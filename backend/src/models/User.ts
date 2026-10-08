import mongoose, { Document, Schema, Types } from 'mongoose';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER';
export type UserStatus = 'ACTIVE' | 'DISABLED';

export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  bloodGroup?: string;
  dateOfBirth?: Date;
  age?: number;
  weight?: number;
  profileImage?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  location?: string;
  lastDonationDate?: Date;
  nextEligibleDate?: Date;
  availability?: string;
  eligibilityStatus?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['SUPER_ADMIN', 'ADMIN', 'USER'], default: 'USER' },
  status: { type: String, enum: ['ACTIVE', 'DISABLED'], default: 'ACTIVE' },
  bloodGroup: { type: String },
  dateOfBirth: { type: Date },
  age: { type: Number },
  weight: { type: Number },
  profileImage: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  location: { type: String },
  lastDonationDate: { type: Date },
  nextEligibleDate: { type: Date },
  availability: { type: String },
  eligibilityStatus: { type: String },
  lastLogin: { type: Date },
}, { timestamps: true });

UserSchema.index({ role: 1 });
UserSchema.index({ email: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
