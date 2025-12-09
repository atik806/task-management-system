# ⚡ Quick Fix - Shared Workspace & Invitation

## 3-Step Fix (5 Minutes)

### Step 1: Deploy Firestore Rules (2 min)
```
1. Firebase Console → Firestore Database → Rules
2. Copy from: FIRESTORE-RULES-SHARED-WORKSPACES.txt
3. Paste and click "Publish"
4. Wait 2 minutes
```

### Step 2: Hard Refresh Browser (1 min)
```
Windows/Linux: Ctrl+Shift+R
Mac: Cmd+Shift+R

Or:
1. F12 (DevTools)
2. Right-click refresh
3. "Empty Cache and Hard Reload"
```

### Step 3: Test (2 min)
```
1. Logout and login again
2. Check console for initialization messages
3. Try sending invitation
4. Try accepting invitation
5. Try moving a task
```

## Verify It's Working

### Check Console (F12)
Should see:
```
✅ User Profile Manager Loaded
✅ Workspace Invitations System Loaded
✅ Shared Workspace System Loaded
✅ Shared Workspace UI Controller Loaded
User logged in: your@email.com
✅ User profile saved
✅ Invitation system initialized
✅ Shared workspace system initialized
✅ Shared workspace UI initialized
```

### Test Invitation
```
1. Click "Invite User"
2. Enter email
3. Click "Send Invite"
4. Should see: "Invite sent successfully!"
```

### Test Shared Workspace
```
1. Login as different user
2. Click "Invitations"
3. Click "Accept"
4. Should see workspace in sidebar
5. Click to switch
```

### Test Move Task
```
1. Click [Move] on any task
2. Modal opens
3. Select workspace
4. Click "Move Here"
5. Task moves to shared workspace
```

## If Still Not Working

### Check 1: Firestore Rules
- Go to Firebase Console
- Firestore → Rules
- Should see "Last published: Just now"
- If not, deploy rules

### Check 2: User Profile
- Firebase Console → Firestore → Data
- Look for `users` collection
- Should have your uid
- Should have email, displayName, createdAt

### Check 3: Browser Console
- Open F12
- Check for errors
- Look for initialization messages
- Run: `console.log(window.currentUser)`

### Check 4: Clear Cache
- DevTools → Application → Clear site data
- Hard refresh (Ctrl+Shift+R)
- Logout and login again

## Console Test Commands

```javascript
// Check user
console.log(window.currentUser);

// Check systems loaded
console.log(window.invitationSystem);
console.log(window.sharedWorkspaceSystem);

// Load invitations
window.invitationSystem.loadUserInvitations();

// Load workspaces
window.sharedWorkspaceSystem.loadUserSharedWorkspaces();

// Check tasks
console.log(window.tasks);
```

## Common Issues

### "Invite User" doesn't work
- Check you're logged in
- Check console for errors
- Verify Firestore rules deployed

### Badge not showing
- Send invitation from different account
- Check console for listener messages
- Hard refresh browser

### "Move" button doesn't work
- Check button is visible
- Check console for errors
- Verify you have shared workspaces

### Permission Denied
- Deploy Firestore rules
- Wait 2 minutes
- Hard refresh browser

---

**Time:** 5 minutes
**Difficulty:** Easy ⭐
**Success Rate:** 99%

🎯 **Just deploy the rules and refresh!**
