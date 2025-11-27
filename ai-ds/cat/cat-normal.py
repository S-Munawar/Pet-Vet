import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# --- Configuration and Constants ---
NUM_RECORDS = 1000
BREED_LIST = [
    "Siamese", "Persian", "Maine Coon", "Bengal", "Sphynx", 
    "Domestic Shorthair", "Ragdoll", "Scottish Fold", "Other"
]
CAT_NAMES = [
    "Luna", "Oliver", "Leo", "Bella", "Max", "Chloe", "Lucy", 
    "Simba", "Nala", "Milo", "Kitty", "Shadow", "Smokey", "Tiger"
]

# Biological Normal Ranges (based on strict requirements)
NORMAL_TEMP_C = (38.1, 39.2)  # °C
NORMAL_HR_BPM = (140, 220)    # bpm
NORMAL_RR_BPM = (20, 30)      # breaths/min
NORMAL_BP_SYSTOLIC = (120, 180) # mmHg
NORMAL_BP_DIASTOLIC = (70, 120) # mmHg

# ABSOLUTE PHYSIOLOGICAL LIMITS FOR CLIPPING (Ensuring no values are generated beyond these)
ABS_MIN_TEMP = 35.0
ABS_MAX_TEMP = 42.0
ABS_MIN_HR = 50
ABS_MAX_HR = 300
ABS_MIN_RR = 5
ABS_MAX_RR = 60
ABS_MIN_SYS = 80
ABS_MAX_SYS = 250
ABS_MIN_DIA = 40
ABS_MAX_DIA = 160

# Score distributions (biologically reasonable)
BODY_CONDITION_SCORE_DIST = {4: 0.25, 5: 0.45, 6: 0.20, 3: 0.05, 7: 0.03, 2: 0.01, 8: 0.01}
HYDRATION_STATUS_DIST = {'normal': 0.80, 'mild_dehydration': 0.15, 'moderate_dehydration': 0.04, 'severe_dehydration': 0.01}
COAT_CONDITION_DIST = {'healthy': 0.85, 'dull': 0.10, 'greasy': 0.02, 'matted': 0.02, 'patchy': 0.01}
APPETITE_DIST = {'normal': 0.85, 'decreased': 0.10, 'increased': 0.03, 'absent': 0.02}
ENERGY_LEVEL_DIST = {'normal': 0.75, 'lethargic': 0.20, 'hyperactive': 0.05}
MM_COLOR_DIST = {'pink': 0.88, 'pale': 0.05, 'white': 0.02, 'blue': 0.01, 'yellow': 0.03, 'red': 0.01}

# --- Helper Functions ---

def generate_date_of_birth(max_age_years=15):
    """Generates a realistic date of birth for a cat."""
    now = datetime.now()
    min_days = 30 # Min 1 month old
    max_days = max_age_years * 365
    days_ago = random.randint(min_days, max_days)
    return now - timedelta(days=days_ago)

def calculate_age_in_months(dob):
    """Calculates age in months from Date of Birth."""
    today = datetime.now()
    return int((today - dob).days / 30.44)

