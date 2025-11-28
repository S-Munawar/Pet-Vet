import express, { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth } from "../middlewares/auth.ts";
import { createPetHandler, listPetsHandler } from "../controllers/pets.controller.ts";

const router: Router = express.Router();

// Create a new pet for the authenticated user
router.post('/', requireAuth, createPetHandler);

// GET /pets - list pets, supports search and filters
router.get('/', requireAuth, listPetsHandler);

export default router;
