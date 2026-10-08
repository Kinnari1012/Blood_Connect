import dotenv from 'dotenv';
dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/bloodconnect',
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_min_32_chars_here!!',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_32chars!!!',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10),
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  eligibilityGapDays: parseInt(process.env.ELIGIBILITY_GAP_DAYS || '90', 10),
  maxDonorNotifyCount: parseInt(process.env.MAX_DONOR_NOTIFY_COUNT || '10', 10),
};
