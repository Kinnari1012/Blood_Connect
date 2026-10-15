import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../../models/User';
import { DonorProfile } from '../../models/DonorProfile';
import { Otp } from '../../models/Otp';
import { config } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { JwtPayload } from '../../types';
import { RegisterDto, LoginDto, SendOtpDto } from './auth.dto';

export class AuthService {
  /**
   * Helper to normalize identifier and find user by email or phone
   */
  static normalizeIdentifier(raw: string): string {
    const trimmed = raw.trim();
    if (trimmed.includes('@')) {
      return trimmed.toLowerCase();
    }
    // Return pure digits or cleaned string
    const digits = trimmed.replace(/\D/g, '');
    return digits || trimmed;
  }

  static findUserByIdentifier(raw: string, includePassword = false) {
    const trimmed = raw.trim();
    const query = trimmed.includes('@')
      ? User.findOne({ email: trimmed.toLowerCase() })
      : (() => {
          const digits = trimmed.replace(/\D/g, '');
          const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
          return User.findOne({
            $or: [
              { phone: trimmed },
              { phone: digits },
              { phone: `+${digits}` },
              { phone: { $regex: `${last10}$` } },
            ],
          });
        })();

    if (includePassword) {
      return query.select('+passwordHash');
    }
    return query;
  }

