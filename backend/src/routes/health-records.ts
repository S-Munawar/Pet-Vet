import { Router, type Request, type Response } from 'express';
import { requireAuth } from '../middlewares/auth.ts';
import { getHealthRecordsByPet, getHealthRecordDetails } from '../controllers/health-records.controller.ts';

const router: Router = Router();

/**
 * Health Records Routes
 * GET /api/health-records/pet/:petId - Get health records for a specific pet
 * GET /api/health-records/:recordId - Get detailed health record
 */

/**
 * GET /api/health-records/pet/:petId
 * Path params: petId
 * Response: Array of health records for the pet (sorted by date descending)
 */
router.get('/pet/:petId', requireAuth, getHealthRecordsByPet);

/**
 * GET /api/health-records/:recordId
 * Path params: recordId (common health record ID)
 * Response: Detailed health record with species-specific data
 */
router.get('/:recordId', requireAuth, getHealthRecordDetails);

export default router;
