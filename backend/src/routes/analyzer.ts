import { Router, type Request, type Response } from 'express';
import { analyzePetHealth, getFormDefinitions } from '../controllers/analyzer.controller.ts';
import { requireAuth } from '../middlewares/auth.ts';

const router: Router = Router();

/**
 * Analyzer Routes
 * POST /api/analyzer/analyze - Submit pet data for health analysis
 * GET /api/analyzer/form-definitions - Get form field definitions
 */

/**
 * POST /api/analyzer/analyze
 * Request body: MLAnalysisRequest
 * Response: MLAnalysisResponse with prediction results
 */
router.post('/analyze', requireAuth, analyzePetHealth);

/**
 * GET /api/analyzer/form-definitions?species=cat
 * Query params: species (cat or dog)
 * Response: Form field definitions for the specified species
 */
router.get('/form-definitions', requireAuth, getFormDefinitions);

export default router;
