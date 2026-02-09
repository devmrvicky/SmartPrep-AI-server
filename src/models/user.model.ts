import { Schema, model, models } from "mongoose";
import { IUser } from "../types/data";

const userSchema = new Schema<IUser>(
  {
    userId: { type: String, required: true, unique: true },
    fullname: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  },
);

export const UserModel = models.User || model<IUser>("User", userSchema);
