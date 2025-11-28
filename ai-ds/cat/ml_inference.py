#!/usr/bin/env python3
"""
ML Prediction Wrapper Script
Reads JSON input from stdin, executes prediction, outputs JSON results.
This is called by Node.js backend as a subprocess.

Usage:
  python ml_inference.py < input.json

Input JSON Format:
{
  "breed": "Siamese",
  "age_in_months": 35,
  "weight_kg": 4.0,
  ...other fields...
}

Output JSON Format:
{
  "success": true,
  "status": "Healthy",
  "confidence_scores": { "Healthy": 0.85, "At Risk": 0.1, "Unhealthy": 0.05 },
  "diagnosis_text": "...",
  "treatment_text": "...",
  "prescriptions": [...],
  "prediction_timestamp": "2025-11-29 10:30:00"
}
"""

import sys
import json
import pickle
import pandas as pd
import numpy as np
import ast
from pathlib import Path
from datetime import datetime

# Configuration
SCRIPT_DIR = Path(__file__).parent
MODEL_FILE = SCRIPT_DIR / "cat_health_model_20251127.pkl"
DATASET_FILE = SCRIPT_DIR / "cat_health_dataset_supplemented.csv"

# Feature Engineering Utilities (MUST MATCH TRAINING SCRIPT)
COMPLEX_COLS = ['vaccinations', 'allergies', 'chronic_conditions', 'prescriptions']
COLS_TO_DROP = [
    'species', 'name', 'date_of_birth',
    'diagnosis_text', 'treatment_text'
] + COMPLEX_COLS


def get_item_count(list_str):
    """Safely converts string representation of list to list and returns its length."""
    try:
        actual_list = ast.literal_eval(str(list_str)) if isinstance(list_str, str) else list_str
        return len(actual_list) if isinstance(actual_list, list) else 0
    except:
        return 0


def get_overdue_vaccine_count(list_str):
    """Safely counts the number of vaccines marked as 'overdue'."""
    try:
        actual_list = ast.literal_eval(str(list_str)) if isinstance(list_str, str) else list_str
        if not isinstance(actual_list, list):
            return 0
        count = sum(1 for item in actual_list if isinstance(item, dict) and item.get('status') == 'overdue')
        return count
    except:
        return 0


def preprocess_and_align_data(raw_data, training_cols):
    """Applies all training-time preprocessing steps and aligns columns."""
    try:
        # Create DataFrame from input
        df = pd.DataFrame([raw_data])

        # Feature Engineering
        for col in COMPLEX_COLS:
            df[f'num_{col}'] = df[col].apply(get_item_count).astype(np.int32)

        df['num_vaccines_overdue'] = df['vaccinations'].apply(get_overdue_vaccine_count).astype(np.int32)

        # Drop irrelevant columns
        df_features = df.drop(columns=COLS_TO_DROP, errors='ignore')

        # Convert boolean columns
        for col in df_features.select_dtypes(include=['bool']).columns:
            df_features[col] = df_features[col].astype(int)

        # One-hot encode categorical columns
        categorical_cols = df_features.select_dtypes(include=['object']).columns
        X_processed = pd.get_dummies(df_features, columns=categorical_cols, drop_first=True)

        # Align columns to training data
        missing_cols = set(training_cols) - set(X_processed.columns)
        for c in missing_cols:
            X_processed[c] = 0

        X_processed = X_processed[training_cols]

        return X_processed
    except Exception as e:
        raise Exception(f"Preprocessing error: {str(e)}")


