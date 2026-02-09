import http from "http";
import app from "./app";
import config from "./config/config";
import logger from "./config/logger";
// import { connectMongo, disconnectMongo } from "./db/db";
import emailService from "./services/email.service";
import otpService from "./services/otp.service";
import { connectMongo, disconnectMongo } from "./db/db";

const server = http.createServer(app);

// Verify email service connection on startup
const initializeServices = async (): Promise<void> => {
  try {
    // Connect to MongoDB if enabled
    await connectMongo();

    // Verify email service
    const emailConnected = await emailService.verifyConnection();
    if (!emailConnected) {
      logger.warn("Email service connection failed - emails may not be sent");
    }

    // Schedule cleanup of expired OTPs every hour
    setInterval(
      () => {
        otpService.cleanupExpiredOTPs();
      },
      60 * 60 * 1000,
    );

    logger.info("All services initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize services", error);
    process.exit(1);
  }
};

// Start server
const startServer = async (): Promise<void> => {
  try {
    await initializeServices();

    server.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Health check: http://localhost:${config.port}/health`);
      logger.info(`API documentation: http://localhost:${config.port}/api`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} signal received: closing HTTP server`);

  server.close(async () => {
    logger.info("HTTP server closed");

    try {
      const results = await disconnectMongo();

      if (results) {
        logger.info("MongoDB connection closed");
      } else {
        logger.error("Failed to close MongoDB connection");
      }

      // const hasErrors = results.some((result) => result.status === "rejected");
      // process.exit(hasErrors ? 1 : 0);
    } catch (error) {
      logger.error("Error during graceful shutdown", error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception", error);
  gracefulShutdown("uncaughtException");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: any) => {
  logger.error("Unhandled Rejection", reason);
  gracefulShutdown("unhandledRejection");
});

// Start the server
startServer();
