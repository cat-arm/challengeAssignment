// Challenge 4: Echo Service
// Port: 4003
// Echoes back whatever it receives from Throttle Service
// If exceeding 512 calls per minute, respond with "Exceeding Limit"
// Logs input and output with timestamp and rate limit capacity info

import express, { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";

const app = express();
const PORT = 4003;

// Middleware to parse JSON
app.use(express.json());

/**
 * RateLimiter class tracks the number of calls per minute
 * Limits to 512 calls per minute
 */
class RateLimiter {
  private calls: number[]; // Array of timestamps for each call
  private readonly maxCallsPerMinute: number = 512; // Maximum allowed calls per minute

  constructor() {
    this.calls = [];
  }

  /**
   * Check if a new call is allowed
   * Removes calls older than 1 minute, then checks if under limit
   * @returns true if call is allowed, false if exceeding limit
   */
  isAllowed(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000; // 60,000 milliseconds = 1 minute

    // Remove calls older than 1 minute
    this.calls = this.calls.filter((timestamp) => timestamp > oneMinuteAgo);

    // Check if under limit
    if (this.calls.length < this.maxCallsPerMinute) {
      this.calls.push(now); // Record this call
      return true;
    }

    return false; // Exceeding limit
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
   * Get remaining capacity
   */
  getRemainingCapacity(): number {
    return Math.max(0, this.maxCallsPerMinute - this.getCurrentCount());
  }
}

// Create rate limiter instance
const rateLimiter = new RateLimiter();

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
    console.log(`[Echo Service] ${logEntry.trim()}`);
  }

  /**
   * Close the write stream (call before process exit)
   */
  close(): void {
    this.writeStream.end();
  }
}

// Create logger instance
const logger = new Logger("echo-service.log");

/**
 * POST /echo - Echo endpoint
 * Receives data from Throttle Service and echoes it back
 * If exceeding 512 calls per minute, returns "Exceeding Limit"
 */
app.post("/echo", (req: Request, res: Response) => {
  const receivedData = req.body;
  const currentCount = rateLimiter.getCurrentCount();
  const remainingCapacity = rateLimiter.getRemainingCapacity();

  // Log incoming request
  logger.log(`Received: ${JSON.stringify(receivedData)} | Current calls in last minute: ${currentCount} | Remaining capacity: ${remainingCapacity}`);

  // Check rate limit
  if (!rateLimiter.isAllowed()) {
    // Exceeding limit - return error message
    const response = "Exceeding Limit";
    logger.log(`Rate limit exceeded! Responding with: "${response}"`);
    return res.status(429).json({ message: response });
  }

  // Within limit - echo back the received data
  logger.log(`Echoing back: ${JSON.stringify(receivedData)}`);
  res.json(receivedData);
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "Echo Service",
    port: PORT,
    currentCalls: rateLimiter.getCurrentCount(),
    remainingCapacity: rateLimiter.getRemainingCapacity(),
    maxCallsPerMinute: 512,
  });
});

// Start server
app.listen(PORT, () => {
  logger.log(`Echo Service started on port ${PORT}`);
  logger.log(`Rate limit: 512 calls per minute`);
  console.log(`Echo Service running on http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  logger.log("Shutting down Echo Service...");
  logger.close();
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.log("Shutting down Echo Service...");
  logger.close();
  process.exit(0);
});
