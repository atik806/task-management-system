// ==================== WORKSPACE INVITATION SYSTEM - COMPLETE WORKING VERSION ====================

import { collection, addDoc, getDocs, getDoc, deleteDoc, doc, query, where, setDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Global state
let invitationListener = null;
let pendingInvitations = [];

console.log('🚀 Workspace Invitations System Loading...');

// ==================== UTILITY FUNCTIONS ====================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

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

// ==================== LOAD USER INVITATIONS ====================

async function loadUserInvitations() {
    const currentUser = getCurrentUser();
    const db = getDb();
    
    if (!currentUser || !db) {
        console.log('⚠️ Cannot load invitations: No user or db');
        return [];
    }

    try {
        console.log('📥 Loading invitations for:', currentUser.email);
        
        const q = query(
            collection(db, 'workspaceInvitations'),
            where('invitedEmail', '==', currentUser.email.toLowerCase()),
            where('status', '==', 'pending')
        );
        
        const querySnapshot = await getDocs(q);
        
        pendingInvitations = [];
        querySnapshot.forEach((docSnap) => {
            pendingInvitations.push({ id: docSnap.id, ...docSnap.data() });
        });

        console.log('✅ Loaded', pendingInvitations.length, 'invitations');
        updateInvitationBadge();
        return pendingInvitations;
    } catch (error) {
        console.error('❌ Error loading invitations:', error);
        return [];
    }
}

// ==================== REAL-TIME LISTENER ====================

function setupInvitationListener() {
    const currentUser = getCurrentUser();
    const db = getDb();
    
    if (!currentUser || !db) {
        console.log('⚠️ Cannot setup listener: No user or db');
        return;
    }

    // Unsubscribe from previous listener
    if (invitationListener) {
        invitationListener();
    }

    console.log('👂 Setting up real-time listener for:', currentUser.email);

    const q = query(
        collection(db, 'workspaceInvitations'),
        where('invitedEmail', '==', currentUser.email.toLowerCase()),
        where('status', '==', 'pending')
    );

    invitationListener = onSnapshot(q, (snapshot) => {
        console.log('📨 Snapshot received, changes:', snapshot.docChanges().length);
        
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const invitation = { id: change.doc.id, ...change.doc.data() };
                const exists = pendingInvitations.find(inv => inv.id === invitation.id);
                
                if (!exists) {
                    pendingInvitations.push(invitation);
                    console.log('➕ New invitation:', invitation.id);
                    
                    if (document.getElementById('invitationsModal')?.style.display !== 'block') {
                        showInvitationNotification(invitation);
                    }
                }
            } else if (change.type === 'removed') {
                pendingInvitations = pendingInvitations.filter(inv => inv.id !== change.doc.id);
                console.log('➖ Invitation removed:', change.doc.id);
            }
        });

        updateInvitationBadge();
        if (document.getElementById('invitationsModal')?.style.display === 'block') {
            renderInvitationsList();
        }
    }, (error) => {
        console.error('❌ Listener error:', error);
    });

    console.log('✅ Listener setup complete');
}

// ==================== ACCEPT INVITATION ====================

async function acceptInvitation(invitationId) {
    const currentUser = getCurrentUser();
    const db = getDb();
    
    if (!currentUser || !db) {
        throw new Error('User must be logged in');
    }

    try {
        console.log('✅ Accepting invitation:', invitationId);
        
        const inviteDoc = await getDoc(doc(db, 'workspaceInvitations', invitationId));
        if (!inviteDoc.exists()) {
            throw new Error('Invitation not found');
        }

        const invitation = inviteDoc.data();
        console.log('📄 Invitation data:', invitation);

        // Add to workspace members
        const memberData = {
            workspaceId: invitation.workspaceId,
            userId: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || currentUser.email,
            role: invitation.role || 'member',
            joinedAt: new Date().toISOString(),
            invitedBy: invitation.invitedBy,
            status: 'active'
        };

        await setDoc(doc(db, 'workspaceMembers', `${invitation.workspaceId}_${currentUser.uid}`), memberData);

        // Add to user workspaces
        const userWorkspaceData = {
            userId: currentUser.uid,
            workspaceId: invitation.workspaceId,
            role: invitation.role || 'member',
            lastAccessed: new Date().toISOString(),
            isFavorite: false
        };

        await setDoc(doc(db, 'userWorkspaces', `${currentUser.uid}_${invitation.workspaceId}`), userWorkspaceData);

        // Delete invitation
        await deleteDoc(doc(db, 'workspaceInvitations', invitationId));

        pendingInvitations = pendingInvitations.filter(inv => inv.id !== invitationId);

        console.log('✅ Invitation accepted successfully!');
        return invitation.workspaceId;
    } catch (error) {
        console.error('❌ Error accepting invitation:', error);
        throw error;
    }
}

// ==================== REJECT INVITATION ====================

async function rejectInvitation(invitationId) {
    const currentUser = getCurrentUser();
    const db = getDb();
    
    if (!currentUser || !db) {
        throw new Error('User must be logged in');
    }

    try {
        console.log('❌ Rejecting invitation:', invitationId);
        await deleteDoc(doc(db, 'workspaceInvitations', invitationId));
        pendingInvitations = pendingInvitations.filter(inv => inv.id !== invitationId);
        console.log('✅ Invitation rejected');
    } catch (error) {
        console.error('❌ Error rejecting invitation:', error);
        throw error;
    }
}

// ==================== UI FUNCTIONS ====================