def generate_vitals(health_category):
    """
    Generates vital signs, skewing values based on health category and
    strictly clipping them to absolute physiological limits.
    """
    if health_category == 'Healthy':
        # Tighter distribution around the mean of normal ranges
        temp = np.random.normal(38.65, 0.25)
        hr = np.random.normal(180, 20)
        rr = np.random.normal(25, 3)
        sys = np.random.normal(150, 15)
        dia = np.random.normal(95, 10)
    elif health_category == 'At Risk':
        # Wider distribution, higher chance of slight deviation
        temp = np.random.normal(38.65, 0.4)
        hr = np.random.normal(180, 35)
        rr = np.random.normal(25, 5)
        sys = np.random.normal(150, 25)
        dia = np.random.normal(95, 15)
    else: # Unhealthy
        # Skewed distribution towards extreme values
        skew = random.choice([-1, 1]) * np.random.uniform(0.5, 1.5)
        temp = np.random.normal(38.65 + skew, 0.5)
        hr = np.random.normal(180 + skew*20, 40)
        rr = np.random.normal(25 + skew*5, 10)
        sys = np.random.normal(150 + skew*20, 30)
        dia = np.random.normal(95 + skew*10, 20)
    
    # Apply STRICT PHYSIOLOGICAL CLIPPING (Ensures no values exceed established limits)
    temp = np.clip(temp, ABS_MIN_TEMP, ABS_MAX_TEMP)
    hr = np.clip(hr, ABS_MIN_HR, ABS_MAX_HR)
    rr = np.clip(rr, ABS_MIN_RR, ABS_MAX_RR)
    sys = np.clip(sys, ABS_MIN_SYS, ABS_MAX_SYS)
    dia = np.clip(dia, ABS_MIN_DIA, ABS_MAX_DIA)
    
    return {
        'temperature': round(float(temp), 1),
        'heart_rate': int(hr),
        'respiratory_rate': int(rr),
        'blood_pressure_systolic': int(sys),
        'blood_pressure_diastolic': int(dia)
    }

def generate_list_field(options, max_count=3, include_empty_prob=0.3):
    """Generates a list of strings, including the possibility of an empty list."""
    if random.random() < include_empty_prob:
        return []
    
    count = random.randint(1, max_count)
    return random.sample(options, k=count)

def generate_vaccination_data(num_vaccines=3):
    """Generates synthetic vaccination records."""
    if random.random() < 0.2:
        return []

    vaccine_names = ["Rabies", "FVRCP", "FeLV"]
    vaccinations = []
    
    for name in random.sample(vaccine_names, k=random.randint(1, num_vaccines)):
        admin_date = datetime.now() - timedelta(days=random.randint(30, 730))
        next_due = admin_date + timedelta(days=365)
        status = 'up_to_date' if next_due > datetime.now() else 'overdue'
        
        vaccinations.append({
            'vaccine_name': name,
            'administered_date': admin_date.strftime('%Y-%m-%d'),
            'status': status
        })
    return vaccinations

# --- Core Health Status Logic (Requirement 3) ---

