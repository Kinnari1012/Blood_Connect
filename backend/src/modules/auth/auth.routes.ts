import { Router } from 'express';
import { AuthController } from './auth.controller';
import { verifyToken } from '../../middleware/verifyToken';
import rateLimit from 'express-rate-limit';
import { config } from '../../config/env';

const router = Router();

const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMax,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts. Try again later.' } },
});

router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);
router.get('/me', verifyToken, AuthController.getMe);
router.put('/change-password', verifyToken, AuthController.changePassword);

export default router;
