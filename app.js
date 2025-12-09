import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC44hfwlFlsShip1xw5UamUv3u79s-FGVg",
    authDomain: "task-management-system-9f068.firebaseapp.com",
    projectId: "task-management-system-9f068",
    storageBucket: "task-management-system-9f068.firebasestorage.app",
    messagingSenderId: "246762190630",
    appId: "1:246762190630:web:3ee3c2e9ea80e97deef3e7",
    measurementId: "G-JGDYPZTRTL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export db to global scope for workspace-invitations.js
window.db = db;

let currentUser = null;
let categories = [];
let tasks = [];

// Default categories
const defaultCategories = [
    { id: 'todo', name: 'To Do', icon: 'fas fa-circle', isDefault: true },
    { id: 'inprogress', name: 'In Progress', icon: 'fas fa-spinner', isDefault: true },
    { id: 'completed', name: 'Completed', icon: 'fas fa-check-circle', isDefault: true }
];

// DOM Elements
const taskBoard = document.getElementById('taskBoard');
const taskModal = document.getElementById('taskModal');
const categoryModal = document.getElementById('categoryModal');
const taskForm = document.getElementById('taskForm');
const categoryForm = document.getElementById('categoryForm');
const addTaskBtn = document.getElementById('addTaskBtn');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userEmailSpan = document.getElementById('userEmail');
const taskCategorySelect = document.getElementById('taskCategory');

// Auth State Observer
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    window.currentUser = user; // Export to global scope
    
    if (user) {
        console.log('User logged in:', user.email);
        userEmailSpan.textContent = user.email;
        
        // Create/update user profile
        if (window.userProfileManager) {
            await window.userProfileManager.createOrUpdateUserProfile(user);
        }
        
        initializeDashboard();
    } else {
        console.log('No user logged in, redirecting to landing page');
        window.location.href = '/';
    }
});

// Initialize Dashboard
async function initializeDashboard() {
    await loadCategories();
    await loadTasks();
    await loadNotes();
    renderBoard();
    
    // Initialize invitation system
    if (window.invitationSystem) {
        window.invitationSystem.initializeInvitationSystem();
    }
    
    // Initialize shared workspace system
    if (window.sharedWorkspaceSystem) {
        window.sharedWorkspaceSystem.initializeSharedWorkspaceSystem();
    }
    
    // Initialize shared workspace UI
    if (window.initializeSharedWorkspaceUI) {
        window.initializeSharedWorkspaceUI();
    }
}

// Load Categories
async function loadCategories() {
    try {
        const q = query(
            collection(db, 'categories'),
            where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        
        const userCategories = [];
        querySnapshot.forEach((doc) => {
            userCategories.push({ id: doc.id, ...doc.data() });
        });
        
        // If no custom categories, use defaults
        if (userCategories.length === 0) {
            categories = [...defaultCategories];
        } else {
            // Merge defaults with custom categories
            categories = [...defaultCategories, ...userCategories.filter(c => !c.isDefault)];
        }
        
        console.log('Loaded categories:', categories);
        updateCategorySelect();
    } catch (error) {
        console.error('Error loading categories:', error);
        categories = [...defaultCategories];
    }
}

// Load Tasks
async function loadTasks() {
    if (!currentUser) return;

    console.log('Loading tasks for user:', currentUser.uid);

    try {
        const q = query(
            collection(db, 'tasks'),
            where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);

        tasks = [];
        querySnapshot.forEach((doc) => {
            tasks.push({ id: doc.id, ...doc.data() });
        });

        console.log('Found', tasks.length, 'tasks');
    } catch (error) {
        console.error('Error loading tasks:', error);
        if (error.code === 'permission-denied') {
            alert('Cannot load tasks: Permission denied. Please check Firestore security rules.');
        }
    }
}

// Render Board
function renderBoard() {
    taskBoard.innerHTML = '';
    
    categories.forEach(category => {
        const column = createColumn(category);
        taskBoard.appendChild(column);
        
        // Render tasks for this category
        const categoryTasks = tasks.filter(t => t.status === category.id);
        const taskList = column.querySelector('.task-list');
        
        categoryTasks.forEach(task => {
            const taskCard = createTaskCard(task);
            taskList.appendChild(taskCard);
        });
        
        // Update task count
        const taskCount = column.querySelector('.task-count');
        taskCount.textContent = categoryTasks.length;
        
        // Initialize Sortable for drag and drop
        initializeSortable(taskList, category.id);
    });
}

// Create Column
function createColumn(category) {
    const column = document.createElement('div');
    column.className = 'task-column';
    column.dataset.categoryId = category.id;
    
    column.innerHTML = `
        <div class="column-header">
            <div class="column-title">
                <i class="${category.icon}"></i>
                <span>${category.name}</span>
            </div>
            <div class="column-actions">
                <span class="task-count">0</span>
                ${!category.isDefault ? `<button class="btn-icon" onclick="deleteCategory('${category.id}')"><i class="fas fa-trash"></i></button>` : ''}
            </div>
        </div>
        <div class="task-list" data-category="${category.id}"></div>
    `;
    
    return column;
}

// Create Task Card
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = `task-card priority-${task.priority}`;
    card.dataset.taskId = task.id;
    
    card.innerHTML = `
        <div class="task-card-header">
            <div class="task-title">${escapeHtml(task.title)}</div>
        </div>
        <div class="task-description">${escapeHtml(task.description)}</div>
        <div class="task-meta">
            <div class="task-date">
                <i class="far fa-calendar"></i>
                <span>${formatDate(task.deadline)}</span>
            </div>
            <span class="priority-badge priority-${task.priority}">${task.priority}</span>
        </div>
        <div class="task-actions">
            <button class="btn-edit" onclick="editTask('${task.id}')">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn-delete" onclick="deleteTask('${task.id}')">
                <i class="fas fa-trash"></i> Delete
            </button>
            <button class="btn-move" onclick="showMoveToWorkspaceModal('${task.id}')" title="Move to Shared Workspace">
                <i class="fas fa-share-alt"></i> Move
            </button>
        </div>
    `;
    
    return card;
}