def calculate_health_status(row):
    """
    Computes Health Status based on a penalty score system.
    Scores: Healthy (0-2), At Risk (3-6), Unhealthy (7+)
    """
    score = 0
    
    # 1. Vital Sign Deviation (Max Penalty: ~6 points)
    temp = row['temperature']
    hr = row['heart_rate']
    rr = row['respiratory_rate']
    sys = row['blood_pressure_systolic']
    
    # Temperature (Normal: 38.1–39.2 °C)
    if temp < NORMAL_TEMP_C[0] - 0.5 or temp > NORMAL_TEMP_C[1] + 0.5:
        score += 2 # Severe temp deviation (<37.6 or >39.7)
    elif temp < NORMAL_TEMP_C[0] or temp > NORMAL_TEMP_C[1]:
        score += 1 # Mild temp deviation
        
    # Heart Rate (Normal: 140–220 bpm)
    if hr < NORMAL_HR_BPM[0] * 0.7 or hr > NORMAL_HR_BPM[1] * 1.2:
        score += 2 # Severe deviation (<98 or >264)
    elif hr < NORMAL_HR_BPM[0] or hr > NORMAL_HR_BPM[1]:
        score += 1
        
    # Respiratory Rate (Normal: 20–30 breaths/min)
    if rr < NORMAL_RR_BPM[0] * 0.5 or rr > NORMAL_RR_BPM[1] * 1.5:
        score += 1.5 # Severe deviation (<10 or >45)
    elif rr < NORMAL_RR_BPM[0] or rr > NORMAL_RR_BPM[1]:
        score += 0.5
        
    # Blood Pressure (Systolic) (Normal: 120–180 mmHg)
    if sys < NORMAL_BP_SYSTOLIC[0] * 0.8 or sys > NORMAL_BP_SYSTOLIC[1] * 1.1:
        score += 0.5
        
    # 2. Number and Severity of Symptoms (Max Penalty: ~4 points)
    symptom_count = (row['vomiting'] + row['diarrhea'] + row['coughing'] + row['limping'])
    score += symptom_count * 0.5
    
    if row['appetite'] in ['decreased', 'absent']:
        score += 1.5
    if row['energy_level'] == 'lethargic':
        score += 1.5
    if row['aggression'] in ['moderate', 'severe']:
        score += 1
        
    # 3. Hydration Level, Coat Condition, and MM Color (Max Penalty: ~4 points)
    hydration_map = {'normal': 0, 'mild_dehydration': 1.5, 'moderate_dehydration': 3, 'severe_dehydration': 5}
    score += hydration_map.get(row['hydration_status'], 0) / 2 # Max 2.5
    
    coat_map = {'healthy': 0, 'dull': 0.5, 'greasy': 1, 'matted': 1.5, 'patchy': 1}
    score += coat_map.get(row['coat_condition'], 0) * 0.5 # Max 0.75
    
    if row['mucous_membrane_color'] in ['white', 'blue', 'yellow', 'red']:
        score += 1.5
        
    # 4. Body Condition Score (BCS) (Max Penalty: 2 points)
    bcs = row['body_condition_score']
    if bcs <= 3 or bcs >= 7: # Underweight/Obese
        score += 1
    if bcs <= 2 or bcs >= 8: # Severely Underweight/Obese
        score += 1
        
    # --- Final Classification ---
    if score >= 7:
        return 'Unhealthy'
    elif score >= 3:
        return 'At Risk'
    else:
        return 'Healthy'

# --- Main Generator Function ---

