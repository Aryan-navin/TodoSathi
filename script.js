// Language translations
const translations = {
    en: {
        appTitle: '📋 TodoSathi',
        newBoard: '➕ New Board',
        undoDelete: '↩️ Undo Delete',
        noBoardsTitle: 'No boards yet!',
        noBoardsDesc: 'Create your first board to get started with organizing your tasks.',
        createBoard: 'Create Board',
        boardName: 'Board Name',
        createTask: 'Create New Task',
        editTask: 'Edit Task',
        taskTitle: 'Task Title',
        taskDescription: 'Description',
        dueDate: 'Due Date',
        priority: 'Priority',
        priorityLow: 'Low',
        priorityMedium: 'Medium',
        priorityHigh: 'High',
        saveTask: 'Save Task',
        addTask: 'Add Task',
        deleteBoard: 'Delete Board',
        boardCreated: 'Board created successfully!',
        boardDeleted: 'Board deleted successfully!',
        taskCreated: 'Task created successfully!',
        taskUpdated: 'Task updated successfully!',
        taskDeleted: 'Task deleted successfully!',
        undoSuccess: 'Action undone successfully!',
        noUndoAvailable: 'No actions to undo!',
        notificationTitle: 'Task Added!',
        due: 'Due:'
    },
    hi: {
        appTitle: '📋 टू-डू साथी',
        newBoard: '➕ नया बोर्ड',
        undoDelete: '↩️ पूर्ववत करें',
        noBoardsTitle: 'अभी तक कोई बोर्ड नहीं!',
        noBoardsDesc: 'अपने कार्यों को व्यवस्थित करने के लिए पहला बोर्ड बनाएं।',
        createBoard: 'बोर्ड बनाएं',
        boardName: 'बोर्ड का नाम',
        createTask: 'नया कार्य बनाएं',
        editTask: 'कार्य संपादित करें',
        taskTitle: 'कार्य शीर्षक',
        taskDescription: 'विवरण',
        dueDate: 'नियत तारीख',
        priority: 'प्राथमिकता',
        priorityLow: 'कम',
        priorityMedium: 'मध्यम',
        priorityHigh: 'उच्च',
        saveTask: 'कार्य सहेजें',
        addTask: 'कार्य जोड़ें',
        deleteBoard: 'बोर्ड हटाएं',
        boardCreated: 'बोर्ड सफलतापूर्वक बनाया गया!',
        boardDeleted: 'बोर्ड सफलतापूर्वक हटाया गया!',
        taskCreated: 'कार्य सफलतापूर्वक बनाया गया!',
        taskUpdated: 'कार्य सफलतापूर्वक अपडेट किया गया!',
        taskDeleted: 'कार्य सफलतापूर्वक हटाया गया!',
        undoSuccess: 'कार्य सफलतापूर्वक पूर्ववत किया गया!',
        noUndoAvailable: 'पूर्ववत करने के लिए कोई कार्य नहीं!',
        notificationTitle: 'कार्य जोड़ा गया!',
        due: 'नियत:'
    }
};

// Global state
let boards = [];
let currentLang = 'en';
let currentTheme = 'light';
let editingTask = null;
let editingBoard = null;
let lastDeleted = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
    loadData();
    renderBoards();
    requestNotificationPermission();
});

// Theme management
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', currentTheme);
    document.querySelector('.theme-toggle').textContent = currentTheme === 'light' ? '🌙' : '☀️';
    saveData();
}

// Language management
function changeLanguage(lang) {
    currentLang = lang;
    updateLanguage();
    saveData();
}

function updateLanguage() {
    const elements = document.querySelectorAll('[data-lang]');
    elements.forEach(element => {
        const key = element.getAttribute('data-lang');
        if (translations[currentLang][key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translations[currentLang][key];
            } else {
                element.textContent = translations[currentLang][key];
            }
        }
    });
}

// Board management
function openBoardModal() {
    document.getElementById('boardModal').style.display = 'block';
    document.getElementById('boardName').focus();
}

function closeBoardModal() {
    document.getElementById('boardModal').style.display = 'none';
    document.getElementById('boardName').value = '';
}

function createBoard(event) {
    event.preventDefault();
    const name = document.getElementById('boardName').value.trim();

    if (!name) return;

    const board = {
        id: Date.now(),
        name: name,
        tasks: [],
        createdAt: new Date().toISOString()
    };

    boards.push(board);
    saveData();
    renderBoards();
    closeBoardModal();
    showToast(translations[currentLang].boardCreated, 'success');
}

function deleteBoard(boardId) {
    const boardIndex = boards.findIndex(b => b.id === boardId);
    if (boardIndex !== -1) {
        lastDeleted = {
            type: 'board',
            data: boards[boardIndex]
        };
        boards.splice(boardIndex, 1);
        saveData();
        renderBoards();
        showToast(translations[currentLang].boardDeleted, 'success');
    }
}

// Task management
function openTaskModal(boardId) {
    editingBoard = boardId;
    editingTask = null;
    document.getElementById('taskModalTitle').textContent = translations[currentLang].createTask;
    document.getElementById('taskModal').style.display = 'block';
    document.getElementById('taskTitle').focus();
}

