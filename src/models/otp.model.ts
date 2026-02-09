import { Schema, model, models } from "mongoose";
import { IOtpCode } from "../types/data";

const otpSchema = new Schema<IOtpCode>(
  {
    email: { type: String, required: true, lowercase: true },
    fullname: { type: String, required: true, trim: true },
    otp_code: { type: String, required: true },
    expires_at: { type: Date, required: true },
    is_used: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  },
);

otpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
export const OtpCodeModel =
  models.OtpCode || model<IOtpCode>("OtpCode", otpSchema);
