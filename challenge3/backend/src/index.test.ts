/**
 * Challenge 3: URL Shortening Service - Jest Tests
 * Tests for backend API endpoints
 */

import request from "supertest";
import { app, urlStorage } from "./index";

describe("Challenge 3: URL Shortening Service API", () => {
  // Reset storage before each test
  beforeEach(() => {
    // Clear the storage by creating a new instance
    // Since urlStorage is exported, we need to manually clear it
    // For testing, we'll test the actual behavior
  });

  describe("GET / - Health check", () => {
    test("should return API status", async () => {
      const response = await request(app).get("/");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("service");
      expect(response.body).toHaveProperty("status", "running");
      expect(response.body).toHaveProperty("endpoints");
    });
  });

  describe("POST /api/shorten - Create short URL", () => {
    test("should shorten a valid URL", async () => {
      const response = await request(app).post("/api/shorten").send({
        url: "https://example.com",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("key");
      expect(typeof response.body.key).toBe("string");
      expect(response.body.key.length).toBeGreaterThan(0);
    });

    test("should return different keys for different URLs", async () => {
      const response1 = await request(app).post("/api/shorten").send({
        url: "https://google.com",
      });

      const response2 = await request(app).post("/api/shorten").send({
        url: "https://github.com",
      });

      expect(response1.body.key).not.toBe(response2.body.key);
    });

    test("should return same key format for same URL (if implemented)", async () => {
      // Note: Current implementation generates unique keys each time
      // This test verifies the key format
      const response = await request(app).post("/api/shorten").send({
        url: "https://example.com",
      });

      expect(response.body.key).toMatch(/^[a-z0-9]+$/); // Base36 format
    });

    test("should return 400 for missing URL", async () => {
      const response = await request(app).post("/api/shorten").send({});
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "URL is required");
    });

    test("should return 400 for invalid URL format - plain text", async () => {
      const response = await request(app).post("/api/shorten").send({
        url: "not-a-valid-url",
      });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Invalid URL format");
    });

    test("should return 400 for invalid URL format - missing protocol", async () => {
      const response = await request(app).post("/api/shorten").send({
        url: "example.com",
      });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Invalid URL format");
    });

    test("should return 400 for invalid URL format - relative path", async () => {
      const response = await request(app).post("/api/shorten").send({
        url: "/path/to/resource",
      });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Invalid URL format");
    });

    test("should return 400 for invalid URL format - invalid protocol", async () => {
      const response = await request(app).post("/api/shorten").send({
        url: "invalid://example.com",
      });
      // Should reject non-http/https protocols
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Invalid URL format");
    });

    test("should return 400 for empty string URL", async () => {
      const response = await request(app).post("/api/shorten").send({
        url: "",
      });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "URL is required");
    });

    test("should handle URLs with query parameters", async () => {
      const response = await request(app).post("/api/shorten").send({
        url: "https://example.com?param=value&other=123",
      });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("key");
    });

    test("should handle URLs with paths", async () => {
      const response = await request(app).post("/api/shorten").send({
        url: "https://example.com/path/to/resource",
      });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("key");
    });

    test("should validate URL format strictly - only accept valid URLs", async () => {
      const invalidUrls = [
        "just-text",
        "example.com",
        "www.example.com",
        "/relative/path",
        "ftp://example.com", // Should reject non-http/https
        "javascript:alert(1)", // Should be rejected
        "file:///path/to/file", // Should be rejected
      ];

      for (const invalidUrl of invalidUrls) {
        const response = await request(app).post("/api/shorten").send({
          url: invalidUrl,
        });
        // Should reject all invalid URLs (must be http:// or https://)
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Invalid URL format");
      }
    });

    test("should accept valid HTTP URLs", async () => {
      const response = await request(app).post("/api/shorten").send({
        url: "http://example.com",
      });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("key");
    });

    test("should accept valid HTTPS URLs", async () => {
      const response = await request(app).post("/api/shorten").send({
        url: "https://example.com",
      });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("key");
    });
  });

  describe("GET /api/:key - Get original URL", () => {
    test("should return original URL for valid key", async () => {
      // First, create a short URL
      const shortenResponse = await request(app).post("/api/shorten").send({
        url: "https://test.com",
      });

      const key = shortenResponse.body.key;

      // Then, retrieve it
      const response = await request(app).get(`/api/${key}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("url", "https://test.com");
    });

    test("should return 404 for non-existent key", async () => {
      const response = await request(app).get("/api/nonexistent123");
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "URL Not Found");
      expect(response.body).toHaveProperty("message");
    });

    test("should handle multiple URLs correctly", async () => {
      // Create multiple URLs
      const url1 = "https://example1.com";
      const url2 = "https://example2.com";

      const response1 = await request(app).post("/api/shorten").send({ url: url1 });
      const response2 = await request(app).post("/api/shorten").send({ url: url2 });

      // Retrieve both
      const get1 = await request(app).get(`/api/${response1.body.key}`);
      const get2 = await request(app).get(`/api/${response2.body.key}`);

      expect(get1.body.url).toBe(url1);
      expect(get2.body.url).toBe(url2);
    });
  });

  describe("Integration tests", () => {
    test("should complete full flow: shorten -> retrieve", async () => {
      const originalURL = "https://integration-test.com";

      // Step 1: Shorten
      const shortenResponse = await request(app).post("/api/shorten").send({
        url: originalURL,
      });
      expect(shortenResponse.status).toBe(200);
      const key = shortenResponse.body.key;

      // Step 2: Retrieve
      const retrieveResponse = await request(app).get(`/api/${key}`);
      expect(retrieveResponse.status).toBe(200);
      expect(retrieveResponse.body.url).toBe(originalURL);
    });

    test("should handle special characters in URL", async () => {
      const specialURL = "https://example.com/path?param=value&other=test#section";
      const response = await request(app).post("/api/shorten").send({
        url: specialURL,
      });
      expect(response.status).toBe(200);

      const key = response.body.key;
      const retrieveResponse = await request(app).get(`/api/${key}`);
      expect(retrieveResponse.body.url).toBe(specialURL);
    });
  });
});

