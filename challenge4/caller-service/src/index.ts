// Challenge 4: Caller Service
// Port: 4001
// Calls Throttle Service at 16^n rates per minute
// - 1st minute: 16 calls
// - 2nd minute: 256 calls
// - 3rd minute: 4,096 calls
// - 4th minute: 65,536 calls
// Each call has incremental ID and logs timestamp

import axios, { AxiosInstance } from "axios";
import * as fs from "fs";
import * as path from "path";
import http from "http";
import https from "https";

const THROTTLE_SERVICE_URL = "http://localhost:4002/forward"; // Throttle Service endpoint

// Create HTTP agent with connection pooling to prevent EMFILE errors
const httpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 50, // Maximum number of sockets per host
  maxFreeSockets: 10, // Maximum number of free sockets to keep open
  timeout: 60000,
  keepAliveMsecs: 30000,
});

// Create axios instance with connection pooling
const axiosInstance: AxiosInstance = axios.create({
  httpAgent,
  timeout: 10000, // 10 second timeout
  maxRedirects: 5,
});

/**
 * Logger utility class for writing logs to file
 * Uses file stream to avoid EMFILE errors with high volume logging
 */
class Logger {
  private logFilePath: string;
  private writeStream: fs.WriteStream;

  constructor(logFileName: string) {
    // Create logs directory if it doesn't exist
    const logsDir = path.join(__dirname, "../../logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    this.logFilePath = path.join(logsDir, logFileName);
    // Open file stream for writing (append mode)
    this.writeStream = fs.createWriteStream(this.logFilePath, { flags: "a" });
  }

  /**
   * Write log entry to file with timestamp
   */
  log(message: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    // Use write stream instead of appendFileSync to avoid file handle issues
    this.writeStream.write(logEntry);
    console.log(`[Caller Service] ${logEntry.trim()}`);
  }

  /**
   * Close the write stream (call before process exit)
   */
  close(): void {
    this.writeStream.end();
  }
}

// Create logger instance
const logger = new Logger("caller-service.log");

/**
 * Make a single call to Throttle Service
 * @param callId - Incremental ID for this call
 * @returns Promise that resolves when call completes
 */
async function makeCall(callId: number): Promise<void> {
  const callStartTime = Date.now();
  const callData = { id: callId, data: callId.toString() };

  logger.log(`Calling Throttle Service - ID: ${callId} | Data: ${callData.data}`);

  try {
    // Make POST request to Throttle Service using pooled connection
    const response = await axiosInstance.post(THROTTLE_SERVICE_URL, callData);

    const callEndTime = Date.now();
    const duration = callEndTime - callStartTime;

    logger.log(`Received response for ID ${callId} | Response: ${JSON.stringify(response.data)} | Duration: ${duration}ms`);
  } catch (error) {
    const callEndTime = Date.now();
    const duration = callEndTime - callStartTime;

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.log(`Error for ID ${callId} | Error: ${errorMessage} | Duration: ${duration}ms`);
  }
}

/**
 * Make multiple calls in parallel
 * @param count - Number of calls to make
 * @param startId - Starting ID for calls
 * @returns Promise that resolves when all calls complete
 */
async function makeCalls(count: number, startId: number): Promise<void> {
  logger.log(`Making ${count} calls starting from ID ${startId}`);

  // Create array of promises for all calls
  const callPromises: Promise<void>[] = [];

  for (let i = 0; i < count; i++) {
    const callId = startId + i;
    callPromises.push(makeCall(callId));
  }

  // Wait for all calls to complete
  await Promise.all(callPromises);

  logger.log(`Completed ${count} calls starting from ID ${startId}`);
}

/**
 * Main function to run the caller service
 * Makes calls at 16^n rates per minute for 4 minutes
 */
async function main() {
  logger.log("Caller Service started");
  logger.log(`Throttle Service URL: ${THROTTLE_SERVICE_URL}`);

  let callId = 1; // Start from ID 1

  // Minute 1: 16 calls (16^1)
  logger.log("=== Minute 1: Making 16 calls ===");
  const minute1Start = Date.now();
  await makeCalls(16, callId);
  callId += 16;
  const minute1Duration = Date.now() - minute1Start;
  logger.log(`Minute 1 completed in ${minute1Duration}ms`);

  // Wait until 1 minute has passed
  const minute1Wait = Math.max(0, 60000 - minute1Duration);
  if (minute1Wait > 0) {
    logger.log(`Waiting ${minute1Wait}ms before minute 2...`);
    await new Promise((resolve) => setTimeout(resolve, minute1Wait));
  }

  // Minute 2: 256 calls (16^2)
  logger.log("=== Minute 2: Making 256 calls ===");
  const minute2Start = Date.now();
  await makeCalls(256, callId);
  callId += 256;
  const minute2Duration = Date.now() - minute2Start;
  logger.log(`Minute 2 completed in ${minute2Duration}ms`);

  // Wait until 1 minute has passed
  const minute2Wait = Math.max(0, 60000 - minute2Duration);
  if (minute2Wait > 0) {
    logger.log(`Waiting ${minute2Wait}ms before minute 3...`);
    await new Promise((resolve) => setTimeout(resolve, minute2Wait));
  }

  // Minute 3: 4,096 calls (16^3)
  logger.log("=== Minute 3: Making 4,096 calls ===");
  const minute3Start = Date.now();
  await makeCalls(4096, callId);
  callId += 4096;
  const minute3Duration = Date.now() - minute3Start;
  logger.log(`Minute 3 completed in ${minute3Duration}ms`);

  // Wait until 1 minute has passed
  const minute3Wait = Math.max(0, 60000 - minute3Duration);
  if (minute3Wait > 0) {
    logger.log(`Waiting ${minute3Wait}ms before minute 4...`);
    await new Promise((resolve) => setTimeout(resolve, minute3Wait));
  }

  // Minute 4: 65,536 calls (16^4)
  // Note: This is a very large number, may take a long time
  logger.log("=== Minute 4: Making 65,536 calls ===");
  logger.log("WARNING: This will take a significant amount of time...");
  const minute4Start = Date.now();
  await makeCalls(65536, callId);
  callId += 65536;
  const minute4Duration = Date.now() - minute4Start;
  logger.log(`Minute 4 completed in ${minute4Duration}ms`);

  logger.log(`Total calls made: ${callId - 1}`);
}

// Cleanup function to close connections
function cleanup() {
  logger.log("Cleaning up connections...");
  httpAgent.destroy(); // Close all connections
  logger.close();
}

// Run main function
main()
  .then(() => {
    cleanup();
  })
  .catch((error) => {
    logger.log(`Fatal error: ${error instanceof Error ? error.message : String(error)}`);
    cleanup();
    process.exit(1);
  });

// Handle graceful shutdown
process.on("SIGINT", () => {
  logger.log("Shutting down Caller Service...");
  cleanup();
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.log("Shutting down Caller Service...");
  cleanup();
  process.exit(0);
});
