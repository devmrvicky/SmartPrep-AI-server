import { Schema, model, models } from "mongoose";
import { IUser } from "../types/data";

const userSchema = new Schema<IUser>(
  {
    fullname: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, unique: true },
    password_hash: { type: String, required: true },
    is_verified: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

export const UserModel = models.User || model<IUser>("User", userSchema);
