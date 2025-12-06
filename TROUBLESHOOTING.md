# Troubleshooting "Erreur de connexion au serveur"

## Common Issues and Solutions

### 1. Server Not Running
**Problem**: The backend server isn't started.

**Solution**: 
```bash
cd backend
npm start
```

You should see: `Server running on port 5000`

### 2. Wrong Port
**Problem**: Server might be running on a different port.

**Solution**: 
- Check the console output when starting the server
- Default port is 5000
- If using a different port, update `API_BASE` in:
  - `frontend/js/auth.js`
  - `frontend/js/dashboard.js`
  - `frontend/js/admin.js`

Change from: `const API_BASE = 'http://localhost:5000/api';`
To your port: `const API_BASE = 'http://localhost:YOUR_PORT/api';`

### 3. Database Not Initialized
**Problem**: Database might not have the `isAdmin` column.

**Solution**: 
- Delete `backend/database.sqlite` and restart the server (it will recreate with the new schema)
- OR manually add the column:
```sql
sqlite3 backend/database.sqlite
ALTER TABLE users ADD COLUMN isAdmin INTEGER DEFAULT 0;
```

### 4. User Not Admin
**Problem**: You're logged in but not an admin user.

**Solution**: Make yourself admin:
```bash
cd backend
npm run make-admin
```

Or manually:
```sql
sqlite3 backend/database.sqlite
UPDATE users SET isAdmin = 1 WHERE id = 1;
```

### 5. CORS Issues
**Problem**: Browser blocking requests.

**Solution**: 
- Make sure CORS is enabled in `backend/server.js` (it should be: `app.use(cors());`)
- Check browser console for CORS errors
- Try accessing from the same origin

### 6. Token Issues
**Problem**: Token expired or invalid.

**Solution**: 
- Log out and log back in
- Clear browser localStorage and login again

## Quick Test

1. **Check if server is running**:
   - Open browser: `http://localhost:5000/api/auth/me` (should return error without token, but server should respond)

2. **Check browser console**:
   - Open DevTools (F12)
   - Go to Console tab
   - Look for error messages
   - Go to Network tab
   - Check if requests to `/api/admin/users` are being made
   - Check the response status

3. **Verify admin status**:
   - Check localStorage in browser DevTools
   - Look for `user` key
   - Verify `isAdmin: true` in the user object

## Still Having Issues?

1. Make sure both frontend and backend are running
2. Check that you're accessing the frontend from the correct URL
3. Verify the backend server console for any error messages
4. Check browser console for detailed error messages

