import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import config from "./config/config";
import logger from "./config/logger";
import authRoutes from "./routes/auth.routes";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddleware(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    this.app.use(
      cors({
        origin:
          config.nodeEnv === "production"
            ? ["https://yourdomain.com"]
            : ["http://localhost:3000", "http://localhost:5173"],
        credentials: true,
      }),
    );

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: {
        success: false,
        message: "Too many requests from this IP, please try again later.",
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    this.app.use("/api/", limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Request logging
    this.app.use((req, _, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get("user-agent"),
      });
      next();
    });
  }

  private configureRoutes(): void {
    // Health check endpoint
    this.app.get("/health", (_, res) => {
      res.status(200).json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString(),
      });
    });

    // API routes
    this.app.use("/api/auth", authRoutes);

    // API documentation endpoint
    this.app.get("/api", (_, res) => {
      res.status(200).json({
        success: true,
        message: "Authentication API",
        version: "1.0.0",
        endpoints: {
          auth: {
            sendOtp: "POST /api/auth/send-otp",
            verifyOtp: "POST /api/auth/verify-otp",
            completeRegistration: "POST /api/auth/complete-registration",
            login: "POST /api/auth/login",
            profile: "GET /api/auth/profile (Protected)",
          },
        },
      });
    });
  }

  private configureErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }
}

export default new App().app;
