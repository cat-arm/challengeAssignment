# Challenge 3: URL Shortening Service

## Requirements

Create a URL shortening service website with form and API.

### Endpoints

- **GET** `http://localhost:80/` - Health check endpoint (returns API status)
- **POST** `http://localhost:80/shorten` - Create short URL and return `{KEY}`
- **GET** `http://localhost:80/{KEY}` - Redirect client to the original URL

### Frontend

- **GET** `http://localhost:3000/` - Display form to shorten URL with a submit button
- Form submits POST request to `http://localhost:80/shorten`
- Displays the returned `{KEY}`

### Documentation

- **Security Concerns**: See `backend/SECURITY.md`
- **Scalability Concerns**: See `backend/SCALABILITY.md`

## Running

### Backend (Port 80)
```bash
cd backend
npm install
npm start
```

**Note:** Port 80 requires administrator/sudo privileges on most systems. If you get permission errors, you may need to:
- Run with `sudo` (Linux/Mac): `sudo npm start`
- Run as Administrator (Windows): Right-click terminal → Run as Administrator

### Frontend (Port 3000)
```bash
cd frontend
npm install
npm start
```

Then visit: http://localhost:3000

## Architecture

- **Backend**: Express.js API on port 80 (no HTML, pure API)
- **Frontend**: React application on port 3000 (displays form, calls backend API)
- **Storage**: In-memory Map (can be replaced with database)

## Notes
- Backend runs on port 80 (as specified in requirements)
- Frontend runs on port 3000 and connects to backend on port 80
- Backend and frontend are completely separated
- All error handling implemented
- Security and scalability documentation provided

