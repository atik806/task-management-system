// ==================== WORKSPACE SYSTEM ====================
// Multi-user workspace collaboration functionality

import { getFirestore, collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, where, setDoc, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Workspace state
let currentWorkspace = null;
let userWorkspaces = [];
let workspaceMembers = [];
let workspaceListeners = [];

// ==================== WORKSPACE MANAGEMENT ====================

// Create new workspace
async function createWorkspace(name, description = '') {
    if (!currentUser) {
        throw new Error('User must be logged in');
    }

    try {
        // Create workspace
        const workspaceData = {
            name: name.trim(),
            description: description.trim(),
            ownerId: currentUser.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            settings: {
                allowJoinRequests: true,
                defaultMemberRole: 'member'
            }
        };

        const workspaceRef = await addDoc(collection(db, 'workspaces'), workspaceData);
        const workspaceId = workspaceRef.id;

        // Add owner as member
        const memberData = {
            workspaceId: workspaceId,
            userId: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || currentUser.email,
            role: 'owner',
            joinedAt: new Date().toISOString(),
            status: 'active'
        };

        await setDoc(doc(db, 'workspaceMembers', `${workspaceId}_${currentUser.uid}`), memberData);

        // Add to user's workspace list
        const userWorkspaceData = {
            userId: currentUser.uid,
            workspaceId: workspaceId,
            role: 'owner',
            lastAccessed: new Date().toISOString(),
            isFavorite: false
        };

        await setDoc(doc(db, 'userWorkspaces', `${currentUser.uid}_${workspaceId}`), userWorkspaceData);

        // Create default categories for workspace
        await createDefaultCategories(workspaceId);

        console.log('Workspace created:', workspaceId);
        return { id: workspaceId, ...workspaceData };
    } catch (error) {
        console.error('Error creating workspace:', error);
        throw error;
    }
}

// Create default categories for workspace
async function createDefaultCategories(workspaceId) {
    const defaultCategories = [
        { id: 'todo', name: 'To Do', icon: 'fas fa-circle', isDefault: true },
        { id: 'inprogress', name: 'In Progress', icon: 'fas fa-spinner', isDefault: true },
        { id: 'completed', name: 'Completed', icon: 'fas fa-check-circle', isDefault: true }
    ];

    for (const category of defaultCategories) {
        const categoryData = {
            ...category,
            workspaceId: workspaceId,
            createdBy: currentUser.uid,
            createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'categories', `${workspaceId}_${category.id}`), categoryData);
    }
}

// Load user's workspaces
async function loadUserWorkspaces() {
    if (!currentUser) return [];

    try {
        const q = query(
            collection(db, 'userWorkspaces'),
            where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);

        userWorkspaces = [];
        for (const docSnap of querySnapshot.docs) {
            const userWorkspace = { id: docSnap.id, ...docSnap.data() };
            
            // Get workspace details
            const workspaceDoc = await getDoc(doc(db, 'workspaces', userWorkspace.workspaceId));
            if (workspaceDoc.exists()) {
                userWorkspaces.push({
                    ...userWorkspace,
                    workspace: { id: workspaceDoc.id, ...workspaceDoc.data() }
                });
            }
        }

        // Sort by last accessed
        userWorkspaces.sort((a, b) => 
            new Date(b.lastAccessed) - new Date(a.lastAccessed)
        );

        console.log('Loaded', userWorkspaces.length, 'workspaces');
        return userWorkspaces;
    } catch (error) {
        console.error('Error loading workspaces:', error);
        return [];
    }
}

