import pandas as pd
import numpy as np
import pickle
import ast
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier
import time

# --- 1. DEFINITIONS (MUST MATCH TRAINING SCRIPT EXACTLY) ---

COMPLEX_COLS = ['vaccinations', 'allergies', 'chronic_conditions', 'prescriptions']
COLS_TO_DROP = [
    'species', 'name', 'date_of_birth', 
    'diagnosis_text', 'treatment_text'
] + COMPLEX_COLS 
MODEL_FILE = "cat_health_model_20251127.pkl"
ORIGINAL_DATA_FILE = 'cat_health_dataset_supplemented.csv'

# -----------------------------------------------------------

def get_item_count(list_str):
    """Safely converts string representation of list to list and returns its length."""
    try:
        actual_list = ast.literal_eval(list_str)
        return len(actual_list)
    except:
        return 0
    
# 🚨 INSERT THE NEW FUNCTION HERE
def get_overdue_vaccine_count(list_str):
    """Safely counts the number of vaccines marked as 'overdue'."""
    try:
        # ast.literal_eval converts the string representation of a list into an actual list
        actual_list = ast.literal_eval(list_str)
        
        # Count items where the 'status' key equals 'overdue'
        count = sum(1 for item in actual_list if isinstance(item, dict) and item.get('status') == 'overdue')
        return count
    except:
        return 0

def preprocess_and_align_data(raw_df, training_cols):
    """Applies all training-time preprocessing steps to new raw data and aligns columns."""
    df = raw_df.copy()
    
    # 1. Feature Engineering
    for col in COMPLEX_COLS:
        df[f'num_{col}'] = df[col].apply(get_item_count).astype(np.int32)
        
    # 🚨 ADD THE NEW FEATURE HERE
    df['num_vaccines_overdue'] = df['vaccinations'].apply(get_overdue_vaccine_count).astype(np.int32)

    # 2. Drop Irrelevant and Original List Columns
    df_features = df.drop(columns=COLS_TO_DROP, errors='ignore') 
    
    # 3. Handle Boolean and Categorical Columns
    for col in df_features.select_dtypes(include=['bool']).columns:
        df_features[col] = df_features[col].astype(int)
        
    categorical_cols = df_features.select_dtypes(include=['object']).columns
    X_processed = pd.get_dummies(df_features, columns=categorical_cols, drop_first=True)
    
    # 4. ALIGNMENT TO TRAINING COLUMNS
    missing_cols = set(training_cols) - set(X_processed.columns)
    for c in missing_cols:
        X_processed[c] = 0
        
    X_processed = X_processed[training_cols]
    
    return X_processed

def generate_documentation(cat_name, status, raw_data_row):
    """
    Generates diagnosis_text, treatment_text, and prescriptions based on 
    predicted status and specific input features.
    """
    
    diagnosis = ""
    treatment = ""
    prescriptions = []
    
    # Extract key symptoms for documentation
    vomiting = raw_data_row['vomiting'].iloc[0]
    lethargy = raw_data_row['energy_level'].iloc[0] == 'lethargic'
    pale_gums = raw_data_row['mucous_membrane_color'].iloc[0] == 'pale'

    if status == 'Unhealthy':
        symptoms = []
        if vomiting: symptoms.append("active vomiting")
        if lethargy: symptoms.append("severe lethargy")
        if pale_gums: symptoms.append("pale mucous membranes")

        diagnosis = f"Acute systemic illness due to potential organ failure, indicated by {', '.join(symptoms)}."
        treatment = "Immediate critical care stabilization. Aggressive IV fluid and electrolyte therapy with continuous monitoring. Symptomatic support and diagnostic workup."
        
        prescriptions = ['IV Fluid Therapy (Lactated Ringers)', 'Maropitant (Antiemetic)', 'Broad-spectrum Antibiotic']
        
    elif status == 'At Risk':
        symptoms = []
        if raw_data_row['appetite'].iloc[0] == 'decreased': symptoms.append("decreased appetite")
        if raw_data_row['hydration_status'].iloc[0] != 'normal': symptoms.append("mild dehydration")

        diagnosis = f"Patient presents with sub-clinical signs ({', '.join(symptoms)}). Requires comprehensive diagnostic screening."
        treatment = "Outpatient treatment plan. Recommend full blood panel and urinalysis. Supportive care with appetite stimulant and oral fluids."
        prescriptions = ['Mirtazapine (Appetite Stimulant)', 'Probiotic supplement']
        
    else: # Healthy
        diagnosis = "General check-up. The cat is asymptomatic and within normal clinical limits."
        treatment = "No specific treatment required. Maintain current diet and preventative care."
        prescriptions = []

    # Format prescription list as a string matching the raw data schema
    prescriptions_str = str(prescriptions) 
    
    return diagnosis, treatment, prescriptions_str

