import { CommonHealthRecord, DogHealthRecord, CatHealthRecord, Pet } from '../models/models.ts';
import type { HealthAnalysisInput, HealthPredictionResult } from '../types/ml.types.ts';
import type mongoose from 'mongoose';

/**
 * Health Records Service
 * Handles creation and storage of health records from ML analysis
 * - Saves species-specific health records (Dog or Cat)
 * - Creates common health record entry linking to species-specific record
 * - Maintains data integrity and audit trail
 */

class HealthRecordsService {
  /**
   * Store ML analysis result in health records
   * Creates both species-specific record and common health record
   */
  async storeAnalysisResult(
    petId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    species: 'cat' | 'dog',
    inputData: HealthAnalysisInput,
    predictionResult: HealthPredictionResult
  ): Promise<{
    success: boolean;
    commonRecordId?: string;
    speciesRecordId?: string;
    error?: string;
  }> {
    try {
      // Fetch pet data for snapshot
      const pet = await Pet.findById(petId);
      if (!pet) {
        return {
          success: false,
          error: `Pet not found with ID: ${petId}`,
        };
      }

      // Create species-specific health record
      let speciesRecordId: string;

      if (species === 'cat') {
        speciesRecordId = await this.createCatHealthRecord(pet, inputData, predictionResult);
      } else if (species === 'dog') {
        speciesRecordId = await this.createDogHealthRecord(pet, inputData, predictionResult);
      } else {
        return {
          success: false,
          error: `Unsupported species: ${species}`,
        };
      }

      // Create common health record linking to species-specific record
      const commonRecordId = await this.createCommonHealthRecord(
        petId,
        userId,
        species,
        speciesRecordId
      );

      console.log(`[Health Records Service] Successfully stored analysis for pet ${pet.name}`);
      console.log(`  - Species Record: ${speciesRecordId}`);
      console.log(`  - Common Record: ${commonRecordId}`);

      return {
        success: true,
        commonRecordId,
        speciesRecordId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[Health Records Service] Error storing analysis result:', errorMessage);
      return {
        success: false,
        error: `Failed to store health record: ${errorMessage}`,
      };
    }
  }

  /**
   * Create cat-specific health record
   */
  private async createCatHealthRecord(
    pet: any,
    inputData: HealthAnalysisInput,
    predictionResult: HealthPredictionResult
  ): Promise<string> {
    const catRecord = new CatHealthRecord({
      // Pet snapshot
      petSnapshot: {
        name: pet.name,
        breed: pet.breed || 'Unknown',
        dateOfBirth: pet.dateOfBirth,
        ageInMonths: Math.round(inputData.age_in_months),
      },

      // Vital signs
      vitals: {
        weight: {
          value: inputData.weight_kg,
          unit: 'kg',
        },
        temperature: {
          value: inputData.temperature,
          unit: 'C',
        },
        heartRate: {
          value: inputData.heart_rate,
          unit: 'bpm',
        },
        respiratoryRate: {
          value: inputData.respiratory_rate,
          unit: 'bpm',
        },
        bloodPressure: {
          systolic: Math.round(inputData.blood_pressure_systolic),
          diastolic: Math.round(inputData.blood_pressure_diastolic),
          unit: 'mmHg',
        },
      },

      // Cat-specific metrics
      catMetrics: {
        bodyConditionScore: Math.round(inputData.body_condition_score),
        hydrationStatus: inputData.hydration_status,
        mucousMembraneColor: inputData.mucous_membrane_color,
        coatCondition: inputData.coat_condition,
      },

      // Behavioral assessment
      behavior: {
        appetite: inputData.appetite,
        energyLevel: inputData.energy_level,
        aggression: inputData.aggression,
        vomiting: inputData.vomiting,
        diarrhea: inputData.diarrhea,
        coughing: inputData.coughing,
        limping: inputData.limping,
      },

      // Diagnosis and treatment from ML model
      diagnosis: this.generateDiagnosis(predictionResult),
      treatment: predictionResult.treatment_text,

      // Medical history from input
      allergies: this.parseStringArray(inputData.allergies),
      chronicConditions: this.parseStringArray(inputData.chronic_conditions),
      prescriptions: this.parsePrescriptions(predictionResult.prescriptions),

      // Vaccination status
      vaccinations: this.mapVaccinations(inputData.vaccinations),
    });

    const savedRecord = await catRecord.save();
    console.log(`[Health Records Service] Created cat health record: ${savedRecord._id}`);
    return savedRecord._id.toString();
  }

  /**
   * Create dog-specific health record
   */
  private async createDogHealthRecord(
    pet: any,
    inputData: HealthAnalysisInput,
    predictionResult: HealthPredictionResult
  ): Promise<string> {
    const dogRecord = new DogHealthRecord({
      // Pet snapshot
      petSnapshot: {
        name: pet.name,
        breed: pet.breed || 'Unknown',
        dateOfBirth: pet.dateOfBirth,
        ageInMonths: Math.round(inputData.age_in_months),
      },

      // Vital signs
      vitals: {
        weight: {
          value: inputData.weight_kg,
          unit: 'kg',
        },
        temperature: {
          value: inputData.temperature,
          unit: 'C',
        },
        heartRate: {
          value: inputData.heart_rate,
          unit: 'bpm',
        },
        respiratoryRate: {
          value: inputData.respiratory_rate,
          unit: 'bpm',
        },
        bloodPressure: {
          systolic: Math.round(inputData.blood_pressure_systolic),
          diastolic: Math.round(inputData.blood_pressure_diastolic),
          unit: 'mmHg',
        },
      },

      // Dog-specific metrics
      dogMetrics: {
        bodyConditionScore: Math.round(inputData.body_condition_score),
        hydrationStatus: inputData.hydration_status,
        mucousMembraneColor: inputData.mucous_membrane_color,
      },

      // Behavioral assessment
      behavior: {
        appetite: inputData.appetite,
        energyLevel: inputData.energy_level,
        aggression: inputData.aggression,
        vomiting: inputData.vomiting,
        diarrhea: inputData.diarrhea,
        coughing: inputData.coughing,
        limping: inputData.limping,
      },

      // Diagnosis and treatment from ML model
      diagnosis: this.generateDiagnosis(predictionResult),
      treatment: predictionResult.treatment_text,

      // Medical history from input
      allergies: this.parseStringArray(inputData.allergies),
      chronicConditions: this.parseStringArray(inputData.chronic_conditions),
      prescriptions: this.parsePrescriptions(predictionResult.prescriptions),

      // Vaccination status
      vaccinations: this.mapVaccinations(inputData.vaccinations),
    });

    const savedRecord = await dogRecord.save();
    console.log(`[Health Records Service] Created dog health record: ${savedRecord._id}`);
    return savedRecord._id.toString();
  }

  /**
   * Create common health record linking to species-specific record
   */
  private async createCommonHealthRecord(
    petId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    species: 'cat' | 'dog',
    speciesRecordId: string
  ): Promise<string> {
    const speciesRecordModel = species === 'cat' ? 'CatHealthRecord' : 'DogHealthRecord';

    const commonRecord = new CommonHealthRecord({
      pet_id: petId,
      created_by: userId,
      created_by_type: 'ml_model',
      species_type: species,
      species_health_record_id: speciesRecordId,
      species_health_record_model: speciesRecordModel,
      visitDate: new Date(),
    });

    const savedRecord = await commonRecord.save();
    console.log(`[Health Records Service] Created common health record: ${savedRecord._id}`);
    return savedRecord._id.toString();
  }

  /**
   * Generate diagnosis text combining ML prediction with input data
   */
  private generateDiagnosis(predictionResult: HealthPredictionResult): string {
    const healthStatus = predictionResult.predicted_status;
    const confidence = (predictionResult.confidence_scores[healthStatus] * 100).toFixed(1);

    return `ML Model Assessment: ${healthStatus} (Confidence: ${confidence}%)\n\nDiagnosis: ${predictionResult.diagnosis_text}`;
  }

  /**
   * Parse string arrays (allergies, chronic conditions)
   */
  private parseStringArray(items: string[]): Array<{ allergen?: string; condition?: string; severity?: string; notes?: string }> {
    if (!items || items.length === 0) return [];

    return items.map((item) => ({
      allergen: item,
      severity: 'mild', // Default severity, could be enhanced
      notes: '',
    }));
  }

  /**
   * Parse prescriptions from ML model output
   */
  private parsePrescriptions(
    prescriptions: string[]
  ): Array<{ medication: string; dosage: string; frequency: string; notes?: string }> {
    if (!prescriptions || prescriptions.length === 0) return [];

    return prescriptions.map((prescription) => {
      // Parse prescription string - format: "Medication - Dosage - Frequency"
      const parts = prescription.split('-').map((p) => p.trim());

      return {
        medication: parts[0] || 'Unknown',
        dosage: parts[1] || 'As recommended',
        frequency: parts[2] || 'As prescribed',
        notes: `Auto-generated from ML analysis`,
      };
    });
  }

  /**
   * Map vaccination data to health record format
   */
  private mapVaccinations(
    vaccinations: Array<{ vaccine_name: string; administered_date?: string; status: string }>
  ): Array<{ vaccineName: string; administeredDate: Date; nextDueDate?: Date; status: string }> {
    if (!vaccinations || vaccinations.length === 0) return [];

    return vaccinations.map((vac) => ({
      vaccineName: vac.vaccine_name,
      administeredDate: vac.administered_date ? new Date(vac.administered_date) : new Date(),
      status: vac.status === 'up_to_date' ? 'up_to_date' : 'overdue',
    }));
  }
}

// Export singleton instance
export const healthRecordsService = new HealthRecordsService();
export default HealthRecordsService;
