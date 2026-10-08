import mongoose, { Document, Schema, Types } from 'mongoose';

export type ReportCategory = 'FAKE_PROFILE' | 'INCORRECT_INFO' | 'ABUSE' | 'SPAM' | 'SUSPICIOUS' | 'OTHER';
export type ReportStatus = 'NEW' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';

export interface IUserReport extends Document {
  _id: Types.ObjectId;
  reporterId: Types.ObjectId;
  reportedUserId: Types.ObjectId;
  category: ReportCategory;
  description?: string;
  status: ReportStatus;
  reviewedById?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
}

const UserReportSchema = new Schema<IUserReport>({
  reporterId:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reportedUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category:       { type: String, enum: ['FAKE_PROFILE','INCORRECT_INFO','ABUSE','SPAM','SUSPICIOUS','OTHER'], required: true },
  description:    { type: String },
  status:         { type: String, enum: ['NEW','UNDER_REVIEW','RESOLVED','DISMISSED'], default: 'NEW' },
  reviewedById:   { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt:     { type: Date },
}, { timestamps: true });

export const UserReport = mongoose.model<IUserReport>('UserReport', UserReportSchema);
