import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAgent extends Document {
  name: string;
  email: string;
  mobile_number: string;
  country_code: string;
  password_hash: string;
}

const AgentSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile_number: { type: String, required: true },
  country_code: { type: String, required: true, default: '+1' },
  password_hash: { type: String, required: true },
}, { timestamps: true });

// Hash password before saving
AgentSchema.pre<IAgent>('save', async function (next) {
  if (!this.isModified('password_hash')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password_hash = await bcrypt.hash(this.password_hash, salt);
  next();
});

export default mongoose.model<IAgent>('Agent', AgentSchema);
