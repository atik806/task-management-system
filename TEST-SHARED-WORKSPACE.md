# 🧪 Test Your Shared Workspace Feature

## Quick Test Guide (10 Minutes)

### Prerequisites
- ✅ Two user accounts (or two browsers)
- ✅ Firestore rules deployed
- ✅ Application running

## Test Scenario 1: Create Shared Workspace

### User A (Browser 1)
```
Step 1: Login
→ Open app
→ Login with User A credentials
→ ✅ Should see dashboard

Step 2: Send Invitation
→ Click "Invite User" in sidebar
→ Enter User B's email
→ Click "Send Invite"
→ ✅ Should see success message

Step 3: Wait for User B
→ Keep browser open
→ Wait for User B to accept
```

### User B (Browser 2)
```
Step 4: Login
→ Open app in different browser/incognito
→ Login with User B credentials
→ ✅ Should see dashboard

Step 5: Check Invitations
→ Look for red badge on "Invitations"
→ Click "Invitations"
→ ✅ Should see invitation from User A

Step 6: Accept Invitation
→ Click "Accept" button
→ Wait 2-3 seconds
→ ✅ Should see success message
→ ✅ Shared workspace created!

Step 7: Verify Workspace Appears
→ Look at sidebar
→ Find "Workspaces" section
→ ✅ Should see shared workspace listed
```

### Both Users
```
Step 8: Switch to Shared Workspace
→ Click shared workspace name in sidebar
→ ✅ Top indicator should show workspace name
→ ✅ Should see "owner" or "member" role

Step 9: Verify Empty Board
→ ✅ Should see empty task board
→ ✅ "Add Task" button visible
```

## Test Scenario 2: Real-Time Task Sync

### User A (Browser 1)
```
Step 1: Create Task
→ Ensure in shared workspace (check indicator)
→ Click "Add Task"
→ Fill in:
   - Title: "Test Task from User A"
   - Category: "To Do"
   - Priority: "High"
   - Deadline: Tomorrow
→ Click "Create Task"
→ ✅ Task should appear on board
```

### User B (Browser 2)
```
Step 2: Verify Task Appears
→ Keep browser on shared workspace
→ ✅ Task should appear automatically (< 1 second)
→ ✅ Should see "Test Task from User A"
→ ✅ Should show correct category and priority
```

### User B (Browser 2)
```
Step 3: Edit Task
→ Click on the task card
→ Change title to: "Updated by User B"
→ Change priority to: "Medium"
→ Save changes
→ ✅ Changes should save
```

### User A (Browser 1)
```
Step 4: Verify Updates
→ Watch the task card
→ ✅ Should update automatically
→ ✅ Should show "Updated by User B"
→ ✅ Should show "Medium" priority
```

## Test Scenario 3: Workspace Switching

### User A (Browser 1)
```
Step 1: Switch to Personal
→ Click "Personal" in workspace switcher
→ ✅ Indicator should show "Personal Workspace"
→ ✅ Should see your personal tasks

Step 2: Create Personal Task
→ Click "Add Task"
→ Create task: "Personal Task A"
→ ✅ Task should appear
```

### User B (Browser 2)
```
Step 3: Verify Isolation
→ Stay in shared workspace
→ ✅ Should NOT see "Personal Task A"
→ ✅ Only shared tasks visible

Step 4: Switch to Personal
→ Click "Personal" in workspace switcher
→ ✅ Should see own personal tasks
→ ✅ Should NOT see User A's personal tasks
```

### Both Users
```
Step 5: Switch Back to Shared
→ Click shared workspace name
→ ✅ Should see shared tasks
→ ✅ Should NOT see personal tasks
→ ✅ Data properly isolated
```

## Test Scenario 4: Workspace Management

### User A (Browser 1)
```
Step 1: Open Workspace List
→ Click "Shared Workspaces" in sidebar
→ ✅ Should see modal with workspace grid
→ ✅ Should show workspace card

Step 2: Open Settings
→ Click "Settings" on workspace card
→ ✅ Should see settings modal
→ ✅ Should see member list
→ ✅ Should see both User A and User B
```

