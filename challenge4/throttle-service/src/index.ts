// Challenge 4: Throttle Service
// Port: 4002
// Receives calls from Caller Service
// Throttles to max 4,096 calls per minute
// Forwards to Echo Service
// Logs all calls and throttle events with timestamp

import express, { Request, Response } from "express";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";

const app = express();
const PORT = 4002;
const ECHO_SERVICE_URL = "http://localhost:4003/echo"; // Echo Service endpoint

// Middleware to parse JSON
app.use(express.json());

/**
 * Throttler class manages rate limiting
 * Limits to 4,096 calls per minute
 */
class Throttler {
  private calls: number[]; // Array of timestamps for each call
  private readonly maxCallsPerMinute: number = 4096; // Maximum allowed calls per minute
  private throttledCount: number = 0; // Count of throttled requests

  constructor() {
    this.calls = [];
  }

  /**
   * Check if a new call can be forwarded
   * Removes calls older than 1 minute, then checks if under limit
   * @returns true if call can be forwarded, false if should be throttled
   */
  canForward(): boolean {
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
 */
class Logger {
  private logFilePath: string;

  constructor(logFileName: string) {
    // Create logs directory if it doesn't exist
    const logsDir = path.join(__dirname, "../../logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    this.logFilePath = path.join(logsDir, logFileName);
  }

  /**
   * Write log entry to file with timestamp
   */
  log(message: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(this.logFilePath, logEntry);
    console.log(`[Throttle Service] ${logEntry.trim()}`);
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
  const currentCount = throttler.getCurrentCount();
  const remainingCapacity = throttler.getRemainingCapacity();

  // Log incoming request
  logger.log(`Received from Caller: ${JSON.stringify(receivedData)} | Current calls in last minute: ${currentCount} | Remaining capacity: ${remainingCapacity}`);

  // Check if we can forward this request
  if (!throttler.canForward()) {
    // Throttled - log and return error
    const throttledCount = throttler.getThrottledCount();
    logger.log(`THROTTLED: Request throttled (exceeding 4,096/min limit) | Total throttled: ${throttledCount}`);
    return res.status(429).json({
      error: "Throttled",
      message: "Request rate exceeds 4,096 calls per minute",
      throttledCount,
    });
  }

  // Can forward - send to Echo Service
  try {
    logger.log(`Forwarding to Echo Service: ${JSON.stringify(receivedData)}`);
    const echoResponse = await axios.post(ECHO_SERVICE_URL, receivedData, {
      timeout: 5000, // 5 second timeout
    });

    // Log successful forward
    logger.log(`Forwarded successfully. Echo Service response: ${JSON.stringify(echoResponse.data)}`);

    // Return Echo Service response to Caller Service
    res.json(echoResponse.data);
  } catch (error) {
    // Error forwarding to Echo Service
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.log(`Error forwarding to Echo Service: ${errorMessage}`);
    res.status(500).json({
      error: "Forwarding failed",
      message: errorMessage,
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