function updateInvitationBadge() {
    const badge = document.getElementById('invitationBadge');
    if (!badge) return;

    const count = pendingInvitations.length;
    
    if (count > 0) {
        badge.textContent = count > 9 ? '9+' : count;
        badge.style.display = 'flex';
        console.log('🔔 Badge updated:', count);
    } else {
        badge.style.display = 'none';
    }
}

function showInvitationNotification(invitation) {
    const toast = document.createElement('div');
    toast.className = 'invitation-toast';
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-envelope"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">New Workspace Invitation</div>
            <div class="toast-message">${escapeHtml(invitation.inviterName)} invited you to join "${escapeHtml(invitation.workspaceName)}"</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

function renderInvitationsList() {
    const listContainer = document.getElementById('invitationsList');
    if (!listContainer) {
        console.log('⚠️ Invitations list container not found');
        return;
    }

    console.log('🎨 Rendering', pendingInvitations.length, 'invitations');
    listContainer.innerHTML = '';

    if (pendingInvitations.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-invitations">
                <i class="fas fa-inbox"></i>
                <p>No invitations available</p>
                <p style="font-size: 13px; color: var(--gray); margin-top: 8px;">
                    You don't have any pending workspace invitations at the moment.
                </p>
            </div>
        `;
        return;
    }

    pendingInvitations.forEach(invitation => {
        const inviteCard = document.createElement('div');
        inviteCard.className = 'invitation-card';
        
        const createdDate = invitation.createdAt ? 
            new Date(invitation.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }) : 'Unknown date';

        const inviterName = invitation.inviterName || invitation.inviterEmail || 'Unknown';
        const inviterInitials = inviterName.substring(0, 2).toUpperCase();
        const workspaceName = invitation.workspaceName || 'Unnamed Workspace';
        const role = invitation.role || 'member';

        inviteCard.innerHTML = `
            <div class="invitation-header">
                <div class="invitation-avatar">
                    ${inviterInitials}
                </div>
                <div class="invitation-info">
                    <div class="invitation-title">Workspace Invitation</div>
                    <div class="invitation-from">From: ${escapeHtml(inviterName)}</div>
                    ${invitation.inviterEmail ? `<div class="invitation-email">${escapeHtml(invitation.inviterEmail)}</div>` : ''}
                </div>
            </div>
            <div class="invitation-body">
                <div class="invitation-workspace">
                    <i class="fas fa-briefcase"></i>
                    <span>${escapeHtml(workspaceName)}</span>
                </div>
                <div class="invitation-role">
                    <i class="fas fa-user-tag"></i>
                    <span>Role: ${escapeHtml(role)}</span>
                </div>
                <div class="invitation-date">
                    <i class="far fa-clock"></i>
                    <span>Invited on ${createdDate}</span>
                </div>
            </div>
            <div class="invitation-actions">
                <button class="btn-accept" onclick="handleAcceptInvitation('${invitation.id}')">
                    <i class="fas fa-check"></i> Accept
                </button>
                <button class="btn-reject" onclick="handleRejectInvitation('${invitation.id}')">
                    <i class="fas fa-times"></i> Reject
                </button>
            </div>
        `;

        listContainer.appendChild(inviteCard);
    });
}

// ==================== EVENT HANDLERS ====================

window.handleAcceptInvitation = async function(invitationId) {
    try {
        await acceptInvitation(invitationId);
        showSuccessToast('Invitation accepted! Joining workspace...');
        renderInvitationsList();
        updateInvitationBadge();
    } catch (error) {
        console.error('Error:', error);
        alert('Error accepting invitation: ' + error.message);
    }
};

window.handleRejectInvitation = async function(invitationId) {
    if (!confirm('Are you sure you want to reject this invitation?')) return;

    try {
        await rejectInvitation(invitationId);
        showSuccessToast('Invitation rejected');
        renderInvitationsList();
        updateInvitationBadge();
    } catch (error) {
        console.error('Error:', error);
        alert('Error rejecting invitation: ' + error.message);
    }
};

function showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==================== UI SETUP ====================

function setupInvitationUI() {
    console.log('🎨 Setting up invitation UI');
    
    const invitationsBtn = document.getElementById('invitationsBtn');
    if (invitationsBtn) {
        invitationsBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('🖱️ Invitations button clicked');
            
            const modal = document.getElementById('invitationsModal');
            if (modal) {
                modal.style.display = 'block';
                await loadUserInvitations();
                renderInvitationsList();
            }
        });
        console.log('✅ Button listener attached');
    } else {
        console.log('⚠️ Invitations button not found');
    }

    const closeBtn = document.querySelector('#invitationsModal .close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('invitationsModal').style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        const modal = document.getElementById('invitationsModal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// ==================== INITIALIZATION ====================

function initializeInvitationSystem() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        console.log('⚠️ Cannot initialize: No user logged in');
        return;
    }

    console.log('🚀 Initializing invitation system for:', currentUser.email);

    setupInvitationUI();
    loadUserInvitations();
    setupInvitationListener();
    
    console.log('✅ Invitation system initialized');
}

function cleanupInvitationSystem() {
    if (invitationListener) {
        invitationListener();
        invitationListener = null;
    }
    pendingInvitations = [];
    updateInvitationBadge();
    console.log('🧹 Invitation system cleaned up');
}

// ==================== EXPORT ====================

window.invitationSystem = {
    loadUserInvitations,
    acceptInvitation,
    rejectInvitation,
    initializeInvitationSystem,
    cleanupInvitationSystem,
    getPendingInvitations: () => pendingInvitations
};

console.log('✅ Workspace Invitations System Loaded');