  static async register(dto: RegisterDto) {
    const emailNormal = dto.email.trim().toLowerCase();
    const existing = await User.findOne({
      $or: [{ email: emailNormal }, { phone: dto.phone.trim() }],
    });
    if (existing) {
      throw new AppError('Email or phone number already registered', 409, 'DUPLICATE_USER');
    }

    const passwordHash = await bcrypt.hash(dto.password, config.bcryptRounds);

    const user = await User.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: emailNormal,
      phone: dto.phone.trim(),
      passwordHash,
      role: dto.role || 'USER',
      bloodGroup: dto.bloodGroup || undefined,
      status: 'ACTIVE',
    });

    if (dto.role === 'DONOR' && dto.bloodGroup) {
      await DonorProfile.create({
        userId: user._id,
        bloodGroup: dto.bloodGroup as any,
        dateOfBirth: new Date('1998-01-01'),
        gender: 'MALE',
        availability: true,
        preferredContact: 'IN_APP',
        totalDonations: 0,
      }).catch((err) => {
        console.warn('Could not create initial donor profile on register:', err?.message);
      });
    }

    const tokens = this.generateTokens(user._id.toString(), user.role);
    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  static async sendOtp(dto: SendOtpDto) {
    const rawIdentifier = dto.identifier.trim();
    const user = await this.findUserByIdentifier(rawIdentifier);
    if (!user) {
      throw new AppError('No registered account found with this email or mobile number', 404, 'USER_NOT_FOUND');
    }

    if (user.status === 'DISABLED') {
      throw new AppError('Your account has been disabled. Please contact support.', 403, 'ACCOUNT_DISABLED');
    }

    const normId = this.normalizeIdentifier(rawIdentifier);
    // Generate 6 digit numeric code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Expire in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await Otp.deleteMany({ identifier: normId });
    await Otp.create({
      identifier: normId,
      code,
      purpose: dto.purpose || 'LOGIN',
      expiresAt,
    });

    console.log(`\n==================================================`);
    console.log(`🔑 [BloodConnect Auth] OTP for ${rawIdentifier} (${user.email || user.phone}): ${code}`);
    console.log(`==================================================\n`);

    return {
      success: true,
      message: `Verification code sent to registered ${rawIdentifier.includes('@') ? 'email' : 'mobile number'}`,
      identifier: rawIdentifier,
      // devOtp returned to ensure seamless local/dev testing
      devOtp: config.nodeEnv !== 'production' ? code : undefined,
    };
  }

  static async login(dto: LoginDto) {
    const rawIdentifier = (dto.identifier || dto.email || '').trim();
    if (!rawIdentifier) {
      throw new AppError('Email address or mobile number is required', 400, 'IDENTIFIER_REQUIRED');
    }

    const user = await this.findUserByIdentifier(rawIdentifier, true);
    if (!user) {
      throw new AppError('Account not found with this email or mobile number', 401, 'INVALID_CREDENTIALS');
    }

    if (user.status === 'DISABLED') {
      throw new AppError('Your account has been disabled', 403, 'ACCOUNT_DISABLED');
    }

    // Verify via OTP or Password
    if (dto.otp) {
      const normId = this.normalizeIdentifier(rawIdentifier);
      const userEmailNorm = this.normalizeIdentifier(user.email);
      const userPhoneNorm = this.normalizeIdentifier(user.phone);

      const enteredOtp = dto.otp.trim();
      const isDevFallback = config.nodeEnv !== 'production' && enteredOtp === '123456';

      const validOtp = await Otp.findOne({
        identifier: { $in: [normId, userEmailNorm, userPhoneNorm] },
        code: enteredOtp,
        expiresAt: { $gt: new Date() },
      });

      if (!validOtp && !isDevFallback) {
        throw new AppError('Invalid or expired OTP. Please request a new one.', 401, 'INVALID_OTP');
      }

      // Cleanup used OTP
      await Otp.deleteMany({
        identifier: { $in: [normId, userEmailNorm, userPhoneNorm] },
      });
    } else if (dto.password) {
      const isValid = await bcrypt.compare(dto.password, user.passwordHash);
      if (!isValid) {
        throw new AppError('Invalid email/mobile or password', 401, 'INVALID_CREDENTIALS');
      }
    } else {
      throw new AppError('Password or OTP must be provided', 400, 'AUTH_CREDENTIAL_MISSING');
    }

    await User.updateOne({ _id: user._id }, { lastLogin: new Date() });

    // Handle Donor Availability Setting during Login:
    // If the user specifies their availability preference (e.g. marking Unavailable)
    if (typeof dto.donorAvailability === 'boolean') {
      await DonorProfile.updateOne(
        { userId: user._id },
        { availability: dto.donorAvailability }
      );
      await User.updateOne(
        { _id: user._id },
        { availability: dto.donorAvailability ? 'AVAILABLE' : 'UNAVAILABLE' }
      );
    }

    // Load donor profile if exists
    const donorProfile = await DonorProfile.findOne({ userId: user._id }).lean();

    const tokens = this.generateTokens(user._id.toString(), user.role);
    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        role: user.role,
        status: user.status,
        bloodGroup: user.bloodGroup || donorProfile?.bloodGroup,
        city: user.city || donorProfile?.city,
        availability: donorProfile ? donorProfile.availability : (user.availability === 'AVAILABLE'),
        donorProfile: donorProfile ? {
          bloodGroup: donorProfile.bloodGroup,
          availability: donorProfile.availability,
          city: donorProfile.city,
          area: donorProfile.area,
          totalDonations: donorProfile.totalDonations,
          lastDonationDate: donorProfile.lastDonationDate,
          nextEligibleDate: donorProfile.nextEligibleDate,
        } : undefined,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  static generateTokens(userId: string, role: string) {
    const accessPayload: JwtPayload = { userId, role: role as any, type: 'access' };
    const refreshPayload: JwtPayload = { userId, role: role as any, type: 'refresh' };

    const accessToken = jwt.sign(accessPayload, config.jwt.secret, {
      expiresIn: config.jwt.accessExpiresIn as any,
    });
    const refreshToken = jwt.sign(refreshPayload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn as any,
    });
    return { accessToken, refreshToken };
  }

  static verifyRefreshToken(token: string): JwtPayload {
    try {
      const payload = jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
      if (payload.type !== 'refresh') throw new AppError('Invalid token type', 401, 'INVALID_TOKEN');
      return payload;
    } catch {
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_TOKEN');
    }
  }
}
