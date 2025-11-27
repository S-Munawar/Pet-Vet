import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# --- Configuration and Constants ---
NUM_RECORDS = 1000
NUM_UNHEALTHY_SUPPLEMENT = 50 # New requirement
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

# ABSOLUTE PHYSIOLOGICAL LIMITS FOR CLIPPING (Survivable ranges)
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
# Note: These are slightly modified in the generator function for "Unhealthy" records
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
    min_days = 30
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
        temp = np.random.normal(38.65, 0.25)
        hr = np.random.normal(180, 20)
        rr = np.random.normal(25, 3)
        sys = np.random.normal(150, 15)
        dia = np.random.normal(95, 10)
    elif health_category == 'At Risk':
        temp = np.random.normal(38.65, 0.4)
        hr = np.random.normal(180, 35)
        rr = np.random.normal(25, 5)
        sys = np.random.normal(150, 25)
        dia = np.random.normal(95, 15)
    else: # Unhealthy
        skew = random.choice([-1, 1]) * np.random.uniform(0.5, 1.5)
        temp = np.random.normal(38.65 + skew, 0.5)
        hr = np.random.normal(180 + skew*20, 40)
        rr = np.random.normal(25 + skew*5, 10)
        sys = np.random.normal(150 + skew*20, 30)
        dia = np.random.normal(95 + skew*10, 20)
    
    # Apply STRICT PHYSIOLOGICAL CLIPPING
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
        # Simplified status for synthetic data
        status = random.choice(['up_to_date', 'overdue'])
        
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
    
    if temp < NORMAL_TEMP_C[0] - 0.5 or temp > NORMAL_TEMP_C[1] + 0.5:
        score += 2
    elif temp < NORMAL_TEMP_C[0] or temp > NORMAL_TEMP_C[1]:
        score += 1
        
    if hr < NORMAL_HR_BPM[0] * 0.7 or hr > NORMAL_HR_BPM[1] * 1.2:
        score += 2
    elif hr < NORMAL_HR_BPM[0] or hr > NORMAL_HR_BPM[1]:
        score += 1
        
    if rr < NORMAL_RR_BPM[0] * 0.5 or rr > NORMAL_RR_BPM[1] * 1.5:
        score += 1.5
    elif rr < NORMAL_RR_BPM[0] or rr > NORMAL_RR_BPM[1]:
        score += 0.5
        
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
    score += hydration_map.get(row['hydration_status'], 0) / 2
    
    coat_map = {'healthy': 0, 'dull': 0.5, 'greasy': 1, 'matted': 1.5, 'patchy': 1}
    score += coat_map.get(row['coat_condition'], 0) * 0.5
    
    if row['mucous_membrane_color'] in ['white', 'blue', 'yellow', 'red']:
        score += 1.5
        
    # 4. Body Condition Score (BCS) (Max Penalty: 2 points)
    bcs = row['body_condition_score']
    if bcs <= 3 or bcs >= 7:
        score += 1
    if bcs <= 2 or bcs >= 8:
        score += 1
        
    # --- Final Classification ---
    if score >= 7:
        return 'Unhealthy'
    elif score >= 3:
        return 'At Risk'
    else:
        return 'Healthy'

# --- Main Generator Function ---

