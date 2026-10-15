import { Request, Response, NextFunction } from 'express';
import { DonationService } from './donation.service';

export class DonationController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await DonationService.getAllDonations(req.query);
      res.json({ success: true, data: result.donations, meta: { total: result.total } });
    } catch (err) { next(err); }
  }

  static async getMyDonations(req: Request, res: Response, next: NextFunction) {
    try {
      const donations = await DonationService.getMyDonations(req.user!.id);
      res.json({ success: true, data: donations });
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const donation = await DonationService.createDonation(req.body, req.user!.id);
      res.status(201).json({ success: true, data: donation, message: 'Donation logged successfully' });
    } catch (err) { next(err); }
  }
}
