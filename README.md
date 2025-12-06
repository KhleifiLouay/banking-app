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
```bash
npm start
```

3. Open `frontend/index.html` in your browser or visit `http://localhost:5000`

## Security Features

- Password requirements: Minimum 8 characters with uppercase, lowercase, and numbers
- Email and password confirmation on signup
- JWT-based authentication
- Rate limiting for API endpoints
- Input validation and sanitization

## License

MIT

