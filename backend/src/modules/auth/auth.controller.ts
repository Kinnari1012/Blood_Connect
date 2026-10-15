import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema, sendOtpSchema, changePasswordSchema } from './auth.dto';
import { AuditService, AUDIT_ACTIONS } from '../../services/audit.service';
import bcrypt from 'bcryptjs';
import { User } from '../../models/User';
import { DonorProfile } from '../../models/DonorProfile';
import { BloodRequest } from '../../models/BloodRequest';
import { Donation } from '../../models/Donation';
import { AppError } from '../../middleware/errorHandler';
import { config } from '../../config/env';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = registerSchema.parse(req.body);
      const result = await AuthService.register(dto);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(201).json({
        success: true,
        data: { user: result.user, accessToken: result.accessToken },
        message: 'Registration successful',
      });
    } catch (err) {
      next(err);
    }
  }

  static async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = sendOtpSchema.parse(req.body);
      const result = await AuthService.sendOtp(dto);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = loginSchema.parse(req.body);
      const result = await AuthService.login(dto);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      if (['ADMIN', 'SUPER_ADMIN'].includes(result.user.role)) {
        await AuditService.log({
          action: AUDIT_ACTIONS.ADMIN_LOGIN,
          performedById: result.user.id,
          ipAddress: req.ip,
        });
      }
      res.json({
        success: true,
        data: { user: result.user, accessToken: result.accessToken },
        message: 'Login successful',
      });
    } catch (err: any) {
      if (
        err.name === 'MongooseServerSelectionError' ||
        err.code === 'ECONNREFUSED' ||
        err.message?.includes('ECONNREFUSED')
      ) {
        console.error('[MongoDB Error]', err);
        return next(
          new AppError('Database connection unavailable. Please try again later.', 503, 'DB_ERROR')
        );
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
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.json({ success: true, data: { accessToken: tokens.accessToken } });
    } catch (err) {
      next(err);
    }
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
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.user!.id).lean();
      if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

      const donorProfile = await DonorProfile.findOne({ userId: user._id }).lean();

      res.json({
        success: true,
        data: {
          id: (user._id as any).toString(),
          email: user.email,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`.trim(),
          role: user.role,
          status: user.status,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          bloodGroup: user.bloodGroup || donorProfile?.bloodGroup,
          city: user.city || donorProfile?.city,
          location: user.location,
          availability: donorProfile ? donorProfile.availability : (user.availability === 'AVAILABLE'),
          donorProfile: donorProfile
            ? {
                bloodGroup: donorProfile.bloodGroup,
                availability: donorProfile.availability,
                city: donorProfile.city,
                area: donorProfile.area,
                totalDonations: donorProfile.totalDonations,
                lastDonationDate: donorProfile.lastDonationDate,
                nextEligibleDate: donorProfile.nextEligibleDate,
              }
            : undefined,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const {
        firstName, lastName, fullName, phone, mobile,
        bloodGroup, dateOfBirth, dob,
        address, city, state, country, location,
        availability,
      } = req.body;

      const updateFields: any = {};

      if (firstName) updateFields.firstName = String(firstName).trim();
      if (lastName) updateFields.lastName = String(lastName).trim();
      if (fullName && (!firstName || !lastName)) {
        const parts = String(fullName).trim().split(' ');
        updateFields.firstName = parts[0] || '';
        updateFields.lastName = parts.slice(1).join(' ') || parts[0] || '';
      }
      if (phone) updateFields.phone = String(phone).trim();
      if (mobile && !phone) updateFields.phone = String(mobile).trim();

      if (bloodGroup) {
        const bgMap: Record<string, string> = {
          'A+': 'A_POS', 'A-': 'A_NEG', 'B+': 'B_POS', 'B-': 'B_NEG',
          'AB+': 'AB_POS', 'AB-': 'AB_NEG', 'O+': 'O_POS', 'O-': 'O_NEG',
          'A_POS': 'A_POS', 'A_NEG': 'A_NEG', 'B_POS': 'B_POS', 'B_NEG': 'B_NEG',
          'AB_POS': 'AB_POS', 'AB_NEG': 'AB_NEG', 'O_POS': 'O_POS', 'O_NEG': 'O_NEG',
        };
        updateFields.bloodGroup = bgMap[bloodGroup] || bloodGroup;
      }

      if (dateOfBirth) updateFields.dateOfBirth = new Date(dateOfBirth);
      else if (dob) updateFields.dateOfBirth = new Date(dob);

      if (address) updateFields.address = address;
      if (city) updateFields.city = String(city).trim();
      if (state) updateFields.state = String(state).trim();
      if (country) updateFields.country = String(country).trim();
      if (location) updateFields.location = location;

      if (typeof availability === 'boolean') {
        updateFields.availability = availability ? 'AVAILABLE' : 'UNAVAILABLE';
      } else if (typeof availability === 'string') {
        updateFields.availability = (availability === 'Available' || availability === 'AVAILABLE') ? 'AVAILABLE' : 'UNAVAILABLE';
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        { new: true }
      ).lean();

      if (!updatedUser) throw new AppError('User not found', 404, 'NOT_FOUND');

      let donorProfile = await DonorProfile.findOne({ userId }).lean();
      if (donorProfile) {
        const dpUpdates: any = {};
        if (updateFields.bloodGroup) dpUpdates.bloodGroup = updateFields.bloodGroup;
        if (updateFields.city) dpUpdates.city = updateFields.city;
        if (typeof availability === 'boolean') dpUpdates.availability = availability;
        else if (availability === 'Available' || availability === 'AVAILABLE') dpUpdates.availability = true;
        else if (availability === 'Unavailable' || availability === 'UNAVAILABLE') dpUpdates.availability = false;

        if (Object.keys(dpUpdates).length > 0) {
          donorProfile = await DonorProfile.findOneAndUpdate({ userId }, { $set: dpUpdates }, { new: true }).lean();
        }
      }

      const returnedUser = {
        id: (updatedUser._id as any).toString(),
        email: updatedUser.email,
        phone: updatedUser.phone,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        fullName: `${updatedUser.firstName} ${updatedUser.lastName}`.trim(),
        role: updatedUser.role,
        status: updatedUser.status,
        bloodGroup: updatedUser.bloodGroup || donorProfile?.bloodGroup,
        city: updatedUser.city || donorProfile?.city,
        location: updatedUser.location,
        availability: donorProfile ? donorProfile.availability : (updatedUser.availability === 'AVAILABLE'),
        donorProfile: donorProfile
          ? {
              bloodGroup: donorProfile.bloodGroup,
              availability: donorProfile.availability,
              city: donorProfile.city,
              area: donorProfile.area,
              totalDonations: donorProfile.totalDonations,
              lastDonationDate: donorProfile.lastDonationDate,
              nextEligibleDate: donorProfile.nextEligibleDate,
            }
          : undefined,
      };

      res.json({
        success: true,
        data: returnedUser,
        message: 'Profile updated successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  static async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.user!.id).lean();
      if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

      const defaultSettings = {
        notifications: {
          bloodRequests: true,
          statusUpdates: true,
          donationReminders: true,
          matchingDonors: true,
          emailAlerts: false,
          smsAlerts: true,
        },
        twoFactorAuth: true,
        language: 'en',
        theme: 'light',
        privacy: {
          profileVisibility: 'public',
          locationVisibility: 'city',
        },
      };

      const settings = (user as any).settings || defaultSettings;
      res.json({
        success: true,
        data: {
          ...defaultSettings,
          ...settings,
          notifications: {
            ...defaultSettings.notifications,
            ...(settings.notifications || {}),
          },
          privacy: {
            ...defaultSettings.privacy,
            ...(settings.privacy || {}),
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.user!.id);
      if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

      const current = user.settings || {
        notifications: {
          bloodRequests: true,
          statusUpdates: true,
          donationReminders: true,
          matchingDonors: true,
          emailAlerts: false,
          smsAlerts: true,
        },
        twoFactorAuth: true,
        language: 'en',
        theme: 'light',
        privacy: {
          profileVisibility: 'public',
          locationVisibility: 'city',
        },
      };

      const { notifications, twoFactorAuth, language, theme, privacy } = req.body;

      const updatedSettings = {
        notifications: {
          ...current.notifications,
          ...(notifications || {}),
        },
        twoFactorAuth: typeof twoFactorAuth === 'boolean' ? twoFactorAuth : current.twoFactorAuth,
        language: typeof language === 'string' ? language : current.language,
        theme: typeof theme === 'string' ? theme : current.theme,
        privacy: {
          ...current.privacy,
          ...(privacy || {}),
        },
      };

      user.settings = updatedSettings as any;
      await user.save();

      res.json({
        success: true,
        data: user.settings,
        message: 'Settings saved successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  static async exportData(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.user!.id).lean();
      if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

      const [donorProfile, requests, donations] = await Promise.all([
        DonorProfile.findOne({ userId: user._id }).lean(),
        BloodRequest.find({ seekerId: user._id }).lean(),
        Donation.find({ donorId: user._id }).lean(),
      ]);

      const archive = {
        exportTimestamp: new Date().toISOString(),
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          bloodGroup: user.bloodGroup,
          city: user.city,
          state: user.state,
          country: user.country,
          role: user.role,
          status: user.status,
          settings: (user as any).settings,
          createdAt: user.createdAt,
        },
        donorProfile,
        bloodRequests: requests,
        donations,
      };

      res.json({
        success: true,
        data: archive,
        message: 'Data archive generated successfully',
      });
    } catch (err) {
      next(err);
    }
  }
}
