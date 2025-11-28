import pandas as pd
import numpy as np
import pickle
import ast
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier

# --- 1. DEFINITIONS (MUST MATCH TRAINING SCRIPT EXACTLY) ---

# These lists must match the columns dropped/engineered during training
COMPLEX_COLS = ['vaccinations', 'allergies', 'chronic_conditions', 'prescriptions']
COLS_TO_DROP = [
    'species', 'name', 'date_of_birth', 
    'diagnosis_text', 'treatment_text'
] + COMPLEX_COLS 

# NOTE: The LabelEncoder (le) and the list of ALL training column names 
# (TRAINING_COLS) must be saved/loaded alongside the model for a perfect deployment.
# For simplicity here, we'll assume the OHE structure is handled by the columns 
# in the dummy data, but in a real-world scenario, you MUST save the full 
# list of training columns (X_encoded.columns) to ensure all 50+ columns are present.

# -----------------------------------------------------------

def get_item_count(list_str):
    """Safely converts string representation of list to list and returns its length."""
    try:
        actual_list = ast.literal_eval(list_str)
        return len(actual_list)
    except:
        return 0

def preprocess_new_data(new_raw_df, training_cols):
    """Applies all training-time preprocessing steps to new raw data."""
    
    df = new_raw_df.copy()

    # 2a. Feature Engineering (Count List Items)
    for col in COMPLEX_COLS:
        df[f'num_{col}'] = df[col].apply(get_item_count)

    # 2b. Drop Irrelevant Columns
    df_processed = df.drop(columns=COLS_TO_DROP, errors='ignore')

    # 2c. One-Hot Encoding (Crucial Step for Consistency)
    categorical_cols = df_processed.select_dtypes(include=['object']).columns
    X_processed = pd.get_dummies(df_processed, columns=categorical_cols, drop_first=True)
    
    # Convert boolean columns to integer
    for col in X_processed.select_dtypes(include=['bool']).columns:
        X_processed[col] = X_processed[col].astype(int)
        
    # --- 3. ALIGNMENT TO TRAINING COLUMNS (THE KEY STEP) ---
    
    # 3a. Add missing columns (categories not present in the new data) and fill with 0
    missing_cols = set(training_cols) - set(X_processed.columns)
    for c in missing_cols:
        X_processed[c] = 0
        
    # 3b. Drop any extra columns (shouldn't happen if COLS_TO_DROP is consistent)
    X_processed = X_processed[training_cols]
    
    return X_processed

# -----------------------------------------------------------

# --- A. DEFINE THE NEW RAW DATA ---
# This is a sample cat record that a vet might enter. Note the list format is raw string.
new_cat_data_raw = {
    'species': ['Cat'], 
    'name': ['Testy'],
    'breed': ['Siamese'],
    'date_of_birth': ['2023-01-01'],
    'age_in_months': [35],
    'weight_kg': [4.0],
    'temperature': [37.8], # Low temperature
    'heart_rate': [120], # Low HR
    'respiratory_rate': [22],
    'blood_pressure_systolic': [100],
    'blood_pressure_diastolic': [65],
    'body_condition_score': [5],
    'hydration_status': ['mild_dehydration'],
    'mucous_membrane_color': ['pale'], # Pale gums = concern
    'coat_condition': ['dull'],
    'appetite': ['decreased'],
    'energy_level': ['lethargic'], # Low energy = concern
    'aggression': ['none'],
    'vomiting': [True], # Symptom
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

# 1. Load the Model
MODEL_FILE = "cat_health_model_20251127.pkl"
loaded_model = pickle.load(open(MODEL_FILE, "rb"))

# 2. Load Metadata (The LabelEncoder and Training Columns)
# Since you did not save these explicitly, we simulate their creation 
# for demonstration purposes using the original CSV file.
# In deployment, you MUST save the original X_encoded.columns list and the le object!

df_original = pd.read_csv('cat_health_dataset_supplemented.csv')
le = LabelEncoder().fit(df_original['health_status']) # Re-create the encoder

# Re-run preprocessing just to get the list of training column names
X_original = df_original.drop(columns=COLS_TO_DROP).drop(columns='health_status', errors='ignore')
categorical_cols = X_original.select_dtypes(include=['object']).columns
X_original_encoded = pd.get_dummies(X_original, columns=categorical_cols, drop_first=True)
TRAINING_COLS = X_original_encoded.columns.tolist() 


# --- C. PREPROCESS AND PREDICT ---
print("--- Prediction Script Initialized ---")
print(f"New cat data loaded: {raw_df.iloc[0]['name']}")

# 1. Preprocess the raw data
X_new_processed = preprocess_new_data(raw_df, TRAINING_COLS)
print(f"Data transformed. Final feature count: {X_new_processed.shape[1]} (Must match training count)")

# 2. Make the prediction
# Prediction returns the encoded label (0, 1, or 2)
prediction_encoded = loaded_model.predict(X_new_processed) 

# 3. Decode the prediction back to the original label
prediction_label = le.inverse_transform(prediction_encoded) 

print(f"\n--- Prediction Result ---")
print(f"The predicted health status for {raw_df.iloc[0]['name']} is: **{prediction_label[0]}**")