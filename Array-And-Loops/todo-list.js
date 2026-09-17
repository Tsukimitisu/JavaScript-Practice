const storageKey = 'todo-list';
const filterStorageKey = 'todo-list-filter';
const sortStorageKey = 'todo-list-sort';
const maxTodoLength = 100;
const todoList = loadTodoList();
const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric'
});
const formElement = document.querySelector('.js-todo-form');
const inputElement = document.querySelector('.js-input');
const dueDateElement = document.querySelector('.js-due-date');
const priorityElement = document.querySelector('.js-priority');
const messageElement = document.querySelector('.js-todo-message');
const undoRemoveButton = document.querySelector('.js-undo-remove');
const listElement = document.querySelector('.js-todo-list');
const summaryElement = document.querySelector('.js-todo-summary');
const filterElement = document.querySelector('.js-todo-filter');
const searchElement = document.querySelector('.js-todo-search');
const clearSearchButton = document.querySelector('.js-clear-search');
const sortElement = document.querySelector('.js-todo-sort');
const toggleAllButton = document.querySelector('.js-toggle-all');
const clearCompletedButton = document.querySelector('.js-clear-completed');
const todoCountElement = document.querySelector('.js-todo-count');
let editingIndex = null;
let lastRemovedTodo = null;
const priorityWeight = { high: 0, normal: 1, low: 2 };

const savedFilter = localStorage.getItem(filterStorageKey);
if (['all', 'active', 'completed', 'today', 'overdue'].includes(savedFilter)) {
    filterElement.value = savedFilter;
}

const savedSort = localStorage.getItem(sortStorageKey);
if (['manual', 'due-date', 'priority'].includes(savedSort)) {
    sortElement.value = savedSort;
}

