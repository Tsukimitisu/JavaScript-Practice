# Functions and game actions

Open [function.html](function.html) to play rock paper scissors. Use the buttons or press `1`, `2`, and `3` for rock, paper, and scissors. Press `R` to reset the score.

Follow the call from an event listener to `playGame(playersMove)`, then to the shared `RPSGame` helpers. `updateScore()` handles the score display, while `resetScore()` replaces the score object and updates the page.

Try playing several rounds and resetting. Wins, losses, and ties should return to zero. This version keeps its score in memory, so reloading also starts a new score.

Practice: explain why both a click and a keyboard event can call the same game function.

[Back to the exercise guide](../README.md)
