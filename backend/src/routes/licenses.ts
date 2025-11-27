import express, { Router } from "express";
import { VetLicense } from "../models/models.ts";
import type { IVetLicense } from "../types/interfaces.ts";

const router: Router = express.Router();

// Get all licenses
router.get("/", async (req, res) => {
  try {
    const licenses = await VetLicense.find().populate('issuedBy', 'name email').sort({ createdAt: -1 });
    res.json(licenses);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create new license
router.post("/", async (req, res) => {
  try {
    const { licenseNumber, issuedBy } = req.body;
    
    // Check if license already exists
    const existing = await VetLicense.findOne({ licenseNumber: licenseNumber.toUpperCase() });
    if (existing) {
      console.log('Attempt to create duplicate license:', licenseNumber.toUpperCase());
      return res.status(400).json({ message: "License number already exists" });
    }

    const license = await VetLicense.create({
      licenseNumber: licenseNumber.toUpperCase(),
      issuedBy,
      status: 'available'
    });

    res.status(201).json(license);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update license status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const license = await VetLicense.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!license) {
      return res.status(404).json({ message: "License not found" });
    }
    
    res.json(license);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;