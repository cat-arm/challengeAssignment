// Challenge 4: Throttle Service
// Port: 4002
// Receives calls from Caller Service
// Throttles to max 4,096 calls per minute
// Forwards to Echo Service
// Logs all calls and throttle events with timestamp

import express, { Request, Response } from "express";
import axios, { AxiosInstance } from "axios";
import * as fs from "fs";
import * as path from "path";
import http from "http";

const app = express();
const PORT = 4002;
const ECHO_SERVICE_URL = "http://localhost:4003/echo"; // Echo Service endpoint

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
  timeout: 5000, // 5 second timeout
  maxRedirects: 5,
});

// Middleware to parse JSON
app.use(express.json());

/**
 * Throttler class manages rate limiting
 * Limits to 4,096 calls per minute
 * Uses a lock to prevent race conditions with concurrent requests
 */
class Throttler {
  private calls: number[]; // Array of timestamps for each call
  private readonly maxCallsPerMinute: number = 4096; // Maximum allowed calls per minute
  private throttledCount: number = 0; // Count of throttled requests
  private processing: Promise<boolean> = Promise.resolve(true); // Lock for concurrent access

  constructor() {
    this.calls = [];
  }

  /**
   * Check if a new call can be forwarded
   * Removes calls older than 1 minute, then checks if under limit
   * Uses a lock to prevent race conditions with concurrent requests
   * @returns Promise<boolean> - true if call can be forwarded, false if should be throttled
   */
  async canForward(): Promise<boolean> {
    // Use a lock to ensure only one request processes at a time
    this.processing = this.processing.then(async () => {
      const now = Date.now();
      const oneMinuteAgo = now - 60000; // 60,000 milliseconds = 1 minute

      // Remove calls older than 1 minute
      this.calls = this.calls.filter((timestamp) => timestamp > oneMinuteAgo);

      // Check if under limit
      if (this.calls.length < this.maxCallsPerMinute) {
        this.calls.push(now); // Record this call
        return true;
      }

      // Exceeding limit - throttle this request
      this.throttledCount++;
      return false;
    });

    return this.processing;
  }

  /**
   * Get current call count in the last minute
   */
  getCurrentCount(): number {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    this.calls = this.calls.filter((timestamp) => timestamp > oneMinuteAgo);
    return this.calls.length;
  }

  /**
   * Get throttled count
   */
  getThrottledCount(): number {
    return this.throttledCount;
  }

  /**
   * Get remaining capacity
   */
  getRemainingCapacity(): number {
    return Math.max(0, this.maxCallsPerMinute - this.getCurrentCount());
  }
}

// Create throttler instance
const throttler = new Throttler();

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
    console.log(`[Throttle Service] ${logEntry.trim()}`);
  }

  /**
   * Close the write stream (call before process exit)
   */
  close(): void {
    this.writeStream.end();
  }
}

// Create logger instance
const logger = new Logger("throttle-service.log");

/**
 * POST /forward - Forward endpoint
 * Receives calls from Caller Service
 * Throttles to max 4,096 calls per minute
 * Forwards allowed calls to Echo Service
 */
app.post("/forward", async (req: Request, res: Response) => {
  const receivedData = req.body;

  // Extract request ID for better logging
  const requestId = receivedData.id || "unknown";

  // Check if we can forward this request (async to handle race conditions)
  // Note: canForward() will update the count, so we get the count AFTER checking
  const canForward = await throttler.canForward();
  
  // Get current count AFTER canForward() to get accurate count
  const currentCount = throttler.getCurrentCount();
  const remainingCapacity = throttler.getRemainingCapacity();

  // Log incoming request with accurate count
  logger.log(`[ID:${requestId}] Received from Caller: ${JSON.stringify(receivedData)} | Current calls in last minute: ${currentCount} | Remaining capacity: ${remainingCapacity}`);
  if (!canForward) {
    // Throttled - log and return error
    const throttledCount = throttler.getThrottledCount();
    logger.log(`[ID:${requestId}] THROTTLED: Request throttled (exceeding 4,096/min limit) | Total throttled: ${throttledCount}`);
    return res.status(429).json({
      error: "Throttled",
      message: "Request rate exceeds 4,096 calls per minute",
      throttledCount,
    });
  }

  // Can forward - send to Echo Service
  try {
    logger.log(`[ID:${requestId}] Forwarding to Echo Service: ${JSON.stringify(receivedData)}`);
    const echoResponse = await axiosInstance.post(ECHO_SERVICE_URL, receivedData);

    // Log successful forward
    logger.log(`[ID:${requestId}] Forwarded successfully. Echo Service response: ${JSON.stringify(echoResponse.data)}`);

    // Return Echo Service response to Caller Service
    res.json(echoResponse.data);
  } catch (error) {
    // Error forwarding to Echo Service
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const statusCode = axios.isAxiosError(error) && error.response ? error.response.status : "unknown";
    logger.log(`[ID:${requestId}] Error forwarding to Echo Service: ${errorMessage} | Status: ${statusCode}`);
    res.status(500).json({
      error: "Forwarding failed",
      message: errorMessage,
      requestId,
    });
  }
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "Throttle Service",
    port: PORT,
    currentCalls: throttler.getCurrentCount(),
    remainingCapacity: throttler.getRemainingCapacity(),
    throttledCount: throttler.getThrottledCount(),
    maxCallsPerMinute: 4096,
  });
});

// Start server
app.listen(PORT, () => {
  logger.log(`Throttle Service started on port ${PORT}`);
  logger.log(`Rate limit: 4,096 calls per minute`);
  logger.log(`Echo Service URL: ${ECHO_SERVICE_URL}`);
  console.log(`Throttle Service running on http://localhost:${PORT}`);
});

// Cleanup function to close connections
function cleanup() {
  logger.log("Cleaning up connections...");
  httpAgent.destroy(); // Close all connections
  logger.close();
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  logger.log("Shutting down Throttle Service...");
  cleanup();
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.log("Shutting down Throttle Service...");
  cleanup();
  process.exit(0);
});
