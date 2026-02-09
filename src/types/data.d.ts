import type { Document } from "mongoose";

export interface IUser extends Document {
  userId: string;
  fullname: string;
  email: string;
  passwordHash: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserResponse {
  id: string;
  fullname: string;
  email: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type purposeType = "registration" | "login";

export interface IOtpCode extends Document {
  id: string;
  email: string;
  otpCode: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
  attemps: number;
  purpose: purposeType;
}

export interface IJwtPayload {
  userId: string;
  email: string;
}

export interface ICreateUserData {
  fullname: string;
  email: string;
  password: string;
}

export interface ISendOtpData {
  fullname: string;
  email: string;
  purpose: purposeType;
}

export interface IVerifyOtpData {
  email: string;
  otp: string;
  purpose: purposeType;
}

export interface ICompleteRegistrationData {
  fullname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ILoginData {
  email: string;
  password: string;
}
