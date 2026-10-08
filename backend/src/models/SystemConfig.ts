import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISystemConfig extends Document {
  key: string;
  value: string;
  updatedById: Types.ObjectId;
  updatedAt: Date;
}

const SystemConfigSchema = new Schema<ISystemConfig>({
  key:         { type: String, required: true, unique: true },
  value:       { type: String, required: true },
  updatedById: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const SystemConfig = mongoose.model<ISystemConfig>('SystemConfig', SystemConfigSchema);
