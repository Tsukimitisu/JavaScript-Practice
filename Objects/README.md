# Objects and saved scores

Open [headorTails.html](headorTails.html). Choose Heads or Tails with the buttons or `H` and `T`; press `R` to reset.

The `score` object groups wins, losses, current streak, and best streak. A win increases the current streak; a loss resets it. The page derives rounds played and win rate from the totals.

Try playing several rounds and reloading. The score is serialized as JSON in `heads-tails-score` and restored by `loadScore()`. Reset Score clears the saved entry and displayed statistics.

Practice: trace the validation in `loadScore()` and explain why a best streak cannot be smaller than the current streak.

[Back to the exercise guide](../README.md)
