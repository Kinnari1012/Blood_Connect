import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../middleware/verifyToken';
import { requireRole, requirePermission } from '../../middleware/requireRole';
import { AuditLog } from '../../models/AuditLog';
import { z } from 'zod';

const router = Router();
router.use(verifyToken);
router.use(requireRole('ADMIN', 'SUPER_ADMIN'));
router.use(requirePermission('VIEW_AUDIT_LOGS'));

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  action: z.string().optional(),
  performedById: z.string().optional(),
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, action, performedById } = querySchema.parse(req.query);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (action) filter.action = { $regex: action, $options: 'i' };
    if (performedById) filter.performedById = performedById;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('performedById', 'fullName email role')
        .populate('targetUserId', 'fullName email')
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    res.json({ success: true, data: logs, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

export default router;
