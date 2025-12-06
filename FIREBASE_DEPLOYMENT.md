# Firebase Deployment Guide

## Overview
This guide will help you deploy your banking app to Firebase. Firebase Hosting will serve the frontend, and you have options for the backend.

## Important Note About SQLite
**SQLite won't work on Firebase Functions** (serverless environment). You have two options:

### Option 1: Use Firebase Hosting + Separate Backend (Recommended for SQLite)
- Deploy frontend to Firebase Hosting
- Keep backend on a separate service (Heroku, Railway, Render, etc.)

### Option 2: Migrate to Firestore (Full Firebase)
- Convert database to Firestore
- Deploy both frontend and backend to Firebase

---

## Option 1: Frontend Only (Keep SQLite Backend Separate)

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Initialize Firebase in Your Project
```bash
# From project root
firebase init hosting
```

**When prompted:**
- Select "Use an existing project" or create a new one
- Public directory: `frontend`
- Configure as single-page app: **Yes**
- Set up automatic builds: **No** (unless you want CI/CD)

### Step 4: Update API URLs
Before deploying, update your frontend JavaScript files to use your backend URL:

**In `frontend/js/auth.js`, `dashboard.js`, `admin.js`:**
```javascript
// Change from:
const API_BASE = 'http://localhost:5000/api';

// To your backend URL (e.g., Heroku, Railway, etc.):
const API_BASE = 'https://your-backend-url.com/api';
```

### Step 5: Deploy Frontend
```bash
firebase deploy --only hosting
```

Your site will be live at: `https://your-project-id.web.app`

### Step 6: Deploy Backend Separately
Deploy your backend to one of these services:

**Heroku:**
```bash
cd backend
heroku create your-app-name
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

**Railway:**
1. Go to railway.app
2. New Project → Deploy from GitHub
3. Select your backend folder
4. Set environment variables

**Render:**
1. Go to render.com
2. New Web Service
3. Connect GitHub repo
4. Root directory: `backend`
5. Build: `npm install`
6. Start: `npm start`

---

## Option 2: Full Firebase (Frontend + Backend with Firestore)

### Step 1: Install Dependencies
```bash
npm install -g firebase-tools
cd backend
npm install firebase-admin
```

### Step 2: Initialize Firebase
```bash
# From project root
firebase init
```

Select:
- ✅ Hosting
- ✅ Functions

### Step 3: Convert Database to Firestore
You'll need to:
1. Export your SQLite data
2. Import to Firestore
3. Update your models to use Firestore

**This requires significant code changes.** I can help with this if you want.

### Step 4: Deploy Everything
```bash
firebase deploy
```

---

## Recommended: Option 1 (Easier)

For now, I recommend **Option 1**:
1. Deploy frontend to Firebase Hosting (free, fast CDN)
2. Deploy backend to Railway/Render (free tier available, supports SQLite)

This keeps your SQLite database and requires minimal changes.

---

## Environment Variables

### For Backend (on Railway/Render/Heroku):
Set these environment variables:
- `JWT_SECRET` - A strong random string (use: `openssl rand -base64 32`)
- `NODE_ENV=production`
- `PORT` - Usually auto-set by hosting service

### For Frontend:
Update API_BASE in all JavaScript files to point to your deployed backend.

---

## Security Checklist for Production

✅ Use HTTPS (Firebase Hosting provides this automatically)
✅ Set strong JWT_SECRET
✅ Enable CORS restrictions (already configured)
✅ Use environment variables for secrets
✅ Enable rate limiting (already configured)
✅ Input validation (just added)
✅ Sanitize user inputs (just added)

---

## Quick Start (Option 1)

1. **Deploy Frontend:**
   ```bash
   firebase init hosting
   # Select frontend as public directory
   firebase deploy --only hosting
   ```

2. **Deploy Backend to Railway:**
   - Go to railway.app
   - New Project
   - Deploy from GitHub (select backend folder)
   - Add environment variable: `JWT_SECRET=your-secret-key`
   - Copy the URL (e.g., `https://your-app.railway.app`)

3. **Update Frontend API URLs:**
   - Edit `frontend/js/auth.js`
   - Edit `frontend/js/dashboard.js`
   - Edit `frontend/js/admin.js`
   - Change `API_BASE` to your Railway URL

4. **Redeploy Frontend:**
   ```bash
   firebase deploy --only hosting
   ```

Done! Your app is live! 🚀

