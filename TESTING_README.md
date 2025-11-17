# Testing Guide for All Challenges

This document provides instructions for running Jest tests for all challenges.

## Prerequisites

Install dependencies for each challenge before running tests:

```bash
# Challenge 1
cd challenge1
npm install

# Challenge 2
cd challenge2
npm install

# Challenge 3
cd challenge3/backend
npm install

# Challenge 5
cd challenge5/backend
npm install
```

## Running Tests

### Challenge 1: Matrix Turtle Problem

```bash
cd challenge1
npm test
```

**Test Coverage:**

- Problem 1.1: Zig-zag walking from (0,0)
- Problem 1.2: Clockwise walking to center from (X,Y)
- Problem 1.3: Find target number with shortest/longest routes

**Mock Data:**

- 2x2, 3x3 matrices
- Single row/column matrices
- Actual input files (input1-1.txt, input1-2.txt, input1-3.txt)

### Challenge 2: Squirrel Tree Problem

```bash
cd challenge2
npm test
```

**Test Coverage:**

- Valid inputs with various tree structures
- Invalid inputs (invalid walnut amount, capacity, tree structure)
- Edge cases (single hole, large capacity, deep trees)

**Mock Data:**

- Simple trees (AB, ABC)
- Complex trees matching input2.txt format
- Various walnut amounts and capacities

### Challenge 3: URL Shortening Service

```bash
cd challenge3/backend
npm test
```

**Test Coverage:**

- Health check endpoint
- POST /api/shorten - Create short URL
- GET /api/:key - Get original URL
- Error handling (invalid URLs, missing fields)
- Integration tests

**Mock Data:**

- Valid URLs (https://example.com, https://google.com)
- URLs with query parameters and paths
- Invalid URL formats

### Challenge 5: Full-stack User Management

```bash
cd challenge5/backend
npm test
```

**Test Coverage:**

- Health check endpoint
- POST /api/user - Create user
- GET /api/user - Get all users (with search and pagination)
- GET /api/user/:userId - Get user by ID
- PUT /api/user/:userId - Update user
- DELETE /api/user/:userId - Delete user
- GET /api/avatar/generate - Generate avatar URL
- Full CRUD integration tests

**Mock Data:**

- Valid user data (name, age, email, avatarUrl)
- Invalid inputs (duplicate emails, invalid formats)
- Search queries and pagination parameters

## Test Commands

All challenges support the following npm scripts:

- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Test Structure

Each challenge has:

- `jest.config.js` - Jest configuration
- `*.test.ts` - Test files with:
  - Unit tests for individual functions
  - Integration tests for API endpoints
  - Mock data and expected results
  - Error handling scenarios

## Expected Test Results

### Challenge 1

- All 3 problems should pass with various matrix sizes
- Edge cases (single row/column) should be handled
- Actual input files should produce correct outputs

### Challenge 2

- Valid inputs should produce correct walnut storage sequences
- Invalid inputs should return appropriate error messages
- Edge cases should be handled correctly

### Challenge 3

- URL shortening should work for valid URLs
- Invalid URLs should return 400 errors
- Retrieved URLs should match original URLs

### Challenge 5

- All CRUD operations should work correctly
- Validation should reject invalid inputs
- Search and pagination should function properly
- Avatar generation should work with/without email

## Notes

- Challenge 4 (Rate and Throttle) is not included in automated tests as it requires multiple services running simultaneously and involves time-based rate limiting, which is better tested manually or with integration tests.
- All tests use in-memory storage, so tests are isolated and don't affect each other.
- Test data is cleared before each test to ensure clean state.
