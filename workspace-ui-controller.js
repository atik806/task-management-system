// ==================== WORKSPACE UI CONTROLLER ====================
// Handles all workspace UI interactions

// DOM Elements
const workspaceSelectorBtn = document.getElementById('workspaceSelectorBtn');
const workspaceDropdown = document.getElementById('workspaceDropdown');
const workspaceList = document.getElementById('workspaceList');
const createWorkspaceBtn = document.getElementById('createWorkspaceBtn');
const createWorkspaceModal = document.getElementById('createWorkspaceModal');
const createWorkspaceForm = document.getElementById('createWorkspaceForm');
const workspaceSettingsModal = document.getElementById('workspaceSettingsModal');
const workspaceSettingsNav = document.getElementById('workspaceSettingsNav');
const inviteMemberModal = document.getElementById('inviteMemberModal');
const inviteMemberForm = document.getElementById('inviteMemberForm');
const currentWorkspaceName = document.getElementById('currentWorkspaceName');
const currentWorkspaceRole = document.getElementById('currentWorkspaceRole');
const memberCount = document.getElementById('memberCount');

// ==================== INITIALIZATION ====================

async function initializeWorkspaceUI() {
    if (!currentUser) return;

    // Load user's workspaces
    await workspaceSystem.loadUserWorkspaces();

    // Check for invite token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const inviteToken = urlParams.get('invite');
    if (inviteToken) {
        await handleInviteAcceptance(inviteToken);
        // Remove invite param from URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Load last accessed workspace or create default
    const lastWorkspaceId = localStorage.getItem('currentWorkspaceId');
    if (lastWorkspaceId) {
        try {
            await workspaceSystem.switchWorkspace(lastWorkspaceId);
        } catch (error) {
            console.error('Error loading last workspace:', error);
            await createDefaultWorkspace();
        }
    } else {
        await createDefaultWorkspace();
    }

    // Render workspace selector
    renderWorkspaceSelector();

    // Setup event listeners
    setupWorkspaceEventListeners();
}

// Create default personal workspace
async function createDefaultWorkspace() {
    try {
        const workspace = await workspaceSystem.createWorkspace(
            'Personal Workspace',
            'Your personal task management space'
        );
        await workspaceSystem.switchWorkspace(workspace.id);
    } catch (error) {
        console.error('Error creating default workspace:', error);
        alert('Error creating workspace: ' + error.message);
    }
}

// ==================== WORKSPACE SELECTOR ====================

function renderWorkspaceSelector() {
    const currentWorkspace = workspaceSystem.getCurrentWorkspace();
    if (!currentWorkspace) return;

    // Update current workspace display
    currentWorkspaceName.textContent = currentWorkspace.name;
    currentWorkspaceRole.textContent = currentWorkspace.userRole;

    // Update member count
    const members = workspaceSystem.getWorkspaceMembers();
    memberCount.textContent = `${members.length} ${members.length === 1 ? 'member' : 'members'}`;

    // Render workspace list
    renderWorkspaceList();
}

function renderWorkspaceList() {
    workspaceList.innerHTML = '';

    const workspaces = userWorkspaces;
    const currentWorkspace = workspaceSystem.getCurrentWorkspace();

    if (workspaces.length === 0) {
        workspaceList.innerHTML = `
            <div class="empty-state">
                <p>No workspaces yet</p>
            </div>
        `;
        return;
    }

    workspaces.forEach(ws => {
        const isActive = currentWorkspace && ws.workspaceId === currentWorkspace.id;
        const initials = ws.workspace.name.substring(0, 2).toUpperCase();

        const item = document.createElement('div');
        item.className = `workspace-item ${isActive ? 'active' : ''}`;
        item.innerHTML = `
            <div class="workspace-item-info">
                <div class="workspace-item-icon">${initials}</div>
                <div class="workspace-item-details">
                    <div class="workspace-item-name">${escapeHtml(ws.workspace.name)}</div>
                    <div class="workspace-item-meta">${ws.role}</div>
                </div>
            </div>
            ${isActive ? '<i class="fas fa-check" style="color: var(--primary);"></i>' : ''}
        `;

        item.addEventListener('click', async () => {
            if (!isActive) {
                try {
                    await workspaceSystem.switchWorkspace(ws.workspaceId);
                    renderWorkspaceSelector();
                    workspaceDropdown.classList.remove('active');
                } catch (error) {
                    console.error('Error switching workspace:', error);
                    alert('Error switching workspace: ' + error.message);
                }
            }
        });

        workspaceList.appendChild(item);
    });
}

// ==================== EVENT LISTENERS ====================

function setupWorkspaceEventListeners() {
    // Workspace selector dropdown
    workspaceSelectorBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        workspaceDropdown.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!workspaceDropdown.contains(e.target) && e.target !== workspaceSelectorBtn) {
            workspaceDropdown.classList.remove('active');
        }
    });

    // Create workspace button
    createWorkspaceBtn.addEventListener('click', () => {
        workspaceDropdown.classList.remove('active');
        createWorkspaceModal.style.display = 'block';
    });

    // Create workspace form
    createWorkspaceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('workspaceName').value.trim();
        const description = document.getElementById('workspaceDescription').value.trim();

        try {
            const workspace = await workspaceSystem.createWorkspace(name, description);
            await workspaceSystem.switchWorkspace(workspace.id);
            await workspaceSystem.loadUserWorkspaces();
            renderWorkspaceSelector();
            createWorkspaceModal.style.display = 'none';
            createWorkspaceForm.reset();
        } catch (error) {
            console.error('Error creating workspace:', error);
            alert('Error creating workspace: ' + error.message);
        }
    });

    // Cancel create workspace
    document.getElementById('cancelCreateWorkspaceBtn').addEventListener('click', () => {
        createWorkspaceModal.style.display = 'none';
        createWorkspaceForm.reset();
    });

    // Workspace settings
    workspaceSettingsNav.addEventListener('click', (e) => {
        e.preventDefault();
        openWorkspaceSettings();
    });

    // Settings tabs
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchSettingsTab(tabName);
        });
    });

    // Invite member button
    document.getElementById('inviteMemberBtn').addEventListener('click', () => {
        inviteMemberModal.style.display = 'block';
    });

    // Invite member form
    inviteMemberForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('inviteEmail').value.trim();
        const role = document.getElementById('inviteRole').value;

        try {
            const invite = await workspaceSystem.createInvite(email, role);
            const inviteLink = workspaceSystem.getInviteLink(invite.inviteToken);

            // Show invite link
            document.getElementById('inviteLinkInput').value = inviteLink;
            document.getElementById('inviteLinkContainer').style.display = 'block';

            // Reload invites list
            await loadInvitesList();
        } catch (error) {
            console.error('Error creating invite:', error);
            alert('Error creating invite: ' + error.message);
        }
    });

    // Copy invite link
    document.getElementById('copyInviteLinkBtn').addEventListener('click', () => {
        const input = document.getElementById('inviteLinkInput');
        input.select();
        document.execCommand('copy');
        
        const btn = document.getElementById('copyInviteLinkBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2000);
    });

    // Cancel invite
    document.getElementById('cancelInviteBtn').addEventListener('click', () => {
        inviteMemberModal.style.display = 'none';
        inviteMemberForm.reset();
        document.getElementById('inviteLinkContainer').style.display = 'none';
    });

    // Save workspace settings
    document.getElementById('saveWorkspaceSettingsBtn').addEventListener('click', async () => {
        await saveWorkspaceSettings();
    });

    // Leave workspace
    document.getElementById('leaveWorkspaceBtn').addEventListener('click', async () => {
        if (confirm('Are you sure you want to leave this workspace?')) {
            try {
                const currentWorkspace = workspaceSystem.getCurrentWorkspace();
                await workspaceSystem.leaveWorkspace(currentWorkspace.id);
                await workspaceSystem.loadUserWorkspaces();
                
                // Switch to another workspace or create new one
                if (userWorkspaces.length > 0) {
                    await workspaceSystem.switchWorkspace(userWorkspaces[0].workspaceId);
                } else {
                    await createDefaultWorkspace();
                }
                
                renderWorkspaceSelector();
                workspaceSettingsModal.style.display = 'none';
            } catch (error) {
                console.error('Error leaving workspace:', error);
                alert('Error leaving workspace: ' + error.message);
            }
        }
    });

    // Delete workspace
    document.getElementById('deleteWorkspaceBtn').addEventListener('click', async () => {
        if (!workspaceSystem.canDeleteWorkspace()) {
            alert('Only the workspace owner can delete the workspace');
            return;
        }

        if (confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) {
            try {
                const currentWorkspace = workspaceSystem.getCurrentWorkspace();
                await workspaceSystem.deleteWorkspace(currentWorkspace.id);
                await workspaceSystem.loadUserWorkspaces();
                
                // Switch to another workspace or create new one
                if (userWorkspaces.length > 0) {
                    await workspaceSystem.switchWorkspace(userWorkspaces[0].workspaceId);
                } else {
                    await createDefaultWorkspace();
                }
                
                renderWorkspaceSelector();
                workspaceSettingsModal.style.display = 'none';
            } catch (error) {
                console.error('Error deleting workspace:', error);
                alert('Error deleting workspace: ' + error.message);
            }
        }
    });
}

