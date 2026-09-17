const test = require('node:test');
const assert = require('node:assert/strict');

require('./todo-data.js');

const { normalizeTodo } = globalThis.TodoData;
const createdAt = '2026-09-17T00:00:00.000Z';

test('migrates legacy string tasks with all fields used by the list', () => {
    assert.deepEqual(normalizeTodo('Read a book', createdAt), {
        name: 'Read a book',
        completed: false,
        createdAt,
        dueDate: '',
        priority: 'normal'
    });
});

test('preserves supported task fields and defaults invalid priorities', () => {
    assert.deepEqual(normalizeTodo({
        name: 'Pay bill',
        completed: true,
        createdAt,
        dueDate: '2026-09-20',
        priority: 'high'
    }), {
        name: 'Pay bill',
        completed: true,
        createdAt,
        dueDate: '2026-09-20',
        priority: 'high'
    });
    assert.equal(normalizeTodo({ name: 'Task', priority: 'urgent' }, createdAt).priority, 'normal');
    assert.equal(normalizeTodo({ completed: true }, createdAt), null);
});
