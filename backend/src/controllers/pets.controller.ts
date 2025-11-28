import type { Request, Response } from 'express';
import { Pet, PetOwnerProfile, User } from '../models/models.ts';

export async function createPetHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string | undefined;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, species, dateOfBirth } = req.body as { name?: string; species?: string; dateOfBirth?: string };

    if (!name || !species || !dateOfBirth) {
      return res.status(400).json({ message: 'Missing required fields: name, species, dateOfBirth' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let ownerProfile = await PetOwnerProfile.findOne({ user_id: user._id });
    if (!ownerProfile) {
      ownerProfile = await PetOwnerProfile.create({ user_id: user._id });
    }

    const pet = await Pet.create({
      owner_id: ownerProfile._id,
      name,
      species,
      dateOfBirth: new Date(dateOfBirth),
    });

    return res.status(201).json(pet);
  } catch (err) {
    console.error('Create pet error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function listPetsHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string | undefined;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const q = typeof req.query.q === 'string' ? req.query.q.trim() : undefined;
    const species = typeof req.query.species === 'string' ? req.query.species : undefined;
    const limit = Math.min(Number(req.query.limit) || 50, 200);

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const filter: any = {};
    if (q) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(q);
      if (isObjectId) filter._id = q;
      else filter.name = { $regex: q, $options: 'i' };
    }
    if (species) filter.species = species;

    if ((user as any).role === 'pet_owner') {
      const ownerProfile = await PetOwnerProfile.findOne({ user_id: user._id }).lean();
      if (!ownerProfile) return res.json([]);
      filter.owner_id = ownerProfile._id;
    }

    const pets = await Pet.find(filter)
      .limit(limit)
      .populate({ path: 'owner_id', populate: { path: 'user_id', select: 'name email' } })
      .lean();

    const out = pets.map((p: any) => ({
      _id: p._id?.toString(),
      name: p.name,
      species: p.species,
      dateOfBirth: p.dateOfBirth,
      owner_id: p.owner_id?._id?.toString(),
      ownerName: p.owner_id?.user_id?.name || null,
      ownerEmail: p.owner_id?.user_id?.email || null,
    }));

    return res.json(out);
  } catch (err) {
    console.error('List pets error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
