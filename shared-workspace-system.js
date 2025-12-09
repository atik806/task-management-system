// ==================== SHARED WORKSPACE SYSTEM ====================
// Extends invitation system to create collaborative workspaces

import { collection, addDoc, getDocs, getDoc, deleteDoc, doc, query, where, updateDoc, setDoc, onSnapshot, arrayUnion, arrayRemove } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Global state
let sharedWorkspaces = [];
let currentSharedWorkspace = null;
let sharedWorkspaceListeners = [];

console.log('🚀 Shared Workspace System Loading...');

// ==================== UTILITY FUNCTIONS ====================

function getDb() {
    if (!window.db) {
        console.error('❌ Database not initialized!');
        return null;
    }
    return window.db;
}

function getCurrentUser() {
    if (!window.currentUser) {
        console.error('❌ User not logged in!');
        return null;
    }
    return window.currentUser;
}

function generateWorkspaceId(userA, userB) {
    // Create consistent workspace ID regardless of order
    const ids = [userA, userB].sort();
    return `shared_${ids[0]}_${ids[1]}`;
}

// ==================== CREATE SHARED WORKSPACE ====================

async function createSharedWorkspace(inviterUid, inviteeUid, inviterName, inviteeName) {
    const db = getDb();
    if (!db) throw new Error('Database not available');

    try {
        const workspaceId = generateWorkspaceId(inviterUid, inviteeUid);
        console.log('🏗️ Creating shared workspace:', workspaceId);

        // Check if workspace already exists
        const workspaceRef = doc(db, 'sharedWorkspaces', workspaceId);
        const workspaceDoc = await getDoc(workspaceRef);

        if (workspaceDoc.exists()) {
            console.log('✅ Shared workspace already exists');
            return { id: workspaceId, ...workspaceDoc.data() };
        }

        // Create new shared workspace
        const workspaceData = {
            id: workspaceId,
            name: `${inviterName} & ${inviteeName}`,
            description: 'Shared collaborative workspace',
            members: [inviterUid, inviteeUid],
            created_by: inviterUid,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            settings: {
                allow_member_invite: false,
                auto_sync: true
            }
        };

        await setDoc(workspaceRef, workspaceData);

        // Add workspace to both users' workspace lists
        await Promise.all([
            setDoc(doc(db, 'userSharedWorkspaces', `${inviterUid}_${workspaceId}`), {
                user_id: inviterUid,
                workspace_id: workspaceId,
                role: 'owner',
                joined_at: new Date().toISOString(),
                last_accessed: new Date().toISOString()
            }),
            setDoc(doc(db, 'userSharedWorkspaces', `${inviteeUid}_${workspaceId}`), {
                user_id: inviteeUid,
                workspace_id: workspaceId,
                role: 'member',
                joined_at: new Date().toISOString(),
                last_accessed: new Date().toISOString()
            })
        ]);

        console.log('✅ Shared workspace created successfully');
        return workspaceData;
    } catch (error) {
        console.error('❌ Error creating shared workspace:', error);
        throw error;
    }
}

// ==================== LOAD USER'S SHARED WORKSPACES ====================

async function loadUserSharedWorkspaces() {
    const currentUser = getCurrentUser();
    const db = getDb();
    
    if (!currentUser || !db) {
        console.log('⚠️ Cannot load shared workspaces: No user or db');
        return [];
    }

    try {
        console.log('📥 Loading shared workspaces for:', currentUser.email);
        
        // Get user's shared workspace memberships
        const q = query(
            collection(db, 'userSharedWorkspaces'),
            where('user_id', '==', currentUser.uid)
        );
        
        const snapshot = await getDocs(q);
        const workspacePromises = [];
        
        snapshot.forEach((docSnap) => {
            const membership = docSnap.data();
            workspacePromises.push(
                getDoc(doc(db, 'sharedWorkspaces', membership.workspace_id))
                    .then(workspaceDoc => {
                        if (workspaceDoc.exists()) {
                            return {
                                ...workspaceDoc.data(),
                                userRole: membership.role,
                                lastAccessed: membership.last_accessed
                            };
                        }
                        return null;
                    })
            );
        });
        
        const workspaces = await Promise.all(workspacePromises);
        sharedWorkspaces = workspaces.filter(ws => ws !== null);
        
        console.log('✅ Loaded', sharedWorkspaces.length, 'shared workspaces');
        return sharedWorkspaces;
    } catch (error) {
        console.error('❌ Error loading shared workspaces:', error);
        return [];
    }
}

// ==================== SWITCH TO SHARED WORKSPACE ====================

