# 🏦 SecureBank - Banking Application

A secure online banking application with user management, transactions, and admin interface.

## Features

- 🔐 Secure user authentication (JWT)
- 💰 Account balance management
- 💸 Money transfers between accounts
- 📊 Transaction history
- 👑 Admin interface for user management
- 📱 Responsive design (mobile-friendly)

## Tech Stack

- **Backend**: Node.js, Express.js, SQLite
- **Frontend**: HTML5, CSS3, JavaScript
- **Security**: JWT, bcrypt, Helmet.js, CORS, rate limiting

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Start the server:

**Option A - Using PowerShell script (Recommended):**
```powershell
cd backend
.\start-server.ps1
```

**Option B - Using npm directly:**
```bash
cd backend
npm start
```

**Option C - Manual start (if port is in use):**
```powershell
# First, stop any existing server
cd backend
.\stop-server.ps1

# Then start the server
npm start
```

3. Open your browser and visit `http://localhost:5000`

## Stopping the Server

**Option A - Using PowerShell script:**
```powershell
cd backend
.\stop-server.ps1
```

**Option B - Manual stop:**
```powershell
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

**Option C - Press `Ctrl+C` in the terminal where the server is running**

## Security Features

- Password requirements: Minimum 8 characters with uppercase, lowercase, and numbers
- Email and password confirmation on signup
- JWT-based authentication
- Rate limiting for API endpoints
- Input validation and sanitization

## License

MIT

