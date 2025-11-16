# Programming and Algorithm Test (rel:202501)

Challenge Assignment - 5 Programming Challenges

## 📁 Project Structure

```
challengeAssignment/
├── challenge1/              # Walking Matrix Turtle Problem
│   ├── input1-1.txt        # Input for Problem 1.1
│   ├── input1-2.txt        # Input for Problem 1.2
│   ├── input1-3.txt        # Input for Problem 1.3
│   ├── index.ts            # Main solution file
│   ├── package.json
│   └── tsconfig.json
│
├── challenge2/              # Squirrel Tree Problem
│   ├── input2.txt          # Input file
│   ├── index.ts            # Main solution file
│   ├── package.json
│   └── tsconfig.json
│
├── challenge3/              # URL Shortening Service
│   ├── backend/
│   │   ├── src/
│   │   │   └── index.ts    # Backend API server
│   │   ├── SECURITY.md     # Security documentation
│   │   ├── SCALABILITY.md  # Scalability documentation
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend/
│       ├── src/
│       │   ├── App.tsx      # React frontend
│       │   └── main.tsx
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
│
├── challenge4/              # Rate and Throttle API
│   ├── caller-service/      # Service 1: Calls at 16^n rates
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── throttle-service/   # Service 2: Throttles to 4,096/min
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── echo-service/        # Service 3: Echoes back requests
│       ├── src/
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── challenge5/              # Full-stack Application (Compulsory)
│   ├── backend/
│   │   ├── src/
│   │   │   └── index.ts    # REST API backend
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend/
│       ├── src/
│       │   ├── App.tsx      # React frontend with table
│       │   └── main.tsx
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
│
├── package.json             # Root package.json with scripts
└── README.md               # This file
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- TypeScript
- Database (PostgreSQL/MySQL for SQL, MongoDB for NoSQL) - for Challenge 5

### Installation

1. **Install all dependencies:**
   ```bash
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

## 📝 Challenge Descriptions

### Challenge 1: Walking Matrix Turtle Problem
- **Problem 1.1**: Zig-zag walking from (0,0)
- **Problem 1.2**: Clockwise walking to center from (X,Y)
- **Problem 1.3**: Find target number with shortest/longest route

**Run:**
```bash
npm run challenge1
```

### Challenge 2: Squirrel Tree Problem
Help a squirrel store walnuts in tree holes with minimum energy.

**Run:**
```bash
npm run challenge2
```

### Challenge 3: URL Shortening Service
Create a URL shortening service with frontend form and backend API.

**Run Backend:**
```bash
npm run challenge3:backend
```

**Run Frontend:**
```bash
npm run challenge3:frontend
```

**Requirements:**
- GET `/` - Display form
- POST `/shorten` - Create short URL
- GET `/{KEY}` - Redirect to original URL

### Challenge 4: Rate and Throttle API
Three services communicating with each other:
- **Caller Service**: Calls at 16^n rates per minute
- **Throttle Service**: Throttles to max 4,096 calls/minute
- **Echo Service**: Echoes back requests

**Run Services:**
```bash
# Terminal 1
npm run challenge4:echo

# Terminal 2
npm run challenge4:throttle

# Terminal 3
npm run challenge4:caller
```

### Challenge 5: Full-stack Application (Compulsory)
REST API backend with React frontend for user management.

**Backend API:**
- GET `/api/user?q=คําค้นหา&start=0&limit=10`
- GET `/api/user/:userId`
- POST `/api/user`
- PUT `/api/user/:userId`
- DELETE `/api/user/:userId`

**Run Backend:**
```bash
npm run challenge5:backend
```

**Run Frontend:**
```bash
npm run challenge5:frontend
```

**Database Setup:**
1. Copy `.env.example` to `.env` in `challenge5/backend/`
2. Configure database connection
3. Create database and tables

## 📋 Notes

- All challenges use TypeScript
- Frontend challenges use React with Vite
- Backend challenges use Express.js
- Input files are provided in respective challenge folders
- Each challenge has its own `package.json` and dependencies

## 🎯 Submission Guidelines

1. Ensure all solutions run correctly without errors
2. Write clean, readable code with meaningful names
3. Follow specified input/output formats exactly
4. Provide screenshots/video of working solutions
5. Submit as a well-organized folder in a single ZIP file

## 📚 Additional Resources

- Challenge 3: See `challenge3/backend/SECURITY.md` and `SCALABILITY.md`
- Challenge 5: Configure database in `challenge5/backend/.env`
