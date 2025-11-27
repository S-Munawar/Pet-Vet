import pandas as pd
import numpy as np
import ast
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix
from xgboost import XGBClassifier

# --- 1. Load Data ---
FILE_PATH = 'cat_health_dataset_supplemented.csv'
df = pd.read_csv(FILE_PATH)
print("Data loaded successfully.")

# --- 2. Feature Engineering & Preprocessing ---

def get_item_count(list_str):
    """Safely converts string representation of list to list and returns its length."""
    try:
        actual_list = ast.literal_eval(list_str)
        return len(actual_list)
    except:
        return 0

# --- Additional function to count overdue vaccinations ---

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

# Extract numerical counts from complex fields (e.g., how many allergies)
complex_cols = ['vaccinations', 'allergies', 'chronic_conditions', 'prescriptions']
for col in complex_cols:
    df[f'num_{col}'] = df[col].apply(get_item_count)

# 🚨 NEW FEATURE ADDITION
df['num_vaccines_overdue'] = df['vaccinations'].apply(get_overdue_vaccine_count)

# Drop columns not needed for the model (identifiers, free text, and original list columns)
cols_to_drop = [
    'species', 'name', 'date_of_birth', 
    'diagnosis_text', 'treatment_text'
] + complex_cols 
df_processed = df.drop(columns=cols_to_drop)

# Separation of Features (X) and Target (y)
X = df_processed.drop('health_status', axis=1)
y = df_processed['health_status']

# Encode the categorical target variable (Health Status) into numbers (0, 1, 2)
le = LabelEncoder()
y_encoded = le.fit_transform(y)
class_names = le.classes_ 
print(f"Target classes encoded: {class_names}")

# One-Hot Encode all remaining categorical columns (e.g., breed, appetite)
categorical_cols = X.select_dtypes(include=['object']).columns
X_encoded = pd.get_dummies(X, columns=categorical_cols, drop_first=True)

# Convert boolean columns to integer (True=1, False=0)
for col in X_encoded.select_dtypes(include=['bool']).columns:
    X_encoded[col] = X_encoded[col].astype(int)

# --- 3. Data Splitting ---
# Split data into 80% for training and 20% for testing, ensuring class balance (stratify)
X_train, X_test, y_train, y_test = train_test_split(
    X_encoded, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)
print(f"Data split: Training set size={len(X_train)}, Testing set size={len(X_test)}")

# --- STEP 3B: CALCULATE AND APPLY CLASS WEIGHTS ---
from sklearn.utils.class_weight import compute_sample_weight

# Map the encoded labels (0, 1, 2) back to the class names for clarity
# class_names are: ['At Risk', 'Healthy', 'Unhealthy']
# Label 0: At Risk (Minority Class, needs highest weight)
# Label 1: Healthy
# Label 2: Unhealthy

# Define a custom weight map to boost 'At Risk' and 'Unhealthy' importance
custom_class_weights = {
    # Label 0: At Risk (High Importance, e.g., 3x base weight)
    le.transform(['At Risk'])[0]: 3.0,
    # Label 1: Healthy (Base Importance)
    le.transform(['Healthy'])[0]: 1.0, 
    # Label 2: Unhealthy (Medium Importance, e.g., 2x base weight)
    le.transform(['Unhealthy'])[0]: 2.0
}

# Convert the class weights dictionary into an array matching the y_train samples
sample_weights = compute_sample_weight(
    class_weight=custom_class_weights,
    y=y_train
)

print("\nSample weights calculated and ready for training.")
# -----------------------------------------------------------------

# --- 4. Model Training (XGBoost) ---
print("\nTraining XGBoost Classifier with Sample Weights...")

xgb_model = XGBClassifier(
    objective='multi:softmax',
    num_class=len(class_names),
    eval_metric='mlogloss',
    use_label_encoder=False,
    n_estimators=100,
    learning_rate=0.1,
    random_state=42
)

# APPLY THE WEIGHTS HERE:
xgb_model.fit(X_train, y_train, sample_weight=sample_weights)

# --- 5. Evaluation ---
y_pred = xgb_model.predict(X_test)

print("\n--- XGBoost Model Evaluation ---")
print("Accuracy on Test Set:", xgb_model.score(X_test, y_test))
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=class_names))

# Optional: Extract Feature Importance
feature_importance = pd.Series(xgb_model.feature_importances_, index=X_encoded.columns).sort_values(ascending=False).head(10)
print("\nTop 10 Feature Importance:")
print(feature_importance)

# ----------------------------------------------------
# --- STEP 6: SAVE THE TRAINED MODEL ---
# ----------------------------------------------------
import pickle
import time # Optional: Add a timestamp to the filename

model_filename = f"cat_health_model_{time.strftime('%Y%m%d')}.pkl"

try:
    # 'wb' stands for write binary
    pickle.dump(xgb_model, open(model_filename, "wb"))
    print(f"\n✅ Model successfully saved to {model_filename}")
except Exception as e:
    print(f"Error saving model: {e}")