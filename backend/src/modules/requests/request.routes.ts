import { Router } from 'express';
import { RequestController } from './request.controller';
import { verifyToken } from '../../middleware/verifyToken';
import { requireRole } from '../../middleware/requireRole';

const router = Router();

// Public routes (no authentication required)
router.get('/public/live-radar', RequestController.getPublicLiveRadar);

router.use(verifyToken);

router.get('/', RequestController.getAllRequests);
router.post('/', requireRole('USER'), RequestController.createRequest);
router.get('/my', RequestController.getMyRequests);
router.get('/matching', RequestController.getMatchingRequests);
router.get('/:id', RequestController.getRequest);
router.delete('/:id', requireRole('USER'), RequestController.cancelRequest);

// Donor response routes
router.post('/:requestId/accept', requireRole('USER'), RequestController.acceptRequest);
router.post('/:requestId/decline', requireRole('USER'), RequestController.declineRequest);
router.post('/:requestId/complete', requireRole('USER'), RequestController.completeRequest);
// Admin/Super Admin verification routes
router.post('/:id/approve', requireRole('ADMIN', 'SUPER_ADMIN'), RequestController.approveRequest);
router.post('/:id/reject', requireRole('ADMIN', 'SUPER_ADMIN'), RequestController.rejectRequest);
router.post('/:id/responses/:responseId/approve', requireRole('ADMIN', 'SUPER_ADMIN'), RequestController.approveDonorResponse);

export default router;
