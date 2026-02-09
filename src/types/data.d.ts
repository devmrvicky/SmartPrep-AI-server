import type { Document } from "mongoose";

export interface IUser extends Document {
  id: string;
  fullname: string;
  email: string;
  password_hash: string;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IUserResponse {
  id: string;
  fullname: string;
  email: string;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IOtpCode extends Document {
  id: string;
  email: string;
  fullname: string;
  otp_code: string;
  expires_at: Date;
  is_used: boolean;
  created_at: Date;
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
}

export interface IVerifyOtpData {
  email: string;
  otp: string;
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
