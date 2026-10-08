import { Router } from 'express';
import { DonorController } from './donor.controller';
import { verifyToken } from '../../middleware/verifyToken';
import { requireRole } from '../../middleware/requireRole';

const router = Router();

router.get('/search', DonorController.searchDonors);
router.get('/:id/public', DonorController.getPublicProfile);

router.use(verifyToken);
router.post('/profile', requireRole('USER'), DonorController.createProfile);
router.get('/profile', requireRole('USER'), DonorController.getMyProfile);
router.put('/profile', requireRole('USER'), DonorController.updateProfile);
router.put('/availability', requireRole('USER'), DonorController.updateAvailability);

export default router;