// ==================== WORKSPACE SETTINGS ====================

async function openWorkspaceSettings() {
    const currentWorkspace = workspaceSystem.getCurrentWorkspace();
    if (!currentWorkspace) return;

    // Load workspace data
    document.getElementById('settingsWorkspaceName').value = currentWorkspace.name;
    document.getElementById('settingsWorkspaceDescription').value = currentWorkspace.description || '';

    // Show/hide buttons based on role
    const canManage = workspaceSystem.canManageMembers();
    const canDelete = workspaceSystem.canDeleteWorkspace();

    document.getElementById('inviteMemberBtn').style.display = canManage ? 'block' : 'none';
    document.getElementById('deleteWorkspaceBtn').style.display = canDelete ? 'block' : 'none';
    document.getElementById('leaveWorkspaceBtn').style.display = !canDelete ? 'block' : 'none';

    // Load members and invites
    await loadMembersList();
    await loadInvitesList();

    workspaceSettingsModal.style.display = 'block';
}

function switchSettingsTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.settings-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

async function saveWorkspaceSettings() {
    const currentWorkspace = workspaceSystem.getCurrentWorkspace();
    if (!currentWorkspace) return;

    const name = document.getElementById('settingsWorkspaceName').value.trim();
    const description = document.getElementById('settingsWorkspaceDescription').value.trim();

    try {
        await updateDoc(doc(db, 'workspaces', currentWorkspace.id), {
            name: name,
            description: description,
            updatedAt: new Date().toISOString()
        });

        currentWorkspace.name = name;
        currentWorkspace.description = description;

        renderWorkspaceSelector();
        alert('Workspace settings saved');
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Error saving settings: ' + error.message);
    }
}

