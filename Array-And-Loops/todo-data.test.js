const test = require('node:test');
const assert = require('node:assert/strict');

require('./todo-data.js');

const {
    getLocalDateValue,
    isDateValue,
    isDueToday,
    isOverdue,
    normalizeTodo,
    parseDate
} = globalThis.TodoData;
const createdAt = '2026-09-17T00:00:00.000Z';

test('migrates legacy string tasks with all fields used by the list', () => {
    assert.deepEqual(normalizeTodo('  Read a book  ', createdAt), {
        name: 'Read a book',
        completed: false,
        createdAt,
        dueDate: '',
        priority: 'normal'
    });
    assert.equal(normalizeTodo('   ', createdAt), null);
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
    assert.equal(normalizeTodo({ name: '\t' }, createdAt), null);
});

test('keeps real calendar due dates and discards invalid ones', () => {
    assert.equal(isDateValue('2028-02-29'), true);
    assert.equal(isDateValue('2026-02-29'), false);
    assert.equal(isDateValue('2026-13-01'), false);
    assert.equal(normalizeTodo({ name: 'Valid', dueDate: '2026-09-20' }, createdAt).dueDate, '2026-09-20');
    assert.equal(normalizeTodo({ name: 'Invalid', dueDate: '2026-02-30' }, createdAt).dueDate, '');
});

test('replaces invalid saved creation timestamps', () => {
    assert.equal(normalizeTodo({
        name: 'Missing timestamp'
    }, createdAt).createdAt, createdAt);
    assert.equal(normalizeTodo({
        name: 'Invalid timestamp',
        createdAt: 'not-a-date'
    }, createdAt).createdAt, createdAt);
    assert.equal(normalizeTodo({
        name: 'Valid timestamp',
        createdAt: '2026-09-18T10:30:00.000Z'
    }, createdAt).createdAt, '2026-09-18T10:30:00.000Z');
});

test('interprets due dates in the local calendar day', () => {
    const previousTimeZone = process.env.TZ;
    process.env.TZ = 'America/Los_Angeles';

    try {
        assert.equal(parseDate('2026-09-17').getDate(), 17);
        assert.equal(parseDate('2026-09-17T12:00:00.000Z').getDate(), 17);
        assert.equal(getLocalDateValue(new Date('2026-09-18T06:30:00.000Z')), '2026-09-17');
    } finally {
        if (previousTimeZone === undefined) {
            delete process.env.TZ;
        } else {
            process.env.TZ = previousTimeZone;
        }
    }
});

test('detects tasks due on the supplied local day', () => {
    const now = new Date(2026, 8, 17, 12);

    assert.equal(isDueToday({ dueDate: '2026-09-17' }, now), true);
    assert.equal(isDueToday({ dueDate: '2026-09-18' }, now), false);
    assert.equal(isDueToday({ dueDate: '' }, now), false);
});

test('only marks incomplete tasks before the supplied day as overdue', () => {
    const now = new Date(2026, 8, 17, 12);

    assert.equal(isOverdue({ dueDate: '2026-09-16', completed: false }, now), true);
    assert.equal(isOverdue({ dueDate: '2026-09-17', completed: false }, now), false);
    assert.equal(isOverdue({ dueDate: '2026-09-16', completed: true }, now), false);
    assert.equal(isOverdue({ dueDate: '', completed: false }, now), false);
});
