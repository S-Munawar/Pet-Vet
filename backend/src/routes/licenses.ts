import express, { Router } from "express";
import { listLicensesHandler, createLicenseHandler, updateLicenseStatusHandler } from "../controllers/licenses.controller.ts";
import { requireAuth } from "../middlewares/auth.ts";

const router: Router = express.Router();

router.get('/', requireAuth, listLicensesHandler);
router.post('/', requireAuth, createLicenseHandler);
router.patch('/:id/status', requireAuth, updateLicenseStatusHandler);

export default router;