// ==================== MEMBERS LIST ====================

async function loadMembersList() {
    const membersList = document.getElementById('membersList');
    const members = workspaceSystem.getWorkspaceMembers();
    const canManage = workspaceSystem.canManageMembers();

    membersList.innerHTML = '';

    if (members.length === 0) {
        membersList.innerHTML = `
            <div class="empty-members">
                <i class="fas fa-users"></i>
                <p>No members yet</p>
            </div>
        `;
        return;
    }

    members.forEach(member => {
        const initials = member.displayName.substring(0, 2).toUpperCase();
        const isCurrentUser = member.userId === currentUser.uid;

        const item = document.createElement('div');
        item.className = 'member-item';
        item.innerHTML = `
            <div class="member-info">
                <div class="member-avatar">${initials}</div>
                <div class="member-details">
                    <div class="member-name">${escapeHtml(member.displayName)} ${isCurrentUser ? '(You)' : ''}</div>
                    <div class="member-email">${escapeHtml(member.email)}</div>
                </div>
            </div>
            <div class="member-actions">
                ${canManage && member.role !== 'owner' ? `
                    <select class="role-select" data-member-id="${member.id}">
                        <option value="member" ${member.role === 'member' ? 'selected' : ''}>Member</option>
                        <option value="admin" ${member.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                    ${!isCurrentUser ? `<button class="btn-remove-member" data-member-id="${member.id}">Remove</button>` : ''}
                ` : `
                    <span class="role-badge ${member.role}">${member.role}</span>
                `}
            </div>
        `;

        membersList.appendChild(item);
    });

    // Add event listeners for role changes and removals
    if (canManage) {
        membersList.querySelectorAll('.role-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const memberId = e.target.dataset.memberId;
                const newRole = e.target.value;
                try {
                    await workspaceSystem.updateMemberRole(memberId, newRole);
                    await loadMembersList();
                } catch (error) {
                    console.error('Error updating role:', error);
                    alert('Error updating role: ' + error.message);
                }
            });
        });

        membersList.querySelectorAll('.btn-remove-member').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const memberId = e.target.dataset.memberId;
                if (confirm('Are you sure you want to remove this member?')) {
                    try {
                        await workspaceSystem.removeMember(memberId);
                        await loadMembersList();
                    } catch (error) {
                        console.error('Error removing member:', error);
                        alert('Error removing member: ' + error.message);
                    }
                }
            });
        });
    }
}