function loadTodoList() {
    try {
        const savedTodos = JSON.parse(localStorage.getItem(storageKey));
        if (!Array.isArray(savedTodos)) {
            return [];
        }

        return savedTodos.flatMap((todo) => {
            const normalizedTodo = TodoData.normalizeTodo(todo);
            return normalizedTodo ? [normalizedTodo] : [];
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
                (filterElement.value === 'completed' && todo.completed) ||
                (filterElement.value === 'today' && isDueToday(todo)) ||
                (filterElement.value === 'overdue' && isOverdue(todo));
            const matchesSearch = todo.name.toLocaleLowerCase().includes(searchQuery);

            return matchesFilter && matchesSearch;
        })
        .sort(compareVisibleTodos);

    if (visibleTodos.length === 0) {
        const emptyItem = document.createElement('li');
        const emptyMessages = {
            all: 'No tasks yet. Add one above.',
            active: 'No active tasks.',
            completed: 'No completed tasks.',
            today: 'No tasks are due today.',
            overdue: 'No overdue tasks.'
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
            const editNameLabel = document.createElement('label');
            const editCount = document.createElement('span');
            const editInput = document.createElement('input');
            const editDueDateLabel = document.createElement('label');
            const editDueDateInput = document.createElement('input');
            const editPriorityLabel = document.createElement('label');
            const editPrioritySelect = document.createElement('select');
            const saveButton = document.createElement('button');
            const cancelButton = document.createElement('button');

            editForm.className = 'todo-edit-form';
            editNameLabel.htmlFor = `edit-todo-name-${index}`;
            editNameLabel.textContent = 'Task name ';
            editCount.className = 'todo-edit-count';
            editCount.textContent = `${todo.name.length} / ${maxTodoLength}`;
            editNameLabel.append(editCount);
            editInput.id = editNameLabel.htmlFor;
            editInput.value = todo.name;
            editInput.required = true;
            editInput.maxLength = maxTodoLength;
            editInput.addEventListener('input', () => {
                editCount.textContent = `${editInput.value.length} / ${maxTodoLength}`;
            });

            editDueDateLabel.htmlFor = `edit-todo-date-${index}`;
            editDueDateLabel.textContent = 'Due date';
            editDueDateInput.id = editDueDateLabel.htmlFor;
            editDueDateInput.type = 'date';
            editDueDateInput.value = todo.dueDate;

            editPriorityLabel.htmlFor = `edit-todo-priority-${index}`;
            editPriorityLabel.textContent = 'Priority';
            editPrioritySelect.id = editPriorityLabel.htmlFor;
            ['high', 'normal', 'low'].forEach((priority) => {
                const option = document.createElement('option');
                option.value = priority;
                option.textContent = formatPriority(priority);
                editPrioritySelect.append(option);
            });
            editPrioritySelect.value = todo.priority;

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
                todo.dueDate = editDueDateInput.value;
                todo.priority = editPrioritySelect.value;
                editingIndex = null;
                saveTodoList();
                messageElement.textContent = `Updated ${updatedName}.`;
                renderTodoList();
            });

            editForm.append(
                editNameLabel,
                editInput,
                editDueDateLabel,
                editDueDateInput,
                editPriorityLabel,
                editPrioritySelect,
                saveButton,
                cancelButton
            );
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

        if (isOverdue(todo)) {
            itemElement.classList.add('todo-overdue');
        }

        todoMeta.textContent = todo.dueDate
            ? `${formatPriority(todo.priority)} | ${getDueDateLabel(todo)} | Added ${formatDate(todo.createdAt)}`
            : `${formatPriority(todo.priority)} | Added ${formatDate(todo.createdAt)}`;

        moveUpButton.type = 'button';
        moveUpButton.textContent = 'Move up';
        moveUpButton.disabled = sortElement.value !== 'manual' || visibleIndex === 0;
        moveUpButton.setAttribute('aria-label', `Move ${todo.name} up`);
        moveUpButton.addEventListener('click', () => {
            const previousIndex = visibleTodos[visibleIndex - 1].index;
            [todoList[previousIndex], todoList[index]] = [todoList[index], todoList[previousIndex]];
            editingIndex = null;
            saveTodoList();
            messageElement.textContent = `Moved ${todo.name} up.`;
            renderTodoList();
        });

        moveDownButton.type = 'button';
        moveDownButton.textContent = 'Move down';
        moveDownButton.disabled = sortElement.value !== 'manual' || visibleIndex === visibleTodos.length - 1;
        moveDownButton.setAttribute('aria-label', `Move ${todo.name} down`);
        moveDownButton.addEventListener('click', () => {
            const nextIndex = visibleTodos[visibleIndex + 1].index;
            [todoList[index], todoList[nextIndex]] = [todoList[nextIndex], todoList[index]];
            editingIndex = null;
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
            const [removedTodo] = todoList.splice(index, 1);
            editingIndex = null;
            lastRemovedTodo = { todo: removedTodo, index };
            undoRemoveButton.hidden = false;
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
    const visibleCountText = filterElement.value !== 'all' || searchQuery
        ? `${visibleTodos.length} shown. `
        : '';
    summaryElement.textContent =
        `${visibleCountText}${remainingCount} ${remainingCount === 1 ? 'task' : 'tasks'} remaining, ` +
        `${completedCount} completed, ${todoList.length} total.`;
    toggleAllButton.disabled = todoList.length === 0;
    toggleAllButton.textContent = remainingCount > 0 ? 'Mark all complete' : 'Mark all active';
    clearCompletedButton.disabled = !todoList.some((todo) => todo.completed);
    clearSearchButton.disabled = !searchQuery;
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
    editingIndex = null;
    saveTodoList();
    messageElement.textContent = `Cleared ${completedCount} completed ${completedCount === 1 ? 'task' : 'tasks'}.`;
    renderTodoList();
});

undoRemoveButton.addEventListener('click', () => {
    if (!lastRemovedTodo) {
        return;
    }

    const insertIndex = Math.min(lastRemovedTodo.index, todoList.length);
    todoList.splice(insertIndex, 0, lastRemovedTodo.todo);
    editingIndex = null;
    messageElement.textContent = `Restored ${lastRemovedTodo.todo.name}.`;
    lastRemovedTodo = null;
    undoRemoveButton.hidden = true;
    saveTodoList();
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

clearSearchButton.addEventListener('click', () => {
    clearTodoSearch();
});

function clearTodoSearch({ focusSearch = true } = {}) {
    searchElement.value = '';
    editingIndex = null;
    renderTodoList();

    if (focusSearch) {
        searchElement.focus();
    }
}

document.addEventListener('keydown', (event) => {
    const isTyping = ['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName) ||
        event.target.isContentEditable;

    if (event.key === '/' && !isTyping) {
        event.preventDefault();
        searchElement.focus();
        return;
    }

    if (event.key === 'Escape' && document.activeElement === searchElement) {
        event.preventDefault();
        clearTodoSearch({ focusSearch: false });
        searchElement.blur();
        messageElement.textContent = 'Cleared task search.';
    }
});

sortElement.addEventListener('change', () => {
    editingIndex = null;
    localStorage.setItem(sortStorageKey, sortElement.value);
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
        dueDate: dueDateElement.value,
        priority: priorityElement.value
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
    const date = TodoData.parseDate(dateValue);

    if (Number.isNaN(date.getTime())) {
        return 'today';
    }

    return dateFormatter.format(date);
}

function formatPriority(priority) {
    return `${priority[0].toLocaleUpperCase()}${priority.slice(1)} priority`;
}

function compareVisibleTodos(first, second) {
    if (sortElement.value === 'due-date') {
        return compareDueDates(first.todo, second.todo) || first.index - second.index;
    }

    if (sortElement.value === 'priority') {
        return priorityWeight[first.todo.priority] - priorityWeight[second.todo.priority] ||
            first.index - second.index;
    }

    return first.index - second.index;
}

function compareDueDates(firstTodo, secondTodo) {
    if (!firstTodo.dueDate && !secondTodo.dueDate) {
        return 0;
    }

    if (!firstTodo.dueDate) {
        return 1;
    }

    if (!secondTodo.dueDate) {
        return -1;
    }

    return firstTodo.dueDate.localeCompare(secondTodo.dueDate);
}

function isOverdue(todo) {
    if (!todo.dueDate || todo.completed) {
        return false;
    }

    return todo.dueDate < getLocalDateValue();
}

function isDueToday(todo) {
    return todo.dueDate === getLocalDateValue();
}

function getLocalDateValue(date = new Date()) {
    const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;

    return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function getDueDateLabel(todo) {
    return isOverdue(todo)
        ? `Overdue ${formatDate(todo.dueDate)}`
        : `Due ${formatDate(todo.dueDate)}`;
}
