// ==================== USER INVITATION SYSTEM ====================
// Complete invitation system using Google Auth UIDs

import { collection, addDoc, getDocs, getDoc, deleteDoc, doc, query, where, updateDoc, onSnapshot, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Global state
let invitationListener = null;
let pendingInvitations = [];

console.log('🚀 User Invitation System Loading...');

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

// ==================== SEND INVITATION ====================

async function sendInvitation(receiverEmail, message = '') {
    const currentUser = getCurrentUser();
    const db = getDb();
    
    if (!currentUser || !db) {
        throw new Error('User must be logged in');
    }

    try {
        console.log('📤 Sending invitation to:', receiverEmail);

        // Check if receiver exists
        const usersQuery = query(
            collection(db, 'users'),
            where('email', '==', receiverEmail.toLowerCase())
        );
        const usersSnapshot = await getDocs(usersQuery);

        if (usersSnapshot.empty) {
            throw new Error('User not found. They must be registered first.');
        }

        const receiverDoc = usersSnapshot.docs[0];
        const receiverData = receiverDoc.data();
        const receiverId = receiverData.uid || receiverDoc.id;

        // Check if already invited
        const existingQuery = query(
            collection(db, 'invitations'),
            where('sender_id', '==', currentUser.uid),
            where('receiver_id', '==', receiverId),
            where('status', '==', 'pending')
        );
        const existingSnapshot = await getDocs(existingQuery);

        if (!existingSnapshot.empty) {
            throw new Error('You have already sent an invitation to this user.');
        }

        // Create invitation
        const invitationData = {
            sender_id: currentUser.uid,
            sender_name: currentUser.displayName || currentUser.email,
            sender_email: currentUser.email,
            sender_photo: currentUser.photoURL || null,
            receiver_id: receiverId,
            receiver_email: receiverEmail.toLowerCase(),
            message: message.trim(),
            status: 'pending',
            timestamp: new Date().toISOString(),
            created_at: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, 'invitations'), invitationData);
        
        console.log('✅ Invitation sent successfully:', docRef.id);
        return { id: docRef.id, ...invitationData };
    } catch (error) {
        console.error('❌ Error sending invitation:', error);
        throw error;
    }
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
        
        // Query invitations where current user is the receiver
        const q = query(
            collection(db, 'invitations'),
            where('receiver_id', '==', currentUser.uid),
            where('status', '==', 'pending'),
            orderBy('timestamp', 'desc')
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
        
        // If orderBy fails (no index), try without ordering
        if (error.code === 'failed-precondition') {
            console.log('⚠️ Retrying without orderBy...');
            try {
                const q = query(
                    collection(db, 'invitations'),
                    where('receiver_id', '==', currentUser.uid),
                    where('status', '==', 'pending')
                );
                
                const querySnapshot = await getDocs(q);
                
                pendingInvitations = [];
                querySnapshot.forEach((docSnap) => {
                    pendingInvitations.push({ id: docSnap.id, ...docSnap.data() });
                });

                // Sort manually
                pendingInvitations.sort((a, b) => 
                    new Date(b.timestamp) - new Date(a.timestamp)
                );

                console.log('✅ Loaded', pendingInvitations.length, 'invitations (no index)');
                updateInvitationBadge();
                return pendingInvitations;
            } catch (retryError) {
                console.error('❌ Retry failed:', retryError);
                return [];
            }
        }
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
        collection(db, 'invitations'),
        where('receiver_id', '==', currentUser.uid),
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
            } else if (change.type === 'modified') {
                const invitation = { id: change.doc.id, ...change.doc.data() };
                const index = pendingInvitations.findIndex(inv => inv.id === invitation.id);
                if (index >= 0) {
                    pendingInvitations[index] = invitation;
                }
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
        
        const inviteDoc = await getDoc(doc(db, 'invitations', invitationId));
        if (!inviteDoc.exists()) {
            throw new Error('Invitation not found');
        }

        const invitation = inviteDoc.data();
        console.log('📄 Invitation data:', invitation);

        // Verify receiver
        if (invitation.receiver_id !== currentUser.uid) {
            throw new Error('This invitation is not for you');
        }

        // Update invitation status
        await updateDoc(doc(db, 'invitations', invitationId), {
            status: 'accepted',
            accepted_at: new Date().toISOString()
        });

        // TODO: Add your custom action here
        // For example: Add to team, join project, etc.
        console.log('💡 Perform custom action here (e.g., add to team)');

        pendingInvitations = pendingInvitations.filter(inv => inv.id !== invitationId);

        console.log('✅ Invitation accepted successfully!');
        return invitation;
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
        
        const inviteDoc = await getDoc(doc(db, 'invitations', invitationId));
        if (!inviteDoc.exists()) {
            throw new Error('Invitation not found');
        }

        const invitation = inviteDoc.data();

        // Verify receiver
        if (invitation.receiver_id !== currentUser.uid) {
            throw new Error('This invitation is not for you');
        }

        // Update invitation status
        await updateDoc(doc(db, 'invitations', invitationId), {
            status: 'rejected',
            rejected_at: new Date().toISOString()
        });

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
            ${invitation.sender_photo ? 
                `<img src="${invitation.sender_photo}" alt="${escapeHtml(invitation.sender_name)}" style="width: 40px; height: 40px; border-radius: 50%;">` :
                `<i class="fas fa-user-circle"></i>`
            }
        </div>
        <div class="toast-content">
            <div class="toast-title">New Invitation</div>
            <div class="toast-message">${escapeHtml(invitation.sender_name)} sent you an invitation</div>
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
                    You don't have any pending invitations at the moment.
                </p>
            </div>
        `;
        return;
    }

    pendingInvitations.forEach(invitation => {
        const inviteCard = document.createElement('div');
        inviteCard.className = 'invitation-card';
        
        const createdDate = invitation.timestamp ? 
            new Date(invitation.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : 'Unknown date';

        const senderName = invitation.sender_name || invitation.sender_email || 'Unknown User';
        const senderInitials = senderName.substring(0, 2).toUpperCase();

        inviteCard.innerHTML = `
            <div class="invitation-header">
                <div class="invitation-avatar">
                    ${invitation.sender_photo ? 
                        `<img src="${invitation.sender_photo}" alt="${escapeHtml(senderName)}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">` :
                        `<div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px;">${senderInitials}</div>`
                    }
                </div>
                <div class="invitation-info">
                    <div class="invitation-title">Invitation from ${escapeHtml(senderName)}</div>
                    <div class="invitation-from">${escapeHtml(invitation.sender_email)}</div>
                </div>
            </div>
            <div class="invitation-body">
                ${invitation.message ? `
                    <div class="invitation-message">
                        <i class="fas fa-comment"></i>
                        <span>"${escapeHtml(invitation.message)}"</span>
                    </div>
                ` : ''}
                <div class="invitation-date">
                    <i class="far fa-clock"></i>
                    <span>${createdDate}</span>
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
        showSuccessToast('Invitation accepted!');
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
    console.log('👤 User UID:', currentUser.uid);

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

window.userInvitationSystem = {
    sendInvitation,
    loadUserInvitations,
    acceptInvitation,
    rejectInvitation,
    initializeInvitationSystem,
    cleanupInvitationSystem,
    getPendingInvitations: () => pendingInvitations
};

console.log('✅ User Invitation System Loaded');
