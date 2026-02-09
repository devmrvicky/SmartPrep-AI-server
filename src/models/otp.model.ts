import { Schema, model, models } from "mongoose";
import { IOtpCode } from "../types/data";

const otpSchema = new Schema<IOtpCode>(
  {
    email: { type: String, required: true, lowercase: true },
    otpCode: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    isUsed: { type: Boolean, default: false },
    attemps: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  },
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const OtpCodeModel =
  models.OtpCode || model<IOtpCode>("OtpCode", otpSchema);
