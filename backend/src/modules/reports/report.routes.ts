import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../middleware/verifyToken';
import { requireRole, requirePermission } from '../../middleware/requireRole';
import { UserReport } from '../../models/UserReport';
import { AppError } from '../../middleware/errorHandler';
import { z } from 'zod';

const router = Router();

const createReportSchema = z.object({
  reportedUserId: z.string().min(1),
  category: z.enum(['FAKE_PROFILE', 'INCORRECT_INFO', 'ABUSE', 'SPAM', 'SUSPICIOUS', 'OTHER']),
  description: z.string().max(1000).optional(),
});

const reviewReportSchema = z.object({
  status: z.enum(['UNDER_REVIEW', 'RESOLVED', 'DISMISSED']),
});

router.use(verifyToken);

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = createReportSchema.parse(req.body);
    if (dto.reportedUserId === req.user!.id) throw new AppError('Cannot report yourself', 400, 'INVALID_REQUEST');
    const report = await UserReport.create({ reporterId: req.user!.id, ...dto });
    res.status(201).json({ success: true, data: report, message: 'Report submitted' });
  } catch (err) { next(err); }
});

router.get('/my', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reports = await UserReport.find({ reporterId: req.user!.id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: reports });
  } catch (err) { next(err); }
});

router.get('/', requireRole('ADMIN', 'SUPER_ADMIN'), requirePermission('MANAGE_REPORTS'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reports = await UserReport.find()
        .sort({ createdAt: -1 })
        .populate('reporterId', 'fullName')
        .populate('reportedUserId', 'fullName role')
        .lean();
      res.json({ success: true, data: reports });
    } catch (err) { next(err); }
  }
);

router.put('/:id', requireRole('ADMIN', 'SUPER_ADMIN'), requirePermission('MANAGE_REPORTS'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = reviewReportSchema.parse(req.body);
      const report = await UserReport.findByIdAndUpdate(
        req.params.id as string,
        { status, reviewedById: req.user!.id, reviewedAt: new Date() },
        { new: true }
      );
      res.json({ success: true, data: report, message: 'Report updated' });
    } catch (err) { next(err); }
  }
);

export default router;
