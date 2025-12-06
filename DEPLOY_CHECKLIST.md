# ✅ Deployment Checklist - Quick Reference

## 🎯 Goal: Deploy your banking app for FREE

**Time needed**: ~15 minutes  
**Cost**: $0.00

---

## 📝 Quick Steps

### Backend (Render) - 10 min
- [ ] 1. Go to https://render.com → Sign up (FREE, no card)
- [ ] 2. Click "New +" → "Web Service"
- [ ] 3. Connect GitHub → Select `banking-app` repo
- [ ] 4. Settings:
  - Name: `banking-app-backend`
  - Root Directory: `backend`
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Plan: **Free**
- [ ] 5. Add Environment Variables:
  - `JWT_SECRET` = `your-random-secret-key-12345`
  - `NODE_ENV` = `production`
- [ ] 6. Click "Create Web Service"
- [ ] 7. Wait 5-10 min → Copy backend URL: `https://xxx.onrender.com`

### Frontend (Netlify) - 5 min
- [ ] 8. Update API URLs in frontend files:
  - Open `frontend/dashboard.html` → Find line with `YOUR-BACKEND-URL` → Replace with your Render URL
  - Do same for: `login.html`, `signup.html`, `admin.html`
- [ ] 9. Go to https://netlify.com → Sign up (FREE, no card)
- [ ] 10. Drag `frontend` folder onto Netlify page
- [ ] 11. Wait 1-2 min → Copy frontend URL: `https://xxx.netlify.app`
- [ ] 12. Go back to Render → Add environment variable:
  - `ALLOWED_ORIGINS` = `https://your-netlify-url.netlify.app`
- [ ] 13. Test your site!

---

## 🔗 Where to Change API URL

In these files, find `YOUR-BACKEND-URL` and replace with your Render URL:
1. `frontend/dashboard.html` (line ~157)
2. `frontend/login.html` (line ~44)
3. `frontend/signup.html` (line ~56)
4. `frontend/admin.html` (line ~68)

**Example**: 
- Render URL: `https://banking-app-backend-abc123.onrender.com`
- Replace: `https://YOUR-BACKEND-URL.onrender.com/api`
- With: `https://banking-app-backend-abc123.onrender.com/api`

---

## 🆘 Need Help?

See detailed guide: `FREE_DEPLOYMENT_GUIDE.md`

---

## ✨ Done!

Your site will be live at: `https://your-site.netlify.app` 🎉

