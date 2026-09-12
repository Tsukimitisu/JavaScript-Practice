# Variables and cart state

Open [index.html](index.html) for the cart exercise or [calculator.html](calculator.html) for the calculator.

The cart uses `let` for the changing quantity and `const` for its limit and storage key. Button data attributes supply amounts to the event handlers.

Try resetting the cart, adding three items three times, and adding two more. The last action should be rejected because the maximum is 10. Removing from an empty cart should leave the quantity at zero.

Reload after adding an item to inspect persistence through the `cart-quantity` local-storage entry. Reset Cart removes that entry.

Practice: trace how a button's string data attribute becomes a number before arithmetic.

[Back to the exercise guide](../README.md)
