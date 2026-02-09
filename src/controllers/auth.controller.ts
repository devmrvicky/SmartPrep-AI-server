import { Request, Response, NextFunction } from "express";
import authService from "../services/auth.service";
import otpService from "../services/otp.service";
import emailService from "../services/email.service";
import logger from "../config/logger";
import { AppError } from "../middlewares/error.middleware";
// import {
//   ISendOtpData,
//   IVerifyOtpData,
//   ICompleteRegistrationData,
//   LoginData,
// } from "../models/user.model";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  ICompleteRegistrationData,
  ILoginData,
  ISendOtpData,
  IVerifyOtpData,
} from "../types/data";

class AuthController {
  // Step 1: Send OTP to email
  async sendOtp(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { fullname, email }: ISendOtpData = req.body;

      // Check if user already exists
      const existingUser = await authService.findUserByEmail(email);
      if (existingUser) {
        throw new AppError("Email already registered", 409);
      }

      // Generate and save OTP
      const otp = otpService.generateOTP();
      await otpService.saveOTP(email, fullname, otp);

      // Send OTP via email
      await emailService.sendOTP(email, fullname, otp);

      logger.info(`OTP sent successfully to ${email}`);

      res.status(200).json({
        success: true,
        message: "OTP sent successfully to your email",
        data: {
          email,
          expiryMinutes: 10,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Step 2: Verify OTP
  async verifyOtp(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email, otp }: IVerifyOtpData = req.body;

      const verification = await otpService.verifyOTP(email, otp);

      if (!verification.valid) {
        throw new AppError("Invalid or expired OTP", 400);
      }

      res.status(200).json({
        success: true,
        message:
          "OTP verified successfully. You can now complete your registration.",
        data: {
          email,
          fullname: verification.fullname,
          verified: true,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Step 3: Complete registration with password
  async completeRegistration(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { fullname, email, password }: ICompleteRegistrationData = req.body;

      // Check if user already exists
      const existingUser = await authService.findUserByEmail(email);
      if (existingUser) {
        throw new AppError("Email already registered", 409);
      }

      // Create user
      const user = await authService.createUser({
        fullname,
        email,
        password,
      });

      // Generate token
      const token = authService.generateToken({ userId: user.id, email });

      // Clean up OTPs for this email
      await otpService.deleteOTPsByEmail(email);

      logger.info(`User registration completed for ${email}`);

      res.status(201).json({
        success: true,
        message: "Registration completed successfully",
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Login endpoint
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loginData: ILoginData = req.body;

      const { user, token } = await authService.login(loginData);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Invalid email or password"
      ) {
        next(new AppError("Invalid email or password", 401));
      } else {
        next(error);
      }
    }
  }

  // Get current user profile (protected route example)
  async getProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }

      const user = await authService.findUserByEmail(req.user.email);

      if (!user) {
        throw new AppError("User not found", 404);
      }

      const userResponse = authService.sanitizeUser(user);

      res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
        data: {
          user: userResponse,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
