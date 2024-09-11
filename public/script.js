document.getElementById('todoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const priority = document.getElementById('priority').value; // Capture priority value
    await fetch('/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, priority: parseInt(priority) }) // Ensure priority is treated as a number
    });
    document.getElementById('title').value = '';
    document.getElementById('priority').value = ''; // Clear the priority selection
    loadTodos();
});
// Add event listener for the theme toggle switch
document.getElementById('themeToggle').addEventListener('change', function() {
    document.body.classList.toggle('dark-mode', this.checked);
    // Save the user's preference in localStorage
    localStorage.setItem('dark-mode', this.checked ? 'enabled' : 'disabled');
});

// Load the user's preference on page load
window.addEventListener('DOMContentLoaded', () => {
    const darkModePreference = localStorage.getItem('dark-mode');
    if (darkModePreference === 'enabled') {
        document.body.classList.add('dark-mode');
        document.getElementById('themeToggle').checked = true;
    }
});


async function loadTodos() {
    const response = await fetch('/todos');
    const todos = await response.json();
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';
    
    // Sort todos based on priority (higher priority first)
    todos.sort((a, b) => b.priority - a.priority).forEach(todo => {
        const li = document.createElement('li');
        li.className = todo.completed ? 'completed' : '';
        
        // Only display priority label if it's "Medium" (2) or "High" (3)
        const priorityBadge = todo.priority === 2 ? 'Medium' : todo.priority === 3 ? 'High' : '';
        const priorityClass = todo.priority === 2 ? 'priority-2' : todo.priority === 3 ? 'priority-3' : '';

        li.innerHTML = `
            <span class="checkbox ${todo.completed ? 'checked' : ''}" data-id="${todo.id}">
                <img src="icons/check-mark.png" alt="Checkmark" />
            </span>
            <span class="todo-text">${todo.title}</span>
            ${priorityBadge ? `<span class="priority-badge ${priorityClass}">${priorityBadge}</span>` : ''}
            <span class="delete-icon" data-id="${todo.id}">
                <img src="icons/dustbin.png" alt="Trash Icon" />
            </span>
        `;
        todoList.appendChild(li);
    });

    addEventListeners();
}

function addEventListeners() {
    document.querySelectorAll('.checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', toggleTodo);
    });
    document.querySelectorAll('.delete-icon').forEach(deleteIcon => {
        deleteIcon.addEventListener('click', deleteTodo);
    });
}

async function toggleTodo(event) {
    const id = event.target.getAttribute('data-id');
    const completed = !event.target.classList.contains('checked');
    await updateTodo(id, { completed });
}

async function updateTodo(id, updates) {
    try {
        const response = await fetch(`/todos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (response.ok) {
            loadTodos();
        } else {
            console.error('Failed to update todo');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function deleteTodo(event) {
    const id = event.target.closest('.delete-icon').getAttribute('data-id');
    try {
        const response = await fetch(`/todos/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            loadTodos();
        } else {
            console.error('Failed to delete todo');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

loadTodos();
