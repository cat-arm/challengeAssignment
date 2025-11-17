// Challenge 5: Full-stack Backend
// Port: 5001
// REST API for user management
// Uses in-memory storage (can be easily replaced with SQL/NoSQL database)

import express, { Request, Response } from "express";
import cors from "cors";
import crypto from "crypto";

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

    // Update user - only include fields that are provided (not undefined)
    const updatedUser: User = {
      ...existingUser,
      ...(userData.name !== undefined && { name: userData.name }),
      ...(userData.age !== undefined && { age: userData.age }),
      ...(userData.email !== undefined && { email: userData.email }),
      ...(userData.avatarUrl !== undefined && { avatarUrl: userData.avatarUrl }),
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
 * Seed mock data - Generate 40 sample users
 */
function seedMockData() {
  const existingUsers = userStorage.getAllUsers();
  if (existingUsers.length > 0) {
    console.log(`Database already has ${existingUsers.length} users. Skipping seed.`);
    return;
  }

  const firstNames = [
    "John", "Jane", "Michael", "Sarah", "David", "Emily", "James", "Emma", "Robert", "Olivia",
    "William", "Sophia", "Richard", "Isabella", "Joseph", "Mia", "Thomas", "Charlotte", "Charles", "Amelia",
    "Daniel", "Harper", "Matthew", "Evelyn", "Anthony", "Abigail", "Mark", "Elizabeth", "Donald", "Sofia",
    "Steven", "Avery", "Paul", "Ella", "Andrew", "Madison", "Joshua", "Scarlett", "Kenneth", "Victoria"
  ];

  const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee",
    "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
    "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams"
  ];

  const domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "example.com"];

  console.log("Seeding mock data...");

  for (let i = 0; i < 40; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const name = `${firstName} ${lastName}`;
    const age = Math.floor(Math.random() * 50) + 18; // Age between 18-67
    // Make email unique by adding index
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${domains[i % domains.length]}`;
    
    // Generate avatar URL using email hash
    const normalizedEmail = email.toLowerCase().trim();
    const hash = crypto.createHash("md5").update(normalizedEmail).digest("hex");
    const avatarTypes = ["robohash", "identicon", "monsterid", "wavatar", "retro"];
    const avatarType = avatarTypes[i % avatarTypes.length];
    const avatarUrl = `https://gravatar.com/avatar/${hash}?s=150&d=${avatarType}&r=x`;

    try {
      userStorage.createUser({
        name,
        age,
        email,
        avatarUrl,
      });
    } catch (error) {
      // If email already exists, skip
      console.warn(`Skipping user ${name} - email already exists`);
    }
  }

  console.log(`✅ Successfully seeded ${userStorage.getAllUsers().length} mock users`);
}

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

/**
 * GET /api/avatar/generate - Generate a random Gravatar avatar URL
 * Query parameters (optional):
 *   - email: Email address to generate consistent avatar (optional)
 *   - size: Image size (default: 150)
 *   - default: Default avatar type (robohash, identicon, monsterid, wavatar, retro, blank)
 */
app.get("/api/avatar/generate", (req: Request, res: Response) => {
  try {
    const email = req.query.email as string | undefined;
    const size = parseInt(req.query.size as string) || 150;
    const defaultType = (req.query.default as string) || "robohash";

    // Valid default types for Gravatar
    const validDefaultTypes = ["robohash", "identicon", "monsterid", "wavatar", "retro", "blank"];
    const avatarType = validDefaultTypes.includes(defaultType) ? defaultType : "robohash";

    let hash: string;

    if (email && email.trim() !== "") {
      // Generate MD5 hash from email (lowercase and trimmed)
      const normalizedEmail = email.toLowerCase().trim();
      hash = crypto.createHash("md5").update(normalizedEmail).digest("hex");
    } else {
      // Generate random hash for random avatar
      const randomString = Math.random().toString() + Date.now().toString();
      hash = crypto.createHash("md5").update(randomString).digest("hex");
    }

    // Gravatar URL format: https://gravatar.com/avatar/{hash}?s={size}&d={default}&r=x
    const avatarUrl = `https://gravatar.com/avatar/${hash}?s=${size}&d=${avatarType}&r=x`;

    res.json({
      avatarUrl,
      hash,
      size,
      defaultType: avatarType,
    });
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

// Export app and userStorage for testing
export { app, userStorage };

// Seed mock data on server start (skip in test environment)
if (process.env.NODE_ENV !== "test") {
  seedMockData();
}

// Start server (only if not in test environment)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`User Management API running on http://localhost:${PORT}`);
    console.log(`API endpoints available:`);
    console.log(`  - GET    http://localhost:${PORT}/api/user`);
    console.log(`  - GET    http://localhost:${PORT}/api/user/:userId`);
    console.log(`  - POST   http://localhost:${PORT}/api/user`);
    console.log(`  - PUT    http://localhost:${PORT}/api/user/:userId`);
    console.log(`  - DELETE http://localhost:${PORT}/api/user/:userId`);
    console.log(`  - GET    http://localhost:${PORT}/api/avatar/generate`);
    console.log(`  - GET    http://localhost:${PORT}/health`);
    console.log(`\n📊 Total users in database: ${userStorage.getAllUsers().length}`);
  });
}
