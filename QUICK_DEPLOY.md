# Quick Firebase Deployment Guide

## 🚀 Fastest Way to Deploy

### Step 1: Deploy Frontend to Firebase (5 minutes)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (from project root)
firebase init hosting

# When asked:
# - Select/create Firebase project
# - Public directory: frontend
# - Single-page app: Yes
# - Automatic builds: No

# Deploy
firebase deploy --only hosting
```

Your frontend will be live at: `https://your-project-id.web.app`

---

### Step 2: Deploy Backend to Railway (Free, 5 minutes)

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Set root directory to: `backend`
6. Add environment variable:
   - Name: `JWT_SECRET`
   - Value: Generate with: `openssl rand -base64 32`
7. Railway will auto-deploy
8. Copy your Railway URL (e.g., `https://your-app.railway.app`)

---

### Step 3: Update Frontend API URL

Edit these files and change `API_BASE_URL`:

**In `frontend/dashboard.html` (line ~152):**
```javascript
const API_BASE_URL = 'https://your-app.railway.app/api';
```

**In `frontend/login.html` (before `</body>`):**
```javascript
const API_BASE_URL = 'https://your-app.railway.app/api';
```

**In `frontend/signup.html` (before `</body>`):**
```javascript
const API_BASE_URL = 'https://your-app.railway.app/api';
```

**In `frontend/admin.html` (before `</body>`):**
```javascript
const API_BASE_URL = 'https://your-app.railway.app/api';
```

---

### Step 4: Redeploy Frontend

```bash
firebase deploy --only hosting
```

---

## ✅ Done!

Your app is now live:
- Frontend: `https://your-project-id.web.app`
- Backend: `https://your-app.railway.app`

---

## 🔒 Security Checklist

Before going live:
- [ ] Set strong `JWT_SECRET` on Railway
- [ ] Update `ALLOWED_ORIGINS` in Railway env vars:
  ```
  ALLOWED_ORIGINS=https://your-project-id.web.app,https://your-project-id.firebaseapp.com
  ```
- [ ] Set `NODE_ENV=production` in Railway
- [ ] Test all functionality
- [ ] Make yourself admin: `npm run make-admin` (on Railway, use Railway CLI or connect via SSH)

---

## 📝 Notes

- **SQLite works on Railway** - They provide persistent storage
- **Free tier available** on both Firebase and Railway
- **HTTPS automatically enabled** on both services
- **Database persists** between deployments on Railway

---

## Alternative: Render.com

If Railway doesn't work, use Render:
1. Go to render.com
2. New → Web Service
3. Connect GitHub
4. Root directory: `backend`
5. Build: `npm install`
6. Start: `npm start`
7. Add environment variables
8. Deploy!

Same process, just different service.

