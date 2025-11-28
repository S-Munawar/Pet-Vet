/**
 * Shared TypeScript interfaces for ML model integration
 * Used by both frontend and backend for type safety
 */

// ============= HEALTH STATUS ENUMS =============
export enum HealthStatus {
  Healthy = 'Healthy',
  AtRisk = 'At Risk',
  Unhealthy = 'Unhealthy',
}

// ============= INPUT TYPES =============

export interface CatHealthAnalysisInput {
  // Basic Information
  breed: string;
  age_in_months: number;
  weight_kg: number;

  // Vital Signs
  temperature: number;
  heart_rate: number;
  respiratory_rate: number;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;

  // Clinical Assessment
  body_condition_score: number; // 1-6
  hydration_status: 'normal' | 'mild_dehydration' | 'severe_dehydration';
  mucous_membrane_color: 'pink' | 'pale' | 'yellow';
  coat_condition: 'healthy' | 'dull' | 'matted' | 'patchy';

  // Behavioral/Symptom Assessment
  appetite: 'normal' | 'increased' | 'decreased' | 'absent';
  energy_level: 'normal' | 'hyperactive' | 'lethargic';
  aggression: 'none' | 'mild' | 'moderate' | 'severe';

  // Symptoms (Boolean)
  vomiting: boolean;
  diarrhea: boolean;
  coughing: boolean;
  limping: boolean;

  // Medical History (As Lists/Arrays)
  allergies: string[];
  chronic_conditions: string[];
  prescriptions: string[];

  // Vaccination Status (Special Format: array of objects with vaccine_name and status)
  vaccinations: Array<{
    vaccine_name: string;
    administered_date?: string;
    status: 'up_to_date' | 'overdue';
  }>;
}

export interface DogHealthAnalysisInput {
  // Basic Information
  breed: string;
  age_in_months: number;
  weight_kg: number;

  // Vital Signs
  temperature: number;
  heart_rate: number;
  respiratory_rate: number;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;

  // Clinical Assessment
  body_condition_score: number; // 1-9
  hydration_status: 'normal' | 'mild_dehydration' | 'severe_dehydration';
  mucous_membrane_color: 'pink' | 'pale' | 'red' | 'yellow';
  coat_condition: 'healthy' | 'dull' | 'matted' | 'patchy';

  // Behavioral/Symptom Assessment
  appetite: 'normal' | 'increased' | 'decreased' | 'absent';
  energy_level: 'normal' | 'hyperactive' | 'lethargic';
  aggression: 'none' | 'mild' | 'moderate' | 'severe';

  // Symptoms (Boolean)
  vomiting: boolean;
  diarrhea: boolean;
  coughing: boolean;
  limping: boolean;

  // Medical History (As Lists/Arrays)
  allergies: string[];
  chronic_conditions: string[];
  prescriptions: string[];

  // Vaccination Status
  vaccinations: Array<{
    vaccine_name: string;
    administered_date?: string;
    status: 'up_to_date' | 'overdue';
  }>;
}

// Union type for any species analysis
export type HealthAnalysisInput = CatHealthAnalysisInput | DogHealthAnalysisInput;

// ============= OUTPUT TYPES =============

export interface HealthPredictionResult {
  // Model Output
  predicted_status: HealthStatus;
  confidence_scores: {
    Healthy: number;
    'At Risk': number;
    Unhealthy: number;
  };

  // Rule-Based Documentation
  diagnosis_text: string;
  treatment_text: string;
  prescriptions: string[];

  // Metadata
  prediction_timestamp: string;
  model_version: string;
  species: 'cat' | 'dog';
}

export interface MLAnalysisRequest {
  pet_id: string; // Reference to pet in database
  pet_name: string;
  species: 'cat' | 'dog';
  input_data: HealthAnalysisInput;
}

export interface MLAnalysisResponse {
  request_id: string;
  success: boolean;
  result?: HealthPredictionResult;
  error?: string;
  error_details?: string;
}

// ============= FORM FIELD DEFINITIONS =============

export interface FormFieldDefinition {
  name: keyof HealthAnalysisInput;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea';
  required: boolean;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  help?: string;
}

// ============= ML MODEL METADATA =============

export interface MLModelMetadata {
  species: 'cat' | 'dog';
  model_filename: string;
  training_date: string;
  accuracy: number;
  feature_count: number;
  classes: string[];
  status: 'active' | 'inactive' | 'deprecated';
}