### User B (Browser 2)
```
Step 3: View Members
→ Click "Shared Workspaces" in sidebar
→ Click "Settings"
→ ✅ Should see same member list
→ ✅ Should see "Leave Workspace" button
```

## Test Scenario 5: Mobile Responsiveness

### Desktop (> 768px)
```
→ Resize browser to desktop size
→ ✅ All elements in one row
→ ✅ Workspace indicator visible
→ ✅ Full sidebar visible
```

### Tablet (768px)
```
→ Resize browser to 768px width
→ ✅ Workspace indicator wraps to new line
→ ✅ Sidebar still accessible
→ ✅ Layout adjusts properly
```

### Mobile (375px)
```
→ Resize browser to 375px width
→ ✅ Hamburger menu appears
→ ✅ Workspace indicator compact
→ ✅ Touch-friendly buttons
→ ✅ No horizontal scroll
```

## Expected Console Messages

### On Page Load
```
🚀 Shared Workspace System Loading...
✅ Shared Workspace System Loaded
🎨 Shared Workspace UI Controller Loading...
✅ Shared Workspace UI Controller Loaded
🚀 Initializing shared workspace system for: user@example.com
📥 Loading shared workspaces for: user@example.com
✅ Loaded 1 shared workspaces
✅ Shared workspace system initialized
🎨 Initializing shared workspace UI
✅ Shared workspace UI initialized
```

### On Accepting Invitation
```
🏗️ Creating shared workspace: shared_uid1_uid2
✅ Shared workspace created successfully
📥 Loading shared workspaces for: user@example.com
✅ Loaded 1 shared workspaces
```

### On Switching Workspace
```
🔄 Switching to shared workspace: shared_uid1_uid2
👂 Setting up shared workspace listeners for: shared_uid1_uid2
📊 Loading shared workspace data for: shared_uid1_uid2
✅ Loaded shared data: 0 tasks, 0 notes
✅ Switched to shared workspace: User A & User B
```

### On Real-Time Update
```
📨 Shared tasks update: 1 changes
```

## Verification Checklist

### Functionality
- [ ] Invitation sent successfully
- [ ] Invitation received and visible
- [ ] Workspace created on acceptance
- [ ] Workspace appears in sidebar
- [ ] Can switch between workspaces
- [ ] Tasks sync in real-time
- [ ] Edits sync in real-time
- [ ] Personal data isolated
- [ ] Member list displays correctly
- [ ] Leave workspace works

### UI/UX
- [ ] Workspace indicator shows correct workspace
- [ ] Active workspace highlighted in sidebar
- [ ] Count badge shows correct number
- [ ] Modals open and close properly
- [ ] Buttons are clickable
- [ ] No visual glitches
- [ ] Smooth transitions
- [ ] Responsive on all sizes

### Performance
- [ ] Workspace list loads < 2 seconds
- [ ] Workspace switch is instant
- [ ] Real-time updates < 1 second
- [ ] No lag when creating tasks
- [ ] No memory leaks
- [ ] Console has no errors

### Security
- [ ] Can't access other users' personal data
- [ ] Can't access non-member workspaces
- [ ] Firestore rules enforced
- [ ] Authentication required

## Common Issues & Solutions

### Issue: "Permission Denied" Error
**Check:**
- [ ] Firestore rules deployed?
- [ ] Waited 2 minutes after deployment?
- [ ] User is authenticated?

**Solution:**
```
1. Go to Firebase Console
2. Firestore Database → Rules
3. Verify rules are published
4. Wait 2 minutes
5. Hard refresh browser (Ctrl+Shift+R)
```

### Issue: Workspace Not Created
**Check:**
- [ ] Invitation was accepted?
- [ ] Both users have profiles in `users` collection?
- [ ] Console shows any errors?

**Solution:**
```
1. Check browser console for errors
2. Verify invitation status in Firestore
3. Check `workspaceInvitations` collection
4. Refresh both browsers
```

