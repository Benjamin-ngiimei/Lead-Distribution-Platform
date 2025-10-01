import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  first_name: string;
  phone: string;
  notes?: string;
  upload_batch_id: string;
}

const LeadSchema: Schema = new Schema({
  first_name: { type: String, required: true },
  phone: { type: String, required: true },
  notes: { type: String },
  upload_batch_id: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<ILead>('Lead', LeadSchema);
