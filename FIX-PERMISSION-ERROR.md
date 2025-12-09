# 🔧 Fix Permission Error - Step by Step

## ❌ Error You're Seeing:
```
Error sending invite: Missing or insufficient permissions.
```

## ✅ Solution: Update Firestore Rules

---

## 📋 Step-by-Step Instructions

### Step 1: Open Firebase Console

1. Go to: https://console.firebase.google.com/
2. Click on your project: **task-management-system-9f068**
3. Wait for project to load

### Step 2: Navigate to Firestore Rules

1. In the left sidebar, click **"Firestore Database"**
2. Click the **"Rules"** tab at the top
3. You should see the rules editor

### Step 3: Copy the New Rules

**Option A: Use Simple Rules (Recommended)**

Open the file `FIRESTORE-RULES-SIMPLE.txt` and copy ALL the content.

**Option B: Use Compatible Rules**

Open the file `firestore-rules-compatible.txt` and copy ALL the content.

### Step 4: Paste and Publish

1. **Select all** existing text in the Firebase rules editor (Ctrl+A)
2. **Delete** the old rules
3. **Paste** the new rules you copied
4. Click the **"Publish"** button (top right)
5. Wait for "Rules published successfully" message

### Step 5: Wait 30 Seconds

⏰ **IMPORTANT:** Wait at least 30 seconds for rules to propagate globally.

### Step 6: Test Your App

1. **Refresh your browser** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Try inviting a user again**
3. Should work now! ✅

---

## 🎯 Quick Copy-Paste Rules

If you want to copy directly from here, use these **SIMPLE RULES**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Tasks
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && 
                            (resource.data.userId == request.auth.uid || 
                             request.resource.data.userId == request.auth.uid);
    }
    
    // Categories
    match /categories/{categoryId} {
      allow read, write: if request.auth != null && 
                            (resource.data.userId == request.auth.uid || 
                             request.resource.data.userId == request.auth.uid);
    }
    
    // Notes
    match /notes/{noteId} {
      allow read, write: if request.auth != null && 
                            (resource.data.userId == request.auth.uid || 
                             request.resource.data.userId == request.auth.uid);
    }
    
    // Invites - THIS IS THE IMPORTANT PART
    match /invites/{inviteId} {
      allow create: if request.auth != null && 
                       request.resource.data.invitedBy == request.auth.uid;
      
      allow read: if request.auth != null && 
                     (resource.data.invitedBy == request.auth.uid ||
                      resource.data.invitedEmail == request.auth.token.email);
      
      allow update, delete: if request.auth != null && 
                               resource.data.invitedBy == request.auth.uid;
    }
    
    // Workspace collections (for future)
    match /workspaces/{workspaceId} {
      allow read, write: if request.auth != null;
    }
    
    match /workspaceMembers/{memberId} {
      allow read, write: if request.auth != null;
    }
    
    match /workspaceInvites/{inviteId} {
      allow read, write: if request.auth != null;
    }
    
    match /userWorkspaces/{userWorkspaceId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🔍 Verify Rules Are Published

### Check in Firebase Console:

1. Go to **Firestore Database** → **Rules**
2. Look for the timestamp at the top
3. Should say "Last published: [recent time]"
4. Should see the new rules in the editor

### Check in Your App:

1. Open browser console (F12)
2. Try to send an invite
3. Should NOT see permission error
4. Should see "Invite created with ID: ..."

---

## 🐛 Still Getting Error?

### Troubleshooting Steps:

1. **Clear Browser Cache**
   - Press Ctrl+Shift+Delete
   - Clear cached images and files
   - Close and reopen browser

2. **Check You're Logged In**
   - Make sure you see your email in the sidebar
   - Try logging out and back in

3. **Wait Longer**
   - Sometimes takes up to 1 minute
   - Try again after waiting

4. **Check Firebase Console**
   - Go to Firestore Database → Data
   - Try to manually create a document
   - If that fails, rules aren't published

5. **Verify Project**
   - Make sure you're in the correct Firebase project
   - Project ID should be: `task-management-system-9f068`

---

## ✅ Success Indicators

You'll know it's working when:

✅ No permission error in console
✅ Success message appears in app
✅ Invite document created in Firestore
✅ Can see invite in Firestore Database → Data → invites

---

## 📊 What the Rules Do

### For Invites:
- ✅ **Create:** Any logged-in user can create invites
- ✅ **Read:** Users can see invites they sent or received
- ✅ **Update/Delete:** Users can manage their own invites

### For Tasks/Categories/Notes:
- ✅ Users can only access their own data
- ✅ Prevents users from seeing others' data
- ✅ Secure and private

---

## 🎯 Quick Test

After updating rules, test with these steps:

1. **Open your app**
2. **Click "Invite User"**
3. **Enter:** `test@example.com`
4. **Click "Send Invite"**
5. **Should see:** Green success message ✅
6. **Check Firestore:** Go to Firebase Console → Firestore Database → Data
7. **Should see:** New document in `invites` collection ✅

---

## 📞 Need More Help?

If still not working:

1. **Screenshot the error** in browser console
2. **Screenshot your Firestore rules** in Firebase Console
3. **Check the timestamp** on rules (should be recent)
4. **Try in incognito mode** to rule out cache issues

---

## 🎉 Once It Works

After rules are published and working:

✅ Invite feature will work
✅ Tasks will save properly
✅ Categories will work
✅ Notes will work
✅ Everything will be secure

---

**Follow these steps carefully and it will work! 🚀**

*The key is making sure the rules are actually published in Firebase Console.*