### Issue: Tasks Not Syncing
**Check:**
- [ ] In shared workspace mode?
- [ ] Workspace indicator shows shared workspace?
- [ ] Internet connection stable?
- [ ] Console shows listener setup?

**Solution:**
```
1. Verify workspace indicator at top-right
2. Check console for listener messages
3. Try switching workspace and back
4. Refresh browser
```

### Issue: UI Not Showing
**Check:**
- [ ] All scripts loaded?
- [ ] Console shows initialization messages?
- [ ] CSS files loaded?

**Solution:**
```
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache
3. Check Network tab in DevTools
4. Verify all files loaded (200 status)
```

## Firestore Data Verification

### After Accepting Invitation

**Check `sharedWorkspaces` collection:**
```javascript
{
  id: "shared_uid1_uid2",
  name: "User A & User B",
  members: ["uid1", "uid2"],
  created_by: "uid1",
  created_at: "2024-12-09T...",
  updated_at: "2024-12-09T..."
}
```

**Check `userSharedWorkspaces` collection:**
```javascript
// Document: uid1_shared_uid1_uid2
{
  user_id: "uid1",
  workspace_id: "shared_uid1_uid2",
  role: "owner",
  joined_at: "2024-12-09T..."
}

// Document: uid2_shared_uid1_uid2
{
  user_id: "uid2",
  workspace_id: "shared_uid1_uid2",
  role: "member",
  joined_at: "2024-12-09T..."
}
```

### After Creating Shared Task

**Check `sharedTasks` collection:**
```javascript
{
  workspace_id: "shared_uid1_uid2",
  title: "Test Task from User A",
  category: "todo",
  priority: "high",
  deadline: "2024-12-10",
  created_by: "uid1",
  created_by_name: "User A",
  created_at: "2024-12-09T...",
  updated_at: "2024-12-09T..."
}
```

## Success Criteria

Your shared workspace feature is working correctly when:

✅ **Workspace Creation**
- Invitation acceptance creates workspace
- Both users see workspace in sidebar
- Workspace appears in Firestore

✅ **Real-Time Sync**
- Tasks appear instantly for both users
- Edits sync within 1 second
- No manual refresh needed

✅ **Data Isolation**
- Personal tasks stay private
- Shared tasks only in shared workspace
- Can't access other users' data

✅ **UI/UX**
- Workspace indicator shows correct workspace
- Switching is smooth and instant
- Responsive on all devices
- No console errors

✅ **Performance**
- Fast load times
- No lag or delays
- Efficient Firestore queries
- No memory leaks

## Test Report Template

```
Date: ___________
Tester: ___________

Scenario 1: Workspace Creation
- Invitation sent: [ ] Pass [ ] Fail
- Invitation received: [ ] Pass [ ] Fail
- Workspace created: [ ] Pass [ ] Fail
- Notes: ___________

Scenario 2: Real-Time Sync
- Task creation syncs: [ ] Pass [ ] Fail
- Task edit syncs: [ ] Pass [ ] Fail
- Sync speed < 1s: [ ] Pass [ ] Fail
- Notes: ___________

Scenario 3: Workspace Switching
- Switch to personal: [ ] Pass [ ] Fail
- Switch to shared: [ ] Pass [ ] Fail
- Data isolation: [ ] Pass [ ] Fail
- Notes: ___________

Scenario 4: Workspace Management
- View members: [ ] Pass [ ] Fail
- Settings modal: [ ] Pass [ ] Fail
- Leave workspace: [ ] Pass [ ] Fail
- Notes: ___________

Scenario 5: Responsive Design
- Desktop layout: [ ] Pass [ ] Fail
- Tablet layout: [ ] Pass [ ] Fail
- Mobile layout: [ ] Pass [ ] Fail
- Notes: ___________

Overall Result: [ ] Pass [ ] Fail
Issues Found: ___________
```

---

**Happy Testing! 🧪**

Your shared workspace feature is ready to test. Follow this guide and verify everything works as expected!
