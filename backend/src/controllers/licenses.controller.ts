import type { Request, Response } from 'express';
import { VetLicense } from '../models/models.ts';

export async function listLicensesHandler(req: Request, res: Response) {
  try {
    const licenses = await VetLicense.find().populate('issuedBy', 'name email').sort({ createdAt: -1 });
    return res.json(licenses);
  } catch (error) {
    console.error('List licenses error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function createLicenseHandler(req: Request, res: Response) {
  try {
    const { licenseNumber, issuedBy } = req.body;
    const existing = await VetLicense.findOne({ licenseNumber: licenseNumber.toUpperCase() });
    if (existing) {
      console.log('Attempt to create duplicate license:', licenseNumber.toUpperCase());
      return res.status(400).json({ message: 'License number already exists' });
    }
    const license = await VetLicense.create({
      licenseNumber: licenseNumber.toUpperCase(),
      issuedBy,
      status: 'available',
    });
    return res.status(201).json(license);
  } catch (error) {
    console.error('Create license error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function updateLicenseStatusHandler(req: Request, res: Response) {
  try {
    const { status } = req.body;
    const license = await VetLicense.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!license) return res.status(404).json({ message: 'License not found' });
    return res.json(license);
  } catch (error) {
    console.error('Update license status error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