// Initialize Sortable (Drag and Drop)
function initializeSortable(element, categoryId) {
    new Sortable(element, {
        group: 'tasks',
        animation: 150,
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        onEnd: async function(evt) {
            const taskId = evt.item.dataset.taskId;
            const newCategoryId = evt.to.dataset.category;
            
            console.log(`Moving task ${taskId} to ${newCategoryId}`);
            
            // Update task status in Firebase
            try {
                await updateDoc(doc(db, 'tasks', taskId), {
                    status: newCategoryId
                });
                
                // Update local tasks array
                const task = tasks.find(t => t.id === taskId);
                if (task) {
                    task.status = newCategoryId;
                }
                
                // Update task counts
                updateTaskCounts();
            } catch (error) {
                console.error('Error updating task:', error);
                alert('Failed to move task: ' + error.message);
                // Reload to revert
                await loadTasks();
                renderBoard();
            }
        }
    });
}

// Update Task Counts
function updateTaskCounts() {
    categories.forEach(category => {
        const column = document.querySelector(`[data-category-id="${category.id}"]`);
        if (column) {
            const count = tasks.filter(t => t.status === category.id).length;
            const taskCount = column.querySelector('.task-count');
            if (taskCount) {
                taskCount.textContent = count;
            }
        }
    });
}

// Update Category Select
function updateCategorySelect() {
    taskCategorySelect.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        taskCategorySelect.appendChild(option);
    });
}

// Modal Controls
addTaskBtn.addEventListener('click', () => {
    taskModal.style.display = 'block';
    taskForm.reset();
});

addCategoryBtn.addEventListener('click', () => {
    categoryModal.style.display = 'block';
    categoryForm.reset();
});

document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});

document.getElementById('cancelTaskBtn').addEventListener('click', () => {
    taskModal.style.display = 'none';
});

document.getElementById('cancelCategoryBtn').addEventListener('click', () => {
    categoryModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === taskModal) {
        taskModal.style.display = 'none';
    }
    if (e.target === categoryModal) {
        categoryModal.style.display = 'none';
    }
});

// Add Task
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser) {
        alert('Please login to add tasks');
        return;
    }

    // Get status from select, default to 'todo' if not set
    const selectedStatus = document.getElementById('taskCategory').value || 'todo';

    const task = {
        title: document.getElementById('taskTitle').value.trim(),
        description: document.getElementById('taskDesc').value.trim(),
        deadline: document.getElementById('taskDeadline').value,
        priority: document.getElementById('taskPriority').value,
        status: selectedStatus, // Fixed: Now defaults to 'todo'
        userId: currentUser.uid,
        createdAt: new Date().toISOString()
    };

    console.log('Adding task:', task);

    try {
        const docRef = await addDoc(collection(db, 'tasks'), task);
        console.log('Task added successfully with ID:', docRef.id);
        
        task.id = docRef.id;
        tasks.push(task);
        
        taskModal.style.display = 'none';
        taskForm.reset();
        renderBoard();
    } catch (error) {
        console.error('Error adding task:', error);
        alert('Error adding task: ' + error.message);
    }
});

