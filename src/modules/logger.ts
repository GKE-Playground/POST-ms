import { LoggingWinston } from "@google-cloud/logging-winston";
import winston from "winston";

// Imports the Google Cloud client library for Winston

// Replace 'YOUR_PROJECT_ID' with your actual Google Cloud project ID
const loggingWinston = new LoggingWinston({ projectId: "cst-pbag-aiml-test" });

// Create a Winston logger that streams to Cloud Logging
// Logs will be written to: "projects/YOUR_PROJECT_ID/logs/winston_log"
const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console(),
    // Add Cloud Logging
    loggingWinston,
  ],
});

export default logger;