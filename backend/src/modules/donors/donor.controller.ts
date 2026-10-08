import { Request, Response, NextFunction } from 'express';
import { DonorService } from './donor.service';
import { createDonorProfileSchema, updateAvailabilitySchema, searchDonorsSchema } from './donor.dto';

export class DonorController {
  static async createProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = createDonorProfileSchema.parse(req.body);
      const profile = await DonorService.createProfile(req.user!.id, dto as any);
      res.status(201).json({ success: true, data: profile, message: 'Donor profile created' });
    } catch (err) { next(err); }
  }

  static async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await DonorService.getMyProfile(req.user!.id);
      res.json({ success: true, data: profile });
    } catch (err) { next(err); }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = createDonorProfileSchema.partial().parse(req.body);
      const profile = await DonorService.updateProfile(req.user!.id, dto as any);
      res.json({ success: true, data: profile, message: 'Profile updated' });
    } catch (err) { next(err); }
  }

  static async updateAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { availability } = updateAvailabilitySchema.parse(req.body);
      const result = await DonorService.updateAvailability(req.user!.id, availability);
      res.json({ success: true, data: result, message: `You are now ${availability ? 'available' : 'unavailable'}` });
    } catch (err) { next(err); }
  }

  static async searchDonors(req: Request, res: Response, next: NextFunction) {
    try {
      const query = searchDonorsSchema.parse(req.query);
      const { donors, total } = await DonorService.searchDonors(query as any);
      const { page, limit } = query;
      res.json({ success: true, data: donors, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (err) { next(err); }
  }

  static async getPublicProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await DonorService.getPublicProfile(req.params.id as string);
      res.json({ success: true, data: profile });
    } catch (err) { next(err); }
  }
}
