# JavaScript Practice

A collection of small browser exercises for learning JavaScript fundamentals, DOM manipulation, arrays, functions, objects, and local storage.

## Exercise guide

| Topic | Exercise | What it practices |
| --- | --- | --- |
| Basics | [Values and variables](Javascript-Basics/index.html) | Arithmetic, strings, and console output |
| Variables | [Cart quantity](Variable/index.html) | State, limits, and local storage |
| Variables | [Calculator](Variable/calculator.html) | Functions, keyboard input, and error handling |
| Functions | [Rock paper scissors](Functions/function.html) | Parameters, return values, and branching |
| Booleans | [Cart exercise](booleans/Exercise.html) | Conditions and persisted state |
| Booleans | [Rock paper scissors](booleans/RPS.html) | Boolean logic and score tracking |
| Objects | [Heads or tails](Objects/headorTails.html) | Objects, random values, and win streaks |
| DOM | [Interactive exercises](DOM/DOM.html) | Events, form input, and DOM updates |
| Arrays | [Todo list](Array-And-Loops/index.html) | Arrays, rendering, completion, and storage |
| Combined | [Styled rock paper scissors](HTML-CSS-JAVASCRIPT/RPSFinal.html) | Accessible UI, CSS, and event listeners |
| Website | [Luma Studio](new-website/index.html) | Responsive design, forms, themes, and navigation |

## Todo list features

The todo exercise stores tasks in the browser and supports due dates, priorities, completion states, editing, manual reordering, and sorting. Use the task filter to focus on active, completed, due-today, or overdue work. Removed tasks can be restored with **Undo remove** until another task is removed.

Press `/` outside a form field to focus task search. While search is focused, press `Escape` to clear it and return to the task list.

## Run locally

No packages or build step are required. Clone the repository and open an exercise HTML file in a browser. You can also serve the whole folder so every project is available from one local origin:

```powershell
npx serve .
```

The command prints a local URL to open. Exercises that save a cart, score, palette, or todo list use browser local storage, so their state remains after a refresh. Clear the relevant exercise data from browser developer tools when you want a completely fresh start.

Run the shared rock-paper-scissors rule tests with Node.js:

```powershell
node --test shared/rps-game.test.js
```