// Add Category
categoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser) {
        alert('Please login to add categories');
        return;
    }

    const categoryName = document.getElementById('categoryName').value.trim();
    const categoryIcon = document.getElementById('categoryIcon').value;
    
    if (!categoryName) {
        alert('Please enter a category name');
        return;
    }
    
    // Generate unique ID
    const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();

    const category = {
        id: categoryId,
        name: categoryName,
        icon: categoryIcon,
        userId: currentUser.uid,
        isDefault: false,
        createdAt: new Date().toISOString()
    };

    console.log('Adding category:', category);

    try {
        await setDoc(doc(db, 'categories', categoryId), category);
        console.log('Category added successfully');
        
        categories.push(category);
        
        categoryModal.style.display = 'none';
        categoryForm.reset();
        updateCategorySelect();
        renderBoard();
    } catch (error) {
        console.error('Error adding category:', error);
        console.error('Error code:', error.code);
        console.error('Error details:', error);
        
        if (error.code === 'permission-denied') {
            alert('Permission denied: Please update Firestore security rules.\n\nSee FIRESTORE-RULES.md for instructions.');
        } else {
            alert('Error adding category: ' + error.message);
        }
    }
});

// Delete Task
window.deleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        await deleteDoc(doc(db, 'tasks', taskId));
        tasks = tasks.filter(t => t.id !== taskId);
        renderBoard();
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Error deleting task: ' + error.message);
    }
};

// Delete Category
window.deleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category? Tasks in this category will be moved to "To Do".')) return;

    try {
        // Move tasks to "To Do"
        const categoryTasks = tasks.filter(t => t.status === categoryId);
        for (const task of categoryTasks) {
            await updateDoc(doc(db, 'tasks', task.id), { status: 'todo' });
            task.status = 'todo';
        }
        
        // Delete category
        await deleteDoc(doc(db, 'categories', categoryId));
        categories = categories.filter(c => c.id !== categoryId);
        
        updateCategorySelect();
        renderBoard();
    } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category: ' + error.message);
    }
};

// Edit Task (placeholder)
window.editTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDesc').value = task.description;
    document.getElementById('taskDeadline').value = task.deadline;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskCategory').value = task.status;
    
    taskModal.style.display = 'block';
    
    // Change form to edit mode
    taskForm.onsubmit = async (e) => {
        e.preventDefault();
        
        const updatedTask = {
            title: document.getElementById('taskTitle').value.trim(),
            description: document.getElementById('taskDesc').value.trim(),
            deadline: document.getElementById('taskDeadline').value,
            priority: document.getElementById('taskPriority').value,
            status: document.getElementById('taskCategory').value
        };
        
        try {
            await updateDoc(doc(db, 'tasks', taskId), updatedTask);
            
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTask };
            }
            
            taskModal.style.display = 'none';
            renderBoard();
            
            // Reset form handler
            taskForm.onsubmit = null;
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Error updating task: ' + error.message);
        }
    };
};

// Logout
logoutBtn.addEventListener('click', async () => {
    try {
        // Cleanup invitation system
        if (window.invitationSystem) {
            window.invitationSystem.cleanupInvitationSystem();
        }
        
        await signOut(auth);
    } catch (error) {
        alert('Logout failed: ' + error.message);
    }
});

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}


// ==================== DARK MODE ====================
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme') || 'light';

// Apply saved theme
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    
    if (isDark) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i><span>Dark Mode</span>';
        localStorage.setItem('theme', 'light');
    }
});

// ==================== VIEW SWITCHING ====================
const navItems = document.querySelectorAll('.nav-item');
const views = {
    dashboard: document.getElementById('dashboardView'),
    mytasks: document.getElementById('mytasksView'),
    calendar: document.getElementById('calendarView')
};

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const viewName = item.dataset.view;
        
        // Update active nav item
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // Show selected view
        Object.values(views).forEach(view => view.classList.remove('active'));
        views[viewName].classList.add('active');
        
        // Load view data
        if (viewName === 'mytasks') {
            renderMyTasks('all');
        } else if (viewName === 'calendar') {
            renderCalendar();
        } else if (viewName === 'notes') {
            renderNotes();
        }
    });
});

// ==================== MY TASKS VIEW ====================
const mytasksList = document.getElementById('mytasksList');
const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderMyTasks(btn.dataset.filter);
    });
});

