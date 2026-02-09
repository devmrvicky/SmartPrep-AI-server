import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// import db from "../db/db";
import config from "../config/config";
import logger from "../config/logger";
import { ICreateUserData, IUser, ILoginData, IJwtPayload } from "../types/data";
import { UserModel } from "../models/user.model";
// import {
//   User,
//   UserResponse,
//   CreateUserData,
//   ILoginData,
// } from "../models/user.model";

class AuthService {
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken({ userId, email }: IJwtPayload): string {
    return jwt.sign(
      { userId, email },
      config.jwt.secret as string,
      {
        expiresIn: config.jwt.expiresIn,
      } as jwt.SignOptions,
    );
  }

  verifyToken(token: string): IJwtPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as IJwtPayload;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    try {
      const result = await UserModel.findOne({ email });

      return result ? (result.toObject() as IUser) : null;
    } catch (error) {
      logger.error("Error finding user by email", { email, error });
      throw new Error("Database error");
    }
  }

  async createUser(userData: ICreateUserData): Promise<IUser> {
    try {
      const passwordHash = await this.hashPassword(userData.password);

      const newUser = new UserModel({
        fullname: userData.fullname,
        email: userData.email,
        password_hash: passwordHash,
        is_verified: false,
      });
      const savedUser = await newUser.save();
      logger.info(`User created successfully: ${savedUser.email}`);
      return savedUser.toObject() as IUser;
    } catch (error) {
      logger.error("Error creating user", { email: userData.email, error });
      if ((error as any).code === "23505") {
        throw new Error("Email already exists");
      }
      throw new Error("Failed to create user");
    }
  }

  async login(loginData: ILoginData): Promise<{ user: IUser; token: string }> {
    try {
      const user = await this.findUserByEmail(loginData.email);

      if (!user) {
        throw new Error("Invalid email or password");
      }

      const isPasswordValid = await this.comparePassword(
        loginData.password,
        user.password_hash,
      );

      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
      }

      const token = this.generateToken({ userId: user.id, email: user.email });

      // const userResponse: IUser = {
      //   id: user.id,
      //   fullname: user.fullname,
      //   email: user.email,
      //   is_verified: user.is_verified,
      //   created_at: user.created_at,
      //   updated_at: user.updated_at,
      // };

      logger.info(`User logged in successfully: ${user.email}`);
      return { user, token };
    } catch (error) {
      logger.error("Login error", { email: loginData.email, error });
      throw error;
    }
  }

  sanitizeUser(user: IUser): IUser {
    const { password_hash, ...userResponse } = user;
    return userResponse as IUser;
  }
}

export default new AuthService();
