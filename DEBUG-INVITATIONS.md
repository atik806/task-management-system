# 🔧 Debug Invitations - Step by Step

## 🎯 Quick Fix Steps

### Step 1: Open Debug Tool

1. Open your browser
2. Go to: `http://localhost:5000/test-invitations.html`
3. You should see the debug tool

### Step 2: Check System Status

1. Click **"Check System"** button
2. You should see:
   - ✓ User: your-email@example.com
   - ✓ User ID: your-user-id
   - ✓ Firestore: Connected
   - ✓ Total Invitations in DB: X
   - ✓ Your Invitations: X

### Step 3: Create Test Invitation

1. Your email should be pre-filled
2. Click **"Create Test Invitation"**
3. You should see: "✓ SUCCESS! Invitation created with ID: ..."

### Step 4: View Invitations

1. Click **"Load Invitations"**
2. You should see your invitation data

### Step 5: Go Back to Main App

1. Go to: `http://localhost:5000`
2. Click "Invitations" button
3. You should now see your invitation!

---

## 🐛 If Still Not Working

### Check Browser Console

1. Press F12
2. Go to Console tab
3. Look for errors
4. Share the errors with me

### Check Firestore Rules

1. Go to Firebase Console
2. Firestore Database → Rules
3. Make sure rules from `FIRESTORE-RULES-SIMPLE.txt` are published

### Manual Test in Console

Open browser console (F12) on main app and run:

```javascript
// Check if system is loaded
console.log('DB:', window.db);
console.log('User:', window.currentUser);
console.log('Invitation System:', window.invitationSystem);

// Try to load invitations
await window.invitationSystem.loadUserInvitations();
console.log('Invitations:', window.invitationSystem.getPendingInvitations());
```

---

## 📊 Common Issues

### Issue 1: "No invitations available"

**Cause:** No invitations in Firestore for your email

**Solution:** Use debug tool to create test invitation

### Issue 2: Permission Denied

**Cause:** Firestore rules not updated

**Solution:** 
1. Go to Firebase Console
2. Update rules from `FIRESTORE-RULES-SIMPLE.txt`
3. Wait 30 seconds

### Issue 3: System Not Loaded

**Cause:** JavaScript not initialized

**Solution:**
1. Check browser console for errors
2. Make sure `workspace-invitations.js` is loaded
3. Refresh page (Ctrl+Shift+R)

### Issue 4: Email Mismatch

**Cause:** Invitation email doesn't match your login email

**Solution:**
1. Check invitation email in Firestore
2. Make sure it matches your login email exactly
3. Email comparison is case-insensitive

---

## 🧪 Test Commands

### Create Invitation via Console

```javascript
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

await addDoc(collection(window.db, 'workspaceInvitations'), {
    workspaceId: 'test-123',
    workspaceName: 'Test Workspace',
    invitedBy: window.currentUser.uid,
    inviterName: 'Test User',
    inviterEmail: 'test@example.com',
    invitedEmail: window.currentUser.email.toLowerCase(),
    role: 'member',
    status: 'pending',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
});
```

### Check Invitations

```javascript
const invites = await window.invitationSystem.loadUserInvitations();
console.log('Found:', invites.length, 'invitations');
console.log('Data:', invites);
```

### Force Reload

```javascript
await window.invitationSystem.loadUserInvitations();
document.getElementById('invitationsModal').style.display = 'block';
```

---

## ✅ Success Checklist

- [ ] Debug tool opens successfully
- [ ] System check shows user logged in
- [ ] Can create test invitation
- [ ] Can view invitations in debug tool
- [ ] Invitation appears in main app
- [ ] Badge shows count
- [ ] Can accept/reject invitation

---

## 📞 Still Need Help?

If still not working, provide:

1. Screenshot of browser console (F12)
2. Screenshot of debug tool results
3. Screenshot of Firestore data
4. Any error messages

---

**Use the debug tool to test everything!** 🚀

File: `test-invitations.html`
URL: `http://localhost:5000/test-invitations.html`
