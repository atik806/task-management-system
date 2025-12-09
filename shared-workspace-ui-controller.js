// ==================== SHARED WORKSPACE UI CONTROLLER ====================
// Handles all shared workspace UI interactions

// DOM Elements
let personalWorkspaceBtn;
let sharedWorkspacesList;
let sharedWorkspacesNav;
let sharedWorkspaceModal;
let sharedWorkspaceSettingsModal;
let workspaceIndicator;
let sharedModeToggle;

console.log('🎨 Shared Workspace UI Controller Loading...');

// ==================== INITIALIZATION ====================

function initializeSharedWorkspaceUI() {
    console.log('🎨 Initializing shared workspace UI');
    
    // Get DOM elements
    personalWorkspaceBtn = document.getElementById('personalWorkspaceBtn');
    sharedWorkspacesList = document.getElementById('sharedWorkspacesList');
    sharedWorkspacesNav = document.getElementById('sharedWorkspacesNav');
    sharedWorkspaceModal = document.getElementById('sharedWorkspaceModal');
    sharedWorkspaceSettingsModal = document.getElementById('sharedWorkspaceSettingsModal');
    workspaceIndicator = document.getElementById('workspaceIndicator');
    sharedModeToggle = document.getElementById('sharedModeToggle');
    
    // Setup event listeners
    setupEventListeners();
    
    // Load and render shared workspaces
    loadAndRenderSharedWorkspaces();
    
    console.log('✅ Shared workspace UI initialized');
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
    // Personal workspace button
    if (personalWorkspaceBtn) {
        personalWorkspaceBtn.addEventListener('click', async () => {
            try {
                await window.sharedWorkspaceSystem.switchToPersonalWorkspace();
                updateWorkspaceButtons();
            } catch (error) {
                console.error('Error switching to personal workspace:', error);
            }
        });
    }
    
    // Shared workspaces navigation
    if (sharedWorkspacesNav) {
        sharedWorkspacesNav.addEventListener('click', (e) => {
            e.preventDefault();
            openSharedWorkspacesModal();
        });
    }
    
    // Modal close buttons
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Leave workspace button
    const leaveWorkspaceBtn = document.getElementById('leaveWorkspaceBtn');
    if (leaveWorkspaceBtn) {
        leaveWorkspaceBtn.addEventListener('click', async () => {
            const currentWorkspace = window.sharedWorkspaceSystem.getCurrentSharedWorkspace();
            if (currentWorkspace && confirm(`Are you sure you want to leave "${currentWorkspace.name}"?`)) {
                try {
                    await window.sharedWorkspaceSystem.leaveSharedWorkspace(currentWorkspace.id);
                    sharedWorkspaceSettingsModal.style.display = 'none';
                    loadAndRenderSharedWorkspaces();
                    showSuccessToast('Left workspace successfully');
                } catch (error) {
                    console.error('Error leaving workspace:', error);
                    alert('Error leaving workspace: ' + error.message);
                }
            }
        });
    }
}

// ==================== LOAD AND RENDER ====================

async function loadAndRenderSharedWorkspaces() {
    try {
        const workspaces = await window.sharedWorkspaceSystem.loadUserSharedWorkspaces();
        renderSharedWorkspacesList(workspaces);
        renderSharedWorkspacesModal(workspaces);
        updateWorkspaceCount(workspaces.length);
        updateWorkspaceButtons();
    } catch (error) {
        console.error('Error loading shared workspaces:', error);
    }
}

// ==================== RENDER FUNCTIONS ====================

function renderSharedWorkspacesList(workspaces) {
    if (!sharedWorkspacesList) return;
    
    sharedWorkspacesList.innerHTML = '';
    
    if (workspaces.length === 0) {
        if (sharedModeToggle) {
            sharedModeToggle.style.display = 'none';
        }
        return;
    }
    
    if (sharedModeToggle) {
        sharedModeToggle.style.display = 'block';
    }
    
    workspaces.forEach(workspace => {
        const workspaceBtn = document.createElement('button');
        workspaceBtn.className = 'workspace-option';
        workspaceBtn.innerHTML = `
            <i class="fas fa-users"></i>
            <span>${escapeHtml(workspace.name)}</span>
        `;
        
        workspaceBtn.addEventListener('click', async () => {
            try {
                await window.sharedWorkspaceSystem.switchToSharedWorkspace(workspace.id);
                updateWorkspaceButtons();
            } catch (error) {
                console.error('Error switching workspace:', error);
                alert('Error switching workspace: ' + error.message);
            }
        });
        
        sharedWorkspacesList.appendChild(workspaceBtn);
    });
}

function renderSharedWorkspacesModal(workspaces) {
    const mySharedWorkspacesList = document.getElementById('mySharedWorkspacesList');
    if (!mySharedWorkspacesList) return;
    
    mySharedWorkspacesList.innerHTML = '';
    
    if (workspaces.length === 0) {
        mySharedWorkspacesList.innerHTML = `
            <div class="empty-shared-workspaces">
                <i class="fas fa-users"></i>
                <h3>No Shared Workspaces</h3>
                <p>Accept an invitation to start collaborating with others!</p>
            </div>
        `;
        return;
    }
    
    workspaces.forEach(workspace => {
        const workspaceCard = document.createElement('div');
        workspaceCard.className = 'shared-workspace-card';
        
        const memberCount = workspace.members ? workspace.members.length : 0;
        const initials = workspace.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
        
        workspaceCard.innerHTML = `
            <div class="workspace-card-header">
                <div class="workspace-card-avatar">${initials}</div>
                <div class="workspace-card-info">
                    <div class="workspace-card-name">${escapeHtml(workspace.name)}</div>
                    <div class="workspace-card-meta">${memberCount} member${memberCount !== 1 ? 's' : ''} • ${workspace.userRole}</div>
                </div>
            </div>
            <div class="workspace-card-actions">
                <button class="btn-workspace primary" onclick="switchToWorkspace('${workspace.id}')">
                    <i class="fas fa-arrow-right"></i> Switch
                </button>
                <button class="btn-workspace" onclick="openWorkspaceSettings('${workspace.id}')">
                    <i class="fas fa-cog"></i> Settings
                </button>
            </div>
        `;
        
        mySharedWorkspacesList.appendChild(workspaceCard);
    });
}

