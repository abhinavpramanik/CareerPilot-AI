import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  college?: string;
  degree?: string;
  branch?: string;
  graduationYear?: number;
  targetRole?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    image: { type: String },
    college: { type: String },
    degree: { type: String },
    branch: { type: String },
    graduationYear: { type: Number },
    targetRole: { type: String },
  },
  { timestamps: true }
);

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