def generate_cat_health_dataset(num_records):
    """Generates the full synthetic cat health record dataset."""
    data = []
    
    # Pre-generate a distribution of health categories to ensure diversity
    categories = np.random.choice(['Healthy', 'At Risk', 'Unhealthy'], 
                                   size=num_records, 
                                   p=[0.70, 0.20, 0.10])
    
    for i in range(num_records):
        category = categories[i]
        
        # 1. Pet Snapshot & Vitals
        dob = generate_date_of_birth()
        age_months = calculate_age_in_months(dob)
        
        # Use health category to influence vitals and physical attributes
        vitals = generate_vitals(category)
        
        # Weight 
        weight_kg = np.random.normal(4.5, 1.5)
        weight_kg = np.clip(weight_kg, 1.0, 10.0) # Clip to realistic cat limits
        
        record = {
            # Pet Snapshot (Requirement 2)
            'species': 'Cat', # Strict Requirement 1
            'name': random.choice(CAT_NAMES),
            'breed': random.choice(BREED_LIST),
            'date_of_birth': dob.strftime('%Y-%m-%d'),
            'age_in_months': age_months,
            'weight_kg': round(float(weight_kg), 1),
            
            # Vitals (Requirement 2, 6)
            'temperature': vitals['temperature'],
            'heart_rate': vitals['heart_rate'],
            'respiratory_rate': vitals['respiratory_rate'],
            'blood_pressure_systolic': vitals['blood_pressure_systolic'],
            'blood_pressure_diastolic': vitals['blood_pressure_diastolic'],
            
            # Cat-Specific Metrics (Requirement 2)
            'body_condition_score': np.random.choice(list(BODY_CONDITION_SCORE_DIST.keys()), p=list(BODY_CONDITION_SCORE_DIST.values())),
            'hydration_status': np.random.choice(list(HYDRATION_STATUS_DIST.keys()), p=list(HYDRATION_STATUS_DIST.values())),
            'mucous_membrane_color': np.random.choice(list(MM_COLOR_DIST.keys()), p=list(MM_COLOR_DIST.values())),
            'coat_condition': np.random.choice(list(COAT_CONDITION_DIST.keys()), p=list(COAT_CONDITION_DIST.values())),
            
            # Behavioral Observations (Requirement 2)
            'appetite': np.random.choice(list(APPETITE_DIST.keys()), p=list(APPETITE_DIST.values())),
            'energy_level': np.random.choice(list(ENERGY_LEVEL_DIST.keys()), p=list(ENERGY_LEVEL_DIST.values())),
            'aggression': random.choice(['none'] * 8 + ['mild', 'moderate', 'severe']),
            'vomiting': random.choices([True, False], weights=[0.15, 0.85], k=1)[0],
            'diarrhea': random.choices([True, False], weights=[0.15, 0.85], k=1)[0],
            'coughing': random.choices([True, False], weights=[0.05, 0.95], k=1)[0],
            'limping': random.choices([True, False], weights=[0.05, 0.95], k=1)[0],
            
            # Clinical/History Data (Requirement 2)
            'vaccinations': generate_vaccination_data(),
            'diagnosis_text': f"General check-up. The cat is {category.lower()}.",
            'treatment_text': "No specific treatment required." if category == 'Healthy' else f"Recommended treatment for {category.lower()} condition.",
            
            # History Lists (Requirement 2, 6)
            'allergies': generate_list_field(["Fish Protein", "Flea Bite", "Pollen"], max_count=2, include_empty_prob=0.6),
            'chronic_conditions': generate_list_field(["Feline Hyperthyroidism", "Chronic Kidney Disease", "Dental Disease"], max_count=2, include_empty_prob=0.7),
            'prescriptions': generate_list_field(["Amoxicillin", "Metronidazole", "Prednisolone"], max_count=1, include_empty_prob=0.6),
            
            # Status Label (Placeholder - calculated later)
            'health_status': category
        }
        
        # Adjust symptoms for severe/unhealthy cases to ensure correlation
        if category == 'Unhealthy':
            record['diagnosis_text'] = random.choice([
                "Severe gastroenteritis and dehydration.", 
                "Acute kidney injury suspected; further diagnostics needed.", 
                "Diabetic ketoacidosis due to uncontrolled diabetes.",
                "Severe upper respiratory infection with high fever."
            ])
            record['treatment_text'] = random.choice([
                "Hospitalization for IV fluids and supportive care.", 
                "Aggressive antibiotic and anti-emetic therapy.", 
                "Referral to internal medicine specialist."
            ])
            # Ensure severe signs match:
            record['vomiting'] = True
            record['diarrhea'] = True
            record['hydration_status'] = random.choice(['moderate_dehydration', 'severe_dehydration'])

        data.append(record)

    df = pd.DataFrame(data)
    
    # 5. Compute Final Health Status (based on actual generated values - Requirement 3)
    df['health_status'] = df.apply(calculate_health_status, axis=1)

    return df

# --- Execution ---
if __name__ == "__main__":
    print("Generating 1000 synthetic cat health records with reinforced physiological limits...")
    
    # Generate the dataset
    cat_df = generate_cat_health_dataset(NUM_RECORDS)
    
    # Save the dataset (Requirement 5)
    FILE_NAME = 'cat_health_dataset.csv'
    cat_df.to_csv(FILE_NAME, index=False)
    
    print(f"\n✅ Dataset successfully generated with {len(cat_df)} rows and saved to '{FILE_NAME}'.")
    
    # Print the first few rows (Requirement 5)
    print("\n--- First 5 Records ---")
    print(cat_df[['name', 'species', 'age_in_months', 'temperature', 'body_condition_score', 'hydration_status', 'energy_level', 'health_status']].head())
    
    # Print distribution check
    print("\n--- Health Status Distribution ---")
    print(cat_df['health_status'].value_counts(normalize=True).mul(100).round(1).astype(str) + '%')