(function attachRPSGame(global) {
    'use strict';

    const moves = Object.freeze(['Rock', 'Paper', 'Scissors']);
    const defeatedMove = Object.freeze({
        Rock: 'Scissors',
        Paper: 'Rock',
        Scissors: 'Paper'
    });

    function assertMove(move) {
        if (!moves.includes(move)) {
            throw new TypeError(`Unsupported move: ${move}`);
        }
    }

    function getComputerMove(randomValue = Math.random()) {
        if (!Number.isFinite(randomValue) || randomValue < 0 || randomValue >= 1) {
            throw new RangeError('Random value must be between 0 (inclusive) and 1 (exclusive).');
        }

        return moves[Math.floor(randomValue * moves.length)];
    }

    function getResult(playerMove, computerMove) {
        assertMove(playerMove);
        assertMove(computerMove);

        if (playerMove === computerMove) {
            return 'Tie';
        }

        return defeatedMove[playerMove] === computerMove
            ? 'You Win!'
            : 'You Lose!';
    }

    global.RPSGame = Object.freeze({ getComputerMove, getResult });
}(globalThis));
