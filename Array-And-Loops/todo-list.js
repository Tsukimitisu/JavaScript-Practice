const storageKey = 'todo-list';
const filterStorageKey = 'todo-list-filter';
const maxTodoLength = 100;
const todoList = loadTodoList();
const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric'
});
const formElement = document.querySelector('.js-todo-form');
const inputElement = document.querySelector('.js-input');
const dueDateElement = document.querySelector('.js-due-date');
const messageElement = document.querySelector('.js-todo-message');
const listElement = document.querySelector('.js-todo-list');
const summaryElement = document.querySelector('.js-todo-summary');
const filterElement = document.querySelector('.js-todo-filter');
const searchElement = document.querySelector('.js-todo-search');
const toggleAllButton = document.querySelector('.js-toggle-all');
const clearCompletedButton = document.querySelector('.js-clear-completed');
const todoCountElement = document.querySelector('.js-todo-count');
let editingIndex = null;

const savedFilter = localStorage.getItem(filterStorageKey);
if (['all', 'active', 'completed'].includes(savedFilter)) {
    filterElement.value = savedFilter;
}

function loadTodoList() {
    try {
        const savedTodos = JSON.parse(localStorage.getItem(storageKey));
        if (!Array.isArray(savedTodos)) {
            return [];
        }

        return savedTodos.flatMap((todo) => {
            if (typeof todo === 'string') {
                return [{ name: todo, completed: false, createdAt: new Date().toISOString() }];
            }

            if (typeof todo?.name === 'string') {
                return [{
                    name: todo.name,
                    completed: Boolean(todo.completed),
                    createdAt: typeof todo.createdAt === 'string'
                        ? todo.createdAt
                        : new Date().toISOString(),
                    dueDate: typeof todo.dueDate === 'string' ? todo.dueDate : ''
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

function isDuplicateTodo(name, excludedIndex = -1) {
    const normalizedName = name.toLocaleLowerCase();

    return todoList.some((todo, index) =>
        index !== excludedIndex && todo.name.toLocaleLowerCase() === normalizedName
    );
}

function renderTodoList() {
    listElement.replaceChildren();
    const searchQuery = searchElement.value.trim().toLocaleLowerCase();

    const visibleTodos = todoList
        .map((todo, index) => ({ todo, index }))
        .filter(({ todo }) => {
            const matchesFilter = filterElement.value === 'all' ||
                (filterElement.value === 'active' && !todo.completed) ||
                (filterElement.value === 'completed' && todo.completed);
            const matchesSearch = todo.name.toLocaleLowerCase().includes(searchQuery);

            return matchesFilter && matchesSearch;
        });

    if (visibleTodos.length === 0) {
        const emptyItem = document.createElement('li');
        const emptyMessages = {
            all: 'No tasks yet. Add one above.',
            active: 'No active tasks.',
            completed: 'No completed tasks.'
        };

        emptyItem.textContent = searchQuery
            ? `No tasks match "${searchElement.value.trim()}".`
            : emptyMessages[filterElement.value];
        listElement.append(emptyItem);
    }

    visibleTodos.forEach(({ todo, index }, visibleIndex) => {
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

            editForm.addEventListener('keydown', (event) => {
                if (event.key !== 'Escape') {
                    return;
                }

                event.preventDefault();
                editingIndex = null;
                messageElement.textContent = `Canceled editing ${todo.name}.`;
                renderTodoList();
            });

            editForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const updatedName = editInput.value.trim();

                if (!updatedName) {
                    return;
                }

                if (isDuplicateTodo(updatedName, index)) {
                    messageElement.textContent = 'A task with that name already exists.';
                    editInput.focus();
                    return;
                }

                todo.name = updatedName;
                editingIndex = null;
                saveTodoList();
                messageElement.textContent = `Updated task to ${updatedName}.`;
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
        const todoMeta = document.createElement('small');
        const moveUpButton = document.createElement('button');
        const moveDownButton = document.createElement('button');
        const editButton = document.createElement('button');
        const removeButton = document.createElement('button');

        completedInput.type = 'checkbox';
        completedInput.checked = todo.completed;
        completedInput.setAttribute(
            'aria-label',
            `Mark ${todo.name} as ${todo.completed ? 'active' : 'complete'}`
        );
        completedInput.addEventListener('change', () => {
            todo.completed = completedInput.checked;
            saveTodoList();
            messageElement.textContent = todo.completed
                ? `Completed ${todo.name}.`
                : `Marked ${todo.name} as active.`;
            renderTodoList();
        });

        todoText.textContent = todo.name;
        if (todo.completed) {
            todoText.style.textDecoration = 'line-through';
        }

        todoMeta.textContent = todo.dueDate
            ? `Due ${formatDate(todo.dueDate)} | Added ${formatDate(todo.createdAt)}`
            : `Added ${formatDate(todo.createdAt)}`;

        moveUpButton.type = 'button';
        moveUpButton.textContent = 'Move up';
        moveUpButton.disabled = visibleIndex === 0;
        moveUpButton.setAttribute('aria-label', `Move ${todo.name} up`);
        moveUpButton.addEventListener('click', () => {
            const previousIndex = visibleTodos[visibleIndex - 1].index;
            [todoList[previousIndex], todoList[index]] = [todoList[index], todoList[previousIndex]];
            saveTodoList();
            messageElement.textContent = `Moved ${todo.name} up.`;
            renderTodoList();
        });

        moveDownButton.type = 'button';
        moveDownButton.textContent = 'Move down';
        moveDownButton.disabled = visibleIndex === visibleTodos.length - 1;
        moveDownButton.setAttribute('aria-label', `Move ${todo.name} down`);
        moveDownButton.addEventListener('click', () => {
            const nextIndex = visibleTodos[visibleIndex + 1].index;
            [todoList[index], todoList[nextIndex]] = [todoList[nextIndex], todoList[index]];
            saveTodoList();
            messageElement.textContent = `Moved ${todo.name} down.`;
            renderTodoList();
        });

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
            messageElement.textContent = `Removed ${todo.name}.`;
            renderTodoList();
        });

        itemElement.append(
            completedInput,
            ' ',
            todoText,
            ' ',
            todoMeta,
            ' ',
            moveUpButton,
            ' ',
            moveDownButton,
            ' ',
            editButton,
            ' ',
            removeButton
        );
        listElement.append(itemElement);
    });

    const remainingCount = todoList.filter((todo) => !todo.completed).length;
    const completedCount = todoList.length - remainingCount;
    summaryElement.textContent =
        `${remainingCount} ${remainingCount === 1 ? 'task' : 'tasks'} remaining, ` +
        `${completedCount} completed, ${todoList.length} total.`;
    toggleAllButton.disabled = todoList.length === 0;
    toggleAllButton.textContent = remainingCount > 0 ? 'Mark all complete' : 'Mark all active';
    clearCompletedButton.disabled = !todoList.some((todo) => todo.completed);
}

toggleAllButton.addEventListener('click', () => {
    const shouldComplete = todoList.some((todo) => !todo.completed);

    todoList.forEach((todo) => {
        todo.completed = shouldComplete;
    });

    saveTodoList();
    messageElement.textContent = shouldComplete
        ? 'Marked all tasks complete.'
        : 'Marked all tasks active.';
    renderTodoList();
});

clearCompletedButton.addEventListener('click', () => {
    const completedCount = todoList.filter((todo) => todo.completed).length;
    const activeTodos = todoList.filter((todo) => !todo.completed);
    todoList.splice(0, todoList.length, ...activeTodos);
    saveTodoList();
    messageElement.textContent = `Cleared ${completedCount} completed ${completedCount === 1 ? 'task' : 'tasks'}.`;
    renderTodoList();
});

filterElement.addEventListener('change', () => {
    editingIndex = null;
    localStorage.setItem(filterStorageKey, filterElement.value);
    renderTodoList();
});

searchElement.addEventListener('input', () => {
    editingIndex = null;
    renderTodoList();
});

formElement.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = inputElement.value.trim();

    if (!name) {
        return;
    }

    if (isDuplicateTodo(name)) {
        messageElement.textContent = 'A task with that name already exists.';
        inputElement.focus();
        return;
    }

    todoList.push({
        name,
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: dueDateElement.value
    });
    saveTodoList();
    renderTodoList();
    formElement.reset();
    todoCountElement.textContent = `0 / ${maxTodoLength}`;
    messageElement.textContent = `Added ${name}.`;
    inputElement.focus();
});

inputElement.addEventListener('input', () => {
    messageElement.textContent = '';
    todoCountElement.textContent = `${inputElement.value.length} / ${maxTodoLength}`;
});

renderTodoList();

function formatDate(dateValue) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return 'today';
    }

    return dateFormatter.format(date);
}
