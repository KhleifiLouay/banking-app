# 🚀 Step-by-Step Deployment Guide

## Follow These Steps in Order:

### ✅ Step 1: Create Firebase Project (if not done)
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Enter project name (e.g., "my-banking-app")
4. Copy the **Project ID** (shown after creation)

### ✅ Step 2: Set Your Project ID
Run this command (replace with YOUR project ID):
```bash
firebase use YOUR-PROJECT-ID
```

### ✅ Step 3: Initialize Firebase
```bash
firebase init
```

**When asked, select:**
- ✅ Firestore
- ✅ Functions  
- ✅ Hosting

**For each service:**
- **Firestore:** Use existing files (firestore.rules, firestore.indexes.json)
- **Functions:** Use existing functions directory
- **Hosting:** Public directory = `frontend`, Single-page app = Yes

### ✅ Step 4: Set JWT Secret
```bash
firebase functions:config:set jwt.secret="$(openssl rand -base64 32)"
```

**OR on Windows PowerShell:**
```powershell
$secret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
firebase functions:config:set jwt.secret="$secret"
```

**OR manually (any OS):**
```bash
firebase functions:config:set jwt.secret="your-random-secret-key-here-make-it-long"
```

### ✅ Step 5: Install Functions Dependencies
```bash
cd functions
npm install
cd ..
```

### ✅ Step 6: Deploy Everything
```bash
firebase deploy
```

This will deploy:
- Firestore rules
- Functions (backend)
- Hosting (frontend)

### ✅ Step 7: Get Your URLs
After deployment, you'll see:
- **Hosting URL:** `https://YOUR-PROJECT-ID.web.app`
- **Functions URL:** `https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/api`

### ✅ Step 8: Update Frontend API URLs
Edit these 4 files and change `API_BASE_URL`:

**File: `frontend/dashboard.html` (around line 154)**
```javascript
const API_BASE_URL = 'https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/api/api';
```

**File: `frontend/login.html`**
```javascript
const API_BASE_URL = 'https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/api/api';
```

**File: `frontend/signup.html`**
```javascript
const API_BASE_URL = 'https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/api/api';
```

**File: `frontend/admin.html`**
```javascript
const API_BASE_URL = 'https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/api/api';
```

**Replace `YOUR-PROJECT-ID` with your actual project ID!**

### ✅ Step 9: Redeploy Frontend
```bash
firebase deploy --only hosting
```

### ✅ Step 10: Test Your App!
1. Open: `https://YOUR-PROJECT-ID.web.app`
2. Sign up for an account
3. Test on your phone - it works! 📱

---

## 🎉 Done!

Your banking app is now live on Firebase!

---

## 🐛 Troubleshooting

**If Step 3 (init) fails:**
- Make sure you ran `firebase use YOUR-PROJECT-ID` first
- Check you're logged in: `firebase login`

**If Step 6 (deploy) fails:**
- Make sure you ran `npm install` in functions folder
- Check Functions logs: `firebase functions:log`

**If API calls fail:**
- Double-check API_BASE_URL in all 4 HTML files
- Make sure you replaced YOUR-PROJECT-ID correctly

