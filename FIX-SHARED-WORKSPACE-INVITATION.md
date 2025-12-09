# 🔧 Fix Shared Workspace & Invitation Functionality

## Diagnostic Report

### Issues to Fix

1. **Shared Workspace System Not Initializing Properly**
   - Real-time listeners may not be set up
   - Workspace data not loading
   - UI not updating

2. **Invitation System Not Working**
   - Invitations not being created
   - Badge not showing
   - Modal not opening

3. **Move Task Feature Issues**
   - Modal not opening
   - Workspace list not showing
   - Move operation failing

## Root Causes

### 1. Missing Global Exports
The systems need to export functions globally for HTML onclick handlers to work.

### 2. Initialization Order
Systems must initialize in correct order:
1. Firebase (db, auth)
2. User profile manager
3. Invitation system
4. Shared workspace system
5. UI controllers

### 3. Missing Event Handlers
Modal close handlers and form submissions need proper setup.

## Complete Fix

### Step 1: Verify Firestore Rules Are Deployed

**CRITICAL:** Make sure you've deployed the rules from:
`FIRESTORE-RULES-SHARED-WORKSPACES.txt`

To deploy:
1. Go to Firebase Console
2. Firestore Database → Rules
3. Copy all content from the file
4. Paste and Publish
5. Wait 2 minutes

### Step 2: Check Browser Console

Open DevTools (F12) and check for these messages:

**Should See:**
```
✅ User Profile Manager Loaded
✅ Workspace Invitations System Loaded
✅ Shared Workspace System Loaded
✅ Shared Workspace UI Controller Loaded
User logged in: your@email.com
👤 Creating/updating user profile for: your@email.com
✅ User profile saved
🚀 Initializing invitation system for: your@email.com
✅ Invitation system initialized
🚀 Initializing shared workspace system for: your@email.com
✅ Shared workspace system initialized
🎨 Initializing shared workspace UI
✅ Shared workspace UI initialized
```

**If Missing:**
- Check that all script files are loaded
- Verify no JavaScript errors
- Hard refresh browser (Ctrl+Shift+R)

### Step 3: Test Invitation System

**Test 1: Send Invitation**
```
1. Click "Invite User" in sidebar
2. Enter email: test@example.com
3. Click "Send Invite"
4. Should see: "Invite sent successfully!"
5. Check console for: "Invite created with ID: ..."
```

**Test 2: Receive Invitation**
```
1. Login as different user
2. Should see badge on "Invitations" button
3. Click "Invitations"
4. Should see invitation card
5. Click "Accept"
6. Should see: "Invitation accepted!"
```

**Test 3: Shared Workspace Created**
```
1. After accepting invitation
2. Look in sidebar for "Workspaces" section
3. Should see shared workspace listed
4. Click to switch to it
5. Should see workspace indicator at top
```

### Step 4: Test Move Task Feature

**Test 1: Move Button Visible**
```
1. Go to personal task board
2. Look at any task card
3. Should see three buttons: [Edit] [Delete] [Move]
4. Move button should be purple
```

**Test 2: Move Task**
```
1. Click [Move] button on a task
2. Modal should open
3. Should show task preview
4. Should list shared workspaces
5. Click "Move Here"
6. Task should disappear from personal
7. Should appear in shared workspace
```

## Quick Fixes to Apply

### Fix 1: Ensure All Scripts Load in Order

In `index.html`, verify script order:
```html
<script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
<script type="module" src="user-profile-manager.js"></script>
<script type="module" src="workspace-invitations.js"></script>
<script type="module" src="shared-workspace-system.js"></script>
<script type="module" src="shared-workspace-ui-controller.js"></script>
<script type="module" src="app.js"></script>
```

### Fix 2: Hard Refresh Browser

Clear all cache and reload:
- **Windows/Linux:** Ctrl+Shift+R
- **Mac:** Cmd+Shift+R

Or:
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### Fix 3: Check Firestore Rules

Verify rules are deployed:
1. Firebase Console → Firestore → Rules
2. Should see "Last published: Just now" or recent timestamp
3. If not, deploy from `FIRESTORE-RULES-SHARED-WORKSPACES.txt`

### Fix 4: Verify User Profile Created

Check Firestore:
1. Firebase Console → Firestore → Data
2. Look for `users` collection
3. Should have document with your uid
4. Should contain: email, displayName, createdAt, lastLogin

### Fix 5: Check Invitations Collection

1. Firebase Console → Firestore → Data
2. Look for `workspaceInvitations` collection
3. After sending invite, should see new document
4. Should have: invitedEmail, status: "pending", createdAt

## Troubleshooting

### Issue: "Invite User" button doesn't work

**Check:**
1. Are you logged in? (Check email in top-right)
2. Is the button visible? (Check sidebar)
3. Any console errors? (Open F12)

**Fix:**
```javascript
// In browser console, test:
console.log('Current user:', window.currentUser);
console.log('Invitation system:', window.invitationSystem);
console.log('Shared workspace system:', window.sharedWorkspaceSystem);
```

### Issue: Invitation badge not showing

**Check:**
1. Did you send an invitation?
2. Are you logged in as different user?
3. Check console for listener messages

**Fix:**
```javascript
// In browser console:
window.invitationSystem.loadUserInvitations().then(invites => {
    console.log('Invitations:', invites);
});
```

### Issue: "Move" button not working

**Check:**
1. Is button visible on task cards?
2. Any console errors when clicking?
3. Are you in personal workspace?

