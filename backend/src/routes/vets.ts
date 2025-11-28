import express, { Router } from "express";
import type { Request, Response } from "express";
import { VetProfile } from "../models/models.ts";
import { requireAuth } from "../middlewares/auth.ts";
import { listVetsHandler } from "../controllers/vets.controller.ts";

const router: Router = express.Router();

// GET /vets - return list of vets (requires auth)
router.get('/', requireAuth, listVetsHandler);

export default router;
