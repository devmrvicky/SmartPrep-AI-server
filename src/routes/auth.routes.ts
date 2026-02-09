import { Router } from "express";
import authController from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import {
  validate,
  sendOtpValidation,
  verifyOtpValidation,
  completeRegistrationValidation,
  loginValidation,
} from "../middlewares/validation.middleware";

const router = Router();

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to user's email for verification
 * @access  Public
 */
router.post("/send-otp", validate(sendOtpValidation), authController.sendOtp);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify the OTP sent to user's email
 * @access  Public
 */
router.post(
  "/verify-otp",
  validate(verifyOtpValidation),
  authController.verifyOtp,
);

/**
 * @route   POST /api/auth/complete-registration
 * @desc    Complete registration with password after OTP verification
 * @access  Public
 */
router.post(
  "/complete-registration",
  validate(completeRegistrationValidation),
  authController.completeRegistration,
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user with email and password
 * @access  Public
 */
router.post("/login", validate(loginValidation), authController.login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Protected
 */
router.get("/profile", authenticate, authController.getProfile);

export default router;