function updateWorkspaceButtons() {
    const currentSharedWorkspace = window.sharedWorkspaceSystem.getCurrentSharedWorkspace();
    
    // Update personal workspace button
    if (personalWorkspaceBtn) {
        if (currentSharedWorkspace) {
            personalWorkspaceBtn.classList.remove('active');
        } else {
            personalWorkspaceBtn.classList.add('active');
        }
    }
    
    // Update shared workspace buttons
    const workspaceButtons = sharedWorkspacesList?.querySelectorAll('.workspace-option');
    if (workspaceButtons) {
        workspaceButtons.forEach((btn, index) => {
            const workspaces = window.sharedWorkspaceSystem.getSharedWorkspaces();
            const workspace = workspaces[index];
            
            if (currentSharedWorkspace && workspace && workspace.id === currentSharedWorkspace.id) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

function updateWorkspaceCount(count) {
    const countBadge = document.getElementById('sharedWorkspaceCount');
    if (countBadge) {
        if (count > 0) {
            countBadge.textContent = count;
            countBadge.style.display = 'flex';
        } else {
            countBadge.style.display = 'none';
        }
    }
}

// ==================== MODAL FUNCTIONS ====================

function openSharedWorkspacesModal() {
    if (sharedWorkspaceModal) {
        sharedWorkspaceModal.style.display = 'block';
        loadAndRenderSharedWorkspaces();
    }
}

function openWorkspaceSettings(workspaceId) {
    const workspaces = window.sharedWorkspaceSystem.getSharedWorkspaces();
    const workspace = workspaces.find(ws => ws.id === workspaceId);
    
    if (!workspace || !sharedWorkspaceSettingsModal) return;
    
    // Update modal content
    const nameElement = document.getElementById('settingsWorkspaceName');
    const membersElement = document.getElementById('settingsWorkspaceMembers');
    const membersList = document.getElementById('workspaceMembersList');
    
    if (nameElement) nameElement.textContent = workspace.name;
    if (membersElement) {
        const memberCount = workspace.members ? workspace.members.length : 0;
        membersElement.textContent = `${memberCount} member${memberCount !== 1 ? 's' : ''}`;
    }
    
    // Render members list
    if (membersList && workspace.members) {
        renderWorkspaceMembers(workspace.members, membersList);
    }
    
    // Show/hide leave button based on role
    const leaveBtn = document.getElementById('leaveWorkspaceBtn');
    if (leaveBtn) {
        leaveBtn.style.display = workspace.userRole !== 'owner' ? 'flex' : 'none';
    }
    
    sharedWorkspaceSettingsModal.style.display = 'block';
}

async function renderWorkspaceMembers(memberIds, container) {
    container.innerHTML = '<p>Loading members...</p>';
    
    try {
        const db = window.db;
        if (!db) return;
        
        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        const memberPromises = memberIds.map(async (memberId) => {
            const userDoc = await getDoc(doc(db, 'users', memberId));
            return userDoc.exists() ? { id: memberId, ...userDoc.data() } : null;
        });
        
        const members = (await Promise.all(memberPromises)).filter(member => member !== null);
        
        container.innerHTML = '';
        
        members.forEach(member => {
            const memberItem = document.createElement('div');
            memberItem.className = 'member-item';
            
            const initials = (member.displayName || member.email).substring(0, 2).toUpperCase();
            
            memberItem.innerHTML = `
                <div class="member-avatar">${initials}</div>
                <div class="member-info">
                    <div class="member-name">${escapeHtml(member.displayName || member.email)}</div>
                    <div class="member-role">Member</div>
                </div>
            `;
            
            container.appendChild(memberItem);
        });
    } catch (error) {
        console.error('Error loading members:', error);
        container.innerHTML = '<p>Error loading members</p>';
    }
}

// ==================== UTILITY FUNCTIONS ====================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
    `;
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${escapeHtml(message)}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==================== GLOBAL FUNCTIONS ====================

window.switchToWorkspace = async function(workspaceId) {
    try {
        await window.sharedWorkspaceSystem.switchToSharedWorkspace(workspaceId);
        updateWorkspaceButtons();
        if (sharedWorkspaceModal) {
            sharedWorkspaceModal.style.display = 'none';
        }
    } catch (error) {
        console.error('Error switching workspace:', error);
        alert('Error switching workspace: ' + error.message);
    }
};

window.openWorkspaceSettings = function(workspaceId) {
    openWorkspaceSettings(workspaceId);
};

window.initializeSharedWorkspaceUI = initializeSharedWorkspaceUI;
window.loadAndRenderSharedWorkspaces = loadAndRenderSharedWorkspaces;

console.log('✅ Shared Workspace UI Controller Loaded');
