# 🌐 Single Site Deployment - Everything in One URL!

Your app is now configured to run everything from **ONE website** - no need for separate frontend and backend!

---

## ✅ What Changed

1. **Backend now serves frontend files** - Everything runs from one server
2. **Frontend uses relative API paths** - Automatically works on the same domain
3. **One URL for everything** - No CORS issues, simpler setup!

---

## 🚀 Deploy to Render (One Site)

### Step 1: Update Render Settings

1. Go to https://dashboard.render.com
2. Click your service (`banking-app-rg9t`)
3. Go to **Settings**
4. Make sure these settings are correct:
   - **Root Directory**: `backend` ✅ (keep this!)
   - **Build Command**: `npm install` ✅
   - **Start Command**: `npm start` ✅
   - **Environment**: `Node` ✅

### Step 2: Environment Variables

Make sure you have these set:
- `JWT_SECRET` = (your secret key)
- `NODE_ENV` = `production`

### Step 3: Deploy

1. Go to **Manual Deploy** tab
2. Click **"Deploy latest commit"**
3. Wait 3-5 minutes for deployment

### Step 4: Test!

Once deployed, your **ONE URL** will serve:
- ✅ Frontend (all HTML pages)
- ✅ Backend API (`/api/*`)
- ✅ Everything works together!

**Your site URL**: `https://banking-app-rg9t.onrender.com`

---

## 🎯 How It Works

- **Frontend files** are served from `/` (root)
- **API endpoints** are at `/api/*`
- **Same domain** = No CORS issues!
- **One deployment** = Easier to manage!

---

## 📝 Local Testing

To test locally:
1. Make sure backend is running: `cd backend && npm start`
2. Open: `http://localhost:5000`
3. Everything works the same!

---

## ✨ Benefits

- ✅ **One URL** - Everything in one place
- ✅ **No CORS** - Same domain, no issues
- ✅ **Simpler** - One deployment to manage
- ✅ **Free** - Still uses Render's free tier!

---

## 🆘 Troubleshooting

**If frontend doesn't load:**
- Check Render logs for errors
- Make sure `frontend` folder exists at project root
- Verify Root Directory is set to `backend`

**If API doesn't work:**
- Check that routes start with `/api/`
- Verify environment variables are set
- Check Render logs for errors

---

**That's it! One site, one URL, everything works! 🎉**

