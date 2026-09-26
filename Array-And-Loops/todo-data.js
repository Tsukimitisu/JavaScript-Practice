(function attachTodoData(global) {
    'use strict';

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
            createdAt: typeof todo.createdAt === 'string' ? todo.createdAt : createdAt,
            dueDate: typeof todo.dueDate === 'string' ? todo.dueDate : '',
            priority: ['high', 'normal', 'low'].includes(todo.priority)
                ? todo.priority
                : 'normal'
        };
    }

    function parseDate(dateValue) {
        return /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
            ? new Date(`${dateValue}T00:00:00`)
            : new Date(dateValue);
    }

    global.TodoData = Object.freeze({ normalizeTodo, parseDate });
}(globalThis));