function renderMyTasks(filter) {
    let filteredTasks = [...tasks];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch(filter) {
        case 'today':
            filteredTasks = tasks.filter(t => {
                const taskDate = new Date(t.deadline);
                taskDate.setHours(0, 0, 0, 0);
                return taskDate.getTime() === today.getTime();
            });
            break;
        case 'upcoming':
            filteredTasks = tasks.filter(t => {
                const taskDate = new Date(t.deadline);
                return taskDate > today && t.status !== 'completed';
            });
            break;
        case 'overdue':
            filteredTasks = tasks.filter(t => {
                const taskDate = new Date(t.deadline);
                return taskDate < today && t.status !== 'completed';
            });
            break;
        case 'completed':
            filteredTasks = tasks.filter(t => t.status === 'completed');
            break;
    }
    
    // Sort by deadline
    filteredTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    
    mytasksList.innerHTML = '';
    
    if (filteredTasks.length === 0) {
        mytasksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No tasks found</p>
            </div>
        `;
        return;
    }
    
    filteredTasks.forEach(task => {
        const category = categories.find(c => c.id === task.status);
        const taskDate = new Date(task.deadline);
        const isOverdue = taskDate < today && task.status !== 'completed';
        
        const taskItem = document.createElement('div');
        taskItem.className = `mytask-item priority-${task.priority} ${task.status === 'completed' ? 'completed' : ''}`;
        
        taskItem.innerHTML = `
            <div class="mytask-content">
                <div class="mytask-title">${escapeHtml(task.title)}</div>
                <div class="mytask-meta">
                    <div class="mytask-category">
                        <i class="${category ? category.icon : 'fas fa-folder'}"></i>
                        <span>${category ? category.name : 'Unknown'}</span>
                    </div>
                    <div class="task-date ${isOverdue ? 'text-danger' : ''}">
                        <i class="far fa-calendar"></i>
                        <span>${formatDate(task.deadline)}</span>
                        ${isOverdue ? '<i class="fas fa-exclamation-circle"></i>' : ''}
                    </div>
                    <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                </div>
            </div>
            <div class="mytask-actions">
                ${task.status !== 'completed' ? 
                    `<button class="btn-edit" onclick="markComplete('${task.id}')">
                        <i class="fas fa-check"></i> Complete
                    </button>` : 
                    `<button class="btn-edit" onclick="markIncomplete('${task.id}')">
                        <i class="fas fa-undo"></i> Reopen
                    </button>`
                }
                <button class="btn-delete" onclick="deleteTask('${task.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        mytasksList.appendChild(taskItem);
    });
}

// Mark task as complete
window.markComplete = async (taskId) => {
    try {
        await updateDoc(doc(db, 'tasks', taskId), { status: 'completed' });
        const task = tasks.find(t => t.id === taskId);
        if (task) task.status = 'completed';
        renderMyTasks(document.querySelector('.filter-btn.active').dataset.filter);
        renderBoard();
    } catch (error) {
        console.error('Error completing task:', error);
        alert('Error completing task: ' + error.message);
    }
};

// Mark task as incomplete
window.markIncomplete = async (taskId) => {
    try {
        await updateDoc(doc(db, 'tasks', taskId), { status: 'todo' });
        const task = tasks.find(t => t.id === taskId);
        if (task) task.status = 'todo';
        renderMyTasks(document.querySelector('.filter-btn.active').dataset.filter);
        renderBoard();
    } catch (error) {
        console.error('Error reopening task:', error);
        alert('Error reopening task: ' + error.message);
    }
};

// ==================== CALENDAR VIEW ====================
let currentDate = new Date();
let selectedDate = null;

const calendar = document.getElementById('calendar');
const currentMonthEl = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const selectedDateEl = document.getElementById('selectedDate');
const calendarTasksList = document.getElementById('calendarTasksList');

prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update month display
    currentMonthEl.textContent = new Date(year, month).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    // Clear calendar
    calendar.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        calendar.appendChild(header);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // Add previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayEl = createCalendarDay(day, month - 1, year, true);
        calendar.appendChild(dayEl);
    }
    
    // Add current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = createCalendarDay(day, month, year, false);
        calendar.appendChild(dayEl);
    }
    
    // Add next month days to fill grid
    const totalCells = calendar.children.length - 7; // Subtract headers
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
    for (let day = 1; day <= remainingCells; day++) {
        const dayEl = createCalendarDay(day, month + 1, year, true);
        calendar.appendChild(dayEl);
    }
    
    // Select today by default
    if (!selectedDate) {
        const today = new Date();
        if (today.getMonth() === month && today.getFullYear() === year) {
            selectedDate = today;
            showTasksForDate(today);
        }
    }
}

function createCalendarDay(day, month, year, isOtherMonth) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isOtherMonth) {
        dayEl.classList.add('other-month');
    }
    
    if (date.toDateString() === today.toDateString()) {
        dayEl.classList.add('today');
    }
    
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
        dayEl.classList.add('selected');
    }
    
    // Get tasks for this day
    const dayTasks = tasks.filter(t => {
        const taskDate = new Date(t.deadline);
        return taskDate.toDateString() === date.toDateString();
    });
    
    dayEl.innerHTML = `
        <div class="calendar-day-number">${day}</div>
        <div class="calendar-day-tasks">
            ${dayTasks.slice(0, 3).map(t => 
                `<div class="calendar-task-dot priority-${t.priority}"></div>`
            ).join('')}
            ${dayTasks.length > 3 ? `<div style="font-size: 10px; color: var(--gray);">+${dayTasks.length - 3} more</div>` : ''}
        </div>
    `;
    
    dayEl.addEventListener('click', () => {
        document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
        dayEl.classList.add('selected');
        selectedDate = date;
        showTasksForDate(date);
    });
    
    return dayEl;
}

