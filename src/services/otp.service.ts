import crypto from "crypto";
import config from "../config/config";
import logger from "../config/logger";
import { OtpCodeModel } from "../models/otp.model";

class OtpService {
  generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  async saveOTP(email: string, fullname: string, otp: string): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + config.otp.expiryMinutes);

      await OtpCodeModel.create({
        email,
        fullname,
        otp_code: otp,
        expires_at: expiresAt,
        is_used: false,
      });

      logger.info(`OTP saved for email: ${email}`);
    } catch (error) {
      logger.error("Error saving OTP", { email, error });
      throw new Error("Failed to save OTP");
    }
  }
  async verifyOTP(
    email: string,
    otp: string,
  ): Promise<{ valid: boolean; fullname?: string }> {
    try {
      const otpRecord = await OtpCodeModel.findOne({
        email: email.toLowerCase(),
        otp_code: otp,
        is_used: false,
        expires_at: { $gt: new Date() },
      }).sort({ created_at: -1 });

      if (!otpRecord) {
        logger.warn(`Invalid or expired OTP for email: ${email}`);
        return { valid: false };
      }

      // Mark OTP as used
      otpRecord.is_used = true;
      await otpRecord.save();

      logger.info(`OTP verified successfully for email: ${email}`);
      return { valid: true, fullname: otpRecord.fullname };
    } catch (error) {
      logger.error("Error verifying OTP", { email, error });
      throw new Error("Failed to verify OTP");
    }
  }

  async cleanupExpiredOTPs(): Promise<void> {
    try {
      const result = await OtpCodeModel.deleteMany({
        expires_at: { $lt: new Date() },
      });
      logger.info(`Cleaned up ${result.deletedCount} expired OTP codes`);
    } catch (error) {
      logger.error("Error cleaning up expired OTPs", error);
    }
  }

  async deleteOTPsByEmail(email: string): Promise<void> {
    try {
      await OtpCodeModel.deleteMany({ email: email.toLowerCase() });
      logger.info(`Deleted all OTP codes for email: ${email}`);
    } catch (error) {
      logger.error("Error deleting OTPs", { email, error });
    }
  }
}

export default new OtpService();