// Switch to workspace
async function switchWorkspace(workspaceId) {
    try {
        // Get workspace details
        const workspaceDoc = await getDoc(doc(db, 'workspaces', workspaceId));
        if (!workspaceDoc.exists()) {
            throw new Error('Workspace not found');
        }

        // Check if user is member
        const memberDoc = await getDoc(doc(db, 'workspaceMembers', `${workspaceId}_${currentUser.uid}`));
        if (!memberDoc.exists() || memberDoc.data().status !== 'active') {
            throw new Error('You are not a member of this workspace');
        }

        // Update last accessed
        await updateDoc(doc(db, 'userWorkspaces', `${currentUser.uid}_${workspaceId}`), {
            lastAccessed: new Date().toISOString()
        });

        // Set current workspace
        currentWorkspace = {
            id: workspaceId,
            ...workspaceDoc.data(),
            userRole: memberDoc.data().role
        };

        // Store in localStorage
        localStorage.setItem('currentWorkspaceId', workspaceId);

        // Reload data for new workspace
        await loadWorkspaceData();

        console.log('Switched to workspace:', currentWorkspace.name);
        return currentWorkspace;
    } catch (error) {
        console.error('Error switching workspace:', error);
        throw error;
    }
}

// Load workspace data
async function loadWorkspaceData() {
    if (!currentWorkspace) return;

    // Unsubscribe from previous listeners
    workspaceListeners.forEach(unsubscribe => unsubscribe());
    workspaceListeners = [];

    // Load workspace members
    await loadWorkspaceMembers();

    // Load tasks, categories, notes with real-time listeners
    setupWorkspaceListeners();

    // Reload UI
    await loadCategories();
    await loadTasks();
    await loadNotes();
    renderBoard();
}

// Load workspace members
async function loadWorkspaceMembers() {
    if (!currentWorkspace) return;

    try {
        const q = query(
            collection(db, 'workspaceMembers'),
            where('workspaceId', '==', currentWorkspace.id),
            where('status', '==', 'active')
        );
        const querySnapshot = await getDocs(q);

        workspaceMembers = [];
        querySnapshot.forEach((doc) => {
            workspaceMembers.push({ id: doc.id, ...doc.data() });
        });

        console.log('Loaded', workspaceMembers.length, 'members');
        return workspaceMembers;
    } catch (error) {
        console.error('Error loading members:', error);
        return [];
    }
}

// ==================== REAL-TIME LISTENERS ====================

function setupWorkspaceListeners() {
    if (!currentWorkspace) return;

    // Listen to tasks
    const tasksQuery = query(
        collection(db, 'tasks'),
        where('workspaceId', '==', currentWorkspace.id)
    );
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
                const task = { id: change.doc.id, ...change.doc.data() };
                const index = tasks.findIndex(t => t.id === task.id);
                if (index >= 0) {
                    tasks[index] = task;
                } else {
                    tasks.push(task);
                }
            } else if (change.type === 'removed') {
                tasks = tasks.filter(t => t.id !== change.doc.id);
            }
        });
        renderBoard();
    });
    workspaceListeners.push(unsubscribeTasks);

    // Listen to categories
    const categoriesQuery = query(
        collection(db, 'categories'),
        where('workspaceId', '==', currentWorkspace.id)
    );
    const unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
                const category = { id: change.doc.id, ...change.doc.data() };
                const index = categories.findIndex(c => c.id === category.id);
                if (index >= 0) {
                    categories[index] = category;
                } else {
                    categories.push(category);
                }
            } else if (change.type === 'removed') {
                categories = categories.filter(c => c.id !== change.doc.id);
            }
        });
        updateCategorySelect();
        renderBoard();
    });
    workspaceListeners.push(unsubscribeCategories);

    // Listen to notes
    const notesQuery = query(
        collection(db, 'notes'),
        where('workspaceId', '==', currentWorkspace.id)
    );
    const unsubscribeNotes = onSnapshot(notesQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
                const note = { id: change.doc.id, ...change.doc.data() };
                const index = notes.findIndex(n => n.id === note.id);
                if (index >= 0) {
                    notes[index] = note;
                } else {
                    notes.push(note);
                }
            } else if (change.type === 'removed') {
                notes = notes.filter(n => n.id !== change.doc.id);
            }
        });
        if (views.notes.classList.contains('active')) {
            renderNotes();
        }
    });
    workspaceListeners.push(unsubscribeNotes);
}

