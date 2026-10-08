import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../middleware/verifyToken';
import { requireRole, requirePermission } from '../../middleware/requireRole';
import { User } from '../../models/User';
import { DonorProfile } from '../../models/DonorProfile';
import { BloodRequest } from '../../models/BloodRequest';

const router = Router();
router.use(verifyToken);
router.use(requireRole('ADMIN', 'SUPER_ADMIN'));
router.use(requirePermission('VIEW_ANALYTICS'));

router.get('/overview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers, totalDonors, totalSeekers, availableDonors,
      activeRequests, emergencyRequests, completedRequests, totalAdmins,
    ] = await Promise.all([
      User.countDocuments({ deletedAt: null }),
      User.countDocuments({ role: 'USER', deletedAt: null }),
      User.countDocuments({ role: 'USER', deletedAt: null }), // Left as placeholder to avoid breaking destructured array
      DonorProfile.countDocuments({ availability: true }),
      BloodRequest.countDocuments({ status: { $in: ['Searching Donors', 'Donor Found', 'Partially Fulfilled'] } }),
      BloodRequest.countDocuments({ urgency: { $in: ['Urgent', 'Critical'] }, status: { $nin: ['Fulfilled', 'Cancelled'] } }),
      BloodRequest.countDocuments({ status: 'Fulfilled' }),
      User.countDocuments({ role: { $in: ['ADMIN', 'SUPER_ADMIN'] }, deletedAt: null }),
    ]);

    res.json({ success: true, data: { totalUsers, totalDonors, totalSeekers, availableDonors, activeRequests, emergencyRequests, completedRequests, totalAdmins } });
  } catch (err) { next(err); }
});

router.get('/blood-groups', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const groups = await DonorProfile.aggregate([
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, data: groups.map(g => ({ bloodGroup: g._id, count: g.count })) });
  } catch (err) { next(err); }
});

router.get('/cities', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cities = await DonorProfile.aggregate([
      { $match: { city: { $ne: null } } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.json({ success: true, data: cities.map(c => ({ city: c._id, count: c.count })) });
  } catch (err) { next(err); }
});

router.get('/registrations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const results = await User.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo }, deletedAt: null } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            role: '$role',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthly: Record<string, { donors: number; seekers: number }> = {};
    for (const r of results) {
      const key = `${r._id.year}-${String(r._id.month).padStart(2, '0')}`;
      if (!monthly[key]) monthly[key] = { donors: 0, seekers: 0 };
      if (r._id.role === 'USER') monthly[key].donors += r.count;
      else if (r._id.role === 'USER') monthly[key].seekers += r.count;
    }
    res.json({ success: true, data: monthly });
  } catch (err) { next(err); }
});

router.get('/requests', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const statusCounts = await BloodRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    res.json({ success: true, data: statusCounts.map(s => ({ status: s._id, count: s.count })) });
  } catch (err) { next(err); }
});

export default router;
