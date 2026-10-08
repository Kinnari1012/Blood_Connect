import mongoose, { Document, Schema, Types } from 'mongoose';

export type BloodGroup = 'A_POS' | 'A_NEG' | 'B_POS' | 'B_NEG' | 'AB_POS' | 'AB_NEG' | 'O_POS' | 'O_NEG';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type ContactPreference = 'CALL' | 'WHATSAPP' | 'IN_APP';

export interface IDonorProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  dateOfBirth: Date;
  gender: Gender;
  bloodGroup: BloodGroup;
  availability: boolean;
  lastDonationDate?: Date;
  nextEligibleDate?: Date;
  preferredContact: ContactPreference;
  state?: string;
  city?: string;
  area?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  totalDonations: number;
  createdAt: Date;
  updatedAt: Date;
}

const DonorProfileSchema = new Schema<IDonorProfile>({
  userId:           { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  dateOfBirth:      { type: Date, required: true },
  gender:           { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], required: true },
  bloodGroup:       { type: String, enum: ['A_POS','A_NEG','B_POS','B_NEG','AB_POS','AB_NEG','O_POS','O_NEG'], required: true },
  availability:     { type: Boolean, default: true },
  lastDonationDate: { type: Date },
  nextEligibleDate: { type: Date },
  preferredContact: { type: String, enum: ['CALL','WHATSAPP','IN_APP'], default: 'IN_APP' },
  state:            { type: String },
  city:             { type: String },
  area:             { type: String },
  pincode:          { type: String },
  latitude:         { type: Number },
  longitude:        { type: Number },
  totalDonations:   { type: Number, default: 0 },
}, { timestamps: true });

DonorProfileSchema.index({ bloodGroup: 1 });
DonorProfileSchema.index({ city: 1, area: 1 });
DonorProfileSchema.index({ availability: 1 });
DonorProfileSchema.index({ nextEligibleDate: 1 });

export const DonorProfile = mongoose.model<IDonorProfile>('DonorProfile', DonorProfileSchema);
