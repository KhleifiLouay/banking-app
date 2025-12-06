# Firebase Init - What to Select

## When Firebase asks:

### "Would you like to initialize a new codebase, or overwrite an existing one?"
**→ Select: Initialize** ✅

This will use your existing `functions/` folder with all the code we created.

---

## After selecting Initialize, you'll be asked:

### "What language would you like to use?"
**→ Select: JavaScript** ✅

### "Do you want to use ESLint?"
**→ Select: No** (or Yes if you want)

### "Do you want to install dependencies now?"
**→ Select: Yes** ✅

---

## For Hosting Setup:

### "What do you want to use as your public directory?"
**→ Type: frontend** ✅

### "Configure as a single-page app?"
**→ Select: Yes** ✅

### "Set up automatic builds?"
**→ Select: No** ✅

---

## For Firestore Setup:

### "File firestore.rules already exists. Overwrite?"
**→ Select: No** ✅ (keep existing)

### "File firestore.indexes.json already exists. Overwrite?"
**→ Select: No** ✅ (keep existing)

---

## Summary:
- **Functions:** Initialize (use existing)
- **Hosting:** Public = `frontend`, SPA = Yes
- **Firestore:** Keep existing files

