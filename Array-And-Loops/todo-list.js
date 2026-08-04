const storageKey = 'todo-list';
const todoList = loadTodoList();
const formElement = document.querySelector('.js-todo-form');
const inputElement = document.querySelector('.js-input');
const listElement = document.querySelector('.js-todo-list');
const summaryElement = document.querySelector('.js-todo-summary');
const clearCompletedButton = document.querySelector('.js-clear-completed');

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
        const completedInput = document.createElement('input');
        const todoText = document.createElement('span');
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

        removeButton.type = 'button';
        removeButton.textContent = 'Remove';
        removeButton.setAttribute('aria-label', `Remove ${todo.name}`);
        removeButton.addEventListener('click', () => {
            todoList.splice(index, 1);
            saveTodoList();
            renderTodoList();
        });

        itemElement.append(completedInput, ' ', todoText, ' ', removeButton);
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
