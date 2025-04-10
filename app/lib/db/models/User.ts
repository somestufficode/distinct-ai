import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'worker';
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['admin', 'manager', 'worker'], 
      default: 'worker' 
    },
    profilePicture: { type: String },
  },
  { timestamps: true }
);

const User = (mongoose.models.User as Model<IUser>) || 
             mongoose.model<IUser>('User', UserSchema);

export default User; 