import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(2).max(255),
  lastName: z.string().min(2).max(255),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number'),
  password: z.string().min(8).max(100),
  role: z.preprocess(
    (v) => (typeof v === 'string' ? v.toUpperCase() : v),
    z.enum(['USER', 'DONOR']).default('USER')
  ),
  bloodGroup: z.string().optional(),
});

export const loginSchema = z.object({
  identifier: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  otp: z.string().optional(),
  donorAvailability: z.boolean().optional(),
}).refine((data) => !!(data.identifier || data.email), {
  message: 'Email address or mobile number is required',
  path: ['identifier'],
}).refine((data) => !!(data.password || data.otp), {
  message: 'Password or OTP is required',
  path: ['password'],
});

export const sendOtpSchema = z.object({
  identifier: z.string().min(1, 'Email address or mobile number is required'),
  purpose: z.enum(['LOGIN', 'RESET_PASSWORD', 'VERIFICATION']).optional().default('LOGIN'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8).max(100),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type SendOtpDto = z.infer<typeof sendOtpSchema>;
