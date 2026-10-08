import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IThemeSettings extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  mode: 'light' | 'dark' | 'system';
  createdAt: Date;
  updatedAt: Date;
}

const ThemeSettingsSchema = new Schema<IThemeSettings>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  primaryColor: { type: String, default: '#C62828' },
  secondaryColor: { type: String, default: '#0F172A' },
  accentColor: { type: String, default: '#2563EB' },
  mode: { type: String, enum: ['light', 'dark', 'system'], default: 'system' }
}, { timestamps: true });

export const ThemeSettings = mongoose.model<IThemeSettings>('ThemeSettings', ThemeSettingsSchema);
