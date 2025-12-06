# 🚂 Deploy Backend to Railway (Free, No Card!)

## Quick Steps:

### 1. Go to Railway
https://railway.app

### 2. Sign Up
- Click "Start a New Project"
- Sign up with GitHub (easiest, no card needed)

### 3. Deploy Your Backend
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. **Authorize Railway** to access your GitHub
4. **Select your repository** (banking-app)
5. Railway will detect it's a Node.js app

### 4. Configure Settings
1. Click on your service
2. Go to **Settings** tab
3. **Root Directory:** Set to `backend`
4. **Start Command:** `npm start` (should auto-detect)

### 5. Add Environment Variable
1. Go to **Variables** tab
2. Click **"New Variable"**
3. **Name:** `JWT_SECRET`
4. **Value:** Generate a random string (e.g., `my-super-secret-jwt-key-123456789`)
5. Click **"Add"**

### 6. Deploy!
Railway will automatically:
- Install dependencies
- Start your server
- Give you a URL

### 7. Get Your URL
1. Go to **Settings** tab
2. Scroll to **"Domains"**
3. Click **"Generate Domain"**
4. Copy the URL (e.g., `https://your-app.railway.app`)

### 8. Update Frontend
Update the API URLs in your HTML files to use this Railway URL!

---

## ✅ That's It!

Your backend is now live on Railway - **FREE, no card needed!**

