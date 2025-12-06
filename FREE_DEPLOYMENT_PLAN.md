# 🆓 Free Deployment Plan (No Credit Card!)

## ✅ What We'll Do:

1. **Frontend → Firebase Hosting** (FREE Spark plan - no card needed!)
2. **Backend → Railway** (FREE tier - no card needed!)

Both are completely FREE! 🎉

---

## Step 1: Deploy Frontend to Firebase (Already Done!)

Your frontend is now deployed to Firebase Hosting!

**Your app URL:** `https://banking-app-71ef1.web.app`

---

## Step 2: Deploy Backend to Railway (Free, No Card!)

### Option A: Railway (Easiest)

1. **Go to:** https://railway.app
2. **Sign up** with GitHub (free, no card needed)
3. **New Project** → **Deploy from GitHub repo**
4. **Select your repository**
5. **Set Root Directory:** `backend`
6. **Add Environment Variable:**
   - Name: `JWT_SECRET`
   - Value: `your-random-secret-key-here` (use a long random string)
7. **Railway auto-deploys!**
8. **Copy your Railway URL** (e.g., `https://your-app.railway.app`)

### Option B: Render (Alternative)

1. **Go to:** https://render.com
2. **Sign up** (free, no card needed)
3. **New** → **Web Service**
4. **Connect GitHub** → Select your repo
5. **Settings:**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. **Add Environment Variable:**
   - `JWT_SECRET` = your random secret
7. **Deploy!**
8. **Copy your Render URL**

---

## Step 3: Update Frontend API URLs

After you get your backend URL (Railway or Render), update these files:

**File: `frontend/dashboard.html` (line ~154)**
```javascript
const API_BASE_URL = 'https://your-backend-url.railway.app/api';
```

**File: `frontend/login.html`**
```javascript
const API_BASE_URL = 'https://your-backend-url.railway.app/api';
```

**File: `frontend/signup.html`**
```javascript
const API_BASE_URL = 'https://your-backend-url.railway.app/api';
```

**File: `frontend/admin.html`**
```javascript
const API_BASE_URL = 'https://your-backend-url.railway.app/api';
```

---

## Step 4: Redeploy Frontend

```powershell
firebase deploy --only hosting
```

---

## ✅ Done!

Your app is now:
- **Frontend:** `https://banking-app-71ef1.web.app` (Firebase - FREE)
- **Backend:** `https://your-backend.railway.app` (Railway - FREE)

**Both FREE, no credit card needed!** 🎉

---

## 📱 Mobile Access

Open `https://banking-app-71ef1.web.app` on your phone - it works!

