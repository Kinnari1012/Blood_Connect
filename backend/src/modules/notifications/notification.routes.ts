import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../middleware/verifyToken';
import { NotificationService } from '../../services/notification.service';
import { z } from 'zod';

const router = Router();
const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

router.use(verifyToken);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const { notifications, total } = await NotificationService.getForUser(req.user!.id, page, limit);
    res.json({ success: true, data: notifications, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

router.put('/read-all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await NotificationService.markAllRead(req.user!.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
});

router.put('/:id/read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await NotificationService.markRead(req.params.id as string, req.user!.id);
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) { next(err); }
});

export default router;
