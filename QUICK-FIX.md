# Quick Fix: Category Permission Error

## The Problem
You're getting "Missing or insufficient permissions" when adding categories because Firestore security rules don't include the `categories` collection.

## The Solution (2 minutes)

### Option 1: Update Security Rules (Recommended)

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Select project: **task-management-system-9f068**

2. **Open Firestore Rules:**
   - Click **Firestore Database** (left sidebar)
   - Click **Rules** tab

3. **Copy & Paste These Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && 
                            request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
    }
    
    match /categories/{categoryId} {
      allow read, write: if request.auth != null && 
                            request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
    }
  }
}
```

4. **Click "Publish"**

5. **Refresh your app and try again!**

---

### Option 2: Test Mode (Quick but Less Secure)

If you just want to test quickly:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **Warning:** This allows any logged-in user to access all data. Only use for testing!

---

## Verify It Works

After updating rules:

1. Wait 10-30 seconds
2. Refresh your app (Ctrl+F5)
3. Click "+ Add Category"
4. Enter a name and click "Create Category"
5. You should see the new column appear!

## Still Not Working?

Check these:

- ✅ You clicked "Publish" in Firebase Console
- ✅ You're logged in (email shows in sidebar)
- ✅ Firestore Database is enabled
- ✅ You waited 30 seconds after publishing rules
- ✅ You refreshed the page

## Need More Help?

See `FIRESTORE-RULES.md` for detailed instructions and troubleshooting.
