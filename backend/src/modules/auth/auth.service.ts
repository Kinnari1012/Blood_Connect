import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../../models/User';
import { config } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { JwtPayload } from '../../types';
import { RegisterDto, LoginDto } from './auth.dto';

export class AuthService {
  static async register(dto: RegisterDto) {
    const emailNormal = dto.email.trim().toLowerCase();
    const existing = await User.findOne({
      $or: [{ email: emailNormal }, { phone: dto.phone }],
    });
    if (existing) throw new AppError('Email or phone number already registered', 409, 'DUPLICATE_USER');

    const passwordHash = await bcrypt.hash(dto.password, config.bcryptRounds);

    const user = await User.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: emailNormal,
      phone: dto.phone,
      passwordHash,
      role: 'USER',
      status: 'ACTIVE',
    });

    const tokens = this.generateTokens(user._id.toString(), user.role);
    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  static async login(dto: LoginDto) {
    const emailNormal = dto.email.trim().toLowerCase();
    
    // select: false on passwordHash by default — must explicitly include it
    const user = await User.findOne({ email: emailNormal }).select('+passwordHash');
    if (!user) throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (user.status === 'DISABLED') throw new AppError('Your account has been disabled', 403, 'ACCOUNT_DISABLED');

    await User.updateOne({ _id: user._id }, { lastLogin: new Date() });

    const tokens = this.generateTokens(user._id.toString(), user.role);
    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
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
