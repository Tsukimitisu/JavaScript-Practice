(function attachTodoData(global) {
    'use strict';

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
        return isDateValue(dateValue)
            ? new Date(`${dateValue}T00:00:00`)
            : new Date(dateValue);
    }

    global.TodoData = Object.freeze({
        getLocalDateValue,
        isDateValue,
        normalizeTodo,
        parseDate
    });
}(globalThis));
