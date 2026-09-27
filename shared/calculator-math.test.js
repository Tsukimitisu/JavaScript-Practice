const test = require('node:test');
const assert = require('node:assert/strict');

require('./calculator-math.js');

const { appendToken, backspace, evaluate, toggleSign } = globalThis.CalculatorMath;

test('evaluates multiplication and division before addition and subtraction', () => {
    assert.equal(evaluate('2 + 3 * 4'), 14);
    assert.equal(evaluate('20 / 5 - 1'), 3);
    assert.equal(evaluate('10 - 6 / 2 * 3'), 1);
});

test('evaluates operators with equal precedence from left to right', () => {
    assert.equal(evaluate('20 / 5 * 2'), 8);
    assert.equal(evaluate('10 - 3 + 1'), 8);
    assert.equal(evaluate('18 / 3 / 2'), 3);
});

test('supports decimal and negative operands', () => {
    assert.equal(evaluate('-.5 * 4'), -2);
    assert.equal(evaluate('2 + -3.5'), -1.5);
});

test('accepts a standalone number and flexible whitespace', () => {
    assert.equal(evaluate('42'), 42);
    assert.equal(evaluate('  2   +   3  '), 5);
    assert.equal(evaluate('\t-4\n*\t2 '), -8);
});

test('rejects incomplete calculations and division by zero', () => {
    assert.throws(() => evaluate(''), /Enter a calculation/);
    assert.throws(() => evaluate('2 +'), /Invalid calculation/);
    assert.throws(() => evaluate('2 / 0'), /Cannot divide by zero/);
});

test('rejects malformed expressions and non-finite results', () => {
    assert.throws(() => evaluate('two + 2'), /Invalid calculation/);
    assert.throws(() => evaluate('2 + + 3'), /Invalid calculation/);
    assert.throws(() => evaluate('1e308 * 10'), /Invalid calculation/);
    assert.throws(() => evaluate(`${'9'.repeat(309)} * 10`), /outside the supported range/);
});

test('appends digits and replaces a pending operator', () => {
    assert.equal(appendToken('', '2'), '2');
    assert.equal(appendToken('2', ' + '), '2 + ');
    assert.equal(appendToken('2 + ', '*'), '2 * ');
    assert.equal(appendToken('2 + ', '3'), '2 + 3');
});

test('ignores unsupported input tokens and repeated decimal points', () => {
    assert.equal(appendToken('12', 'x'), '12');
    assert.equal(appendToken('1.2', '.'), '1.2');
    assert.equal(appendToken('2 + 3.4', '.'), '2 + 3.4');
    assert.equal(appendToken(null, '7'), '7');
});

test('starts decimal operands with zero', () => {
    assert.equal(appendToken('', '.'), '0.');
    assert.equal(appendToken('2 + ', '.'), '2 + 0.');
    assert.equal(appendToken('2 + -', '.'), '2 + -0.');
    assert.equal(evaluate('2 + 0.5'), 2.5);
});

test('replaces redundant leading zeros when entering whole numbers', () => {
    assert.equal(appendToken('0', '5'), '5');
    assert.equal(appendToken('-0', '5'), '-5');
    assert.equal(appendToken('2 + 0', '7'), '2 + 7');
    assert.equal(appendToken('0.', '5'), '0.5');
});

test('replaces a pending negative operand when changing operators', () => {
    assert.equal(appendToken('2 + -', '*'), '2 * ');
    assert.equal(appendToken('2 - -', '/'), '2 / ');
    assert.equal(appendToken('-', '*'), '-');
});

test('toggles the current operand sign', () => {
    assert.equal(toggleSign('2 + 3'), '2 + -3');
    assert.equal(toggleSign('2 + -3'), '2 + 3');
    assert.equal(toggleSign('2 + '), '2 + -');
});

test('toggles pending signs without changing invalid input', () => {
    assert.equal(toggleSign(''), '-');
    assert.equal(toggleSign('-'), '');
    assert.equal(toggleSign('2 + -'), '2 + ');
    assert.equal(toggleSign('not-a-number'), 'not-a-number');
});

test('backspace removes digits and whole pending operators', () => {
    assert.equal(backspace('23'), '2');
    assert.equal(backspace('2 + '), '2');
    assert.equal(backspace('2 + -3'), '2 + -');
    assert.equal(backspace(''), '');
    assert.equal(backspace(undefined), '');
});