async function switchToSharedWorkspace(workspaceId) {
    const currentUser = getCurrentUser();
    const db = getDb();
    
    if (!currentUser || !db) {
        throw new Error('User must be logged in');
    }

    try {
        console.log('🔄 Switching to shared workspace:', workspaceId);
        
        // Get workspace details
        const workspaceDoc = await getDoc(doc(db, 'sharedWorkspaces', workspaceId));
        if (!workspaceDoc.exists()) {
            throw new Error('Shared workspace not found');
        }

        const workspaceData = workspaceDoc.data();
        
        // Verify user is a member
        if (!workspaceData.members.includes(currentUser.uid)) {
            throw new Error('You are not a member of this workspace');
        }

        // Get user's role
        const membershipDoc = await getDoc(doc(db, 'userSharedWorkspaces', `${currentUser.uid}_${workspaceId}`));
        const userRole = membershipDoc.exists() ? membershipDoc.data().role : 'member';

        currentSharedWorkspace = {
            ...workspaceData,
            userRole: userRole
        };

        // Update last accessed
        await updateDoc(doc(db, 'userSharedWorkspaces', `${currentUser.uid}_${workspaceId}`), {
            last_accessed: new Date().toISOString()
        });

        // Setup real-time listeners for shared data
        setupSharedWorkspaceListeners(workspaceId);
        
        // Load shared data
        await loadSharedWorkspaceData(workspaceId);
        
        // Update UI
        updateWorkspaceUI();
        
        console.log('✅ Switched to shared workspace:', workspaceData.name);
        return currentSharedWorkspace;
    } catch (error) {
        console.error('❌ Error switching to shared workspace:', error);
        throw error;
    }
}

// ==================== LOAD SHARED WORKSPACE DATA ====================

async function loadSharedWorkspaceData(workspaceId) {
    const db = getDb();
    if (!db) return;

    try {
        console.log('📊 Loading shared workspace data for:', workspaceId);
        
        // Load shared tasks
        const tasksQuery = query(
            collection(db, 'sharedTasks'),
            where('workspace_id', '==', workspaceId)
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        
        const sharedTasks = [];
        tasksSnapshot.forEach((docSnap) => {
            sharedTasks.push({ id: docSnap.id, ...docSnap.data() });
        });
        
        // Load shared notes
        const notesQuery = query(
            collection(db, 'sharedNotes'),
            where('workspace_id', '==', workspaceId)
        );
        const notesSnapshot = await getDocs(notesQuery);
        
        const sharedNotes = [];
        notesSnapshot.forEach((docSnap) => {
            sharedNotes.push({ id: docSnap.id, ...docSnap.data() });
        });
        
        // Store in global state
        window.sharedTasks = sharedTasks;
        window.sharedNotes = sharedNotes;
        window.isSharedMode = true;
        
        console.log('✅ Loaded shared data:', sharedTasks.length, 'tasks,', sharedNotes.length, 'notes');
        
        // Reload the board with shared data
        if (window.renderBoard) {
            window.renderBoard();
        }
    } catch (error) {
        console.error('❌ Error loading shared workspace data:', error);
    }
}

// ==================== REAL-TIME LISTENERS ====================

function setupSharedWorkspaceListeners(workspaceId) {
    const db = getDb();
    if (!db) return;

    // Cleanup existing listeners
    sharedWorkspaceListeners.forEach(unsubscribe => unsubscribe());
    sharedWorkspaceListeners = [];

    console.log('👂 Setting up shared workspace listeners for:', workspaceId);

    // Listen to shared tasks
    const tasksQuery = query(
        collection(db, 'sharedTasks'),
        where('workspace_id', '==', workspaceId)
    );
    
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
        console.log('📨 Shared tasks update:', snapshot.docChanges().length, 'changes');
        
        if (!window.sharedTasks) window.sharedTasks = [];
        
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const task = { id: change.doc.id, ...change.doc.data() };
                const exists = window.sharedTasks.find(t => t.id === task.id);
                if (!exists) {
                    window.sharedTasks.push(task);
                }
            } else if (change.type === 'modified') {
                const task = { id: change.doc.id, ...change.doc.data() };
                const index = window.sharedTasks.findIndex(t => t.id === task.id);
                if (index >= 0) {
                    window.sharedTasks[index] = task;
                }
            } else if (change.type === 'removed') {
                window.sharedTasks = window.sharedTasks.filter(t => t.id !== change.doc.id);
            }
        });
        
        // Update UI if in shared mode
        if (window.isSharedMode && window.renderBoard) {
            window.renderBoard();
        }
    });
    
    sharedWorkspaceListeners.push(unsubscribeTasks);

    // Listen to shared notes
    const notesQuery = query(
        collection(db, 'sharedNotes'),
        where('workspace_id', '==', workspaceId)
    );
    
    const unsubscribeNotes = onSnapshot(notesQuery, (snapshot) => {
        console.log('📨 Shared notes update:', snapshot.docChanges().length, 'changes');
        
        if (!window.sharedNotes) window.sharedNotes = [];
        
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const note = { id: change.doc.id, ...change.doc.data() };
                const exists = window.sharedNotes.find(n => n.id === note.id);
                if (!exists) {
                    window.sharedNotes.push(note);
                }
            } else if (change.type === 'modified') {
                const note = { id: change.doc.id, ...change.doc.data() };
                const index = window.sharedNotes.findIndex(n => n.id === note.id);
                if (index >= 0) {
                    window.sharedNotes[index] = note;
                }
            } else if (change.type === 'removed') {
                window.sharedNotes = window.sharedNotes.filter(n => n.id !== change.doc.id);
            }
        });
        
        // Update UI if in shared mode
        if (window.isSharedMode && window.renderNotes) {
            window.renderNotes();
        }
    });
    
    sharedWorkspaceListeners.push(unsubscribeNotes);
    
    console.log('✅ Shared workspace listeners setup complete');
}

