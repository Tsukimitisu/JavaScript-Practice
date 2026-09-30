const test = require('node:test');
const assert = require('node:assert/strict');

require('./todo-data.js');

const {
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

test('only restores completion from saved boolean values', () => {
    assert.equal(normalizeTodo({ name: 'Done', completed: true }, createdAt).completed, true);
    assert.equal(normalizeTodo({ name: 'Open', completed: false }, createdAt).completed, false);
    assert.equal(normalizeTodo({ name: 'Malformed', completed: 'false' }, createdAt).completed, false);
    assert.equal(normalizeTodo({ name: 'Numeric', completed: 1 }, createdAt).completed, false);
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

test('rejects timestamps with impossible calendar dates', () => {
    assert.equal(normalizeTodo({
        name: 'Invalid calendar timestamp',
        createdAt: '2026-02-30T10:30:00.000Z'
    }, createdAt).createdAt, createdAt);
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

test('rejects invalid values when formatting a local date', () => {
    assert.throws(() => getLocalDateValue('2026-09-17'), /valid Date/);
    assert.throws(() => getLocalDateValue(new Date(Number.NaN)), /valid Date/);
});

test('returns an invalid date for missing or empty date values', () => {
    assert.equal(Number.isNaN(parseDate().getTime()), true);
    assert.equal(Number.isNaN(parseDate('').getTime()), true);
    assert.equal(Number.isNaN(parseDate('   ').getTime()), true);
});

test('does not normalize impossible calendar dates', () => {
    assert.equal(Number.isNaN(parseDate('2026-02-30').getTime()), true);
    assert.equal(Number.isNaN(parseDate('2026-13-01').getTime()), true);
    assert.equal(Number.isNaN(parseDate('2026-00-10').getTime()), true);
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

test('does not mark invalid calendar dates as overdue', () => {
    const now = new Date(2026, 8, 17, 12);

    assert.equal(isOverdue({ dueDate: '2026-09-1', completed: false }, now), false);
    assert.equal(isOverdue({ dueDate: '2026-02-30', completed: false }, now), false);
    assert.equal(isOverdue({ dueDate: 20260916, completed: false }, now), false);
    assert.equal(isOverdue(null, now), false);
});

test('sorts dated tasks first and undated tasks last', () => {
    const early = { dueDate: '2026-09-17' };
    const late = { dueDate: '2026-09-20' };
    const undated = { dueDate: '' };

    assert.ok(compareDueDates(early, late) < 0);
    assert.ok(compareDueDates(late, early) > 0);
    assert.equal(compareDueDates(early, early), 0);
    assert.ok(compareDueDates(early, undated) < 0);
    assert.ok(compareDueDates(undated, early) > 0);
    assert.equal(compareDueDates(undated, undated), 0);
});

test('treats missing tasks as undated while sorting', () => {
    const dated = { dueDate: '2026-09-17' };

    assert.ok(compareDueDates(dated, null) < 0);
    assert.ok(compareDueDates(undefined, dated) > 0);
    assert.equal(compareDueDates(null, undefined), 0);
});

test('treats malformed due dates as undated while sorting', () => {
    const dated = { dueDate: '2026-09-17' };

    assert.ok(compareDueDates(dated, { dueDate: '2026-02-30' }) < 0);
    assert.ok(compareDueDates({ dueDate: 20260917 }, dated) > 0);
    assert.equal(compareDueDates({ dueDate: 'invalid' }, { dueDate: null }), 0);
});

test('sorts priorities from high to low', () => {
    const high = { priority: 'high' };
    const normal = { priority: 'normal' };
    const low = { priority: 'low' };

    assert.ok(comparePriorities(high, normal) < 0);
    assert.ok(comparePriorities(normal, low) < 0);
    assert.ok(comparePriorities(low, high) > 0);
    assert.equal(comparePriorities(normal, normal), 0);
});

test('treats missing and unsupported priorities as normal', () => {
    assert.equal(comparePriorities({}, { priority: 'normal' }), 0);
    assert.equal(comparePriorities({ priority: 'urgent' }, {}), 0);
    assert.ok(comparePriorities({ priority: 'high' }, null) < 0);
    assert.ok(comparePriorities(undefined, { priority: 'low' }) < 0);
});

test('matches task searches without case or surrounding whitespace', () => {
    const todo = { name: 'Read JavaScript Guide' };

    assert.equal(matchesSearch(todo, 'javascript'), true);
    assert.equal(matchesSearch(todo, '  GUIDE  '), true);
    assert.equal(matchesSearch(todo, ''), true);
    assert.equal(matchesSearch(todo, 'TypeScript'), false);
});

test('does not match malformed tasks', () => {
    assert.equal(matchesSearch(null, 'task'), false);
    assert.equal(matchesSearch({}, 'task'), false);
    assert.equal(matchesSearch({ name: 42 }, ''), false);
});

test('detects duplicate task names while allowing the edited task', () => {
    const todos = [
        { name: 'Read a book' },
        { name: 'Practice JavaScript' }
    ];

    assert.equal(hasDuplicateName(todos, '  read A BOOK  '), true);
    assert.equal(hasDuplicateName(todos, 'Write notes'), false);
    assert.equal(hasDuplicateName(todos, 'Read a book', 0), false);
    assert.equal(hasDuplicateName(todos, 'Practice JavaScript', 0), true);
});

test('ignores invalid duplicate-check inputs and malformed saved tasks', () => {
    const todos = [null, {}, { name: 42 }, { name: 'Valid task' }];

    assert.equal(hasDuplicateName(todos, 'valid task'), true);
    assert.equal(hasDuplicateName(todos, ''), false);
    assert.equal(hasDuplicateName(todos, null), false);
    assert.equal(hasDuplicateName(null, 'Valid task'), false);
});
