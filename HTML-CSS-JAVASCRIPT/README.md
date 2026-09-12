# Styled rock paper scissors

Open [RPSFinal.html](RPSFinal.html) to play using image buttons or the `1`, `2`, and `3` shortcuts. Press `R` or use Reset Score to reset.

The page loads the shared game rules before [RPS.js](RPS.js). The local script handles interaction, score persistence, and rendering; [RPSStyle.css](RPSStyle.css) supplies the presentation.

Try playing several rounds, refreshing to check the saved score, and resetting. Use Tab to reach the move buttons and Enter to activate one.

Inspect the markup: each image button has an accessible label, while its image has empty alternative text to avoid repeating the button name. Result and move elements announce updates through status or live-region attributes.

[Back to the exercise guide](../README.md)
