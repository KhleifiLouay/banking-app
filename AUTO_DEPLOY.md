# 🚀 Automatic Firebase Deployment Script

## Quick Deploy (Copy & Paste)

Run these commands in order:

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Initialize (select Firestore, Functions, Hosting)
firebase init

# 4. Set JWT Secret
firebase functions:config:set jwt.secret="$(openssl rand -base64 32)"

# 5. Install Functions dependencies
cd functions
npm install
cd ..

# 6. Deploy everything
firebase deploy
```

## After Deployment

1. **Get your Firebase project ID** from Firebase Console
2. **Update API URLs** in these files:
   - `frontend/dashboard.html`
   - `frontend/login.html`
   - `frontend/signup.html`
   - `frontend/admin.html`

   Change `API_BASE_URL` to:
   ```javascript
   const API_BASE_URL = 'https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/api/api';
   ```

3. **Redeploy frontend:**
   ```bash
   firebase deploy --only hosting
   ```

## Your App URL

After deployment, your app will be at:
- `https://YOUR-PROJECT-ID.web.app`

Open this on your phone - it works! 📱

