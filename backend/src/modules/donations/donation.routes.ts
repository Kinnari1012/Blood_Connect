import { Router } from 'express';
import { DonationController } from './donation.controller';
import { verifyToken } from '../../middleware/verifyToken';

const router = Router();

router.use(verifyToken);

router.get('/', DonationController.getAll);
router.get('/my', DonationController.getMyDonations);
router.post('/', DonationController.create);

export default router;
