# Challenge 5: Generic Front-end and Back-end (Full-stack) Test

**This challenge is COMPULSORY**

## Backend API

### Database Schema
**Table:** `users`
**Columns:** `name`, `age`, `email`, `avatarUrl`

### Endpoints

#### Get all users
- **Method:** GET
- **URL:** `/api/user?q=คําค้นหา&start=0&limit=10`
- **Query Parameters:**
  - `q`: Search by name or email
  - `start`: Starting row (pagination offset)
  - `limit`: Number of rows to return
- **Return:** User lists

#### Get user detail by id
- **Method:** GET
- **URL:** `/api/user/:userId`
- **Return:** User detail

#### Create user
- **Method:** POST
- **URL:** `/api/user`
- **Request Body:** `name`, `age`, `email`, `avatarUrl`
- **Validation:**
  - `age` must be a number
  - `email` must be validated by regex
  - `email` must be unique (no duplicates)
- **Return:** User detail

#### Update user by id
- **Method:** PUT
- **URL:** `/api/user/:userId`
- **Request Body:** Same as create
- **Return:** User detail

#### Delete user by id
- **Method:** DELETE
- **URL:** `/api/user/:userId`
- **Return:** Success or failed (if already deleted)

## Frontend

### Requirements
- **Framework:** React.js or similar
- **UI:** Can use any UI kit or CSS framework
- **Features:**
  - Mock Data: User lists (name, age, email, avatarUrl)
  - Search Box
  - Table view to show data
  - Table has UI to edit or remove data
  - Table must have pagination

## Setup

### Database Configuration

1. Copy `env.example` to `.env` in `backend/` folder
2. Choose database type (SQL or NoSQL)
3. Configure connection settings
4. Create database and tables

### Running

#### Backend
```bash
cd backend
npm install
# Configure .env file
npm start
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## Notes
- Backend runs on port 5000
- Frontend runs on port 3000 (with proxy to backend)
- Implement proper validation and error handling
- Email must be unique in the system

