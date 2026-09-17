(function attachTodoData(global) {
    'use strict';

    function normalizeTodo(todo, createdAt = new Date().toISOString()) {
        if (typeof todo === 'string') {
            return {
                name: todo,
                completed: false,
                createdAt,
                dueDate: '',
                priority: 'normal'
            };
        }

        if (typeof todo?.name !== 'string') {
            return null;
        }

        return {
            name: todo.name,
            completed: Boolean(todo.completed),
            createdAt: typeof todo.createdAt === 'string' ? todo.createdAt : createdAt,
            dueDate: typeof todo.dueDate === 'string' ? todo.dueDate : '',
            priority: ['high', 'normal', 'low'].includes(todo.priority)
                ? todo.priority
                : 'normal'
        };
    }

    global.TodoData = Object.freeze({ normalizeTodo });
}(globalThis));
