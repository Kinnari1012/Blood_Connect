import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TestimonialController } from './testimonial.controller';
import { verifyToken } from '../../middleware/verifyToken';
import { requireRole } from '../../middleware/requireRole';
import { config } from '../../config/env';
import { JwtPayload } from '../../types';

const router = Router();

// Optional token extraction middleware
const optionalToken = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      if (decoded.type === 'access') {
        req.user = {
          id: decoded.userId,
          email: '',
          role: 'USER',
          status: 'ACTIVE',
        };
      }
    } catch {
      // Ignore token failure for public creation
    }
  }
  next();
};

// Public read & submit
router.get('/', TestimonialController.getAll);
router.post('/', optionalToken, TestimonialController.create);

// Admin moderation
router.patch('/:id/approve', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), TestimonialController.approve);

export default router;
