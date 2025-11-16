# Setup and Running Guide

This guide explains how to set up and run all 5 challenges. Each challenge uses different ports to avoid conflicts.

## Port Allocation

- **Challenge 1**: Console application (no port)
- **Challenge 2**: Console application (no port)
- **Challenge 3**: Backend (3001), Frontend (3002)
- **Challenge 4**: Caller (4001), Throttle (4002), Echo (4003)
- **Challenge 5**: Backend (5001), Frontend (5002)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation

### Install All Dependencies

```bash
# From root directory
npm run install:all
```

Or install individually:

```bash
# Challenge 1
cd challenge1 && npm install

# Challenge 2
cd challenge2 && npm install

# Challenge 3
cd challenge3/backend && npm install
cd ../frontend && npm install

# Challenge 4
cd challenge4/caller-service && npm install
cd ../throttle-service && npm install
cd ../echo-service && npm install

# Challenge 5
cd challenge5/backend && npm install
cd ../frontend && npm install
```

## Running Each Challenge

### Challenge 1: Walking Matrix Turtle Problem

```bash
cd challenge1
npm start
```

**Input Files:**

- `input1-1.txt` - Problem 1.1
- `input1-2.txt` - Problem 1.2
- `input1-3.txt` - Problem 1.3

### Challenge 2: Squirrel Tree Problem

```bash
cd challenge2
npm start
```

**Input File:**

- `input2.txt` - Format: "walnuts,capacity,treeString"

### Challenge 3: URL Shortening Service

**Terminal 1 - Backend:**

```bash
cd challenge3/backend
npm start
```

Backend runs on: http://localhost:3001

**Terminal 2 - Frontend (Optional):**

```bash
cd challenge3/frontend
npm start
```

Frontend runs on: http://localhost:3002

**Note:** The backend already includes a form at http://localhost:3001, so the frontend is optional.

### Challenge 4: Rate and Throttle API

**Terminal 1 - Echo Service:**

```bash
cd challenge4/echo-service
npm start
```

Echo Service runs on: http://localhost:4003

**Terminal 2 - Throttle Service:**

```bash
cd challenge4/throttle-service
npm start
```

Throttle Service runs on: http://localhost:4002

**Terminal 3 - Caller Service:**

```bash
cd challenge4/caller-service
npm start
```

Caller Service starts making calls automatically.

**Logs:** Check `challenge4/*/logs/` directory for service logs.

### Challenge 5: Full-stack User Management (Compulsory)

**Terminal 1 - Backend:**

```bash
cd challenge5/backend
npm start
```

Backend API runs on: http://localhost:5001

**Terminal 2 - Frontend:**

```bash
cd challenge5/frontend
npm start
```

Frontend runs on: http://localhost:5002

**Features:**

- Search users by name or email
- View users in table format
- Edit user information
- Delete users
- Pagination (10 users per page)

## Quick Start Scripts

From root directory, you can use these npm scripts:

```bash
# Challenge 1
npm run challenge1

# Challenge 2
npm run challenge2

# Challenge 3
npm run challenge3:backend
npm run challenge3:frontend

# Challenge 4
npm run challenge4:caller
npm run challenge4:throttle
npm run challenge4:echo

# Challenge 5
npm run challenge5:backend
npm run challenge5:frontend
```

## Notes

- All challenges use TypeScript
- Frontend challenges use React with Vite
- Backend challenges use Express.js
- Challenge 4 and 5 use in-memory storage (can be easily replaced with databases)
- All code includes detailed English comments for easy understanding

## Troubleshooting

### Port Already in Use

If you get "port already in use" error:

1. Check which process is using the port
2. Kill the process or change the port in the respective config file
3. Restart the service

### Module Not Found

If you get "module not found" error:

1. Make sure you've run `npm install` in the challenge directory
2. Check that all dependencies are listed in `package.json`

### CORS Errors

If you get CORS errors:

1. Make sure backend CORS is enabled (already configured)
2. Check that frontend is pointing to correct backend URL
