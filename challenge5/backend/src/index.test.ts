/**
 * Challenge 5: Full-stack User Management - Jest Tests
 * Tests for backend API endpoints
 */

import request from "supertest";
import { app, userStorage } from "./index";

describe("Challenge 5: User Management API", () => {
  // Clear storage before each test
  beforeEach(() => {
    // Clear all users by accessing the storage directly
    const allUsers = userStorage.getAllUsers();
    allUsers.forEach((user) => {
      userStorage.deleteUser(user.id);
    });
  });

  describe("GET /health - Health check", () => {
    test("should return API status", async () => {
      const response = await request(app).get("/health");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "ok");
      expect(response.body).toHaveProperty("service", "User Management API");
      expect(response.body).toHaveProperty("port");
      expect(response.body).toHaveProperty("totalUsers");
    });
  });

  describe("POST /api/user - Create user", () => {
    test("should create a new user", async () => {
      const userData = {
        name: "John Doe",
        age: 25,
        email: "john@example.com",
        avatarUrl: "https://example.com/avatar.jpg",
      };

      const response = await request(app).post("/api/user").send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe(userData.name);
      expect(response.body.age).toBe(userData.age);
      expect(response.body.email).toBe(userData.email);
      expect(response.body.avatarUrl).toBe(userData.avatarUrl);
    });

    test("should return 400 for duplicate email", async () => {
      const userData = {
        name: "John Doe",
        age: 25,
        email: "john@example.com",
        avatarUrl: "https://example.com/avatar.jpg",
      };

      // Create first user
      await request(app).post("/api/user").send(userData);

      // Try to create duplicate
      const response = await request(app).post("/api/user").send(userData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Email already exists");
    });

    test("should return 400 for invalid email format", async () => {
      const userData = {
        name: "John Doe",
        age: 25,
        email: "invalid-email",
        avatarUrl: "https://example.com/avatar.jpg",
      };

      const response = await request(app).post("/api/user").send(userData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    test("should return 400 for invalid age (not a number)", async () => {
      const userData = {
        name: "John Doe",
        age: "not-a-number",
        email: "john@example.com",
        avatarUrl: "https://example.com/avatar.jpg",
      };

      const response = await request(app).post("/api/user").send(userData);
      expect(response.status).toBe(400);
    });

    test("should return 400 for missing required fields", async () => {
      const response = await request(app).post("/api/user").send({
        name: "John Doe",
        // Missing other fields
      });
      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/user - Get all users", () => {
    test("should return empty array when no users", async () => {
      const response = await request(app).get("/api/user");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("users");
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBe(0);
      expect(response.body).toHaveProperty("total", 0);
      expect(response.body).toHaveProperty("start", 0);
      expect(response.body).toHaveProperty("limit", 10);
    });

    test("should return all users", async () => {
      // Create test users
      const user1 = {
        name: "User 1",
        age: 20,
        email: "user1@example.com",
        avatarUrl: "https://example.com/1.jpg",
      };
      const user2 = {
        name: "User 2",
        age: 30,
        email: "user2@example.com",
        avatarUrl: "https://example.com/2.jpg",
      };

      await request(app).post("/api/user").send(user1);
      await request(app).post("/api/user").send(user2);

      const response = await request(app).get("/api/user");
      expect(response.status).toBe(200);
      expect(response.body.users.length).toBe(2);
      expect(response.body.total).toBe(2);
    });

    test("should support search query parameter", async () => {
      // Create test users
      await request(app).post("/api/user").send({
        name: "John Doe",
        age: 25,
        email: "john@example.com",
        avatarUrl: "https://example.com/john.jpg",
      });
      await request(app).post("/api/user").send({
        name: "Jane Smith",
        age: 30,
        email: "jane@example.com",
        avatarUrl: "https://example.com/jane.jpg",
      });

      const response = await request(app).get("/api/user?q=John");
      expect(response.status).toBe(200);
      expect(response.body.users.length).toBeGreaterThan(0);
      expect(response.body.users[0].name).toContain("John");
    });

    test("should support pagination", async () => {
      // Create multiple users
      for (let i = 0; i < 5; i++) {
        await request(app).post("/api/user").send({
          name: `User ${i}`,
          age: 20 + i,
          email: `user${i}@example.com`,
          avatarUrl: `https://example.com/${i}.jpg`,
        });
      }

      const response = await request(app).get("/api/user?start=0&limit=2");
      expect(response.status).toBe(200);
      expect(response.body.users.length).toBeLessThanOrEqual(2);
      expect(response.body.total).toBe(5);
      expect(response.body.start).toBe(0);
      expect(response.body.limit).toBe(2);
    });
  });

  describe("GET /api/user/:userId - Get user by ID", () => {
    test("should return user by ID", async () => {
      // Create a user
      const createResponse = await request(app).post("/api/user").send({
        name: "Test User",
        age: 25,
        email: "test@example.com",
        avatarUrl: "https://example.com/test.jpg",
      });

      const userId = createResponse.body.id;

      // Get user by ID
      const response = await request(app).get(`/api/user/${userId}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(userId);
      expect(response.body.name).toBe("Test User");
    });

    test("should return 404 for non-existent user", async () => {
      const response = await request(app).get("/api/user/nonexistent");
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "User not found");
    });
  });

  describe("PUT /api/user/:userId - Update user", () => {
    test("should update user", async () => {
      // Create a user
      const createResponse = await request(app).post("/api/user").send({
        name: "Original Name",
        age: 25,
        email: "original@example.com",
        avatarUrl: "https://example.com/original.jpg",
      });

      const userId = createResponse.body.id;

      // Update user (only name and age, not email)
      const updateResponse = await request(app).put(`/api/user/${userId}`).send({
        name: "Updated Name",
        age: 30,
      });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.name).toBe("Updated Name");
      expect(updateResponse.body.age).toBe(30);
      // Email should remain unchanged if not provided in update
      expect(updateResponse.body.email).toBe("original@example.com");
    });

    test("should return 404 for non-existent user", async () => {
      const response = await request(app).put("/api/user/nonexistent").send({
        name: "Updated Name",
      });
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "User not found");
    });

    test("should return 400 for duplicate email on update", async () => {
      // Create two users
      const user1 = await request(app).post("/api/user").send({
        name: "User 1",
        age: 25,
        email: "user1@example.com",
        avatarUrl: "https://example.com/1.jpg",
      });
      const user2 = await request(app).post("/api/user").send({
        name: "User 2",
        age: 30,
        email: "user2@example.com",
        avatarUrl: "https://example.com/2.jpg",
      });

      // Try to update user2 with user1's email
      const response = await request(app).put(`/api/user/${user2.body.id}`).send({
        email: "user1@example.com",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Email already exists");
    });
  });

  describe("DELETE /api/user/:userId - Delete user", () => {
    test("should delete user", async () => {
      // Create a user
      const createResponse = await request(app).post("/api/user").send({
        name: "To Delete",
        age: 25,
        email: "delete@example.com",
        avatarUrl: "https://example.com/delete.jpg",
      });

      const userId = createResponse.body.id;

      // Delete user
      const deleteResponse = await request(app).delete(`/api/user/${userId}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toHaveProperty("message", "User deleted successfully");

      // Verify user is deleted
      const getResponse = await request(app).get(`/api/user/${userId}`);
      expect(getResponse.status).toBe(404);
    });

    test("should return 404 for non-existent user", async () => {
      const response = await request(app).delete("/api/user/nonexistent");
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "User not found or already deleted");
    });
  });

  describe("GET /api/avatar/generate - Generate avatar URL", () => {
    test("should generate avatar URL without email", async () => {
      const response = await request(app).get("/api/avatar/generate");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("avatarUrl");
      expect(response.body).toHaveProperty("hash");
      expect(response.body).toHaveProperty("size");
      expect(response.body.avatarUrl).toContain("gravatar.com");
    });

    test("should generate avatar URL with email", async () => {
      const response = await request(app).get("/api/avatar/generate?email=test@example.com&size=150");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("avatarUrl");
      expect(response.body.avatarUrl).toContain("gravatar.com");
      expect(response.body.size).toBe(150);
    });

    test("should use default size when not provided", async () => {
      const response = await request(app).get("/api/avatar/generate");
      expect(response.status).toBe(200);
      expect(response.body.size).toBe(150); // Default size
    });
  });

  describe("Integration tests", () => {
    test("should complete full CRUD flow", async () => {
      // Create
      const createResponse = await request(app).post("/api/user").send({
        name: "Integration Test",
        age: 25,
        email: "integration@example.com",
        avatarUrl: "https://example.com/integration.jpg",
      });
      expect(createResponse.status).toBe(201);
      const userId = createResponse.body.id;

      // Read
      const readResponse = await request(app).get(`/api/user/${userId}`);
      expect(readResponse.status).toBe(200);
      expect(readResponse.body.name).toBe("Integration Test");

      // Update
      const updateResponse = await request(app).put(`/api/user/${userId}`).send({
        name: "Updated Integration Test",
      });
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.name).toBe("Updated Integration Test");

      // Delete
      const deleteResponse = await request(app).delete(`/api/user/${userId}`);
      expect(deleteResponse.status).toBe(200);

      // Verify deleted
      const verifyResponse = await request(app).get(`/api/user/${userId}`);
      expect(verifyResponse.status).toBe(404);
    });
  });
});

