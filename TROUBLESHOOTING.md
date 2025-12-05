# TaskFlow Troubleshooting Guide

## Issue: "Add Task" Not Working

If clicking "Add Task" doesn't work, follow these steps:

### Step 1: Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **task-management-system-9f068**
3. Click **Firestore Database** in the left sidebar
4. Click **Create database**
5. Choose **Start in test mode** (for development)
6. Select your location (closest to you)
7. Click **Enable**

### Step 2: Configure Firestore Security Rules

After enabling Firestore, set up security rules:

1. In Firestore Database, click on the **Rules** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own tasks
    match /tasks/{taskId} {
      allow read: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
      
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
      
      allow update, delete: if request.auth != null && 
                               request.auth.uid == resource.data.userId;
    }
  }
}
```

3. Click **Publish**

### Step 3: Check Browser Console

1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Try adding a task
4. Look for error messages

Common errors:

**"permission-denied"**
- Firestore security rules are blocking the request
- Make sure you're logged in
- Check that security rules are configured correctly

**"unavailable"**
- No internet connection
- Firebase services are down (rare)
- Check your network connection

**"FIRESTORE (10.7.1) INTERNAL ASSERTION FAILED"**
- Firestore is not initialized properly
- Make sure Firestore Database is enabled in Firebase Console

### Step 4: Verify Authentication

1. Make sure you're logged in
2. Check that your email appears in the header
3. Try logging out and logging back in

### Step 5: Test with Simple Data

Open browser console and run:

```javascript
// This should show your current user
console.log(auth.currentUser);

// This should show the Firestore instance
console.log(db);
```

### Step 6: Check Network Tab

1. Open Developer Tools → Network tab
2. Try adding a task
3. Look for requests to `firestore.googleapis.com`
4. Check if they return errors (red status codes)

## Common Solutions

### Solution 1: Clear Browser Cache
- Press Ctrl+Shift+Delete
- Clear cached images and files
- Reload the page

### Solution 2: Use Incognito/Private Mode
- Test in a private browsing window
- This rules out extension conflicts

### Solution 3: Check Firebase Quotas
- Go to Firebase Console → Usage
- Make sure you haven't exceeded free tier limits

### Solution 4: Verify Firebase Config
Make sure your Firebase config in `app.js` matches your project:
- Check `projectId`
- Check `apiKey`
- Check `authDomain`

## Still Not Working?

### Enable Debug Mode

Add this to the top of `app.js` after imports:

```javascript
// Enable Firestore debug logging
import { enableIndexedDbPersistence } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Log all Firebase operations
console.log('Firebase initialized:', app);
console.log('Auth initialized:', auth);
console.log('Firestore initialized:', db);
```

### Check Firestore Data Manually

1. Go to Firebase Console → Firestore Database
2. Click on **Data** tab
3. You should see a `tasks` collection after adding a task
4. If you don't see it, the task is not being saved

### Contact Support

If none of these solutions work:

1. Check Firebase Status: https://status.firebase.google.com/
2. Review Firebase documentation: https://firebase.google.com/docs/firestore
3. Check for known issues on GitHub

## Quick Checklist

- [ ] Firestore Database is enabled
- [ ] Security rules are configured
- [ ] User is logged in
- [ ] Browser console shows no errors
- [ ] Internet connection is working
- [ ] Firebase config is correct
- [ ] All required fields are filled in the form

## Test Mode Security Rules (Development Only)

For quick testing, you can use these permissive rules (NOT for production):

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

**⚠️ WARNING:** These rules allow any authenticated user to read/write all data. Only use for testing!
