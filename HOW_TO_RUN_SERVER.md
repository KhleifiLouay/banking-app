# 🚀 How to Run the Server

## ✨ NEW: Random Port Selection!

The server now **automatically selects a random free port** each time you start it locally, so you'll never get "port already in use" errors!

### How It Works:
- **Local Development**: Server randomly selects a free port between 5000-10000 each time
- **Deployment**: Uses the `PORT` environment variable (set by hosting platform)
- **Frontend**: Automatically detects and uses the correct port from the URL

---

## Quick Start (Easiest Way)

### Start the Server:
```powershell
cd backend
.\start-server.ps1
```

The server will find a free port and display it. Just open that URL in your browser!

### Stop the Server:
```powershell
cd backend
.\stop-server.ps1
```

---

## Manual Method

### Start the Server:
1. Open PowerShell
2. Navigate to the backend folder:
   ```powershell
   cd C:\Users\21624\Desktop\banking-app\backend
   ```
3. Run:
   ```powershell
   npm start
   ```

The server will automatically find a free port and show you the URL!

### Stop the Server:
**Option 1:** Press `Ctrl+C` in the terminal where the server is running

**Option 2:** Run the stop script:
```powershell
cd backend
.\stop-server.ps1
```

---

## Access Your App

Once the server starts, it will display:
```
✅ Server running on port [PORT NUMBER]
🌐 Access your app at: http://localhost:[PORT NUMBER]
```

Just open that URL in your browser! The frontend automatically uses the correct port.

---

## What Changed?

✅ **Random Port Selection**: Server picks a random free port (5000-10000) each time you start it

✅ **No More Port Conflicts**: Different port each time means no conflicts with other services

✅ **Dynamic Frontend Configuration**: Frontend automatically detects and uses the correct port from the URL

✅ **Deployment Compatible**: Still works perfectly when deployed (uses PORT env var)

✅ **Helper Scripts**: 
- `start-server.ps1` - Automatically stops old server and starts new one
- `stop-server.ps1` - Stops any Node.js server process

✅ **Graceful Shutdown**: Press `Ctrl+C` to stop the server cleanly

---

## Troubleshooting

**Problem:** "Cannot find module"
**Solution:** Run `npm install` in the backend folder

**Problem:** Script won't run
**Solution:** Make sure you're in PowerShell (not Command Prompt) and run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Problem:** Frontend can't connect to backend
**Solution:** Make sure you're accessing the app through the URL shown when the server starts (not a hardcoded port)

