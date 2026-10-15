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
        .populate('performedById', 'firstName lastName email role')
        .populate('targetUserId', 'firstName lastName email')
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    const formatted = logs.map((l: any) => ({
      ...l,
      id: l._id.toString(),
      admin: l.performedById
        ? `${l.performedById.firstName || ''} ${l.performedById.lastName || ''} (${l.performedById.role || 'Admin'})`.trim()
        : 'System',
      target: l.targetUserId ? `${l.targetUserId.firstName || ''} ${l.targetUserId.lastName || ''}`.trim() : l.targetResource || 'System',
      ip: l.ipAddress || '127.0.0.1',
      time: l.createdAt ? new Date(l.createdAt).toLocaleString() : 'Recently',
    }));

    res.json({ success: true, data: formatted, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

export default router;
