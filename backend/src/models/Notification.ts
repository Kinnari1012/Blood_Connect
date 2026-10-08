import mongoose, { Document, Schema, Types } from 'mongoose';

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: 'New Blood Request' | 'Emergency Request' | 'Donor Matched' | 'Donor Response' | 'Donor Approved' | 'Donation Reminder' | 'Request Fulfilled' | 'Profile Updated' | 'System Notification';
  title: string;
  description: string;
  read: boolean;
  relatedRequestId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['New Blood Request', 'Emergency Request', 'Donor Matched', 'Donor Response', 'Donor Approved', 'Donation Reminder', 'Request Fulfilled', 'Profile Updated', 'System Notification'], 
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  read: { type: Boolean, default: false },
  relatedRequestId: { type: Schema.Types.ObjectId, ref: 'BloodRequest' }
}, { timestamps: true });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
