import { spawn } from 'child_process';
import path from 'path';
import type { HealthAnalysisInput, HealthPredictionResult, HealthStatus, MLAnalysisRequest, MLAnalysisResponse } from '../types/ml.types.ts';

/**
 * ML Service: Handles all machine learning model operations
 * - Loads trained models (.pkl files)
 * - Executes predictions via Python
 * - Returns structured results
 */

interface PythonPredictionOutput {
  success: boolean;
  status: HealthStatus;
  confidence_scores: Record<string, number>;
  diagnosis_text: string;
  treatment_text: string;
  prescriptions: string[];
  prediction_timestamp: string;
  error?: string;
}

class MLService {
  private pythonScriptPath: string;
  private modelDirectory: string;
  private modelMetadata: Map<string, any> = new Map();

  constructor() {
    // Paths to Python scripts and models
    this.pythonScriptPath = path.join(process.cwd(), '..', 'ai-ds', 'cat', 'ml_inference.py');
    this.modelDirectory = path.join(process.cwd(), '..', 'ai-ds', 'cat');
  }

  /**
   * Executes Python prediction script with input data
   * Returns structured prediction result with confidence scores and documentation
   */
  async predictCatHealth(input: HealthAnalysisInput): Promise<HealthPredictionResult> {
    return new Promise((resolve, reject) => {
      // Prepare Python subprocess
      const pythonProcess = spawn('python', [this.pythonScriptPath], {
        cwd: this.modelDirectory,
        env: { ...process.env, PYTHONUNBUFFERED: '1' },
      });

      let outputData = '';
      let errorData = '';

      // Prepare input data as JSON string for Python
      const inputJSON = JSON.stringify(this.formatInputForPython(input));

      // Send data to Python process via stdin
      pythonProcess.stdin.write(inputJSON);
      pythonProcess.stdin.end();

      // Capture stdout (prediction results)
      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      // Capture stderr (errors)
      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      // Handle process completion
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python process exited with code ${code}`);
          console.error('STDERR:', errorData);
          return reject(new Error(`Python prediction failed: ${errorData}`));
        }

        try {
          // Parse Python output (should be JSON)
          const result: PythonPredictionOutput = JSON.parse(outputData);

          if (!result.success) {
            return reject(new Error(result.error || 'Prediction failed'));
          }

          // Transform to HealthPredictionResult
          const prediction: HealthPredictionResult = {
            predicted_status: result.status as HealthStatus,
            confidence_scores: {
              Healthy: result.confidence_scores['Healthy'] || 0,
              'At Risk': result.confidence_scores['At Risk'] || 0,
              Unhealthy: result.confidence_scores['Unhealthy'] || 0,
            },
            diagnosis_text: result.diagnosis_text,
            treatment_text: result.treatment_text,
            prescriptions: result.prescriptions,
            prediction_timestamp: result.prediction_timestamp,
            model_version: '1.0.0-cat',
            species: 'cat',
          };

          resolve(prediction);
        } catch (parseError) {
          console.error('Failed to parse Python output:', outputData);
          reject(new Error(`Failed to parse prediction output: ${parseError}`));
        }
      });

      // Handle process errors
      pythonProcess.on('error', (err) => {
        reject(new Error(`Failed to spawn Python process: ${err.message}`));
      });
    });
  }

  /**
   * Processes ML analysis request end-to-end
   */
  async analyzePet(request: MLAnalysisRequest): Promise<MLAnalysisResponse> {
    try {
      const requestId = `mlreq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log(`[ML Service] Processing analysis request: ${requestId}`);
      console.log(`[ML Service] Species: ${request.species}, Pet: ${request.pet_name}`);

      let result: HealthPredictionResult;

      // Route to appropriate model based on species
      if (request.species === 'cat') {
        result = await this.predictCatHealth(request.input_data);
      } else if (request.species === 'dog') {
        // TODO: Implement dog model when available
        throw new Error('Dog model not yet implemented');
      } else {
        throw new Error(`Unknown species: ${request.species}`);
      }

      return {
        request_id: requestId,
        success: true,
        result,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[ML Service] Analysis failed:`, errorMessage);

      return {
        request_id: `mlreq_${Date.now()}`,
        success: false,
        error: 'ML analysis failed',
        error_details: errorMessage,
      };
    }
  }

  /**
   * Formats input data from TypeScript interface to Python-compatible format
   */
  private formatInputForPython(input: HealthAnalysisInput): Record<string, any> {
    return {
      // Basic info
      breed: input.breed || 'Unknown',
      age_in_months: Math.round(input.age_in_months),
      weight_kg: input.weight_kg,

      // Vital signs
      temperature: input.temperature,
      heart_rate: Math.round(input.heart_rate),
      respiratory_rate: Math.round(input.respiratory_rate),
      blood_pressure_systolic: Math.round(input.blood_pressure_systolic),
      blood_pressure_diastolic: Math.round(input.blood_pressure_diastolic),

      // Clinical
      body_condition_score: Math.round(input.body_condition_score),
      hydration_status: input.hydration_status,
      mucous_membrane_color: input.mucous_membrane_color,
      coat_condition: input.coat_condition,

      // Behavioral
      appetite: input.appetite,
      energy_level: input.energy_level,
      aggression: input.aggression,

      // Symptoms
      vomiting: input.vomiting,
      diarrhea: input.diarrhea,
      coughing: input.coughing,
      limping: input.limping,

      // Medical history
      allergies: input.allergies,
      chronic_conditions: input.chronic_conditions,
      prescriptions: input.prescriptions,

      // Vaccinations (convert to string format expected by Python)
      vaccinations: JSON.stringify(input.vaccinations),
    };
  }

  /**
   * Validates input data before sending to ML model
   */
  validateInput(input: HealthAnalysisInput, species: 'cat' | 'dog'): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validations
    if (!input.breed || input.breed.trim() === '') {
      errors.push('Breed is required');
    }

    if (input.age_in_months < 0 || input.age_in_months > 240) {
      errors.push('Age must be between 0 and 240 months (0-20 years)');
    }

    if (input.weight_kg <= 0 || input.weight_kg > 100) {
      errors.push('Weight must be between 0.1 and 100 kg');
    }

    // Vital sign ranges - ABSOLUTE PHYSIOLOGICAL LIMITS
    // Temperature: 35.0 - 42.0°C
    if (input.temperature < 35.0 || input.temperature > 42.0) {
      errors.push('Temperature must be between 35.0 and 42.0°C');
    }

    // Heart Rate: 50 - 300 bpm
    if (input.heart_rate < 50 || input.heart_rate > 300) {
      errors.push('Heart rate must be between 50 and 300 bpm');
    }

    // Respiratory Rate: 5 - 60 breaths/min
    if (input.respiratory_rate < 5 || input.respiratory_rate > 60) {
      errors.push('Respiratory rate must be between 5 and 60 breaths/min');
    }

    // Blood Pressure Systolic: 80 - 250 mmHg
    if (input.blood_pressure_systolic < 80 || input.blood_pressure_systolic > 250) {
      errors.push('Blood pressure systolic must be between 80 and 250 mmHg');
    }

    // Blood Pressure Diastolic: 40 - 160 mmHg
    if (input.blood_pressure_diastolic < 40 || input.blood_pressure_diastolic > 160) {
      errors.push('Blood pressure diastolic must be between 40 and 160 mmHg');
    }

    const bcsRange = species === 'cat' ? { min: 1, max: 6 } : { min: 1, max: 9 };
    if (input.body_condition_score < bcsRange.min || input.body_condition_score > bcsRange.max) {
      errors.push(`Body condition score must be between ${bcsRange.min} and ${bcsRange.max}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const mlService = new MLService();
export default MLService;
