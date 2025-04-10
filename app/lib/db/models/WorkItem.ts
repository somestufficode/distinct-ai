import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkItem extends Document {
  item: string;
  costEstimate: number;
  status: 'completed' | 'pending' | 'in_progress';
  type: 'plumbing' | 'electrical' | 'carpentry' | 'general';
  location: string;
  notes?: string;
  dateAdded: Date;
  dateCompleted?: Date;
  project: mongoose.Types.ObjectId;
}

const WorkItemSchema: Schema = new Schema(
  {
    item: { type: String, required: true },
    costEstimate: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['completed', 'pending', 'in_progress'], 
      default: 'pending' 
    },
    type: { 
      type: String, 
      enum: ['plumbing', 'electrical', 'carpentry', 'general'],
      required: true 
    },
    location: { type: String, required: true },
    notes: { type: String },
    dateAdded: { type: Date, default: Date.now },
    dateCompleted: { type: Date },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true }
  },
  { timestamps: true }
);

export const WorkItem = mongoose.models.WorkItem || mongoose.model<IWorkItem>('WorkItem', WorkItemSchema); 