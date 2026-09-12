# Shared browser helpers

[rps-game.js](rps-game.js) exposes `globalThis.RPSGame`. Load it before a page script that calls its helpers.

- `getComputerMove(value)` accepts a finite number from 0 inclusive to 1 exclusive; omitting it uses `Math.random()`.
- `getResult(player, computer)` accepts the case-sensitive moves `Rock`, `Paper`, and `Scissors`. It returns `Tie`, `You Win!`, or `You Lose!`.

[calculator-math.js](calculator-math.js) exposes `globalThis.CalculatorMath` with `appendToken`, `toggleSign`, and `evaluate`. Expressions use whitespace-separated operands and operators, such as `2 + 3 * 4`, which evaluates to 14. Evaluation supports addition, subtraction, multiplication, and division, including decimal and negative operands. Invalid expressions and division by zero throw errors.

Run the existing game-rule tests from the repository root:

```powershell
node --test shared/rps-game.test.js
```

Practice: call `RPSGame.getComputerMove(0)` and `RPSGame.getResult('Rock', 'Scissors')` in a page console after loading the helper. Expect `Rock` and `You Win!`.

[Back to the exercise guide](../README.md)
