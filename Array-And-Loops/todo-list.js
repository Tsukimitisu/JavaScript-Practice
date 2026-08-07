const storageKey = 'todo-list';
const todoList = loadTodoList();
const formElement = document.querySelector('.js-todo-form');
const inputElement = document.querySelector('.js-input');
const listElement = document.querySelector('.js-todo-list');
const summaryElement = document.querySelector('.js-todo-summary');
const clearCompletedButton = document.querySelector('.js-clear-completed');
let editingIndex = null;

function loadTodoList() {
    try {
        const savedTodos = JSON.parse(localStorage.getItem(storageKey));
        if (!Array.isArray(savedTodos)) {
            return [];
        }

        return savedTodos.flatMap((todo) => {
            if (typeof todo === 'string') {
                return [{ name: todo, completed: false }];
            }

            if (typeof todo?.name === 'string') {
                return [{
                    name: todo.name,
                    completed: Boolean(todo.completed)
                }];
            }

            return [];
        });
    } catch {
        return [];
    }
}

function saveTodoList() {
    localStorage.setItem(storageKey, JSON.stringify(todoList));
}

function renderTodoList() {
    listElement.replaceChildren();

    todoList.forEach((todo, index) => {
        const itemElement = document.createElement('li');

        if (editingIndex === index) {
            const editForm = document.createElement('form');
            const editInput = document.createElement('input');
            const saveButton = document.createElement('button');
            const cancelButton = document.createElement('button');

            editInput.value = todo.name;
            editInput.required = true;
            editInput.setAttribute('aria-label', `Edit ${todo.name}`);

            saveButton.type = 'submit';
            saveButton.textContent = 'Save';

            cancelButton.type = 'button';
            cancelButton.textContent = 'Cancel';
            cancelButton.addEventListener('click', () => {
                editingIndex = null;
                renderTodoList();
            });

            editForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const updatedName = editInput.value.trim();

                if (!updatedName) {
                    return;
                }

                todo.name = updatedName;
                editingIndex = null;
                saveTodoList();
                renderTodoList();
            });

            editForm.append(editInput, ' ', saveButton, ' ', cancelButton);
            itemElement.append(editForm);
            listElement.append(itemElement);
            editInput.focus();
            return;
        }

        const completedInput = document.createElement('input');
        const todoText = document.createElement('span');
        const editButton = document.createElement('button');
        const removeButton = document.createElement('button');

        completedInput.type = 'checkbox';
        completedInput.checked = todo.completed;
        completedInput.setAttribute('aria-label', `Mark ${todo.name} as complete`);
        completedInput.addEventListener('change', () => {
            todo.completed = completedInput.checked;
            saveTodoList();
            renderTodoList();
        });

        todoText.textContent = todo.name;
        if (todo.completed) {
            todoText.style.textDecoration = 'line-through';
        }

        editButton.type = 'button';
        editButton.textContent = 'Edit';
        editButton.setAttribute('aria-label', `Edit ${todo.name}`);
        editButton.addEventListener('click', () => {
            editingIndex = index;
            renderTodoList();
        });

        removeButton.type = 'button';
        removeButton.textContent = 'Remove';
        removeButton.setAttribute('aria-label', `Remove ${todo.name}`);
        removeButton.addEventListener('click', () => {
            todoList.splice(index, 1);
            saveTodoList();
            renderTodoList();
        });

        itemElement.append(completedInput, ' ', todoText, ' ', editButton, ' ', removeButton);
        listElement.append(itemElement);
    });

    const remainingCount = todoList.filter((todo) => !todo.completed).length;
    summaryElement.textContent = `${remainingCount} ${remainingCount === 1 ? 'task' : 'tasks'} remaining`;
    clearCompletedButton.disabled = !todoList.some((todo) => todo.completed);
}

clearCompletedButton.addEventListener('click', () => {
    const activeTodos = todoList.filter((todo) => !todo.completed);
    todoList.splice(0, todoList.length, ...activeTodos);
    saveTodoList();
    renderTodoList();
});

formElement.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = inputElement.value.trim();

    if (!name) {
        return;
    }

    todoList.push({ name, completed: false });
    saveTodoList();
    renderTodoList();
    formElement.reset();
    inputElement.focus();
});

renderTodoList();