**Fix:**
```javascript
// In browser console:
console.log('Tasks:', window.tasks);
console.log('Shared workspaces:', window.sharedWorkspaceSystem?.getSharedWorkspaces());
```

### Issue: Permission Denied Errors

**Check:**
1. Are Firestore rules deployed?
2. Did you wait 2 minutes after deploying?
3. Are you authenticated?

**Fix:**
1. Go to Firebase Console
2. Firestore Database → Rules
3. Verify rules are published
4. Wait 2 minutes
5. Hard refresh browser

### Issue: Shared workspace not created

**Check:**
1. Did you accept the invitation?
2. Check console for error messages
3. Check Firestore for sharedWorkspaces collection

**Fix:**
```javascript
// In browser console:
window.sharedWorkspaceSystem.loadUserSharedWorkspaces().then(workspaces => {
    console.log('Shared workspaces:', workspaces);
});
```

## Complete Testing Checklist

### User Profile
- [ ] Profile created on login
- [ ] Email stored in lowercase
- [ ] DisplayName set correctly
- [ ] Visible in Firestore `users` collection

### Invitation System
- [ ] "Invite User" button works
- [ ] Modal opens
- [ ] Email validation works
- [ ] Can't invite self
- [ ] Invitation created in Firestore
- [ ] Badge shows count
- [ ] Invitation appears in recipient's list
- [ ] Accept button works
- [ ] Reject button works
- [ ] Success message shows

### Shared Workspace
- [ ] Workspace created on acceptance
- [ ] Appears in sidebar
- [ ] Can switch to it
- [ ] Indicator shows workspace name
- [ ] Both users can access
- [ ] Tasks sync in real-time

### Move Task Feature
- [ ] Move button visible on tasks
- [ ] Modal opens when clicked
- [ ] Task preview shows
- [ ] Workspace list shows
- [ ] Can select workspace
- [ ] Task moves successfully
- [ ] Task disappears from personal
- [ ] Task appears in shared
- [ ] Success notification shows

## Console Commands for Testing

```javascript
// Check current user
console.log(window.currentUser);

// Check if systems loaded
console.log(window.invitationSystem);
console.log(window.sharedWorkspaceSystem);
console.log(window.userProfileManager);

// Load invitations
window.invitationSystem.loadUserInvitations();

// Load shared workspaces
window.sharedWorkspaceSystem.loadUserSharedWorkspaces();

// Get current workspace
console.log(window.sharedWorkspaceSystem.getCurrentSharedWorkspace());

// Check tasks
console.log(window.tasks);

// Check shared tasks
console.log(window.sharedTasks);
```

## If Still Not Working

### Step 1: Check All Files Exist
```
✅ user-profile-manager.js
✅ workspace-invitations.js
✅ shared-workspace-system.js
✅ shared-workspace-ui-controller.js
✅ app.js
✅ index.html
✅ styles.css
✅ shared-workspace-styles.css
✅ workspace-invitations-styles.css
```

### Step 2: Verify Firestore Rules

Copy and paste this into Firebase Console Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User Profiles
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Workspace Invitations
    match /workspaceInvitations/{invitationId} {
      allow read: if request.auth != null && 
                     (request.auth.uid == resource.data.invitedBy || 
                      request.auth.email == resource.data.invitedEmail);
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                       (request.auth.uid == resource.data.invitedBy || 
                        request.auth.email == resource.data.invitedEmail);
      allow delete: if request.auth != null && 
                       request.auth.uid == resource.data.invitedBy;
    }
    
    // Shared Workspaces
    match /sharedWorkspaces/{workspaceId} {
      allow read: if request.auth != null && 
                     request.auth.uid in resource.data.members;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                       request.auth.uid in resource.data.members;
      allow delete: if request.auth != null && 
                       request.auth.uid == resource.data.created_by;
    }
    
    // User Shared Workspaces
    match /userSharedWorkspaces/{membershipId} {
      allow read: if request.auth != null && 
                     request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                       request.auth.uid == resource.data.user_id;
      allow delete: if request.auth != null && 
                       request.auth.uid == resource.data.user_id;
    }
    
    // Shared Tasks
    match /sharedTasks/{taskId} {
      allow read, write: if request.auth != null;
    }
    
    // Shared Notes
    match /sharedNotes/{noteId} {
      allow read, write: if request.auth != null;
    }
    
    // Personal Tasks
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && 
                            request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    // Personal Notes
    match /notes/{noteId} {
      allow read, write: if request.auth != null && 
                            request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    // Categories
    match /categories/{categoryId} {
      allow read, write: if request.auth != null && 
                            request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

### Step 3: Clear Everything and Start Fresh

1. **Clear Browser Cache**
   - Open DevTools (F12)
   - Application → Clear site data
   - Or: Ctrl+Shift+Delete

2. **Hard Refresh**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

3. **Logout and Login**
   - Click Logout
   - Login again
   - Check console for initialization messages

4. **Test Again**
   - Try sending invitation
   - Try accepting invitation
   - Try moving task

## Success Indicators

You'll know it's working when:

✅ **Console shows all initialization messages**
✅ **Firestore rules deployed (check timestamp)**
✅ **User profile created in Firestore**
✅ **Can send invitations**
✅ **Invitations appear in recipient's list**
✅ **Can accept invitations**
✅ **Shared workspace created automatically**
✅ **Can switch between workspaces**
✅ **Can move tasks between workspaces**
✅ **Real-time sync works**
✅ **No permission errors**

---

**Status:** Ready to Fix
**Difficulty:** Medium
**Time:** 10-15 minutes

Follow these steps and the system will work! 🚀
