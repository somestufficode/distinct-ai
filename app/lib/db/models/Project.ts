import mongoose from 'mongoose';
import { IUser } from './User';
import { IEvent } from './Event';

export interface IProject {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId | IUser;
  startDate: Date;
  endDate: Date;
  budget: number;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  location: string;
  progress: number;
  events?: IEvent[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new mongoose.Schema<IProject>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  budget: { type: Number, required: true },
  status: {
    type: String,
    enum: ['planning', 'in_progress', 'completed', 'on_hold'],
    required: true,
    default: 'planning'
  },
  location: { type: String, required: true },
  progress: { type: Number }
}, { timestamps: true });

ProjectSchema.virtual('events', {
  ref: 'Event',
  localField: '_id',
  foreignField: 'project'
});

ProjectSchema.index({ owner: 1 });
ProjectSchema.index({ startDate: 1, endDate: 1 });
ProjectSchema.index({ status: 1 });

export const Project = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema); 