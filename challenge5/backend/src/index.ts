// Challenge 5: Full-stack Backend
// Port: 5001
// REST API for user management
// Uses in-memory storage (can be easily replaced with SQL/NoSQL database)

import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const PORT = 5001;

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Parse JSON request bodies

/**
 * User interface - defines the structure of a user object
 */
interface User {
  id: string;
  name: string;
  age: number;
  email: string;
  avatarUrl: string;
}

/**
 * UserStorage class manages user data
 * Uses in-memory Map for simplicity
 * In production, this would be replaced with a database (SQL or NoSQL)
 */
class UserStorage {
  private users: Map<string, User>; // Map<userId, User>
  private idCounter: number; // Counter for generating unique IDs

  constructor() {
    this.users = new Map();
    this.idCounter = 1;
  }

  /**
   * Generate a unique user ID
   */
  private generateId(): string {
    return `user_${this.idCounter++}`;
  }

  /**
   * Get all users (for search and pagination)
   */
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  /**
   * Create a new user
   */
  createUser(userData: Omit<User, "id">): User {
    // Check if email already exists
    const existingUser = Array.from(this.users.values()).find((u) => u.email === userData.email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    const newUser: User = {
      id: this.generateId(),
      ...userData,
    };

    this.users.set(newUser.id, newUser);
    return newUser;
  }

  /**
   * Update an existing user
   */
  updateUser(id: string, userData: Partial<Omit<User, "id">>): User | null {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      return null;
    }

    // Check if email is being changed and if new email already exists
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = Array.from(this.users.values()).some((u) => u.email === userData.email && u.id !== id);
      if (emailExists) {
        throw new Error("Email already exists");
      }
    }

    // Update user
    const updatedUser: User = {
      ...existingUser,
      ...userData,
      id, // Ensure ID doesn't change
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  /**
   * Delete a user
   */
  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }
}

// Create user storage instance
const userStorage = new UserStorage();

/**
 * Validation utility functions
 */
class Validator {
  /**
   * Validate email format using regex
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate age (must be a positive number)
   */
  static validateAge(age: any): boolean {
    return typeof age === "number" && age > 0 && Number.isInteger(age);
  }

  /**
   * Validate user data for create/update
   */
  static validateUserData(data: any): { valid: boolean; error?: string } {
    if (data.name && typeof data.name !== "string") {
      return { valid: false, error: "Name must be a string" };
    }

    if (data.age !== undefined && !this.validateAge(data.age)) {
      return { valid: false, error: "Age must be a positive integer" };
    }

    if (data.email && !this.validateEmail(data.email)) {
      return { valid: false, error: "Invalid email format" };
    }

    if (data.avatarUrl && typeof data.avatarUrl !== "string") {
      return { valid: false, error: "AvatarUrl must be a string" };
    }

    return { valid: true };
  }
}

/**
 * GET /api/user - Get all users with search and pagination
 * Query parameters:
 *   - q: Search term (searches in name and email)
 *   - start: Starting index for pagination (default: 0)
 *   - limit: Number of results to return (default: 10)
 */
app.get("/api/user", (req: Request, res: Response) => {
  try {
    const searchTerm = (req.query.q as string) || "";
    const start = parseInt(req.query.start as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;

    // Get all users
    let users = userStorage.getAllUsers();

    // Apply search filter if search term provided
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      users = users.filter((user) => user.name.toLowerCase().includes(lowerSearchTerm) || user.email.toLowerCase().includes(lowerSearchTerm));
    }

    // Apply pagination
    const paginatedUsers = users.slice(start, start + limit);

    res.json({
      users: paginatedUsers,
      total: users.length,
      start,
      limit,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

/**
 * GET /api/user/:userId - Get user by ID
 */
app.get("/api/user/:userId", (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = userStorage.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

/**
 * POST /api/user - Create a new user
 * Request body: { name, age, email, avatarUrl }
 */
app.post("/api/user", (req: Request, res: Response) => {
  try {
    const { name, age, email, avatarUrl } = req.body;

    // Validate required fields
    if (!name || !age || !email || !avatarUrl) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate data
    const validation = Validator.validateUserData({ name, age, email, avatarUrl });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Create user
    const newUser = userStorage.createUser({ name, age, email, avatarUrl });

    res.status(201).json(newUser);
  } catch (error) {
    if (error instanceof Error && error.message === "Email already exists") {
      return res.status(400).json({ error: "Email already exists" });
    }

    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

/**
 * PUT /api/user/:userId - Update user by ID
 * Request body: { name, age, email, avatarUrl }
 */
app.put("/api/user/:userId", (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { name, age, email, avatarUrl } = req.body;

    // Validate data if provided
    const validation = Validator.validateUserData({ name, age, email, avatarUrl });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Update user
    const updatedUser = userStorage.updateUser(userId, {
      name,
      age,
      email,
      avatarUrl,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    if (error instanceof Error && error.message === "Email already exists") {
      return res.status(400).json({ error: "Email already exists" });
    }

    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

/**
 * DELETE /api/user/:userId - Delete user by ID
 */
app.delete("/api/user/:userId", (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const deleted = userStorage.deleteUser(userId);

    if (deleted) {
      res.json({ success: true, message: "User deleted successfully" });
    } else {
      res.status(404).json({ success: false, error: "User not found or already deleted" });
    }
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "User Management API",
    port: PORT,
    totalUsers: userStorage.getAllUsers().length,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`User Management API running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api/user`);
});
