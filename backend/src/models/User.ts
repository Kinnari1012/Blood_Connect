import mongoose, { Document, Schema, Types } from 'mongoose';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'DONOR';
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
  settings?: {
    notifications: {
      bloodRequests: boolean;
      statusUpdates: boolean;
      donationReminders: boolean;
      matchingDonors: boolean;
      emailAlerts: boolean;
      smsAlerts: boolean;
    };
    twoFactorAuth: boolean;
    language: string;
    theme: string;
    privacy: {
      profileVisibility: 'public' | 'private';
      locationVisibility: 'exact' | 'city';
    };
  };
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
  role: { type: String, enum: ['SUPER_ADMIN', 'ADMIN', 'USER', 'DONOR'], default: 'USER' },
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
  settings: {
    notifications: {
      bloodRequests: { type: Boolean, default: true },
      statusUpdates: { type: Boolean, default: true },
      donationReminders: { type: Boolean, default: true },
      matchingDonors: { type: Boolean, default: true },
      emailAlerts: { type: Boolean, default: false },
      smsAlerts: { type: Boolean, default: true },
    },
    twoFactorAuth: { type: Boolean, default: true },
    language: { type: String, default: 'en' },
    theme: { type: String, default: 'light' },
    privacy: {
      profileVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
      locationVisibility: { type: String, enum: ['exact', 'city'], default: 'city' },
    },
  },
  lastLogin: { type: Date },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

UserSchema.virtual('fullName').get(function () {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

UserSchema.index({ role: 1 });
UserSchema.index({ phone: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
