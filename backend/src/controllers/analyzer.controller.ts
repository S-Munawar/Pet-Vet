import type { Request, Response } from 'express';
import { mlService } from '../services/ml.service.ts';
import { healthRecordsService } from '../services/health-records.service.ts';
import type { HealthAnalysisInput, MLAnalysisRequest } from '../types/ml.types.ts';
import mongoose from 'mongoose';

/**
 * Analyzer Controller
 * Handles ML analysis requests from the frontend
 * Validates input, calls ML service, returns predictions
 */

export const analyzePetHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pet_id, pet_name, species, input_data } = req.body as MLAnalysisRequest;

    // Validation: Required fields
    if (!pet_id || !pet_name || !species || !input_data) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: pet_id, pet_name, species, input_data',
      });
      return;
    }

    // Validation: Supported species
    if (!['cat', 'dog'].includes(species)) {
      res.status(400).json({
        success: false,
        error: 'Unsupported species. Supported: cat, dog',
      });
      return;
    }

    // Validation: Input data via ML service
    const validation = mlService.validateInput(input_data, species as 'cat' | 'dog');
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        error: 'Invalid input data',
        errors: validation.errors,
      });
      return;
    }

    console.log(`[Analyzer Controller] Analyzing pet: ${pet_name} (${species})`);

    // Call ML service
    const analysisRequest: MLAnalysisRequest = {
      pet_id,
      pet_name,
      species: species as 'cat' | 'dog',
      input_data,
    };

    const result = await mlService.analyzePet(analysisRequest);

    if (!result.success) {
      console.error(`[Analyzer Controller] Analysis failed for ${pet_name}:`, result.error_details);
      res.status(500).json(result);
      return;
    }

    // Store analysis result in health records
    // Note: req.user should be populated by auth middleware
    const userId = (req as any).user?.id || (req as any).userId || '000000000000000000000000';
    const recordsResult = await healthRecordsService.storeAnalysisResult(
      new mongoose.Types.ObjectId(pet_id),
      new mongoose.Types.ObjectId(userId),
      species as 'cat' | 'dog',
      input_data,
      result.result!
    );

    if (!recordsResult.success) {
      console.warn(`[Analyzer Controller] Warning - Analysis succeeded but records storage failed:`, recordsResult.error);
      // Return analysis result but with warning about storage
      res.status(200).json({
        ...result,
        storage_warning: recordsResult.error,
      });
      return;
    }

    // Return successful result with record IDs
    res.status(200).json({
      ...result,
      commonRecordId: recordsResult.commonRecordId,
      speciesRecordId: recordsResult.speciesRecordId,
    });
  } catch (error) {
    console.error('[Analyzer Controller] Unexpected error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      error_details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get form field definitions for a specific species
 * Frontend uses this to dynamically render forms
 */
export const getFormDefinitions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { species } = req.query;

    if (!species || !['cat', 'dog'].includes(species as string)) {
      res.status(400).json({
        success: false,
        error: 'Invalid or missing species parameter',
      });
      return;
    }

    // Form definitions for cat health analysis
    if (species === 'cat') {
      const formDefinitions = [
        // Basic Information Section
        {
          section: 'Basic Information',
          fields: [
            { name: 'breed', label: 'Breed', type: 'select', required: true, options: getBreedOptions('cat') },
            { name: 'age_in_months', label: 'Age (months)', type: 'number', required: true, min: 0, max: 20 },
            { name: 'weight_kg', label: 'Weight (kg)', type: 'number', required: true, min: 0.1, max: 20, step: 0.1 },
          ],
        },

        // Vital Signs Section
        {
          section: 'Vital Signs',
          fields: [
            { name: 'temperature', label: 'Temperature (°C)', type: 'number', required: true, min: 35.0, max: 42.0, step: 0.1 },
            { name: 'heart_rate', label: 'Heart Rate (bpm)', type: 'number', required: true, min: 50, max: 300 },
            { name: 'respiratory_rate', label: 'Respiratory Rate (breaths/min)', type: 'number', required: true, min: 5, max: 60 },
            { name: 'blood_pressure_systolic', label: 'Blood Pressure Systolic (mmHg)', type: 'number', required: true, min: 80, max: 250 },
            { name: 'blood_pressure_diastolic', label: 'Blood Pressure Diastolic (mmHg)', type: 'number', required: true, min: 40, max: 160 },
          ],
        },

        // Clinical Assessment Section
        {
          section: 'Clinical Assessment',
          fields: [
            { name: 'body_condition_score', label: 'Body Condition Score (1-6)', type: 'number', required: true, min: 1, max: 6 },
            {
              name: 'hydration_status',
              label: 'Hydration Status',
              type: 'select',
              required: true,
              options: [
                { value: 'normal', label: 'Normal' },
                { value: 'mild_dehydration', label: 'Mild Dehydration' },
                { value: 'severe_dehydration', label: 'Severe Dehydration' },
              ],
            },
            {
              name: 'mucous_membrane_color',
              label: 'Mucous Membrane Color',
              type: 'select',
              required: true,
              options: [
                { value: 'pink', label: 'Pink' },
                { value: 'pale', label: 'Pale' },
                { value: 'yellow', label: 'Yellow' },
              ],
            },
            {
              name: 'coat_condition',
              label: 'Coat Condition',
              type: 'select',
              required: true,
              options: [
                { value: 'healthy', label: 'Healthy' },
                { value: 'dull', label: 'Dull' },
                { value: 'matted', label: 'Matted' },
                { value: 'patchy', label: 'Patchy' },
              ],
            },
          ],
        },

        // Behavioral & Symptoms Section
        {
          section: 'Behavioral & Symptoms',
          fields: [
            {
              name: 'appetite',
              label: 'Appetite',
              type: 'select',
              required: true,
              options: [
                { value: 'normal', label: 'Normal' },
                { value: 'increased', label: 'Increased' },
                { value: 'decreased', label: 'Decreased' },
                { value: 'absent', label: 'Absent' },
              ],
            },
            {
              name: 'energy_level',
              label: 'Energy Level',
              type: 'select',
              required: true,
              options: [
                { value: 'normal', label: 'Normal' },
                { value: 'hyperactive', label: 'Hyperactive' },
                { value: 'lethargic', label: 'Lethargic' },
              ],
            },
            {
              name: 'aggression',
              label: 'Aggression Level',
              type: 'select',
              required: true,
              options: [
                { value: 'none', label: 'None' },
                { value: 'mild', label: 'Mild' },
                { value: 'moderate', label: 'Moderate' },
                { value: 'severe', label: 'Severe' },
              ],
            },
            { name: 'vomiting', label: 'Vomiting', type: 'checkbox', required: false },
            { name: 'diarrhea', label: 'Diarrhea', type: 'checkbox', required: false },
            { name: 'coughing', label: 'Coughing', type: 'checkbox', required: false },
            { name: 'limping', label: 'Limping', type: 'checkbox', required: false },
          ],
        },

        // Medical History Section
        {
          section: 'Medical History',
          fields: [
            { name: 'allergies', label: 'Allergies (comma-separated)', type: 'textarea', required: false, placeholder: 'e.g., Fish Protein, Pollen' },
            { name: 'chronic_conditions', label: 'Chronic Conditions (comma-separated)', type: 'textarea', required: false, placeholder: 'e.g., Diabetes, Kidney Disease' },
            { name: 'prescriptions', label: 'Current Prescriptions (comma-separated)', type: 'textarea', required: false, placeholder: 'e.g., Amoxicillin, Prednisolone' },
            { name: 'vaccinations', label: 'Vaccination Status', type: 'textarea', required: false, help: 'JSON format: [{"vaccine_name": "FVRCP", "status": "up_to_date"}]' },
          ],
        },
      ];

      res.status(200).json({
        success: true,
        species: 'cat',
        formDefinitions,
      });
      return;
    }

    // Dog form definitions (placeholder for future implementation)
    if (species === 'dog') {
      res.status(501).json({
        success: false,
        error: 'Dog model not yet implemented',
      });
      return;
    }
  } catch (error) {
    console.error('[Form Definitions] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve form definitions',
    });
  }
};

/**
 * Get breed options for a species
 */
function getBreedOptions(species: string): Array<{ value: string; label: string }> {
  const breeds: Record<string, string[]> = {
    cat: [
      'Maine Coon',
      'Persian',
      'Siamese',
      'Bengal',
      'Ragdoll',
      'Scottish Fold',
      'Sphynx',
      'Domestic Shorthair',
      'Other',
    ],
    dog: [
      'Labrador Retriever',
      'Golden Retriever',
      'German Shepherd',
      'French Bulldog',
      'Bulldog',
      'Poodle',
      'Beagle',
      'Other',
    ],
  };

  return (breeds[species] || ['Other']).map((breed) => ({
    value: breed,
    label: breed,
  }));
}
