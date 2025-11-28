import type { Request, Response } from 'express';
import { VetProfile } from '../models/models.ts';

export async function listVetsHandler(req: Request, res: Response) {
  try {
    const vets = await VetProfile.find().populate('user_id', 'name email').lean();
    const response = vets.map((v: any) => ({
      _id: v._id?.toString(),
      name: v.user_id?.name || '',
      email: v.user_id?.email || '',
      specialization: v.specialization || null,
      clinicName: v.clinicName || null,
      licenseNumber: v.licenseNumber || null,
    }));
    return res.json(response);
  } catch (err) {
    console.error('Failed to fetch vets:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
