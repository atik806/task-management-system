# Firebase Setup Guide

## Step-by-Step Firebase Configuration

### 1. Create Firebase Project

1. Visit https://console.firebase.google.com/
2. Click "Add project"
3. Enter project name: "task-management-system"
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Register Web App

1. In project overview, click the web icon `</>`
2. Register app nickname: "Task Manager Web"
3. Don't check "Firebase Hosting" yet
4. Click "Register app"
5. Copy the configuration code shown

### 3. Enable Authentication

1. In left sidebar, click "Authentication"
2. Click "Get started"
3. Click "Sign-in method" tab
4. Click "Email/Password"
5. Enable the first toggle (Email/Password)
6. Click "Save"

### 4. Create Firestore Database

1. In left sidebar, click "Firestore Database"
2. Click "Create database"
3. Select "Start in test mode" (for development)
4. Choose your location (closest to your users)
5. Click "Enable"

### 5. Set Up Security Rules (Production)

For production, replace test mode rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      // Users can only read their own tasks
      allow read: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
      
      // Users can create tasks for themselves
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
      
      // Users can update/delete their own tasks
      allow update, delete: if request.auth != null && 
                               request.auth.uid == resource.data.userId;
    }
  }
}
```

### 6. Update app.js

Replace the firebaseConfig in `app.js` with your credentials from step 2.

### 7. Test the Application

1. Open index.html in a browser
2. Click "Login" → "Register"
3. Create a test account
4. Add a task
5. Verify it appears in Firestore Console

## Troubleshooting

**CORS Errors:**
- Make sure you're running from a web server, not file://
- Use `python -m http.server` or similar

**Authentication Errors:**
- Verify Email/Password is enabled in Firebase Console
- Check browser console for specific error messages

**Firestore Permission Denied:**
- Ensure you're logged in
- Check security rules match your setup
- Verify userId is being set correctly

**Tasks Not Appearing:**
- Check browser console for errors
- Verify Firestore collection is named "tasks"
- Ensure user is authenticated before loading tasks