// ==================== SHARED TASK OPERATIONS ====================

async function createSharedTask(taskData) {
    const currentUser = getCurrentUser();
    const db = getDb();
    
    if (!currentUser || !db || !currentSharedWorkspace) {
        throw new Error('User must be logged in and in a shared workspace');
    }

    try {
        const sharedTaskData = {
            ...taskData,
            workspace_id: currentSharedWorkspace.id,
            created_by: currentUser.uid,
            created_by_name: currentUser.displayName || currentUser.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            updated_by: currentUser.uid
        };

        const docRef = await addDoc(collection(db, 'sharedTasks'), sharedTaskData);
        console.log('✅ Shared task created:', docRef.id);
        
        return { id: docRef.id, ...sharedTaskData };
    } catch (error) {
        console.error('❌ Error creating shared task:', error);
        throw error;
    }
}

async function updateSharedTask(taskId, updates) {
    const currentUser = getCurrentUser();
    const db = getDb();
    
    if (!currentUser || !db) {
        throw new Error('User must be logged in');
    }

    try {
        const updateData = {
            ...updates,
            updated_at: new Date().toISOString(),
            updated_by: currentUser.uid
        };

        await updateDoc(doc(db, 'sharedTasks', taskId), updateData);
        console.log('✅ Shared task updated:', taskId);
    } catch (error) {
        console.error('❌ Error updating shared task:', error);
        throw error;
    }
}

async function deleteSharedTask(taskId) {
    const db = getDb();
    if (!db) throw new Error('Database not available');

    try {
        await deleteDoc(doc(db, 'sharedTasks', taskId));
        console.log('✅ Shared task deleted:', taskId);
    } catch (error) {
        console.error('❌ Error deleting shared task:', error);
        throw error;
    }
}

// ==================== SHARED NOTE OPERATIONS ====================

async function createSharedNote(noteData) {
    const currentUser = getCurrentUser();
    const db = getDb();
    
    if (!currentUser || !db || !currentSharedWorkspace) {
        throw new Error('User must be logged in and in a shared workspace');
    }

    try {
        const sharedNoteData = {
            ...noteData,
            workspace_id: currentSharedWorkspace.id,
            created_by: currentUser.uid,
            created_by_name: currentUser.displayName || currentUser.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            updated_by: currentUser.uid
        };

        const docRef = await addDoc(collection(db, 'sharedNotes'), sharedNoteData);
        console.log('✅ Shared note created:', docRef.id);
        
        return { id: docRef.id, ...sharedNoteData };
    } catch (error) {
        console.error('❌ Error creating shared note:', error);
        throw error;
    }
}

// ==================== LEAVE SHARED WORKSPACE ====================

async function leaveSharedWorkspace(workspaceId) {
    const currentUser = getCurrentUser();
    const db = getDb();
    
    if (!currentUser || !db) {
        throw new Error('User must be logged in');
    }

    try {
        console.log('🚪 Leaving shared workspace:', workspaceId);
        
        // Remove user from workspace members
        const workspaceRef = doc(db, 'sharedWorkspaces', workspaceId);
        await updateDoc(workspaceRef, {
            members: arrayRemove(currentUser.uid),
            updated_at: new Date().toISOString()
        });
        
        // Remove user's workspace membership
        await deleteDoc(doc(db, 'userSharedWorkspaces', `${currentUser.uid}_${workspaceId}`));
        
        // If this was the current workspace, switch back to personal
        if (currentSharedWorkspace && currentSharedWorkspace.id === workspaceId) {
            await switchToPersonalWorkspace();
        }
        
        // Reload shared workspaces
        await loadUserSharedWorkspaces();
        
        console.log('✅ Left shared workspace successfully');
    } catch (error) {
        console.error('❌ Error leaving shared workspace:', error);
        throw error;
    }
}

