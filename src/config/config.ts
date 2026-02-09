import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  email: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
  };
  otp: {
    expiryMinutes: number;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  mongodb: {
    enabled: boolean;
    uri: string;
    dbName: string;
    appName: string;
    maxPoolSize: number;
    minPoolSize: number;
    maxIdleTimeMS: number;
    serverSelectionTimeoutMS: number;
    socketTimeoutMS: number;
    connectTimeoutMS: number;
    heartbeatFrequencyMS: number;
    autoIndex: boolean;
    retryWrites: boolean;
    writeConcernW: string | number;
    journal: boolean;
    readPreference: string;
    connectRetryAttempts: number;
    connectRetryDelayMs: number;
  };
}

const nodeEnv = process.env.NODE_ENV || "development";
const mongodbUri = process.env.DATABASE_URI || "";
const mongodbEnabled = process.env.MONGODB_ENABLED
  ? process.env.MONGODB_ENABLED === "true"
  : mongodbUri.length > 0;

const config: Config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv,
  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    name: process.env.DB_NAME || "auth_db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your_jwt_secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  email: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  otp: {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || "10", 10),
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  },
  mongodb: {
    enabled: mongodbEnabled,
    uri: mongodbUri,
    dbName: process.env.MONGODB_DB_NAME || "smartprep",
    appName: process.env.MONGODB_APP_NAME || "smartprep-api",
    maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || "10", 10),
    minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || "0", 10),
    maxIdleTimeMS: parseInt(
      process.env.MONGODB_MAX_IDLE_TIME_MS || "60000",
      10,
    ),
    serverSelectionTimeoutMS: parseInt(
      process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || "10000",
      10,
    ),
    socketTimeoutMS: parseInt(
      process.env.MONGODB_SOCKET_TIMEOUT_MS || "45000",
      10,
    ),
    connectTimeoutMS: parseInt(
      process.env.MONGODB_CONNECT_TIMEOUT_MS || "10000",
      10,
    ),
    heartbeatFrequencyMS: parseInt(
      process.env.MONGODB_HEARTBEAT_FREQUENCY_MS || "10000",
      10,
    ),
    autoIndex: process.env.MONGODB_AUTO_INDEX
      ? process.env.MONGODB_AUTO_INDEX === "true"
      : nodeEnv !== "production",
    retryWrites: process.env.MONGODB_RETRY_WRITES
      ? process.env.MONGODB_RETRY_WRITES === "true"
      : true,
    writeConcernW: process.env.MONGODB_WRITE_CONCERN_W || "majority",
    journal: process.env.MONGODB_WRITE_JOURNAL
      ? process.env.MONGODB_WRITE_JOURNAL === "true"
      : true,
    readPreference: process.env.MONGODB_READ_PREFERENCE || "primary",
    connectRetryAttempts: parseInt(
      process.env.MONGODB_CONNECT_RETRY_ATTEMPTS || "5",
      10,
    ),
    connectRetryDelayMs: parseInt(
      process.env.MONGODB_CONNECT_RETRY_DELAY_MS || "2000",
      10,
    ),
  },
};

export default config;
