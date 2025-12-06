# 🚀 FREE Deployment Guide - Step by Step

## Overview
We'll deploy your banking app for FREE using:
- **Frontend**: Netlify (FREE, no credit card needed)
- **Backend**: Render (FREE tier, no credit card needed)

**Total Cost: $0.00** ✅

---

## 📋 STEP 1: Deploy Backend to Render (10 minutes)

### 1.1 Create Render Account
1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with GitHub, Google, or email (NO CREDIT CARD NEEDED)
4. Verify your email if required

### 1.2 Create New Web Service
1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub account (if not already connected)
3. Select your repository: `banking-app`
4. Click **"Connect"**

### 1.3 Configure Backend
Fill in these settings:
- **Name**: `banking-app-backend` (or any name you like)
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Select **"Free"** (it's free!)

### 1.4 Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**:
- **Key**: `JWT_SECRET`
- **Value**: `your-super-secret-key-change-this-12345` (use a long random string)
- Click **"Add"**

Add another one:
- **Key**: `NODE_ENV`
- **Value**: `production`
- Click **"Add"**

### 1.5 Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. Once deployed, you'll see a URL like: `https://banking-app-backend-xxxx.onrender.com`
4. **COPY THIS URL** - you'll need it in Step 2!

### 1.6 Test Backend
1. Open the URL in browser: `https://your-backend-url.onrender.com/api/auth/test`
2. If you see a response, backend is working!

---

## 📋 STEP 2: Deploy Frontend to Netlify (5 minutes)

### 2.1 Update Frontend API URL
1. Open `frontend/dashboard.html`
2. Find line 155: `const API_BASE_URL = 'http://localhost:5000/api';`
3. Replace with: `const API_BASE_URL = 'https://YOUR-BACKEND-URL.onrender.com/api';`
   (Use the URL from Step 1.5)

4. Do the same for:
   - `frontend/login.html` (line 42)
   - `frontend/signup.html` (line 54)
   - `frontend/admin.html` (line 66, if it exists)

### 2.2 Create Netlify Account
1. Go to https://www.netlify.com
2. Click **"Sign up"** → **"Sign up with GitHub"** (or email)
3. **NO CREDIT CARD NEEDED**

### 2.3 Deploy Frontend
**Option A: Drag & Drop (EASIEST)**
1. In Netlify dashboard, find **"Sites"**
2. Drag your entire `frontend` folder onto the Netlify page
3. Wait 1-2 minutes
4. You'll get a URL like: `https://random-name-12345.netlify.app`
5. **COPY THIS URL** - this is your website!

**Option B: GitHub (Alternative)**
1. Click **"Add new site"** → **"Import an existing project"**
2. Connect GitHub and select your repository
3. Settings:
   - **Base directory**: `frontend`
   - **Build command**: (leave empty)
   - **Publish directory**: `frontend`
4. Click **"Deploy site"**

### 2.4 Update CORS (Important!)
1. Go back to Render dashboard
2. Find your backend service
3. Go to **"Environment"** tab
4. Add new environment variable:
   - **Key**: `ALLOWED_ORIGINS`
   - **Value**: `https://your-netlify-url.netlify.app`
   - (Use the URL from Step 2.3)
5. Click **"Save Changes"**
6. Render will automatically redeploy

---

## 📋 STEP 3: Test Your Deployed Website

1. Open your Netlify URL: `https://your-site.netlify.app`
2. Try to sign up a new account
3. Try to login
4. If it works, you're done! 🎉

---

## 🔧 Troubleshooting

### Backend not working?
- Check Render logs: Go to your service → "Logs" tab
- Make sure `JWT_SECRET` environment variable is set
- Make sure Root Directory is set to `backend`

### Frontend can't connect to backend?
- Check browser console (F12) for errors
- Make sure you updated ALL API URLs in frontend files
- Make sure `ALLOWED_ORIGINS` in Render includes your Netlify URL
- Wait 2-3 minutes after updating CORS for changes to take effect

### Still having issues?
- Check that backend URL in frontend starts with `https://` (not `http://`)
- Make sure there's no trailing slash: `https://url.onrender.com/api` (not `/api/`)

---

## 📱 Access from Any Device

Once deployed, your website will be accessible from:
- ✅ Any computer
- ✅ Any phone
- ✅ Any tablet
- ✅ Anywhere in the world!

Just share the Netlify URL: `https://your-site.netlify.app`

---

## 💡 Important Notes

1. **Free Tier Limitations**:
   - Render free tier: Service sleeps after 15 minutes of inactivity (first request after sleep takes ~30 seconds)
   - Netlify free tier: 100GB bandwidth/month (plenty for personal use)

2. **Database**: Your SQLite database is stored on Render. It persists between deployments.

3. **Making Changes**: 
   - Update code locally
   - Push to GitHub
   - Render and Netlify will auto-deploy (if connected to GitHub)
   - Or manually redeploy in their dashboards

---

## ✅ You're Done!

Your banking app is now live and accessible worldwide for FREE! 🎉

