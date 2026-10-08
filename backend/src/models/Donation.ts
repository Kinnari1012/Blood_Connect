import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IDonation extends Document {
  _id: Types.ObjectId;
  donorId: Types.ObjectId;
  requestId: Types.ObjectId;
  donationDate: Date;
  status: 'Scheduled' | 'Donation Completed' | 'Cancelled';
  units: number;
  bloodComponent: string;
  hospital: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema = new Schema<IDonation>({
  donorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  requestId: { type: Schema.Types.ObjectId, ref: 'BloodRequest', required: true },
  donationDate: { type: Date, required: true },
  status: { type: String, enum: ['Scheduled', 'Donation Completed', 'Cancelled'], default: 'Scheduled' },
  units: { type: Number, required: true },
  bloodComponent: { type: String, required: true },
  hospital: { type: String, required: true },
  notes: { type: String }
}, { timestamps: true });

export const Donation = mongoose.model<IDonation>('Donation', DonationSchema);