# -----------------------------------------------------------
# --- A. DEFINE THE NEW RAW DATA ---

new_cat_data_raw = {
    'species': ['Cat'], 
    'name': ['Testy'],
    'breed': ['Siamese'],
    'date_of_birth': ['2023-01-01'],
    'age_in_months': [35],
    'weight_kg': [4.0],
    'temperature': [37.8], 
    'heart_rate': [120], 
    'respiratory_rate': [22],
    'blood_pressure_systolic': [100],
    'blood_pressure_diastolic': [65],
    'body_condition_score': [5],
    'hydration_status': ['mild_dehydration'],
    'mucous_membrane_color': ['pale'], 
    'coat_condition': ['dull'],
    'appetite': ['decreased'],
    'energy_level': ['lethargic'], 
    'aggression': ['none'],
    'vomiting': [True], 
    'diarrhea': [False],
    'coughing': [False],
    'limping': [False],
    'vaccinations': ["[{'vaccine_name': 'Rabies'}]"],
    'diagnosis_text': [''],
    'treatment_text': [''],
    'allergies': ['[]'],
    'chronic_conditions': ['[]'],
    'prescriptions': ['[]'],
}

raw_df = pd.DataFrame(new_cat_data_raw)


# --- B. LOAD ASSETS (Model and Metadata) ---

loaded_model = pickle.load(open(MODEL_FILE, "rb"))
df_original = pd.read_csv(ORIGINAL_DATA_FILE)

# Re-create the LabelEncoder
le = LabelEncoder().fit(df_original['health_status']) 

# CORRECTLY generate the TRAINING_COLS list
X_original = df_original.drop(columns='health_status', errors='ignore')
for col in COMPLEX_COLS:
    X_original[f'num_{col}'] = X_original[col].apply(get_item_count).astype(np.int32)
# 🚨 ADD THE NEW FEATURE GENERATION HERE
X_original['num_vaccines_overdue'] = X_original['vaccinations'].apply(get_overdue_vaccine_count).astype(np.int32)
X_original_processed = X_original.drop(columns=COLS_TO_DROP, errors='ignore')
for col in X_original_processed.select_dtypes(include=['bool']).columns:
    X_original_processed[col] = X_original_processed[col].astype(int)
categorical_cols = X_original_processed.select_dtypes(include=['object']).columns
X_original_encoded = pd.get_dummies(X_original_processed, columns=categorical_cols, drop_first=True)
TRAINING_COLS = X_original_encoded.columns.tolist() 


# ... (Part C: PREPROCESS AND PREDICT starts here) ...

# --- C. PREPROCESS AND PREDICT ---
print("--- Comprehensive Health Analysis Prediction ---")
# Capture the timestamp at the moment the prediction process starts
prediction_timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
print(f"Prediction Time: {prediction_timestamp}") # Update: Use the new variable

# 1. Preprocess the raw data
X_new_processed = preprocess_and_align_data(raw_df, TRAINING_COLS)

# 2. Make the prediction (Probabilities and final class)
prediction_probabilities = loaded_model.predict_proba(X_new_processed) 
predicted_class_index = prediction_probabilities[0].argmax() 
prediction_label = le.inverse_transform([predicted_class_index])[0]

# 3. Generate comprehensive documentation (Rule-Based System)
diagnosis, treatment, prescriptions_str = generate_documentation(
    raw_df.iloc[0]['name'], 
    prediction_label, 
    raw_df
)


# --- D. OUTPUT RESULTS ---

prob_df = pd.DataFrame(
    prediction_probabilities, 
    columns=le.classes_,
    index=[raw_df.iloc[0]['name']]
).round(4)


print("\n========================================================")
print(f"🐈 Predicted Health Status for {raw_df.iloc[0]['name'].upper()}: **{prediction_label}**")
print("========================================================")

print("\n--- Model Confidence Scores (Probabilities) ---")
print(prob_df.to_markdown(numalign="left", stralign="left"))

print("\n--- Generated Health Documentation (Rule-Based) ---")
print(f"**Prediction Timestamp:** {prediction_timestamp}") # <-- NEW FIELD ADDED HERE
print(f"**Diagnosis Text:** {diagnosis}")
print(f"**Treatment Text:** {treatment}")
print(f"**Prescriptions:** {prescriptions_str}")

# ... (rest of the script) ...

print("\n**Note:** This comprehensive output combines the ML model's 'health_status' prediction")
print("with a rule-based system to dynamically generate the required documentation text.")