// ==================== INVITE SYSTEM ====================

// Generate invite token
function generateInviteToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Create invite
async function createInvite(email, role = 'member') {
    if (!currentWorkspace) {
        throw new Error('No workspace selected');
    }

    if (!['owner', 'admin'].includes(currentWorkspace.userRole)) {
        throw new Error('Only owners and admins can invite members');
    }

    try {
        const inviteData = {
            workspaceId: currentWorkspace.id,
            workspaceName: currentWorkspace.name,
            invitedEmail: email.toLowerCase().trim(),
            invitedBy: currentUser.uid,
            inviteToken: generateInviteToken(),
            role: role,
            status: 'pending',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };

        const inviteRef = await addDoc(collection(db, 'workspaceInvites'), inviteData);
        
        console.log('Invite created:', inviteRef.id);
        return { id: inviteRef.id, ...inviteData };
    } catch (error) {
        console.error('Error creating invite:', error);
        throw error;
    }
}

// Accept invite
async function acceptInvite(inviteToken) {
    if (!currentUser) {
        throw new Error('User must be logged in');
    }

    try {
        // Find invite
        const q = query(
            collection(db, 'workspaceInvites'),
            where('inviteToken', '==', inviteToken),
            where('status', '==', 'pending')
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error('Invalid or expired invite');
        }

        const inviteDoc = querySnapshot.docs[0];
        const invite = { id: inviteDoc.id, ...inviteDoc.data() };

        // Check if invite is expired
        if (new Date(invite.expiresAt) < new Date()) {
            throw new Error('Invite has expired');
        }

        // Check if email matches
        if (invite.invitedEmail !== currentUser.email.toLowerCase()) {
            throw new Error('This invite is for a different email address');
        }

        // Add user as member
        const memberData = {
            workspaceId: invite.workspaceId,
            userId: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || currentUser.email,
            role: invite.role,
            joinedAt: new Date().toISOString(),
            invitedBy: invite.invitedBy,
            status: 'active'
        };

        await setDoc(doc(db, 'workspaceMembers', `${invite.workspaceId}_${currentUser.uid}`), memberData);

        // Add to user's workspace list
        const userWorkspaceData = {
            userId: currentUser.uid,
            workspaceId: invite.workspaceId,
            role: invite.role,
            lastAccessed: new Date().toISOString(),
            isFavorite: false
        };

        await setDoc(doc(db, 'userWorkspaces', `${currentUser.uid}_${invite.workspaceId}`), userWorkspaceData);

        // Update invite status
        await updateDoc(doc(db, 'workspaceInvites', invite.id), {
            status: 'accepted',
            acceptedAt: new Date().toISOString()
        });

        console.log('Invite accepted, joined workspace:', invite.workspaceId);
        return invite.workspaceId;
    } catch (error) {
        console.error('Error accepting invite:', error);
        throw error;
    }
}