function showTasksForDate(date) {
    selectedDateEl.textContent = date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
    });
    
    const dayTasks = tasks.filter(t => {
        const taskDate = new Date(t.deadline);
        return taskDate.toDateString() === date.toDateString();
    });
    
    calendarTasksList.innerHTML = '';
    
    if (dayTasks.length === 0) {
        calendarTasksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-check"></i>
                <p>No tasks scheduled for this day</p>
            </div>
        `;
        return;
    }
    
    dayTasks.forEach(task => {
        const category = categories.find(c => c.id === task.status);
        const taskItem = document.createElement('div');
        taskItem.className = `mytask-item priority-${task.priority}`;
        
        taskItem.innerHTML = `
            <div class="mytask-content">
                <div class="mytask-title">${escapeHtml(task.title)}</div>
                <div class="mytask-meta">
                    <div class="mytask-category">
                        <i class="${category ? category.icon : 'fas fa-folder'}"></i>
                        <span>${category ? category.name : 'Unknown'}</span>
                    </div>
                    <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                </div>
            </div>
            <div class="mytask-actions">
                <button class="btn-edit" onclick="editTask('${task.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteTask('${task.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        calendarTasksList.appendChild(taskItem);
    });
}


// ==================== NOTES FUNCTIONALITY ====================
let notes = [];
let currentNoteId = null;
let notesViewMode = 'grid'; // 'grid' or 'list'

const notesList = document.getElementById('notesList');
const noteModal = document.getElementById('noteModal');
const noteForm = document.getElementById('noteForm');
const addNoteBtn = document.getElementById('addNoteBtn');
const toggleNotesViewBtn = document.getElementById('toggleNotesView');
const noteModalTitle = document.getElementById('noteModalTitle');

// Add notes to views object
views.notes = document.getElementById('notesView');

// Load Notes
async function loadNotes() {
    if (!currentUser) return;

    console.log('Loading notes for user:', currentUser.uid);

    try {
        const q = query(
            collection(db, 'notes'),
            where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);

        notes = [];
        querySnapshot.forEach((doc) => {
            notes.push({ id: doc.id, ...doc.data() });
        });

        // Sort by updated date
        notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        console.log('Found', notes.length, 'notes');
    } catch (error) {
        console.error('Error loading notes:', error);
    }
}

// Render Notes
function renderNotes() {
    notesList.className = notesViewMode === 'grid' ? 'notes-grid' : 'notes-list';
    notesList.innerHTML = '';
    
    if (notes.length === 0) {
        notesList.innerHTML = `
            <div class="notes-empty">
                <i class="fas fa-sticky-note"></i>
                <h3>No notes yet</h3>
                <p>Create your first note to get started</p>
                <button class="btn-primary" onclick="document.getElementById('addNoteBtn').click()">
                    <i class="fas fa-plus"></i> Create Note
                </button>
            </div>
        `;
        return;
    }
    
    notes.forEach(note => {
        const noteCard = createNoteCard(note);
        notesList.appendChild(noteCard);
    });
}

// Create Note Card
function createNoteCard(note) {
    const card = document.createElement('div');
    card.className = `note-card color-${note.color || 'yellow'}`;
    
    const wordCount = note.content.trim().split(/\s+/).length;
    const updatedDate = new Date(note.updatedAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
    
    card.innerHTML = `
        <div class="note-card-header">
            <div class="note-title">${escapeHtml(note.title)}</div>
            <div class="note-actions">
                <button onclick="editNote('${note.id}'); event.stopPropagation();">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteNote('${note.id}'); event.stopPropagation();">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="note-content">${escapeHtml(note.content)}</div>
        <div class="note-footer">
            <div class="note-date">
                <i class="far fa-clock"></i>
                <span>${updatedDate}</span>
            </div>
            <div class="note-word-count">${wordCount} words</div>
        </div>
    `;
    
    // Click to view/edit
    card.addEventListener('click', () => {
        editNote(note.id);
    });
    
    return card;
}

// Toggle Notes View
toggleNotesViewBtn.addEventListener('click', () => {
    notesViewMode = notesViewMode === 'grid' ? 'list' : 'grid';
    
    if (notesViewMode === 'grid') {
        toggleNotesViewBtn.innerHTML = '<i class="fas fa-list"></i><span>List View</span>';
    } else {
        toggleNotesViewBtn.innerHTML = '<i class="fas fa-th-large"></i><span>Grid View</span>';
    }
    
    renderNotes();
});

// Open Note Modal
addNoteBtn.addEventListener('click', () => {
    currentNoteId = null;
    noteModalTitle.textContent = 'New Note';
    noteForm.reset();
    noteModal.style.display = 'block';
});

document.getElementById('cancelNoteBtn').addEventListener('click', () => {
    noteModal.style.display = 'none';
    currentNoteId = null;
});

// Add/Edit Note
noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser) {
        alert('Please login to save notes');
        return;
    }

    const noteData = {
        title: document.getElementById('noteTitle').value.trim(),
        content: document.getElementById('noteContent').value.trim(),
        color: document.querySelector('input[name="noteColor"]:checked').value,
        userId: currentUser.uid,
        updatedAt: new Date().toISOString()
    };

    try {
        if (currentNoteId) {
            // Update existing note
            await updateDoc(doc(db, 'notes', currentNoteId), noteData);
            console.log('Note updated successfully');
            
            const noteIndex = notes.findIndex(n => n.id === currentNoteId);
            if (noteIndex !== -1) {
                notes[noteIndex] = { ...notes[noteIndex], ...noteData };
            }
        } else {
            // Create new note
            noteData.createdAt = new Date().toISOString();
            const docRef = await addDoc(collection(db, 'notes'), noteData);
            console.log('Note created successfully with ID:', docRef.id);
            
            notes.unshift({ id: docRef.id, ...noteData });
        }
        
        noteModal.style.display = 'none';
        noteForm.reset();
        currentNoteId = null;
        renderNotes();
    } catch (error) {
        console.error('Error saving note:', error);
        alert('Error saving note: ' + error.message);
    }
});

