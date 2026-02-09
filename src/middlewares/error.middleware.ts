import { Request, Response } from "express";
import logger from "../config/logger";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
): void => {
  if (err instanceof AppError) {
    logger.error("Operational error", {
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
    });

    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  logger.error("Unexpected error", {
    message: err.message,
    stack: err.stack,
    path: req.path,
  });

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};
