# Fix Firebase Project ID Error

## Quick Fix Steps:

### Step 1: Create Firebase Project (if you haven't)
1. Go to https://console.firebase.google.com/
2. Click "Add project" or "Create a project"
3. Enter project name (e.g., "banking-app")
4. Disable Google Analytics (optional)
5. Click "Create project"
6. **Copy your Project ID** (shown on the project page)

### Step 2: Set Project in Firebase CLI
Run this command (replace with YOUR project ID):
```bash
firebase use --add
```

Then:
- Select "Create a new project" OR select your existing project
- Enter alias: `default` (or just press Enter)

OR manually set it:
```bash
firebase use YOUR-PROJECT-ID
```

### Step 3: Verify
```bash
firebase projects:list
```

You should see your project listed.

### Step 4: Continue with init
```bash
firebase init
```

Now it should work!

---

## Alternative: Edit .firebaserc Manually

If you know your project ID, edit `.firebaserc`:
```json
{
  "projects": {
    "default": "your-actual-project-id-here"
  }
}
```

Replace `your-actual-project-id-here` with your real Firebase project ID.

