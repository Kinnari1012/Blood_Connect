import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema, changePasswordSchema } from './auth.dto';
import { AuditService, AUDIT_ACTIONS } from '../../services/audit.service';
import bcrypt from 'bcryptjs';
import { User } from '../../models/User';
import { DonorProfile } from '../../models/DonorProfile';
import { AppError } from '../../middleware/errorHandler';
import { config } from '../../config/env';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = registerSchema.parse(req.body);
      const result = await AuthService.register(dto);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true, secure: config.nodeEnv === 'production', sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(201).json({ success: true, data: { user: result.user, accessToken: result.accessToken }, message: 'Registration successful' });
    } catch (err) { next(err); }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = loginSchema.parse(req.body);
      const result = await AuthService.login(dto);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true, secure: config.nodeEnv === 'production', sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      if (['ADMIN', 'SUPER_ADMIN'].includes(result.user.role)) {
        await AuditService.log({ action: AUDIT_ACTIONS.ADMIN_LOGIN, performedById: result.user.id, ipAddress: req.ip });
      }
      res.json({ success: true, data: { user: result.user, accessToken: result.accessToken }, message: 'Login successful' });
    } catch (err: any) {
      if (err.name === 'MongooseServerSelectionError' || err.code === 'ECONNREFUSED' || err.message.includes('ECONNREFUSED')) {
        console.error('[MongoDB Error]', err);
        return next(new AppError('Database connection unavailable. Please try again later.', 503, 'DB_ERROR'));
      }
      next(err);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken;
      if (!token) throw new AppError('Refresh token not found', 401, 'UNAUTHORIZED');
      const payload = AuthService.verifyRefreshToken(token);
      const user = await User.findOne({ _id: payload.userId, deletedAt: null });
      if (!user) throw new AppError('User not found', 401, 'UNAUTHORIZED');
      const tokens = AuthService.generateTokens(user._id.toString(), user.role);
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true, secure: config.nodeEnv === 'production', sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.json({ success: true, data: { accessToken: tokens.accessToken } });
    } catch (err) { next(err); }
  }

  static async logout(_req: Request, res: Response) {
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      const user = await User.findById(req.user!.id).select('+passwordHash');
      if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) throw new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');
      const passwordHash = await bcrypt.hash(newPassword, config.bcryptRounds);
      await User.updateOne({ _id: user._id }, { passwordHash });
      res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) { next(err); }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.user!.id).lean();
      if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
      
      res.json({
        success: true,
        data: {
          id: (user._id as any).toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          status: user.status,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          bloodGroup: user.bloodGroup,
          city: user.city,
          location: user.location,
          availability: user.availability,
        },
      });
    } catch (err) { next(err); }
  }
}
