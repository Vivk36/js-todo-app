// DOM Elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const taskList = document.getElementById('taskList');
const filterButtons = document.querySelectorAll('.filter-btn');
const totalTasksEl = document.getElementById('totalTasks');
const pendingTasksEl = document.getElementById('pendingTasks');
const completedTasksEl = document.getElementById('completedTasks');

// State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// Initialize app
function init() {
    updateYear();
    renderTasks();
    updateStats();
    setupEventListeners();
}

// Update current year in footer
function updateYear() {
    document.getElementById('currentYear').textContent = new Date().getFullYear();
}

// Setup event listeners
function setupEventListeners() {
    // Add task
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Clear all tasks
    clearAllBtn.addEventListener('click', clearAllTasks);

    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
}

// Add new task
function addTask() {
    const text = taskInput.value.trim();
    
    if (!text) {
        showNotification('Please enter a task!', 'error');
        return;
    }

    if (text.length > 100) {
        showNotification('Task is too long! Max 100 characters.', 'error');
        return;
    }

    const newTask = {
        id: Date.now().toString(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
    saveTasks();
    renderTasks();
    updateStats();
    
    taskInput.value = '';
    taskInput.focus();
    
    showNotification('Task added successfully!', 'success');
}

// Toggle task completion
function toggleTask(id) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        renderTasks();
        updateStats();
        
        const status = tasks[taskIndex].completed ? 'completed' : 'marked as pending';
        showNotification(`Task ${status}!`, 'info');
    }
}

// Delete task
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
        updateStats();
        showNotification('Task deleted!', 'info');
    }
}

// Clear all tasks
function clearAllTasks() {
    if (tasks.length === 0) {
        showNotification('No tasks to clear!', 'info');
        return;
    }

    if (confirm('Are you sure you want to delete ALL tasks?')) {
        tasks = [];
        saveTasks();
        renderTasks();
        updateStats();
        showNotification('All tasks cleared!', 'info');
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Render tasks based on current filter
function renderTasks() {
    // Filter tasks
    let filteredTasks = tasks;
    if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    // Clear task list
    taskList.innerHTML = '';

    // Show empty state if no tasks
    if (filteredTasks.length === 0) {
        const emptyState = document.createElement('li');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fas fa-clipboard-list"></i>
            <p>No ${currentFilter === 'all' ? '' : currentFilter} tasks found</p>
        `;
        taskList.appendChild(emptyState);
        return;
    }

    // Create task elements
    filteredTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.dataset.id = task.id;
        
        // Format date
        const date = new Date(task.createdAt);
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        taskItem.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'completed' : ''}" onclick="toggleTask('${task.id}')"></div>
            <div class="task-content">
                ${task.text}
                <small style="display: block; color: #6b7280; margin-top: 5px;">
                    <i class="far fa-clock"></i> ${formattedDate}
                </small>
            </div>
            <div class="task-actions">
                <button class="delete-btn" onclick="deleteTask('${task.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Add click event for the entire task item
        taskItem.addEventListener('click', (e) => {
            if (!e.target.closest('.task-checkbox') && !e.target.closest('.delete-btn')) {
                toggleTask(task.id);
            }
        });

        taskList.appendChild(taskItem);
    });
}

// Update statistics
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;

    totalTasksEl.textContent = `Total: ${total}`;
    pendingTasksEl.textContent = `Pending: ${pending}`;
    completedTasksEl.textContent = `Completed: ${completed}`;
}

// Show notification
function showNotification(message, type) {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                type === 'error' ? 'fa-exclamation-circle' : 
                'fa-info-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;

    // Add to body
    document.body.appendChild(notification);

    // Add notification styles
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 10px;
                color: white;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 10px;
                animation: slideIn 0.3s ease;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .notification.success {
                background: #10b981;
            }
            
            .notification.error {
                background: #ef4444;
            }
            
            .notification.info {
                background: #3b82f6;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Export functions for global access
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