function editTask(boardId, taskId) {
    const board = boards.find(b => b.id === boardId);
    const task = board.tasks.find(t => t.id === taskId);

    editingBoard = boardId;
    editingTask = taskId;

    document.getElementById('taskModalTitle').textContent = translations[currentLang].editTask;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description;
    document.getElementById('taskDueDate').value = task.dueDate;
    document.getElementById('taskPriority').value = task.priority;

    document.getElementById('taskModal').style.display = 'block';
}

function closeTaskModal() {
    document.getElementById('taskModal').style.display = 'none';
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskDueDate').value = '';
    document.getElementById('taskPriority').value = 'low';
    editingTask = null;
    editingBoard = null;
}

function saveTask(event) {
    event.preventDefault();

    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const dueDate = document.getElementById('taskDueDate').value;
    const priority = document.getElementById('taskPriority').value;

    if (!title) return;

    const board = boards.find(b => b.id === editingBoard);

    if (editingTask) {
        // Update existing task
        const task = board.tasks.find(t => t.id === editingTask);
        task.title = title;
        task.description = description;
        task.dueDate = dueDate;
        task.priority = priority;
        task.updatedAt = new Date().toISOString();

        showToast(translations[currentLang].taskUpdated, 'success');
    } else {
        // Create new task
        const task = {
            id: Date.now(),
            title: title,
            description: description,
            dueDate: dueDate,
            priority: priority,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        board.tasks.push(task);
        showNotification(title);
        showToast(translations[currentLang].taskCreated, 'success');
    }

    saveData();
    renderBoards();
    closeTaskModal();
}

function deleteTask(boardId, taskId) {
    const board = boards.find(b => b.id === boardId);
    const taskIndex = board.tasks.findIndex(t => t.id === taskId);

    if (taskIndex !== -1) {
        lastDeleted = {
            type: 'task',
            data: board.tasks[taskIndex],
            boardId: boardId
        };
        board.tasks.splice(taskIndex, 1);
        saveData();
        renderBoards();
        showToast(translations[currentLang].taskDeleted, 'success');
    }
}

// Undo functionality
function undoDelete() {
    if (!lastDeleted) {
        showToast(translations[currentLang].noUndoAvailable, 'warning');
        return;
    }

    if (lastDeleted.type === 'board') {
        boards.push(lastDeleted.data);
    } else if (lastDeleted.type === 'task') {
        const board = boards.find(b => b.id === lastDeleted.boardId);
        if (board) {
            board.tasks.push(lastDeleted.data);
        }
    }

    lastDeleted = null;
    saveData();
    renderBoards();
    showToast(translations[currentLang].undoSuccess, 'success');
}

// Drag and drop functionality
let draggedElement = null;
let draggedTask = null;
let draggedBoard = null;

function handleDragStart(e) {
    draggedElement = e.target;
    draggedElement.classList.add('dragging');

    if (e.target.classList.contains('task-item')) {
        draggedTask = {
            boardId: parseInt(e.target.closest('.board').dataset.boardId),
            taskId: parseInt(e.target.dataset.taskId)
        };
    } else if (e.target.classList.contains('board')) {
        draggedBoard = parseInt(e.target.dataset.boardId);
    }
}

function handleDragEnd(e) {
    if (draggedElement) {
        draggedElement.classList.remove('dragging');
    }
    draggedElement = null;
    draggedTask = null;
    draggedBoard = null;

    // Remove drag-over class from all elements
    document.querySelectorAll('.drag-over').forEach(el => {
        el.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();

    if (draggedTask) {
        const targetBoard = e.target.closest('.board');
        if (targetBoard) {
            const targetBoardId = parseInt(targetBoard.dataset.boardId);
            moveTask(draggedTask.boardId, draggedTask.taskId, targetBoardId);
        }
    } else if (draggedBoard) {
        const targetBoard = e.target.closest('.board');
        if (targetBoard && targetBoard.dataset.boardId !== draggedBoard.toString()) {
            const targetBoardId = parseInt(targetBoard.dataset.boardId);
            moveBoardPosition(draggedBoard, targetBoardId);
        }
    }
}

function moveTask(fromBoardId, taskId, toBoardId) {
    const fromBoard = boards.find(b => b.id === fromBoardId);
    const toBoard = boards.find(b => b.id === toBoardId);
    const taskIndex = fromBoard.tasks.findIndex(t => t.id === taskId);

    if (taskIndex !== -1) {
        const task = fromBoard.tasks.splice(taskIndex, 1)[0];
        toBoard.tasks.push(task);
        saveData();
        renderBoards();
    }
}

function moveBoardPosition(fromBoardId, toBoardId) {
    const fromIndex = boards.findIndex(b => b.id === fromBoardId);
    const toIndex = boards.findIndex(b => b.id === toBoardId);

    if (fromIndex !== -1 && toIndex !== -1) {
        const board = boards.splice(fromIndex, 1)[0];
        boards.splice(toIndex, 0, board);
        saveData();
        renderBoards();
    }
}

// Notification functionality
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function showNotification(taskTitle) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(translations[currentLang].notificationTitle, {
            body: taskTitle,
            icon: '📋'
        });
    }
}

// Rendering functions
function renderBoards() {
    const container = document.getElementById('boardsContainer');
    const emptyState = document.getElementById('emptyState');

    if (boards.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    container.innerHTML = boards.map(board => `
                <div class="board" data-board-id="${board.id}" draggable="true" 
                     ondragstart="handleDragStart(event)"
                     ondragend="handleDragEnd(event)"
                     ondragover="handleDragOver(event)"
                     ondrop="handleDrop(event)">
                    <div class="board-header">
                        <div class="board-title">${board.name}</div>
                        <div class="board-actions">
                            <span class="board-count">${board.tasks.length}</span>
                            <button class="btn btn-danger" onclick="deleteBoard(${board.id})" 
                                    title="${translations[currentLang].deleteBoard}">🗑️</button>
                        </div>
                    </div>
                    <div class="task-list" ondragover="handleDragOver(event)" ondrop="handleDrop(event)">
                        ${board.tasks.map(task => `
                            <div class="task-item" data-task-id="${task.id}" draggable="true"
                                 ondragstart="handleDragStart(event)"
                                 ondragend="handleDragEnd(event)">
                                <div class="task-header">
                                    <div class="task-title">${task.title}</div>
                                    <div class="task-priority priority-${task.priority}">
                                        ${translations[currentLang]['priority' + task.priority.charAt(0).toUpperCase() + task.priority.slice(1)]}
                                    </div>
                                </div>
                                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                                <div class="task-meta">
                                    <div>
                                        ${task.dueDate ? `<span class="task-due">${translations[currentLang].due} ${formatDate(task.dueDate)}</span>` : ''}
                                        <div style="font-size: 0.7rem; margin-top: 0.25rem;">
                                            Created: ${formatDate(task.createdAt)}
                                        </div>
                                    </div>
                                    <div class="task-actions">
                                        <button class="task-action" onclick="editTask(${board.id}, ${task.id})" title="Edit">✏️</button>
                                        <button class="task-action" onclick="deleteTask(${board.id}, ${task.id})" title="Delete">🗑️</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="add-task-btn" onclick="openTaskModal(${board.id})">
                        ➕ ${translations[currentLang].addTask}
                    </button>
                </div>
            `).join('');
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLang === 'hi' ? 'hi-IN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// Data persistence
function saveData() {
    const data = {
        boards: boards,
        currentLang: currentLang,
        currentTheme: currentTheme,
        lastDeleted: lastDeleted
    };
    // Using in-memory storage for this demo
    window.appData = data;
}

function loadData() {
    const data = window.appData || {};
    boards = data.boards || [];
    currentLang = data.currentLang || 'en';
    currentTheme = data.currentTheme || 'light';
    lastDeleted = data.lastDeleted || null;

    // Apply theme
    document.body.setAttribute('data-theme', currentTheme);
    document.querySelector('.theme-toggle').textContent = currentTheme === 'light' ? '🌙' : '☀️';

    // Apply language
    document.querySelector('.lang-select').value = currentLang;
    updateLanguage();
}

// Task sorting functionality
function sortTasks(boardId, sortBy) {
    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    switch (sortBy) {
        case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            board.tasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
            break;
        case 'dueDate':
            board.tasks.sort((a, b) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            });
            break;
        case 'created':
            board.tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'alphabetical':
            board.tasks.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }

    saveData();
    renderBoards();
}

// Enhanced drag and drop with visual feedback
document.addEventListener('dragenter', function (e) {
    if (e.target.classList.contains('task-list') || e.target.classList.contains('board')) {
        e.target.classList.add('drag-over');
    }
});

document.addEventListener('dragleave', function (e) {
    if (e.target.classList.contains('task-list') || e.target.classList.contains('board')) {
        e.target.classList.remove('drag-over');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'n':
                e.preventDefault();
                openBoardModal();
                break;
            case 'z':
                e.preventDefault();
                undoDelete();
                break;
            case 't':
                e.preventDefault();
                toggleTheme();
                break;
        }
    }

    if (e.key === 'Escape') {
        closeBoardModal();
        closeTaskModal();
    }
});

// Click outside to close modals
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal')) {
        closeBoardModal();
        closeTaskModal();
    }
});

// Auto-save functionality
setInterval(saveData, 20000); // Auto-save every 30 seconds

// Initialize with demo data if empty
if (boards.length === 0) {
    boards = [
        {
            id: 1,
            name: 'Personal Tasks',
            tasks: [
                {
                    id: 1,
                    title: 'Buy groceries',
                    description: 'Get milk, bread, and eggs from the store',
                    dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
                    priority: 'medium',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                
            ],
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            name: 'Work Projects',
            tasks: [
                {
                    id: 3,
                    title: 'Complete project proposal',
                    description: 'Finalize the Q4 project proposal document',
                    dueDate: new Date(Date.now() + 172800000).toISOString().slice(0, 16),
                    priority: 'high',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ],
            createdAt: new Date().toISOString()
        }
    ];
    saveData();
}