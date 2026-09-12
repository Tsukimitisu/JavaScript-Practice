# Boolean conditions

Open [Exercise.html](Exercise.html) for the cart or [RPS.html](RPS.html) for rock paper scissors.

The cart demonstrates equality checks, upper and lower bounds, early returns, and a conditional expression for the checkout message. Checkout is disabled when the cart is empty.

Try resetting, then pressing `+4` three times. The quantity should stop at 10. Checkout should report 10 purchased items, empty the cart, and become disabled again.

The cart saves its quantity under `boolean-cart-quantity`. Compare its overflow behavior with the [variables cart](../Variable/index.html): this exercise caps an addition at the limit, while that one rejects additions exceeding the limit.

[Back to the exercise guide](../README.md)
