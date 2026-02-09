import mongoose, { type ConnectOptions } from "mongoose";
import config from "../config/config";
import logger from "../config/logger";

const { mongodb, nodeEnv } = config;

mongoose.set("strictQuery", true);
mongoose.set("sanitizeFilter", true);
mongoose.set("bufferCommands", false);
mongoose.set("autoIndex", mongodb.autoIndex);

if (nodeEnv !== "production") {
  mongoose.set("debug", (collection, method, query, doc, options) => {
    logger.debug("Mongo query", {
      collection,
      method,
      query,
      doc,
      options,
    });
  });
}

let handlersRegistered = false;

const registerConnectionHandlers = (): void => {
  if (handlersRegistered) {
    return;
  }

  handlersRegistered = true;

  mongoose.connection.on("connected", () => {
    logger.info("MongoDB connected");
  });

  mongoose.connection.on("reconnected", () => {
    logger.info("MongoDB reconnected");
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });

  mongoose.connection.on("error", (error) => {
    logger.error("MongoDB connection error", { error });
  });
};

const buildConnectOptions = (): ConnectOptions => ({
  dbName: mongodb.dbName,
  appName: mongodb.appName,
  maxPoolSize: mongodb.maxPoolSize,
  minPoolSize: mongodb.minPoolSize,
  maxIdleTimeMS: mongodb.maxIdleTimeMS,
  serverSelectionTimeoutMS: mongodb.serverSelectionTimeoutMS,
  socketTimeoutMS: mongodb.socketTimeoutMS,
  connectTimeoutMS: mongodb.connectTimeoutMS,
  heartbeatFrequencyMS: mongodb.heartbeatFrequencyMS,
  retryWrites: mongodb.retryWrites,
  w: mongodb.writeConcernW as any,
  journal: mongodb.journal,
  readPreference: mongodb.readPreference as any,
  autoIndex: mongodb.autoIndex,
});

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const connectMongo = async (): Promise<void> => {
  if (!mongodb.enabled) {
    logger.warn("MongoDB is disabled. Set MONGODB_URI to enable it.");
    return;
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  registerConnectionHandlers();

  if (!mongodb.uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  const maxAttempts = Math.max(1, mongodb.connectRetryAttempts);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await mongoose.connect(mongodb.uri, buildConnectOptions());
      return;
    } catch (error) {
      logger.error("MongoDB connection failed", {
        attempt,
        maxAttempts,
        error,
      });

      if (attempt >= maxAttempts) {
        throw error;
      }

      const delayMs = Math.min(mongodb.connectRetryDelayMs * attempt, 30000);
      logger.warn(`Retrying MongoDB connection in ${delayMs}ms`);
      await sleep(delayMs);
    }
  }
};

export const disconnectMongo = async (): Promise<boolean> => {
  if (mongoose.connection.readyState === 0) {
    return false;
  }

  await mongoose.connection.close(false);
  return true;
};

export const mongoReadyState = (): number => mongoose.connection.readyState;
