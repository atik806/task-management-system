# 🎯 User Invitation System - Complete Setup Guide

## 📋 Overview

A complete invitation system that works with Google Sign-In using Firebase Auth UIDs.

### Features:
✅ Send invitations by email
✅ Store in Firestore with sender/receiver UIDs
✅ Real-time notifications
✅ Accept/Reject functionality
✅ Status tracking (pending/accepted/rejected)
✅ Google Auth integration
✅ Clean "No invitations" UI

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Add Script Files

Add to `index.html` before `</body>`:

```html
<script type="module" src="user-profile-manager.js"></script>
<script type="module" src="user-invitations-system.js"></script>
<script type="module" src="app.js"></script>
```

### Step 2: Update app.js

Add this to your `onAuthStateChanged` handler:

```javascript
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    window.currentUser = user;
    
    if (user) {
        console.log('User logged in:', user.email);
        userEmailSpan.textContent = user.email;
        
        // Create/update user profile
        if (window.userProfileManager) {
            await window.userProfileManager.createOrUpdateUserProfile(user);
        }
        
        await initializeDashboard();
    } else {
        console.log('No user logged in, redirecting to landing page');
        window.location.href = '/';
    }
});
```

And in `initializeDashboard()`:

```javascript
async function initializeDashboard() {
    await loadCategories();
    await loadTasks();
    await loadNotes();
    renderBoard();
    
    // Initialize invitation system
    if (window.userInvitationSystem) {
        window.userInvitationSystem.initializeInvitationSystem();
    }
}
```

### Step 3: Update Firestore Rules

1. Go to Firebase Console → Firestore Database → Rules
2. Copy content from `FIRESTORE-RULES-USER-INVITATIONS.txt`
3. Paste and publish
4. Wait 30 seconds

### Step 4: Add Send Invitation UI

Update your "Invite User" modal form handler:

```javascript
document.getElementById('inviteUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('inviteEmail').value.trim();
    const message = document.getElementById('inviteMessage').value.trim();

    try {
        await window.userInvitationSystem.sendInvitation(email, message);
        alert('Invitation sent successfully!');
        e.target.reset();
        document.getElementById('inviteUserModal').style.display = 'none';
    } catch (error) {
        alert('Error: ' + error.message);
    }
});
```

### Step 5: Test!

1. Refresh your app
2. Login with Google
3. Send invitation to another user
4. Login as that user
5. See invitation appear!

---

## 📊 Firestore Structure

### Collection: `users`

```javascript
{
  uid: "google-auth-uid-123",
  email: "user@example.com",
  displayName: "John Doe",
  photoURL: "https://...",
  createdAt: "2024-12-08T...",
  lastLogin: "2024-12-08T...",
  updatedAt: "2024-12-08T..."
}
```

### Collection: `invitations`

```javascript
{
  sender_id: "google-auth-uid-123",
  sender_name: "John Doe",
  sender_email: "john@example.com",
  sender_photo: "https://...",
  receiver_id: "google-auth-uid-456",
  receiver_email: "jane@example.com",
  message: "Join our team!",
  status: "pending", // pending, accepted, rejected
  timestamp: "2024-12-08T10:00:00.000Z",
  created_at: "2024-12-08T10:00:00.000Z",
  accepted_at: "2024-12-08T10:05:00.000Z" // only if accepted
}
```

---

## 🎨 UI Features

### Invitation Card Shows:
- Sender's Google profile photo (if available)
- Sender's name
- Sender's email
- Optional message
- Timestamp
- Accept/Reject buttons

### Empty State:
```
📥
No invitations available
You don't have any pending invitations at the moment.
```

---

## 🧪 Testing

### Test 1: Send Invitation

```javascript
// In console
await window.userInvitationSystem.sendInvitation(
    'friend@example.com',
    'Join me on TaskFlow!'
);
```

### Test 2: Check Invitations

```javascript
// In console
const invites = await window.userInvitationSystem.loadUserInvitations();
console.log('Invitations:', invites);
```

### Test 3: Accept Invitation

```javascript
// In console
const invites = window.userInvitationSystem.getPendingInvitations();
if (invites.length > 0) {
    await window.userInvitationSystem.acceptInvitation(invites[0].id);
}
```

---

## 🔐 Security Features

