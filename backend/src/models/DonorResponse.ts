import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IDonorResponse extends Document {
  _id: Types.ObjectId;
  requestId: Types.ObjectId;
  donorId: Types.ObjectId;
  response: 'INTERESTED' | 'NOT_AVAILABLE';
  matchScore: number;
  matchReason?: string;
  status: 'PENDING' | 'NOTIFIED' | 'ACCEPTED' | 'DECLINED' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

const DonorResponseSchema = new Schema<IDonorResponse>({
  requestId: { type: Schema.Types.ObjectId, ref: 'BloodRequest', required: true },
  donorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  response: { type: String, enum: ['INTERESTED', 'NOT_AVAILABLE'] },
  matchScore: { type: Number },
  matchReason: { type: String },
  status: { type: String, enum: ['PENDING', 'NOTIFIED', 'ACCEPTED', 'DECLINED', 'APPROVED', 'REJECTED'], default: 'PENDING' }
}, { timestamps: true });

export const DonorResponse = mongoose.model<IDonorResponse>('DonorResponse', DonorResponseSchema);
