const storageKey = 'todo-list';
const todoList = loadTodoList();
const formElement = document.querySelector('.js-todo-form');
const inputElement = document.querySelector('.js-input');
const listElement = document.querySelector('.js-todo-list');

function loadTodoList() {
    try {
        const savedTodos = JSON.parse(localStorage.getItem(storageKey));
        return Array.isArray(savedTodos)
            ? savedTodos.filter((todo) => typeof todo === 'string')
            : [];
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
        const removeButton = document.createElement('button');

        itemElement.append(todo, ' ');
        removeButton.type = 'button';
        removeButton.textContent = 'Remove';
        removeButton.setAttribute('aria-label', `Remove ${todo}`);
        removeButton.addEventListener('click', () => {
            todoList.splice(index, 1);
            saveTodoList();
            renderTodoList();
        });

        itemElement.append(removeButton);
        listElement.append(itemElement);
    });
}

formElement.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = inputElement.value.trim();

    if (!name) {
        return;
    }

    todoList.push(name);
    saveTodoList();
    renderTodoList();
    formElement.reset();
    inputElement.focus();
});

renderTodoList();
