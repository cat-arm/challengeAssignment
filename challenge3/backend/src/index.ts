// Challenge 3: URL Shortening Service - Backend
// Simple URL shortening service with in-memory storage
// Port: 80 (as specified in requirements)

import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const PORT = 3001; // Port 80 as specified in requirements

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies in case use form

/**
 * URLStorage class manages the mapping between short keys and original URLs
 * Uses in-memory storage (Map) for simplicity
 * In production, this would be replaced with a database
 */
class URLStorage {
  private urlMap: Map<string, string>; // Map<shortKey, originalURL> ("1" -> "https://google.com")
  private keyCounter: number; // Counter for generating unique keys

  constructor() {
    this.urlMap = new Map();
    this.keyCounter = 1;
  }

  /**
   * Generate a short key for a URL
   * Simple approach: use incremental counter converted to base36 (alphanumeric)
   * This creates short keys like: 1, 2, 3, ..., a, b, c, ...
   */
  private generateKey(): string {
    return (this.keyCounter++).toString(36); // Base36: 0-9, a-z convert Base10 to 36 ex 1 -> "1", 10 -> "a"
  }

  /**
   * Store a URL and return its short key
   * @param originalURL - The original URL to shorten
   * @returns Short key for the URL
   */
  shorten(originalURL: string): string {
    // Validate URL format
    let url: URL;
    try {
      url = new URL(originalURL); // This will throw if URL is invalid
    } catch (error) {
      throw new Error("Invalid URL format");
    }

    // Validate that URL uses http or https protocol
    const allowedProtocols = ["http:", "https:"];
    if (!allowedProtocols.includes(url.protocol)) {
      throw new Error("Invalid URL format");
    }

    // Generate unique key
    const key = this.generateKey();

    // Store mapping
    this.urlMap.set(key, originalURL);

    return key;
  }

  /**
   * Retrieve original URL by short key
   * @param key - The short key
   * @returns Original URL or null if not found
   */
  getOriginalURL(key: string): string | null {
    return this.urlMap.get(key) || null;
  }
}

// Create URL storage instance -> use for GET, POST
const urlStorage = new URLStorage();

/**
 * GET / - Health check endpoint
 * Returns API status (frontend is separate)
 */
app.get("/", (req: Request, res: Response) => {
  res.json({
    service: "URL Shortening Service API",
    status: "running",
    endpoints: {
      "POST /shorten": "Create short URL",
      "GET /{KEY}": "Redirect to original URL",
    },
  });
});

/**
 * POST /api/shorten - Create short URL
 * Request body: { "url": "https://example.com" }
 * Response: { "key": "abc123" }
 */
app.post("/api/shorten", (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    // Validate input
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL is required" });
    }

    // Shorten URL
    const key = urlStorage.shorten(url);

    // Return the key
    res.json({ key });
  } catch (error) {
    // Handle errors (e.g., invalid URL format)
    res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to shorten URL",
    });
  }
});

/**
 * GET /api/url/:key - Get original URL by key
 * Returns original URL as JSON so frontend can redirect
 * This is the only endpoint needed since frontend handles the redirect
 */
app.get("/api/:key", (req: Request, res: Response) => {
  const { key } = req.params;

  // Get original URL from storage
  const originalURL = urlStorage.getOriginalURL(key);

  if (originalURL) {
    // Return original URL as JSON
    res.json({ url: originalURL });
  } else {
    // Key not found - return 404 JSON response
    res.status(404).json({
      error: "URL Not Found",
      message: `The short URL key "${key}" was not found.`,
    });
  }
});

// Export app for testing
export { app, urlStorage };

// Start server (only if not in test environment)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`URL Shortening Service API running on http://localhost:${PORT}`);
    console.log(`API Endpoints:`);
    console.log(`  POST http://localhost:${PORT}/shorten - Create short URL`);
    console.log(`  GET  http://localhost:${PORT}/{KEY} - Redirect to original URL`);
    console.log(`\nNote: Frontend should be running separately and connect to this API`);
  });
}
