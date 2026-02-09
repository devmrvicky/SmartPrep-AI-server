import { Request, Response, NextFunction } from "express";
import authService from "../services/auth.service";
import logger from "../config/logger";
import { IJwtPayload } from "../types/data";

export interface AuthRequest extends Request {
  user?: IJwtPayload;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "No token provided",
      });
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = authService.verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      logger.warn("Invalid token attempt", { error });
      res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
      return;
    }
  } catch (error) {
    logger.error("Authentication middleware error", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
