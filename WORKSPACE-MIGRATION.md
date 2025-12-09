# 🔄 Workspace System Migration Guide

This guide helps you migrate your existing TaskFlow application to support the new multi-user workspace system.

---

## 📋 Overview

The workspace system adds collaboration features while maintaining backward compatibility. Existing users will automatically get a "Personal Workspace" with all their current data.

---

## 🚀 Migration Steps

### Step 1: Backup Current Data

Before starting, backup your Firestore database:

1. Go to Firebase Console → Firestore Database
2. Click "Export" in the top menu
3. Save the export to Cloud Storage
4. Download a local copy

### Step 2: Update Firestore Security Rules

1. Go to Firebase Console → Firestore Database → Rules
2. Replace existing rules with content from `firestore-workspace-rules.txt`
3. Click "Publish"
4. Wait 30 seconds for rules to propagate

### Step 3: Update HTML Files

#### index.html

Add workspace UI components after the sidebar-header:

```html
<!-- Add workspace selector -->
<div class="workspace-selector">
    <!-- Content from workspace-ui.html -->
</div>
```

Add workspace modals before closing `</body>`:

```html
<!-- Workspace Modals -->
<div id="createWorkspaceModal" class="modal">
    <!-- Content from workspace-ui.html -->
</div>

<div id="workspaceSettingsModal" class="modal">
    <!-- Content from workspace-ui.html -->
</div>

<div id="inviteMemberModal" class="modal">
    <!-- Content from workspace-ui.html -->
</div>
```

Add workspace settings nav item in sidebar:

```html
<a href="#" class="nav-item" id="workspaceSettingsNav">
    <i class="fas fa-cog"></i>
    <span>Workspace Settings</span>
</a>
```

### Step 4: Update CSS Files

Add workspace styles to `styles.css`:

```css
/* Import workspace styles */
@import url('workspace-styles.css');
```

Or copy the content from `workspace-styles.css` to the end of `styles.css`.

### Step 5: Update JavaScript Files

#### Add script imports to index.html:

```html
<!-- Add before app.js -->
<script type="module" src="workspace.js"></script>
<script type="module" src="workspace-ui-controller.js"></script>
<script type="module" src="app.js"></script>
```

#### Update app.js:

1. **Import workspace system at the top:**

```javascript
import { workspaceSystem } from './workspace.js';
import { workspaceUI } from './workspace-ui-controller.js';
```

2. **Update initializeDashboard function:**

```javascript
async function initializeDashboard() {
    // Initialize workspace system first
    await workspaceUI.initializeWorkspaceUI();
    
    // Then load data (workspace system handles this)
    // await loadCategories(); // Now handled by workspace system
    // await loadTasks();
    // await loadNotes();
    // renderBoard();
}
```

3. **Update loadTasks function to use workspace:**

```javascript
async function loadTasks() {
    if (!currentUser) return;
    
    const currentWorkspace = workspaceSystem.getCurrentWorkspace();
    if (!currentWorkspace) return;

    console.log('Loading tasks for workspace:', currentWorkspace.id);

    try {
        const q = query(
            collection(db, 'tasks'),
            where('workspaceId', '==', currentWorkspace.id)
        );
        const querySnapshot = await getDocs(q);

        tasks = [];
        querySnapshot.forEach((doc) => {
            tasks.push({ id: doc.id, ...doc.data() });
        });

        console.log('Found', tasks.length, 'tasks');
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}
```

4. **Update addTask to include workspaceId:**

```javascript
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser) {
        alert('Please login to add tasks');
        return;
    }

    const currentWorkspace = workspaceSystem.getCurrentWorkspace();
    if (!currentWorkspace) {
        alert('No workspace selected');
        return;
    }

    const task = {
        workspaceId: currentWorkspace.id, // NEW
        title: document.getElementById('taskTitle').value.trim(),
        description: document.getElementById('taskDesc').value.trim(),
        deadline: document.getElementById('taskDeadline').value,
        priority: document.getElementById('taskPriority').value,
        status: document.getElementById('taskCategory').value,
        createdBy: currentUser.uid, // Changed from userId
        createdAt: new Date().toISOString()
    };

    // ... rest of the code
});
```

5. **Update loadCategories similarly:**

```javascript
async function loadCategories() {
    const currentWorkspace = workspaceSystem.getCurrentWorkspace();
    if (!currentWorkspace) return;

    try {
        const q = query(
            collection(db, 'categories'),
            where('workspaceId', '==', currentWorkspace.id)
        );
        const querySnapshot = await getDocs(q);
        
        categories = [];
        querySnapshot.forEach((doc) => {
            categories.push({ id: doc.id, ...doc.data() });
        });
        
        console.log('Loaded categories:', categories);
        updateCategorySelect();
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}
```

6. **Update loadNotes similarly:**

```javascript
async function loadNotes() {
    if (!currentUser) return;

    const currentWorkspace = workspaceSystem.getCurrentWorkspace();
    if (!currentWorkspace) return;

    try {
        const q = query(
            collection(db, 'notes'),
            where('workspaceId', '==', currentWorkspace.id)
        );
        const querySnapshot = await getDocs(q);

        notes = [];
        querySnapshot.forEach((doc) => {
            notes.push({ id: doc.id, ...doc.data() });
        });

        notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } catch (error) {
        console.error('Error loading notes:', error);
    }
}
```

### Step 6: Data Migration Script