// Edit Note
window.editNote = (noteId) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    currentNoteId = noteId;
    noteModalTitle.textContent = 'Edit Note';
    
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteContent').value = note.content;
    document.querySelector(`input[name="noteColor"][value="${note.color || 'yellow'}"]`).checked = true;
    
    noteModal.style.display = 'block';
};

// Delete Note
window.deleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
        await deleteDoc(doc(db, 'notes', noteId));
        notes = notes.filter(n => n.id !== noteId);
        renderNotes();
        console.log('Note deleted successfully');
    } catch (error) {
        console.error('Error deleting note:', error);
        alert('Error deleting note: ' + error.message);
    }
};

// Update view switching to include notes
const originalNavItemClick = navItems[0].onclick;
navItems.forEach(item => {
    const originalHandler = item.onclick;
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const viewName = item.dataset.view;
        
        // Update active nav item
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // Show selected view
        Object.values(views).forEach(view => view.classList.remove('active'));
        views[viewName].classList.add('active');
        
        // Load view data
        if (viewName === 'mytasks') {
            renderMyTasks('all');
        } else if (viewName === 'calendar') {
            renderCalendar();
        } else if (viewName === 'notes') {
            renderNotes();
        }
    });
});

// Note: initializeDashboard is already defined earlier, just need to update it to include loadNotes()


// Add Task buttons for other views
document.getElementById('addTaskBtnMyTasks')?.addEventListener('click', () => {
    taskModal.style.display = 'block';
    taskForm.reset();
});

document.getElementById('addTaskBtnCalendar')?.addEventListener('click', () => {
    taskModal.style.display = 'block';
    taskForm.reset();
});


// ==================== MOBILE MENU FUNCTIONALITY ====================
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const sidebar = document.querySelector('.sidebar');
let mobileOverlay = null;

// Create mobile overlay
function createMobileOverlay() {
    if (!mobileOverlay) {
        mobileOverlay = document.createElement('div');
        mobileOverlay.className = 'mobile-overlay';
        document.body.appendChild(mobileOverlay);
        
        mobileOverlay.addEventListener('click', closeMobileMenu);
    }
}

// Toggle mobile menu
function toggleMobileMenu() {
    if (window.innerWidth <= 600) {
        createMobileOverlay();
        sidebar.classList.toggle('mobile-open');
        mobileOverlay.classList.toggle('active');
        
        // Change icon
        const icon = mobileMenuToggle.querySelector('i');
        if (sidebar.classList.contains('mobile-open')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    }
}

// Close mobile menu
function closeMobileMenu() {
    if (sidebar.classList.contains('mobile-open')) {
        sidebar.classList.remove('mobile-open');
        if (mobileOverlay) {
            mobileOverlay.classList.remove('active');
        }
        const icon = mobileMenuToggle.querySelector('i');
        icon.className = 'fas fa-bars';
    }
}

// Event listeners
if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
}

// Close menu when clicking nav items on mobile
navItems.forEach(item => {
    item.addEventListener('click', () => {
        if (window.innerWidth <= 600) {
            closeMobileMenu();
        }
    });
});

// Close menu on window resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 600) {
            closeMobileMenu();
        }
    }, 250);
});

