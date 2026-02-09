import crypto from "crypto";
import config from "../config/config";
import logger from "../config/logger";
import { OtpCodeModel } from "../models/otp.model";
import { IOtpCode } from "../types/data";
import hashingService from "./hashing.service";

class OtpService {
  generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  async findOTPByEmailAndPurpose(
    email: string,
    purpose: string,
  ): Promise<IOtpCode | null> {
    try {
      const otpRecord = (await OtpCodeModel.findOne({
        email: email.toLowerCase(),
        purpose,
        isUsed: false,
        expiresAt: { $gt: new Date() },
      })) as IOtpCode | null;
      return otpRecord;
    } catch (error) {
      logger.error("Error finding OTP by email and purpose", {
        email,
        purpose,
        error,
      });
      throw new Error("Failed to find OTP");
    }
  }
  async saveOTP(
    email: string,
    fullname: string,
    otp: string,
  ): Promise<{ email: string; expiresAt: Date }> {
    try {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + config.otp.expiryMinutes);
      const otpHash = await hashingService.hash(otp);

      await OtpCodeModel.create({
        email,
        fullname,
        otpCode: otpHash,
        expiresAt,
        isUsed: false,
      });

      logger.info(`OTP saved for email: ${email}`);
      return { email, expiresAt };
    } catch (error) {
      logger.error("Error saving OTP", { email, error });
      throw new Error("Failed to save OTP");
    }
  }
  async verifyOTP(
    email: string,
    otp: string,
    purpose: string,
  ): Promise<{ valid: boolean; email?: string }> {
    try {
      const otpRecord = (await OtpCodeModel.findOne({
        email: email.toLowerCase(),
        purpose,
        isUsed: false,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 })) as IOtpCode | null;

      if (!otpRecord) {
        logger.warn(`Invalid or expired OTP for email: ${email}`);
        return { valid: false };
      }

      const isMatch = await hashingService.compare(otp, otpRecord.otpCode);
      if (!isMatch) {
        logger.warn(`Invalid OTP attempt for email: ${email}`);
        return { valid: false };
      }

      // Mark OTP as used
      otpRecord.isUsed = true;
      await otpRecord.save();

      logger.info(`OTP verified successfully for email: ${email}`);
      return { valid: true, email: otpRecord.email };
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