def generate_documentation(status, raw_data):
    """Generates diagnosis_text, treatment_text, and prescriptions based on prediction."""
    diagnosis = ""
    treatment = ""
    prescriptions = []

    # Extract key symptoms
    vomiting = raw_data.get('vomiting', False)
    lethargy = raw_data.get('energy_level') == 'lethargic'
    pale_gums = raw_data.get('mucous_membrane_color') == 'pale'

    if status == 'Unhealthy':
        symptoms = []
        if vomiting:
            symptoms.append("active vomiting")
        if lethargy:
            symptoms.append("severe lethargy")
        if pale_gums:
            symptoms.append("pale mucous membranes")

        diagnosis = f"Acute systemic illness indicated by {', '.join(symptoms)}."
        treatment = "Immediate critical care stabilization. IV fluid and electrolyte therapy with continuous monitoring."
        prescriptions = ['IV Fluid Therapy', 'Maropitant', 'Broad-spectrum Antibiotic']

    elif status == 'At Risk':
        symptoms = []
        if raw_data.get('appetite') == 'decreased':
            symptoms.append("decreased appetite")
        if raw_data.get('hydration_status') != 'normal':
            symptoms.append("mild dehydration")

        diagnosis = f"Sub-clinical signs detected. Requires comprehensive diagnostic screening."
        treatment = "Outpatient treatment with supportive care. Recommend full blood panel and urinalysis."
        prescriptions = ['Mirtazapine', 'Probiotic supplement']

    else:  # Healthy
        diagnosis = "General check-up. The cat is asymptomatic and within normal clinical limits."
        treatment = "No specific treatment required. Maintain current diet and preventative care."
        prescriptions = []

    return diagnosis, treatment, prescriptions


def main():
    """Main prediction function."""
    try:
        # Read input from stdin
        input_json = sys.stdin.read()
        raw_data = json.loads(input_json)

        # Load model
        if not MODEL_FILE.exists():
            raise FileNotFoundError(f"Model file not found: {MODEL_FILE}")

        model = pickle.load(open(MODEL_FILE, "rb"))

        # Load training data to reconstruct feature columns
        if not DATASET_FILE.exists():
            raise FileNotFoundError(f"Dataset file not found: {DATASET_FILE}")

        df_original = pd.read_csv(DATASET_FILE)

        # Reconstruct training columns
        X_original = df_original.drop(columns='health_status', errors='ignore')
        for col in COMPLEX_COLS:
            X_original[f'num_{col}'] = X_original[col].apply(get_item_count).astype(np.int32)

        X_original['num_vaccines_overdue'] = X_original['vaccinations'].apply(get_overdue_vaccine_count).astype(np.int32)
        X_original_processed = X_original.drop(columns=COLS_TO_DROP, errors='ignore')

        for col in X_original_processed.select_dtypes(include=['bool']).columns:
            X_original_processed[col] = X_original_processed[col].astype(int)

        categorical_cols = X_original_processed.select_dtypes(include=['object']).columns
        X_original_encoded = pd.get_dummies(X_original_processed, columns=categorical_cols, drop_first=True)
        TRAINING_COLS = X_original_encoded.columns.tolist()

        # Preprocess input
        X_new_processed = preprocess_and_align_data(raw_data, TRAINING_COLS)

        # Make prediction
        prediction_probs = model.predict_proba(X_new_processed)
        predicted_class_idx = prediction_probs[0].argmax()

        # Map index to class name
        from sklearn.preprocessing import LabelEncoder
        le = LabelEncoder().fit(df_original['health_status'])
        predicted_status = le.classes_[predicted_class_idx]

        # Get confidence scores
        confidence_dict = {
            le.classes_[i]: float(prediction_probs[0][i]) for i in range(len(le.classes_))
        }

        # Generate documentation
        diagnosis, treatment, prescriptions = generate_documentation(predicted_status, raw_data)

        # Prepare output
        output = {
            "success": True,
            "status": predicted_status,
            "confidence_scores": confidence_dict,
            "diagnosis_text": diagnosis,
            "treatment_text": treatment,
            "prescriptions": prescriptions,
            "prediction_timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        }

        print(json.dumps(output))

    except Exception as e:
        error_output = {
            "success": False,
            "status": None,
            "error": str(e),
        }
        print(json.dumps(error_output))
        sys.exit(1)


if __name__ == "__main__":
    main()