// Prevent body scroll when mobile menu is open
function updateBodyScroll() {
    if (sidebar.classList.contains('mobile-open')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

// Update on menu toggle
const observer = new MutationObserver(updateBodyScroll);
if (sidebar) {
    observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
}

// ==================== TOUCH IMPROVEMENTS ====================
// Improve touch scrolling for task board
if (taskBoard) {
    let isScrolling = false;
    let startX = 0;
    let scrollLeft = 0;
    
    taskBoard.addEventListener('touchstart', (e) => {
        isScrolling = true;
        startX = e.touches[0].pageX - taskBoard.offsetLeft;
        scrollLeft = taskBoard.scrollLeft;
    });
    
    taskBoard.addEventListener('touchmove', (e) => {
        if (!isScrolling) return;
        e.preventDefault();
        const x = e.touches[0].pageX - taskBoard.offsetLeft;
        const walk = (x - startX) * 2;
        taskBoard.scrollLeft = scrollLeft - walk;
    });
    
    taskBoard.addEventListener('touchend', () => {
        isScrolling = false;
    });
}

// ==================== RESPONSIVE UTILITIES ====================
// Detect screen size
function getScreenSize() {
    const width = window.innerWidth;
    if (width <= 360) return 'xs';
    if (width <= 600) return 'sm';
    if (width <= 768) return 'md';
    if (width <= 1024) return 'lg';
    if (width <= 1200) return 'xl';
    return 'xxl';
}

// Update layout on orientation change
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        renderBoard();
        if (views.notes.classList.contains('active')) {
            renderNotes();
        }
        if (views.calendar.classList.contains('active')) {
            renderCalendar();
        }
    }, 100);
});

// Optimize for mobile performance
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
}

console.log('Responsive features initialized');


// ==================== INVITE USER FUNCTIONALITY ====================

const inviteUserModal = document.getElementById('inviteUserModal');
const inviteUserForm = document.getElementById('inviteUserForm');
const inviteUserNav = document.getElementById('inviteUserNav');
const cancelInviteBtn = document.getElementById('cancelInviteBtn');

// Open invite modal
if (inviteUserNav) {
    inviteUserNav.addEventListener('click', (e) => {
        e.preventDefault();
        inviteUserModal.style.display = 'block';
        inviteUserForm.reset();
    });
}

// Close invite modal
if (cancelInviteBtn) {
    cancelInviteBtn.addEventListener('click', () => {
        inviteUserModal.style.display = 'none';
        inviteUserForm.reset();
    });
}

