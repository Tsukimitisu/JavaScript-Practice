(function attachTodoData(global) {
    'use strict';

    const priorityWeight = Object.freeze({ high: 0, normal: 1, low: 2 });

    function isDateValue(value) {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return false;
        }

        const [year, month, day] = value.split('-').map(Number);
        const date = new Date(year, month - 1, day);

        return date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day;
    }

    function isTimestamp(value) {
        return typeof value === 'string' &&
            value.trim() !== '' &&
            Number.isFinite(Date.parse(value));
    }

    function getLocalDateValue(date = new Date()) {
        const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;

        return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
    }

    function isDueToday(todo, date = new Date()) {
        return todo?.dueDate === getLocalDateValue(date);
    }

    function isOverdue(todo, date = new Date()) {
        return Boolean(
            todo?.dueDate &&
            !todo.completed &&
            todo.dueDate < getLocalDateValue(date)
        );
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

    function comparePriorities(firstTodo, secondTodo) {
        const firstWeight = priorityWeight[firstTodo?.priority] ?? priorityWeight.normal;
        const secondWeight = priorityWeight[secondTodo?.priority] ?? priorityWeight.normal;

        return firstWeight - secondWeight;
    }

    function matchesSearch(todo, query) {
        if (typeof todo?.name !== 'string') {
            return false;
        }

        const normalizedQuery = typeof query === 'string'
            ? query.trim().toLocaleLowerCase()
            : '';

        return todo.name.toLocaleLowerCase().includes(normalizedQuery);
    }

    function hasDuplicateName(todos, name, excludedIndex = -1) {
        const normalizedName = name.trim().toLocaleLowerCase();

        return todos.some((todo, index) =>
            index !== excludedIndex &&
            todo.name.trim().toLocaleLowerCase() === normalizedName
        );
    }

    function normalizeTodo(todo, createdAt = new Date().toISOString()) {
        if (typeof todo === 'string') {
            const name = todo.trim();

            if (!name) {
                return null;
            }

            return {
                name,
                completed: false,
                createdAt,
                dueDate: '',
                priority: 'normal'
            };
        }

        if (typeof todo?.name !== 'string') {
            return null;
        }

        const name = todo.name.trim();

        if (!name) {
            return null;
        }

        return {
            name,
            completed: Boolean(todo.completed),
            createdAt: isTimestamp(todo.createdAt) ? todo.createdAt : createdAt,
            dueDate: isDateValue(todo.dueDate) ? todo.dueDate : '',
            priority: ['high', 'normal', 'low'].includes(todo.priority)
                ? todo.priority
                : 'normal'
        };
    }

    function parseDate(dateValue) {
        if (isDateValue(dateValue)) {
            return new Date(`${dateValue}T00:00:00`);
        }

        return typeof dateValue === 'string' && dateValue.trim()
            ? new Date(dateValue)
            : new Date(Number.NaN);
    }

    global.TodoData = Object.freeze({
        compareDueDates,
        comparePriorities,
        getLocalDateValue,
        hasDuplicateName,
        isDateValue,
        isDueToday,
        isOverdue,
        matchesSearch,
        normalizeTodo,
        parseDate
    });
}(globalThis));
