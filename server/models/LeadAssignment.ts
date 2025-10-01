import mongoose, { Schema, Document } from 'mongoose';

export interface ILeadAssignment extends Document {
  lead_id: mongoose.Types.ObjectId;
  agent_id: mongoose.Types.ObjectId;
}

const LeadAssignmentSchema: Schema = new Schema({
  lead_id: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, unique: true },
  agent_id: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
}, { timestamps: { createdAt: 'assigned_at' } });

export default mongoose.model<ILeadAssignment>('LeadAssignment', LeadAssignmentSchema);
