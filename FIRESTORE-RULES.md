# Firestore Security Rules Setup

## Error: "Missing or insufficient permissions"

This error occurs because Firestore security rules are not configured for the `categories` collection.

## Solution: Update Firestore Security Rules

### Step 1: Go to Firebase Console

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **task-management-system-9f068**
3. Click **Firestore Database** in the left sidebar
4. Click on the **Rules** tab

### Step 2: Replace Rules

Copy and paste these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Tasks Collection
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
    
    // Categories Collection
    match /categories/{categoryId} {
      // Users can only read their own categories
      allow read: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
      
      // Users can create categories for themselves
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
      
      // Users can update/delete their own categories
      allow update, delete: if request.auth != null && 
                               request.auth.uid == resource.data.userId;
    }
    
    // Notes Collection
    match /notes/{noteId} {
      // Users can only read their own notes
      allow read: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
      
      // Users can create notes for themselves
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
      
      // Users can update/delete their own notes
      allow update, delete: if request.auth != null && 
                               request.auth.uid == resource.data.userId;
    }
  }
}
```

### Step 3: Publish Rules

1. Click the **Publish** button
2. Wait for confirmation message
3. Refresh your app and try again

## Alternative: Test Mode (Development Only)

For quick testing, you can use these permissive rules (⚠️ NOT for production):

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

## Verify Rules Are Working

After updating rules:

1. Open your app
2. Try adding a category
3. Check browser console for errors
4. If successful, you should see: "Category added successfully"

## Common Issues

### Issue: "permission-denied" still appears

**Solution:**
- Make sure you clicked "Publish" after updating rules
- Wait 30 seconds for rules to propagate
- Clear browser cache and reload
- Check that you're logged in

### Issue: Rules not saving

**Solution:**
- Check for syntax errors in the rules editor
- Make sure you're using `rules_version = '2';`
- Try copying the rules again

### Issue: Can't access Firestore Rules tab

**Solution:**
- Make sure Firestore Database is enabled
- Check that you have owner/editor permissions on the Firebase project
- Try accessing from a different browser

## Production Security Rules

For production, consider these enhanced rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Tasks Collection
    match /tasks/{taskId} {
      allow read: if isAuthenticated() && isOwner(resource.data.userId);
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
      allow update, delete: if isAuthenticated() && isOwner(resource.data.userId);
    }
    
    // Categories Collection
    match /categories/{categoryId} {
      allow read: if isAuthenticated() && isOwner(resource.data.userId);
      allow create: if isAuthenticated() && 
                       isOwner(request.resource.data.userId) &&
                       request.resource.data.name is string &&
                       request.resource.data.name.size() > 0 &&
                       request.resource.data.name.size() <= 50;
      allow update, delete: if isAuthenticated() && isOwner(resource.data.userId);
    }
  }
}
```

These rules include:
- Data validation (category name must be 1-50 characters)
- Helper functions for cleaner code
- Proper authentication checks

## Testing Rules

You can test rules in the Firebase Console:

1. Go to Firestore Database → Rules
2. Click on the **Rules Playground** tab
3. Select operation (read/write)
4. Enter collection path (e.g., `/categories/test-123`)
5. Set authentication (simulate user)
6. Click **Run**

## Need Help?

If you're still having issues:

1. Check Firebase Status: https://status.firebase.google.com/
2. Review Firestore documentation: https://firebase.google.com/docs/firestore/security/get-started
3. Check browser console for detailed error messages
4. Verify you're logged in (check user email in sidebar)

## Quick Checklist

- [ ] Firestore Database is enabled
- [ ] Security rules include both `tasks` and `categories` collections
- [ ] Rules have been published
- [ ] User is logged in
- [ ] Browser cache is cleared
- [ ] No errors in browser console
