# DOM interactions

Open [DOM.html](DOM.html) for the subscription toggle and shipping calculator.

The subscription button updates both its text and `aria-pressed` attribute. Its state persists in the `youtube-subscription` local-storage entry.

The shipping form handles `submit`, prevents navigation, reads the input, and writes a result using `textContent`. Orders below $40 add $10 shipping; orders of $40 or more receive free shipping.

Try $39.99 and $40: their totals should be $49.99 and $40.00. Press Enter in the input to submit, and try a negative value to inspect validation. Toggle Subscribe and reload to check its saved state.

[Back to the exercise guide](../README.md)
