import mongoose from 'mongoose';
import { IProject } from './Project';
import { IWorker } from './Worker';

export interface IEvent {
  _id: mongoose.Types.ObjectId;
  title: string;
  start: Date;
  end: Date;
  project: mongoose.Types.ObjectId | IProject;
  location: string;
  workers: mongoose.Types.ObjectId[] | IWorker[];
  workType: 'plumbing' | 'electrical' | 'carpentry' | 'general';
  description?: string;
  travelTimeBefore?: number;
  travelTimeAfter?: number;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new mongoose.Schema<IEvent>({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  location: { type: String, required: true },
  workers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true }],
  workType: { type: String, enum: ['plumbing', 'electrical', 'carpentry', 'general'], required: true },
  description: { type: String },
  travelTimeBefore: { type: Number },
  travelTimeAfter: { type: Number }
}, { timestamps: true });

EventSchema.index({ start: 1, end: 1 });
EventSchema.index({ project: 1 });
EventSchema.index({ workers: 1 });

export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema); 