// ==================== INVITES LIST ====================

async function loadInvitesList() {
    const invitesList = document.getElementById('invitesList');
    const currentWorkspace = workspaceSystem.getCurrentWorkspace();

    try {
        const q = query(
            collection(db, 'workspaceInvites'),
            where('workspaceId', '==', currentWorkspace.id),
            where('status', '==', 'pending')
        );
        const querySnapshot = await getDocs(q);

        const invites = [];
        querySnapshot.forEach((doc) => {
            invites.push({ id: doc.id, ...doc.data() });
        });

        invitesList.innerHTML = '';

        if (invites.length === 0) {
            invitesList.innerHTML = `
                <div class="empty-invites">
                    <i class="fas fa-envelope"></i>
                    <p>No pending invites</p>
                </div>
            `;
            return;
        }

        invites.forEach(invite => {
            const createdDate = new Date(invite.createdAt).toLocaleDateString();
            const expiresDate = new Date(invite.expiresAt).toLocaleDateString();

            const item = document.createElement('div');
            item.className = 'invite-item';
            item.innerHTML = `
                <div class="invite-info">
                    <div class="invite-email">${escapeHtml(invite.invitedEmail)}</div>
                    <div class="invite-meta">
                        Role: ${invite.role} • Sent: ${createdDate} • Expires: ${expiresDate}
                    </div>
                </div>
                <div class="invite-actions">
                    <button class="btn-copy-invite" data-token="${invite.inviteToken}">
                        <i class="fas fa-copy"></i> Copy Link
                    </button>
                    <button class="btn-cancel-invite" data-invite-id="${invite.id}">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            `;

            invitesList.appendChild(item);
        });

        // Add event listeners
        invitesList.querySelectorAll('.btn-copy-invite').forEach(btn => {
            btn.addEventListener('click', () => {
                const token = btn.dataset.token;
                const link = workspaceSystem.getInviteLink(token);
                navigator.clipboard.writeText(link);
                
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                }, 2000);
            });
        });

        invitesList.querySelectorAll('.btn-cancel-invite').forEach(btn => {
            btn.addEventListener('click', async () => {
                const inviteId = btn.dataset.inviteId;
                if (confirm('Cancel this invite?')) {
                    try {
                        await deleteDoc(doc(db, 'workspaceInvites', inviteId));
                        await loadInvitesList();
                    } catch (error) {
                        console.error('Error canceling invite:', error);
                        alert('Error canceling invite: ' + error.message);
                    }
                }
            });
        });
    } catch (error) {
        console.error('Error loading invites:', error);
    }
}

// ==================== INVITE ACCEPTANCE ====================

async function handleInviteAcceptance(inviteToken) {
    try {
        const workspaceId = await workspaceSystem.acceptInvite(inviteToken);
        await workspaceSystem.loadUserWorkspaces();
        await workspaceSystem.switchWorkspace(workspaceId);
        renderWorkspaceSelector();
        alert('Successfully joined workspace!');
    } catch (error) {
        console.error('Error accepting invite:', error);
        alert('Error accepting invite: ' + error.message);
    }
}

// Export for use in app.js
window.workspaceUI = {
    initializeWorkspaceUI,
    renderWorkspaceSelector
};

console.log('Workspace UI controller loaded');
