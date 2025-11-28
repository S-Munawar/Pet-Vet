import type { Request, Response } from 'express';
import { CommonHealthRecord, CatHealthRecord, DogHealthRecord } from '../models/models.ts';
import type { ICommonHealthRecord, ICatHealthRecord, IDogHealthRecord } from '../types/interfaces.ts';
import mongoose from 'mongoose';

/**
 * Health Records Controller
 * Handles retrieval of health analysis records for pets
 */

/**
 * GET /health-records/pet/:petId
 * Retrieve all health records for a specific pet
 */
export const getHealthRecordsByPet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { petId } = req.params;

    // Validate petId
    if (!petId || !mongoose.Types.ObjectId.isValid(petId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid pet ID format',
      });
      return;
    }

    // Fetch all common health records for this pet, sorted by date descending
    const records = await CommonHealthRecord.find({
      pet_id: new mongoose.Types.ObjectId(petId),
    })
      .sort({ visitDate: -1 })
      .limit(100)
      .lean() as ICommonHealthRecord[];

    if (!records || records.length === 0) {
      res.status(200).json({
        success: true,
        data: [],
        message: 'No health records found for this pet',
      });
      return;
    }

    // Enrich records with species-specific data
    const enrichedRecords = await Promise.all(
      records.map(async (record) => {
        try {
          const recordId = record.species_health_record_id;
          if (!recordId) {
            throw new Error('Missing species health record ID');
          }

          const speciesRecord = record.species_health_record_model === 'CatHealthRecord'
            ? await CatHealthRecord.findById(recordId).lean()
            : await DogHealthRecord.findById(recordId).lean();

          return {
            _id: record._id,
            visitDate: record.visitDate,
            created_by_type: record.created_by_type,
            species_type: record.species_type,
            commonRecordId: record._id,
            speciesRecordId: recordId,
            diagnosis: (speciesRecord as any)?.diagnosis || '',
            treatment: (speciesRecord as any)?.treatment || '',
          };
        } catch (error) {
          console.error(`Error enriching record ${record._id}:`, error);
          return {
            _id: record._id,
            visitDate: record.visitDate,
            created_by_type: record.created_by_type,
            species_type: record.species_type,
            commonRecordId: record._id,
            speciesRecordId: record.species_health_record_id,
            diagnosis: 'Error loading diagnosis',
            treatment: 'Error loading treatment',
          };
        }
      })
    );

    res.status(200).json({
      success: true,
      data: enrichedRecords,
    });
  } catch (error) {
    console.error('[Health Records Controller] Error fetching records:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve health records',
      error_details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /health-records/:recordId
 * Retrieve detailed information for a specific health record
 */
export const getHealthRecordDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recordId } = req.params;

    // Validate recordId
    if (!recordId || !mongoose.Types.ObjectId.isValid(recordId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid record ID format',
      });
      return;
    }

    // Fetch common health record
    const commonRecord = await CommonHealthRecord.findById(recordId)
      .populate('pet_id', 'name species breed dateOfBirth')
      .populate('created_by', 'name email role')
      .lean() as any;

    if (!commonRecord) {
      res.status(404).json({
        success: false,
        error: 'Health record not found',
      });
      return;
    }

    // Fetch species-specific record
    const recordId2 = (commonRecord as any).species_health_record_id;
    if (!recordId2) {
      res.status(500).json({
        success: false,
        error: 'Species health record ID is missing',
      });
      return;
    }

    const speciesRecord = (commonRecord as any).species_health_record_model === 'CatHealthRecord'
      ? await CatHealthRecord.findById(recordId2).lean()
      : await DogHealthRecord.findById(recordId2).lean();

    if (!speciesRecord) {
      res.status(404).json({
        success: false,
        error: 'Species-specific health record not found',
      });
      return;
    }

    // Return combined data
    res.status(200).json({
      success: true,
      data: {
        commonRecord,
        speciesRecord,
        petInfo: commonRecord.pet_id,
        createdBy: commonRecord.created_by,
      },
    });
  } catch (error) {
    console.error('[Health Records Controller] Error fetching record details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve health record details',
      error_details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
