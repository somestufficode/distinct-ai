import mongoose from 'mongoose';

export interface IWorker {
  name: string;
  role: string;
  hourlyRate: number;
  hoursWorked: number;
  specialty: string[];
  project?: string;
}

const WorkerSchema = new mongoose.Schema<IWorker>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    hourlyRate: { type: Number, required: true },
    hoursWorked: { type: Number, default: 0 },
    specialty: [{ type: String, enum: ['plumbing', 'electrical', 'carpentry', 'general'] }],
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  },
  {
    timestamps: true,
  }
);

const Worker = mongoose.models.Worker || mongoose.model<IWorker>('Worker', WorkerSchema);

export default Worker; 