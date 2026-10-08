import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBloodRequest extends Document {
  _id: Types.ObjectId;
  requestId: string;
  patientName: string;
  bloodGroup: string;
  unitsRequired: number;
  hospital: string;
  location: string;
  requiredDate: Date;
  requiredTime: string;
  urgency: 'Normal' | 'Urgent' | 'Critical';
  status: 'Pending Verification' | 'Searching Donors' | 'Donor Found' | 'Partially Fulfilled' | 'Fulfilled' | 'Cancelled' | 'Rejected';
  contactName: string;
  contactPhone: string;
  createdBy: Types.ObjectId;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BloodRequestSchema = new Schema<IBloodRequest>({
  requestId: { type: String, required: true, unique: true },
  patientName: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  unitsRequired: { type: Number, required: true },
  hospital: { type: String, required: true },
  location: { type: String, required: true },
  requiredDate: { type: Date, required: true },
  requiredTime: { type: String, required: true },
  urgency: { type: String, enum: ['Normal', 'Urgent', 'Critical'], default: 'Normal' },
  status: { type: String, enum: ['Pending Verification', 'Searching Donors', 'Donor Found', 'Partially Fulfilled', 'Fulfilled', 'Cancelled', 'Rejected'], default: 'Pending Verification' },
  contactName: { type: String, required: true },
  contactPhone: { type: String, required: true },
  rejectionReason: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const BloodRequest = mongoose.model<IBloodRequest>('BloodRequest', BloodRequestSchema);