// Get invite link
function getInviteLink(inviteToken) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/?invite=${inviteToken}`;
}

// ==================== MEMBER MANAGEMENT ====================

// Update member role
async function updateMemberRole(memberId, newRole) {
    if (!currentWorkspace) {
        throw new Error('No workspace selected');
    }

    if (!['owner', 'admin'].includes(currentWorkspace.userRole)) {
        throw new Error('Only owners and admins can change roles');
    }

    try {
        await updateDoc(doc(db, 'workspaceMembers', memberId), {
            role: newRole
        });

        // Update in userWorkspaces
        const memberDoc = await getDoc(doc(db, 'workspaceMembers', memberId));
        const member = memberDoc.data();
        
        await updateDoc(doc(db, 'userWorkspaces', `${member.userId}_${member.workspaceId}`), {
            role: newRole
        });

        console.log('Member role updated');
    } catch (error) {
        console.error('Error updating member role:', error);
        throw error;
    }
}

// Remove member
async function removeMember(memberId) {
    if (!currentWorkspace) {
        throw new Error('No workspace selected');
    }

    if (!['owner', 'admin'].includes(currentWorkspace.userRole)) {
        throw new Error('Only owners and admins can remove members');
    }

    try {
        const memberDoc = await getDoc(doc(db, 'workspaceMembers', memberId));
        const member = memberDoc.data();

        // Cannot remove owner
        if (member.role === 'owner') {
            throw new Error('Cannot remove workspace owner');
        }

        // Update status to removed
        await updateDoc(doc(db, 'workspaceMembers', memberId), {
            status: 'removed',
            removedAt: new Date().toISOString(),
            removedBy: currentUser.uid
        });

        // Remove from userWorkspaces
        await deleteDoc(doc(db, 'userWorkspaces', `${member.userId}_${member.workspaceId}`));

        console.log('Member removed');
    } catch (error) {
        console.error('Error removing member:', error);
        throw error;
    }
}

// Leave workspace
async function leaveWorkspace(workspaceId) {
    if (!currentUser) {
        throw new Error('User must be logged in');
    }

    try {
        const memberId = `${workspaceId}_${currentUser.uid}`;
        const memberDoc = await getDoc(doc(db, 'workspaceMembers', memberId));
        
        if (!memberDoc.exists()) {
            throw new Error('You are not a member of this workspace');
        }

        const member = memberDoc.data();

        // Owner cannot leave (must transfer ownership or delete workspace)
        if (member.role === 'owner') {
            throw new Error('Owner cannot leave workspace. Transfer ownership or delete workspace.');
        }

        // Remove member
        await deleteDoc(doc(db, 'workspaceMembers', memberId));
        await deleteDoc(doc(db, 'userWorkspaces', `${currentUser.uid}_${workspaceId}`));

        console.log('Left workspace');
    } catch (error) {
        console.error('Error leaving workspace:', error);
        throw error;
    }
}

// Delete workspace
async function deleteWorkspace(workspaceId) {
    if (!currentUser) {
        throw new Error('User must be logged in');
    }

    try {
        const workspaceDoc = await getDoc(doc(db, 'workspaces', workspaceId));
        if (!workspaceDoc.exists()) {
            throw new Error('Workspace not found');
        }

        const workspace = workspaceDoc.data();

        // Only owner can delete
        if (workspace.ownerId !== currentUser.uid) {
            throw new Error('Only workspace owner can delete workspace');
        }

        // Delete all workspace data
        // Note: In production, use Cloud Functions for this
        await deleteDoc(doc(db, 'workspaces', workspaceId));

        console.log('Workspace deleted');
    } catch (error) {
        console.error('Error deleting workspace:', error);
        throw error;
    }
}

// ==================== PERMISSION CHECKS ====================

function canManageMembers() {
    return currentWorkspace && ['owner', 'admin'].includes(currentWorkspace.userRole);
}

function canDeleteWorkspace() {
    return currentWorkspace && currentWorkspace.userRole === 'owner';
}

function canEditTask(task) {
    if (!currentWorkspace) return false;
    return task.createdBy === currentUser.uid || ['owner', 'admin'].includes(currentWorkspace.userRole);
}

function canDeleteTask(task) {
    return canEditTask(task);
}

// Export functions
window.workspaceSystem = {
    createWorkspace,
    loadUserWorkspaces,
    switchWorkspace,
    createInvite,
    acceptInvite,
    getInviteLink,
    updateMemberRole,
    removeMember,
    leaveWorkspace,
    deleteWorkspace,
    canManageMembers,
    canDeleteWorkspace,
    canEditTask,
    canDeleteTask,
    getCurrentWorkspace: () => currentWorkspace,
    getWorkspaceMembers: () => workspaceMembers
};

console.log('Workspace system loaded');
