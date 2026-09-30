const test = require('node:test');
const assert = require('node:assert/strict');

require('./rps-game.js');

const { getComputerMove, getResult } = globalThis.RPSGame;

test('selects each move from a deterministic random value', () => {
    assert.equal(getComputerMove(0), 'Rock');
    assert.equal(getComputerMove(0.34), 'Paper');
    assert.equal(getComputerMove(0.99), 'Scissors');
});

test('uses Math.random when no random value is supplied', () => {
    const originalRandom = Math.random;
    Math.random = () => 0.5;

    try {
        assert.equal(getComputerMove(), 'Paper');
    } finally {
        Math.random = originalRandom;
    }
});

test('changes moves at the exact third boundaries', () => {
    assert.equal(getComputerMove((1 / 3) - Number.EPSILON), 'Rock');
    assert.equal(getComputerMove(1 / 3), 'Paper');
    assert.equal(getComputerMove((2 / 3) - Number.EPSILON), 'Paper');
    assert.equal(getComputerMove(2 / 3), 'Scissors');
});

test('accepts the largest representable value below one', () => {
    assert.equal(getComputerMove(1 - Number.EPSILON), 'Scissors');
});

test('reports ties', () => {
    assert.equal(getResult('Rock', 'Rock'), 'Tie');
    assert.equal(getResult('Paper', 'Paper'), 'Tie');
    assert.equal(getResult('Scissors', 'Scissors'), 'Tie');
});

test('reports every winning matchup', () => {
    assert.equal(getResult('Rock', 'Scissors'), 'You Win!');
    assert.equal(getResult('Paper', 'Rock'), 'You Win!');
    assert.equal(getResult('Scissors', 'Paper'), 'You Win!');
});

test('reports every losing matchup', () => {
    assert.equal(getResult('Rock', 'Paper'), 'You Lose!');
    assert.equal(getResult('Paper', 'Scissors'), 'You Lose!');
    assert.equal(getResult('Scissors', 'Rock'), 'You Lose!');
});

test('rejects unsupported moves and random values', () => {
    assert.throws(() => getResult('Lizard', 'Rock'), TypeError);
    assert.throws(() => getResult('Rock', 'Lizard'), TypeError);
    assert.throws(() => getComputerMove(-0.01), RangeError);
    assert.throws(() => getComputerMove(1), RangeError);
});

test('rejects non-numeric and non-finite random values', () => {
    assert.throws(() => getComputerMove('0.5'), RangeError);
    assert.throws(() => getComputerMove(Number.NaN), RangeError);
    assert.throws(() => getComputerMove(Number.POSITIVE_INFINITY), RangeError);
});