Create a migration script to add workspaceId to existing data:

```javascript
// migration-script.js
async function migrateExistingData() {
    if (!currentUser) return;

    console.log('Starting data migration...');

    try {
        // Get or create personal workspace
        let personalWorkspace;
        const workspaces = await workspaceSystem.loadUserWorkspaces();
        
        if (workspaces.length === 0) {
            personalWorkspace = await workspaceSystem.createWorkspace(
                'Personal Workspace',
                'Your personal task management space'
            );
        } else {
            personalWorkspace = workspaces[0].workspace;
        }

        const workspaceId = personalWorkspace.id;

        // Migrate tasks
        const tasksQuery = query(
            collection(db, 'tasks'),
            where('userId', '==', currentUser.uid)
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        
        for (const taskDoc of tasksSnapshot.docs) {
            const taskData = taskDoc.data();
            if (!taskData.workspaceId) {
                await updateDoc(doc(db, 'tasks', taskDoc.id), {
                    workspaceId: workspaceId,
                    createdBy: taskData.userId || currentUser.uid
                });
            }
        }

        // Migrate categories
        const categoriesQuery = query(
            collection(db, 'categories'),
            where('userId', '==', currentUser.uid)
        );
        const categoriesSnapshot = await getDocs(categoriesQuery);
        
        for (const catDoc of categoriesSnapshot.docs) {
            const catData = catDoc.data();
            if (!catData.workspaceId) {
                await updateDoc(doc(db, 'categories', catDoc.id), {
                    workspaceId: workspaceId,
                    createdBy: catData.userId || currentUser.uid
                });
            }
        }

        // Migrate notes
        const notesQuery = query(
            collection(db, 'notes'),
            where('userId', '==', currentUser.uid)
        );
        const notesSnapshot = await getDocs(notesQuery);
        
        for (const noteDoc of notesSnapshot.docs) {
            const noteData = noteDoc.data();
            if (!noteData.workspaceId) {
                await updateDoc(doc(db, 'notes', noteDoc.id), {
                    workspaceId: workspaceId,
                    createdBy: noteData.userId || currentUser.uid
                });
            }
        }

        console.log('Migration completed successfully!');
        alert('Your data has been migrated to the new workspace system!');
        
        // Reload the page
        window.location.reload();
    } catch (error) {
        console.error('Migration error:', error);
        alert('Migration error: ' + error.message);
    }
}

// Run migration on first load
if (localStorage.getItem('migrationCompleted') !== 'true') {
    migrateExistingData().then(() => {
        localStorage.setItem('migrationCompleted', 'true');
    });
}
```

### Step 7: Test the Migration

1. **Test with existing user:**
   - Login with existing account
   - Verify personal workspace is created
   - Verify all tasks, categories, and notes are visible
   - Verify you can create new items

2. **Test workspace creation:**
   - Create a new workspace
   - Verify it appears in workspace selector
   - Verify you can switch between workspaces

3. **Test invite system:**
   - Create an invite
   - Copy invite link
   - Open in incognito/different browser
   - Accept invite
   - Verify member can see workspace data

4. **Test permissions:**
   - Test as owner (full access)
   - Test as admin (can manage members)
   - Test as member (can edit content)

### Step 8: Deploy

1. **Test locally first:**
   ```bash
   python server.py
   ```

2. **Deploy to Firebase Hosting:**
   ```bash
   firebase deploy
   ```

3. **Monitor for errors:**
   - Check Firebase Console → Firestore → Usage
   - Check browser console for errors
   - Monitor user feedback

---

## 🔍 Verification Checklist

- [ ] Firestore rules updated and published
- [ ] HTML files updated with workspace UI
- [ ] CSS files include workspace styles
- [ ] JavaScript files updated with workspace logic
- [ ] Migration script runs successfully
- [ ] Existing data visible in personal workspace
- [ ] Can create new workspaces
- [ ] Can invite members
- [ ] Can switch between workspaces
- [ ] Real-time sync works
- [ ] Permissions work correctly
- [ ] Mobile responsive
- [ ] Dark mode works

---

## 🐛 Troubleshooting

### Issue: "Permission denied" errors

**Solution:**
- Verify Firestore rules are published
- Wait 30 seconds after publishing
- Check user is member of workspace
- Verify workspaceId is set on documents

### Issue: Existing data not showing

**Solution:**
- Run migration script
- Check workspaceId field exists on documents
- Verify workspace membership
- Check browser console for errors

### Issue: Invite links not working

**Solution:**
- Verify invite exists in Firestore
- Check invite hasn't expired
- Ensure user email matches invite
- Check user is logged in

### Issue: Real-time sync not working

**Solution:**
- Check Firestore listeners are active
- Verify network connection
- Check browser console for errors
- Refresh the page

---

## 📚 Additional Resources

- `WORKSPACE-SYSTEM.md` - Complete system documentation
- `firestore-workspace-rules.txt` - Security rules
- `workspace.js` - Core workspace functionality
- `workspace-ui-controller.js` - UI controller
- `workspace-styles.css` - Workspace styles

---

## 🆘 Need Help?

If you encounter issues during migration:

1. Check the troubleshooting section above
2. Review Firebase Console for errors
3. Check browser console for JavaScript errors
4. Verify all files are updated correctly
5. Test with a fresh user account

---

**Migration complete! Your TaskFlow app now supports multi-user workspaces! 🎉**