def generate_record(predefined_category=None):
    """Generates a single cat health record."""
    
    dob = generate_date_of_birth()
    age_months = calculate_age_in_months(dob)
    
    # Determine the health category to bias the data generation
    if predefined_category:
        category = predefined_category
    else:
        # Default distribution for the main 1000 records
        category = np.random.choice(['Healthy', 'At Risk', 'Unhealthy'], p=[0.70, 0.20, 0.10])
    
    vitals = generate_vitals(category)
    weight_kg = np.random.normal(4.5, 1.5)
    weight_kg = np.clip(weight_kg, 1.0, 10.0) 

    # Bias attribute distributions for UNHEALTHY records
    if category == 'Unhealthy':
        hydration_dist = {'normal': 0.05, 'mild_dehydration': 0.15, 'moderate_dehydration': 0.40, 'severe_dehydration': 0.40}
        coat_dist = {'healthy': 0.05, 'dull': 0.20, 'greasy': 0.25, 'matted': 0.30, 'patchy': 0.20}
        appetite_dist = {'normal': 0.10, 'decreased': 0.30, 'absent': 0.60}
        energy_dist = {'normal': 0.05, 'lethargic': 0.85, 'hyperactive': 0.10}
        bcs = np.random.choice([1, 2, 7, 8, 9], p=[0.2, 0.2, 0.2, 0.2, 0.2]) # Extremes more likely
        
        vomit = True
        diarrhea = random.choices([True, False], weights=[0.7, 0.3], k=1)[0]
        limping = random.choices([True, False], weights=[0.3, 0.7], k=1)[0]
        
        diagnosis_text = random.choice([
            "Severe gastroenteritis and dehydration.", 
            "Acute kidney injury suspected; further diagnostics needed.", 
            "Diabetic ketoacidosis due to uncontrolled diabetes.",
            "Severe upper respiratory infection with high fever."
        ])
        treatment_text = random.choice([
            "Hospitalization for IV fluids and supportive care.", 
            "Aggressive antibiotic and anti-emetic therapy.", 
            "Referral to internal medicine specialist."
        ])
    else:
        hydration_dist = HYDRATION_STATUS_DIST
        coat_dist = COAT_CONDITION_DIST
        appetite_dist = APPETITE_DIST
        energy_dist = ENERGY_LEVEL_DIST
        bcs = np.random.choice(list(BODY_CONDITION_SCORE_DIST.keys()), p=list(BODY_CONDITION_SCORE_DIST.values()))
        
        vomit = random.choices([True, False], weights=[0.15, 0.85], k=1)[0]
        diarrhea = random.choices([True, False], weights=[0.15, 0.85], k=1)[0]
        limping = random.choices([True, False], weights=[0.05, 0.95], k=1)[0]
        
        diagnosis_text = f"General check-up. The cat is {category.lower()}."
        treatment_text = "No specific treatment required." if category == 'Healthy' else f"Recommended treatment for {category.lower()} condition."


    record = {
        # Pet Snapshot
        'species': 'Cat', 
        'name': random.choice(CAT_NAMES),
        'breed': random.choice(BREED_LIST),
        'date_of_birth': dob.strftime('%Y-%m-%d'),
        'age_in_months': age_months,
        'weight_kg': round(float(weight_kg), 1),
        
        # Vitals
        'temperature': vitals['temperature'],
        'heart_rate': vitals['heart_rate'],
        'respiratory_rate': vitals['respiratory_rate'],
        'blood_pressure_systolic': vitals['blood_pressure_systolic'],
        'blood_pressure_diastolic': vitals['blood_pressure_diastolic'],
        
        # Cat-Specific Metrics
        'body_condition_score': bcs,
        'hydration_status': np.random.choice(list(hydration_dist.keys()), p=list(hydration_dist.values())),
        'mucous_membrane_color': np.random.choice(list(MM_COLOR_DIST.keys()), p=list(MM_COLOR_DIST.values())),
        'coat_condition': np.random.choice(list(coat_dist.keys()), p=list(coat_dist.values())),
        
        # Behavioral Observations
        'appetite': np.random.choice(list(appetite_dist.keys()), p=list(appetite_dist.values())),
        'energy_level': np.random.choice(list(energy_dist.keys()), p=list(energy_dist.values())),
        'aggression': random.choice(['none'] * 8 + ['mild', 'moderate', 'severe']),
        'vomiting': vomit,
        'diarrhea': diarrhea,
        'coughing': random.choices([True, False], weights=[0.05, 0.95], k=1)[0],
        'limping': limping,
        
        # Clinical/History Data
        'vaccinations': generate_vaccination_data(),
        'diagnosis_text': diagnosis_text,
        'treatment_text': treatment_text,
        
        # History Lists
        'allergies': generate_list_field(["Fish Protein", "Flea Bite", "Pollen"], max_count=2, include_empty_prob=0.6),
        'chronic_conditions': generate_list_field(["Feline Hyperthyroidism", "Chronic Kidney Disease", "Dental Disease"], max_count=2, include_empty_prob=0.7),
        'prescriptions': generate_list_field(["Amoxicillin", "Metronidazole", "Prednisolone"], max_count=1, include_empty_prob=0.6),
        
        # Status Label (Placeholder - calculated later)
        'health_status': category
    }

    return record


def generate_cat_health_dataset(num_records, unhealthy_supplement=0):
    """Generates the full synthetic cat health record dataset, including a supplementary set."""
    
    data = []
    
    # 1. Generate the main balanced set (70% Healthy, 20% At Risk, 10% Unhealthy)
    for _ in range(num_records):
        data.append(generate_record())
        
    # 2. Generate the supplementary UNHEALTHY set (Strictly 'Unhealthy')
    if unhealthy_supplement > 0:
        for _ in range(unhealthy_supplement):
            data.append(generate_record(predefined_category='Unhealthy'))

    df = pd.DataFrame(data)
    
    # 3. Compute Final Health Status (based on actual generated values)
    # This step validates the generated data against the logic, correcting misclassified records
    df['health_status_calculated'] = df.apply(calculate_health_status, axis=1)
    
    # Keep the final calculated status and drop the temporary one
    df['health_status'] = df['health_status_calculated']
    df = df.drop(columns=['health_status_calculated'])
    
    return df

# --- Execution ---
if __name__ == "__main__":
    print(f"Generating main dataset ({NUM_RECORDS} records) plus {NUM_UNHEALTHY_SUPPLEMENT} supplementary 'Unhealthy' records...")
    
    # Generate the combined dataset (1000 + 50 = 1050 records)
    cat_df = generate_cat_health_dataset(NUM_RECORDS, NUM_UNHEALTHY_SUPPLEMENT)
    
    # Save the dataset
    FILE_NAME = 'cat_health_dataset_supplemented.csv'
    cat_df.to_csv(FILE_NAME, index=False)
    
    print(f"\n✅ Combined Dataset successfully generated with {len(cat_df)} total rows and saved to '{FILE_NAME}'.")
    
    # Print the first few rows
    print("\n--- First 5 Records ---")
    print(cat_df[['name', 'species', 'age_in_months', 'temperature', 'body_condition_score', 'hydration_status', 'energy_level', 'health_status']].head())
    
    # Print distribution check
    print("\n--- Final Health Status Distribution ---")
    print(cat_df['health_status'].value_counts().sort_index())
    print(cat_df['health_status'].value_counts(normalize=True).mul(100).round(1).astype(str) + '%')