// ==================== WORKSPACE SWITCHING ====================

async function switchToPersonalWorkspace() {
    console.log('🏠 Switching to personal workspace');
    
    // Cleanup shared workspace listeners
    sharedWorkspaceListeners.forEach(unsubscribe => unsubscribe());
    sharedWorkspaceListeners = [];
    
    currentSharedWorkspace = null;
    window.isSharedMode = false;
    
    // Reload personal data
    if (window.loadTasks) await window.loadTasks();
    if (window.loadNotes) await window.loadNotes();
    if (window.renderBoard) window.renderBoard();
    
    updateWorkspaceUI();
    
    console.log('✅ Switched to personal workspace');
}

// ==================== UI FUNCTIONS ====================

function updateWorkspaceUI() {
    const workspaceIndicator = document.getElementById('workspaceIndicator');
    const sharedModeToggle = document.getElementById('sharedModeToggle');
    
    if (workspaceIndicator) {
        if (currentSharedWorkspace) {
            workspaceIndicator.innerHTML = `
                <i class="fas fa-users"></i>
                <span>${currentSharedWorkspace.name}</span>
                <span class="workspace-role">${currentSharedWorkspace.userRole}</span>
            `;
            workspaceIndicator.style.display = 'flex';
        } else {
            workspaceIndicator.innerHTML = `
                <i class="fas fa-user"></i>
                <span>Personal Workspace</span>
            `;
        }
    }
    
    if (sharedModeToggle) {
        sharedModeToggle.style.display = sharedWorkspaces.length > 0 ? 'block' : 'none';
    }
}

// ==================== ENHANCED INVITATION ACCEPTANCE ====================

// Store original accept invitation function
const originalAcceptInvitation = window.handleAcceptInvitation;

window.handleAcceptInvitation = async function(invitationId) {
    try {
        // Get invitation details first
        const db = getDb();
        const inviteDoc = await getDoc(doc(db, 'workspaceInvitations', invitationId));
        
        if (inviteDoc.exists()) {
            const invitation = inviteDoc.data();
            
            // Call original accept function
            if (originalAcceptInvitation) {
                await originalAcceptInvitation(invitationId);
            }
            
            // Create shared workspace
            const currentUser = getCurrentUser();
            if (currentUser) {
                await createSharedWorkspace(
                    invitation.invitedBy,
                    currentUser.uid,
                    invitation.inviterName,
                    currentUser.displayName || currentUser.email
                );
                
                // Reload shared workspaces
                await loadUserSharedWorkspaces();
                updateWorkspaceUI();
                
                // Update UI controller if available
                if (window.loadAndRenderSharedWorkspaces) {
                    await window.loadAndRenderSharedWorkspaces();
                }
                
                // Show success message
                console.log('✅ Invitation accepted! Shared workspace created.');
            }
        }
    } catch (error) {
        console.error('Error in enhanced accept invitation:', error);
        throw error;
    }
};

// ==================== INITIALIZATION ====================

function initializeSharedWorkspaceSystem() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        console.log('⚠️ Cannot initialize shared workspace system: No user logged in');
        return;
    }

    console.log('🚀 Initializing shared workspace system for:', currentUser.email);
    
    // Load user's shared workspaces
    loadUserSharedWorkspaces().then(() => {
        updateWorkspaceUI();
    });
    
    console.log('✅ Shared workspace system initialized');
}

function cleanupSharedWorkspaceSystem() {
    sharedWorkspaceListeners.forEach(unsubscribe => unsubscribe());
    sharedWorkspaceListeners = [];
    sharedWorkspaces = [];
    currentSharedWorkspace = null;
    window.isSharedMode = false;
    console.log('🧹 Shared workspace system cleaned up');
}

// ==================== EXPORT ====================

window.sharedWorkspaceSystem = {
    createSharedWorkspace,
    loadUserSharedWorkspaces,
    switchToSharedWorkspace,
    switchToPersonalWorkspace,
    createSharedTask,
    updateSharedTask,
    deleteSharedTask,
    createSharedNote,
    leaveSharedWorkspace,
    initializeSharedWorkspaceSystem,
    cleanupSharedWorkspaceSystem,
    getCurrentSharedWorkspace: () => currentSharedWorkspace,
    getSharedWorkspaces: () => sharedWorkspaces
};

console.log('✅ Shared Workspace System Loaded');
