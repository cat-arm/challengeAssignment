# Challenge 5 Testing Guide

## Prerequisites

### 1. Install Dependencies

#### Backend

```bash
cd challenge5/backend
npm install
```

#### Frontend

```bash
cd challenge5/frontend
npm install
```

### 2. Environment Setup (If using a real database)

**Note:** Currently, the Backend uses in-memory storage (no real database required). However, if you want to use a real SQL/NoSQL database:

```bash
cd challenge5/backend
cp env.example .env
# Edit .env file as needed
```

## How to Run the Application

### 1. Start Backend Server

Open the first terminal:

```bash
cd challenge5/backend
npm start
```

Backend will run at: **http://localhost:5001**

You should see:

```
User Management API running on http://localhost:5001
API endpoints available at http://localhost:5001/api/user
```

### 2. Start Frontend Server

Open a second terminal:

```bash
cd challenge5/frontend
npm start
# or
npm run dev
```

Frontend will run at: **http://localhost:5173** (or another port assigned by Vite)

## Feature Testing

### ✅ 1. Create New User

1. Open your browser and navigate to the Frontend URL
2. Click the **"+ Create New User"** button
3. Fill in the form:
   - **Name**: e.g., "John Doe"
   - **Age**: e.g., 25 (must be a number)
   - **Email**: e.g., "john@example.com" (must be a valid email format)
   - **Avatar URL**: e.g., "https://i.pravatar.cc/150?img=1"
4. Click **"Create User"**
5. Verify that the new user appears in the table

**Test Validation:**

- Try creating a user with a duplicate email → Should show error "Email already exists"
- Try creating with an invalid email format → Should show error "Invalid email format"
- Try creating with age that is not a number → Should show error

### ✅ 2. Search Users

1. Use the search box at the top
2. Try searching by:
   - **Name**: e.g., type "John" → Should show users with name containing "John"
   - **Email**: e.g., type "john@" → Should show users with email containing "john@"
3. Verify that search works for both name and email

### ✅ 3. List Users with Pagination

1. Verify that the table displays all users
2. If there are more than 10 users → Pagination should appear
3. Try clicking **"Next"** and **"Previous"** to navigate pages
4. Verify that page numbers are displayed correctly

### ✅ 4. Edit User

1. Click the **"Edit"** button in the row of the user you want to edit
2. Modify the data in the fields you want to change
3. Click **"Save"** → Data should be updated
4. Click **"Cancel"** → Edit should be cancelled

**Test Validation:**

- Try editing email to a duplicate email of another user → Should show error
- Try editing age to a non-numeric value → Should show error

### ✅ 5. Delete User

1. Click the **"Remove"** button in the row of the user you want to delete
2. Confirm deletion in the popup
3. Verify that the user is removed from the table

**Test Error Cases:**

- Try deleting a user that was already deleted (if possible) → Should show error

## Direct API Testing

You can test the API directly using **curl** or **Postman**:

### GET All Users (with search & pagination)

```bash
curl "http://localhost:5001/api/user?q=john&start=0&limit=10"
```

### GET User by ID

```bash
curl "http://localhost:5001/api/user/user_1"
```

### POST Create User

```bash
curl -X POST http://localhost:5001/api/user \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "age": 30,
    "email": "test@example.com",
    "avatarUrl": "https://i.pravatar.cc/150?img=2"
  }'
```

### PUT Update User

```bash
curl -X PUT http://localhost:5001/api/user/user_1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "age": 31,
    "email": "updated@example.com",
    "avatarUrl": "https://i.pravatar.cc/150?img=3"
  }'
```

### DELETE User

```bash
curl -X DELETE http://localhost:5001/api/user/user_1
```

### Health Check

```bash
curl http://localhost:5001/health
```

## Testing Checklist

- [ ] Backend server runs on port 5001
- [ ] Frontend server runs and connects to Backend successfully
- [ ] Can create new users (Create User)
- [ ] Validation works correctly (email format, age is a number, email is unique)
- [ ] Can search users (Search by name/email)
- [ ] User list displays in the table
- [ ] Pagination works (if there are more than 10 records)
- [ ] Can edit users (Edit User)
- [ ] Can delete users (Delete User)
- [ ] Error messages display when errors occur
- [ ] Avatar images display (if URL is valid)

## Important Notes

1. **Backend Port**: Backend uses port **5001** (not 5000 as mentioned in README)
2. **Database**: Currently uses in-memory storage (data will be lost when server restarts)
3. **CORS**: Backend has CORS enabled, so Frontend can call the API
4. **Frontend Port**: Vite typically uses port 5173, but if it's in use, it will use another port

## Troubleshooting

### Backend Won't Start

- Check that port 5001 is available
- Verify that dependencies are installed: `npm install`
- Check error messages in the terminal

### Frontend Can't Connect to Backend

- Verify that Backend is running on port 5001
- Check the URL in App.tsx is `http://localhost:5001`
- Check CORS settings in Backend

### No Data in Table

- Verify that Backend is running
- Check Browser Console (F12) for any errors
- Try creating a new user first

## Summary

After following the steps above, you should be able to:

1. ✅ Create new users
2. ✅ Search users
3. ✅ View user list with pagination
4. ✅ Edit users
5. ✅ Delete users

The application is ready for testing! 🎉
