import mongoose, { Document, Schema } from 'mongoose';

export interface IOtp extends Document {
  identifier: string;
  code: string;
  purpose: string;
  expiresAt: Date;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    identifier: { type: String, required: true, index: true },
    code: { type: String, required: true },
    purpose: { type: String, default: 'LOGIN' },
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { timestamps: true }
);

export const Otp = mongoose.model<IOtp>('Otp', OtpSchema);