### Firestore Rules Ensure:
✅ Users can only send invitations as themselves
✅ Users can only see invitations they sent or received
✅ Only receiver can accept/reject
✅ Status must be 'pending' on creation
✅ UIDs are verified by Firebase Auth

### User Verification:
✅ Receiver must exist in `users` collection
✅ Receiver must be registered (have Google account)
✅ Cannot send duplicate invitations
✅ UIDs match Firebase Auth

---

## 💡 Customization

### Add Custom Action on Accept

Edit `acceptInvitation()` in `user-invitations-system.js`:

```javascript
// After updating status
await updateDoc(doc(db, 'invitations', invitationId), {
    status: 'accepted',
    accepted_at: new Date().toISOString()
});

// ADD YOUR CUSTOM ACTION HERE
// Example: Add to team
await addDoc(collection(db, 'teamMembers'), {
    teamId: invitation.team_id,
    userId: currentUser.uid,
    role: 'member',
    joinedAt: new Date().toISOString()
});
```

### Change Notification Style

Edit `showInvitationNotification()` in `user-invitations-system.js`.

### Add More Invitation Data

Add fields to `invitationData` in `sendInvitation()`:

```javascript
const invitationData = {
    sender_id: currentUser.uid,
    // ... existing fields ...
    team_id: 'your-team-id', // Add custom fields
    project_id: 'your-project-id',
    custom_data: { ... }
};
```

---

## 🔍 Debugging

### Check User Profile Created

```javascript
// In console
const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
const userDoc = await getDoc(doc(window.db, 'users', window.currentUser.uid));
console.log('Profile:', userDoc.data());
```

### Check Invitations in Firestore

1. Go to Firebase Console
2. Firestore Database → Data
3. Look for `invitations` collection
4. Check documents

### View Console Logs

The system logs everything:
- 🚀 Initialization
- 📤 Sending invitations
- 📥 Loading invitations
- 📨 Real-time updates
- ✅ Success operations
- ❌ Errors

---

## 🐛 Troubleshooting

### Issue: "User not found"

**Cause:** Receiver hasn't logged in yet

**Solution:** 
- Receiver must login at least once
- This creates their profile in `users` collection

### Issue: "Already sent invitation"

**Cause:** Duplicate invitation exists

**Solution:**
- Check Firestore for existing pending invitation
- Delete old invitation or wait for response

### Issue: Permission Denied

**Cause:** Firestore rules not updated

**Solution:**
1. Update rules from `FIRESTORE-RULES-USER-INVITATIONS.txt`
2. Wait 30 seconds
3. Refresh app

### Issue: No Real-Time Updates

**Cause:** Listener not setup

**Solution:**
```javascript
// Reinitialize
window.userInvitationSystem.cleanupInvitationSystem();
window.userInvitationSystem.initializeInvitationSystem();
```

---

## 📱 Mobile Support

The system is fully responsive:
- ✅ Touch-friendly buttons
- ✅ Responsive cards
- ✅ Mobile-optimized toasts
- ✅ Works on all devices

---

## 🎯 API Reference

### sendInvitation(receiverEmail, message)
```javascript
await window.userInvitationSystem.sendInvitation(
    'user@example.com',
    'Optional message'
);
```

### loadUserInvitations()
```javascript
const invitations = await window.userInvitationSystem.loadUserInvitations();
```

### acceptInvitation(invitationId)
```javascript
await window.userInvitationSystem.acceptInvitation('invitation-id');
```

### rejectInvitation(invitationId)
```javascript
await window.userInvitationSystem.rejectInvitation('invitation-id');
```

### getPendingInvitations()
```javascript
const pending = window.userInvitationSystem.getPendingInvitations();
```

---

## ✅ Complete Checklist

- [ ] Added script files to index.html
- [ ] Updated app.js with profile creation
- [ ] Updated app.js with system initialization
- [ ] Updated Firestore rules
- [ ] Updated invite form handler
- [ ] Tested sending invitation
- [ ] Tested receiving invitation
- [ ] Tested accept functionality
- [ ] Tested reject functionality
- [ ] Verified real-time updates

---

## 🎉 You're Done!

Your invitation system now:

✅ Uses Google Auth UIDs
✅ Stores in Firestore
✅ Real-time notifications
✅ Accept/Reject functionality
✅ Clean UI
✅ Secure rules
✅ Fully functional!

**Start inviting users!** 🚀

---

**Last Updated:** December 2024
**Version:** 1.0
**Status:** Production Ready
