import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITestimonial extends Document {
  _id: Types.ObjectId;
  authorName: string;
  role: string;
  city: string;
  bloodGroup: string;
  content: string;
  rating: number;
  isApproved: boolean;
  userId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>({
  authorName: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  bloodGroup: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  isApproved: { type: Boolean, default: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
}, { timestamps: true });

export const Testimonial = mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