// Handle invite form submission
if (inviteUserForm) {
    inviteUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!currentUser) {
            alert('Please login to invite users');
            return;
        }

        const inviteEmail = document.getElementById('inviteEmail').value.trim();
        const inviteMessage = document.getElementById('inviteMessage').value.trim();

        // Validate email
        if (!inviteEmail || !inviteEmail.includes('@')) {
            alert('Please enter a valid email address');
            return;
        }

        // Check if inviting self
        if (inviteEmail.toLowerCase() === currentUser.email.toLowerCase()) {
            alert('You cannot invite yourself!');
            return;
        }

        try {
            // Create invite document in Firestore (using workspaceInvitations collection)
            const inviteData = {
                workspaceId: 'personal-workspace-' + currentUser.uid,
                workspaceName: 'Personal Workspace',
                invitedBy: currentUser.uid,
                inviterEmail: currentUser.email,
                inviterName: currentUser.displayName || currentUser.email,
                invitedEmail: inviteEmail.toLowerCase(),
                message: inviteMessage,
                role: 'member',
                status: 'pending',
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
            };

            const docRef = await addDoc(collection(db, 'workspaceInvitations'), inviteData);
            console.log('Invite created with ID:', docRef.id);

            // Show success message
            const modalBody = inviteUserModal.querySelector('.modal-body');
            const successMessage = document.createElement('div');
            successMessage.className = 'invite-success';
            successMessage.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <div>
                    <p><strong>Invite sent successfully!</strong></p>
                    <p>An invitation has been sent to ${escapeHtml(inviteEmail)}. They will receive instructions to join TaskFlow.</p>
                </div>
            `;
            
            // Insert success message at the top
            modalBody.insertBefore(successMessage, modalBody.firstChild);

            // Reset form
            inviteUserForm.reset();

            // Auto-close after 3 seconds
            setTimeout(() => {
                inviteUserModal.style.display = 'none';
                successMessage.remove();
            }, 3000);

        } catch (error) {
            console.error('Error sending invite:', error);
            alert('Error sending invite: ' + error.message);
        }
    });
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === inviteUserModal) {
        inviteUserModal.style.display = 'none';
        inviteUserForm.reset();
    }
});

// Close modal with X button
const inviteModalClose = inviteUserModal?.querySelector('.close');
if (inviteModalClose) {
    inviteModalClose.addEventListener('click', () => {
        inviteUserModal.style.display = 'none';
        inviteUserForm.reset();
    });
}

console.log('Invite user functionality loaded');

// ==================== MOVE TASK TO SHARED WORKSPACE ====================

let taskToMove = null;

// Show Move to Workspace Modal
window.showMoveToWorkspaceModal = async function(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        console.error('Task not found:', taskId);
        return;
    }
    
    taskToMove = task;
    
    // Get shared workspaces
    const sharedWorkspaces = window.sharedWorkspaceSystem?.getSharedWorkspaces() || [];
    
    if (sharedWorkspaces.length === 0) {
        alert('You don\'t have any shared workspaces yet. Accept an invitation to create a shared workspace first.');
        return;
    }
    
    // Show modal
    const modal = document.getElementById('moveToWorkspaceModal');
    const taskPreview = document.getElementById('moveTaskPreview');
    const workspaceList = document.getElementById('workspaceSelectionList');
    
    // Show task preview
    taskPreview.innerHTML = `
        <div class="task-preview-card">
            <div class="task-preview-title">${escapeHtml(task.title)}</div>
            <div class="task-preview-meta">
                <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                <span class="task-preview-date">
                    <i class="far fa-calendar"></i> ${formatDate(task.deadline)}
                </span>
            </div>
        </div>
    `;
    
    // Render workspace list
    workspaceList.innerHTML = '';
    sharedWorkspaces.forEach(workspace => {
        const workspaceCard = document.createElement('div');
        workspaceCard.className = 'workspace-selection-card';
        
        const memberCount = workspace.members ? workspace.members.length : 0;
        const initials = workspace.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
        
        workspaceCard.innerHTML = `
            <div class="workspace-selection-header">
                <div class="workspace-selection-avatar">${initials}</div>
                <div class="workspace-selection-info">
                    <div class="workspace-selection-name">${escapeHtml(workspace.name)}</div>
                    <div class="workspace-selection-meta">${memberCount} member${memberCount !== 1 ? 's' : ''}</div>
                </div>
            </div>
            <button class="btn-select-workspace" onclick="moveTaskToWorkspace('${workspace.id}')">
                <i class="fas fa-arrow-right"></i> Move Here
            </button>
        `;
        
        workspaceList.appendChild(workspaceCard);
    });
    
    modal.style.display = 'block';
};

// Move Task to Workspace
window.moveTaskToWorkspace = async function(workspaceId) {
    if (!taskToMove) {
        console.error('No task selected to move');
        return;
    }
    
    try {
        console.log('🔄 Moving task to workspace:', workspaceId);
        
        // Get workspace info
        const sharedWorkspaces = window.sharedWorkspaceSystem?.getSharedWorkspaces() || [];
        const workspace = sharedWorkspaces.find(ws => ws.id === workspaceId);
        
        if (!workspace) {
            throw new Error('Workspace not found');
        }
        
        // Create shared task data
        const sharedTaskData = {
            workspace_id: workspaceId,
            title: taskToMove.title,
            description: taskToMove.description || '',
            category: taskToMove.category || 'todo',
            priority: taskToMove.priority || 'medium',
            deadline: taskToMove.deadline,
            status: taskToMove.status || 'todo',
            created_by: currentUser.uid,
            created_by_name: currentUser.displayName || currentUser.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            updated_by: currentUser.uid
        };
        
        // Add to shared workspace
        const docRef = await addDoc(collection(db, 'sharedTasks'), sharedTaskData);
        console.log('✅ Task added to shared workspace:', docRef.id);
        
        // Delete from personal tasks
        await deleteDoc(doc(db, 'tasks', taskToMove.id));
        console.log('✅ Task removed from personal workspace');
        
        // Update local tasks array
        tasks = tasks.filter(t => t.id !== taskToMove.id);
        
        // Close modal
        const modal = document.getElementById('moveToWorkspaceModal');
        modal.style.display = 'none';
        
        // Refresh board
        renderBoard();
        
        // Show success message
        showMoveSuccessToast(workspace.name);
        
        // Reset
        taskToMove = null;
        
    } catch (error) {
        console.error('❌ Error moving task:', error);
        alert('Failed to move task: ' + error.message);
    }
};

// Show success toast
function showMoveSuccessToast(workspaceName) {
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
        <span>Task moved to "${escapeHtml(workspaceName)}" successfully!</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Setup modal close handlers
document.addEventListener('DOMContentLoaded', () => {
    const moveModal = document.getElementById('moveToWorkspaceModal');
    const cancelMoveBtn = document.getElementById('cancelMoveBtn');
    
    if (cancelMoveBtn) {
        cancelMoveBtn.addEventListener('click', () => {
            moveModal.style.display = 'none';
            taskToMove = null;
        });
    }
    
    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === moveModal) {
            moveModal.style.display = 'none';
            taskToMove = null;
        }
    });
    
    // Close button
    const closeBtn = moveModal?.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            moveModal.style.display = 'none';
            taskToMove = null;
        });
    }
});

// Export functions for global access
window.loadTasks = loadTasks;
window.renderBoard = renderBoard;
window.renderNotes = renderNotes;
