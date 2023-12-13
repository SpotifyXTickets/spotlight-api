import "winston-mongodb";
// src/utils/logger.js
import winston from "winston";
import dotenv from "dotenv";
dotenv.config();

// Set up Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    // Write to all logs with level `info` and below to `combined.log`
    // Write all logs error (and below) to `error.log`.
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV === "production") {
  logger.add(
    new winston.transports.MongoDB({
      db: process.env.MONGODB_URL ?? "",
      dbName: "citricLogs",
      collection: "ErrorLogs",
      level: "error",
    })
  );
} else {
  logger.add(
    new winston.transports.File({ filename: "logs/error.log", level: "error" })
  );
  logger.add(new winston.transports.File({ filename: "logs/combined.log" }));
}

export default logger;
