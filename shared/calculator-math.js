(function attachCalculatorMath(global) {
    'use strict';

    const numberPattern = /^-?(?:\d+\.?\d*|\.\d+)$/;
    const operatorPattern = /^[+\-*/]$/;

    function evaluate(expression) {
        if (typeof expression !== 'string' || !expression.trim()) {
            throw new Error('Enter a calculation.');
        }

        const tokens = expression.trim().split(/\s+/);
        const hasValidStructure = tokens.length % 2 === 1 &&
            tokens.every((token, index) =>
                index % 2 === 0
                    ? numberPattern.test(token)
                    : operatorPattern.test(token)
            );

        if (!hasValidStructure) {
            throw new Error('Invalid calculation.');
        }

        const values = [Number(tokens[0])];
        const additionOperators = [];

        for (let index = 1; index < tokens.length; index += 2) {
            const operator = tokens[index];
            const rightValue = Number(tokens[index + 1]);

            if (operator === '*' || operator === '/') {
                const leftValue = values.pop();

                if (operator === '/' && rightValue === 0) {
                    throw new Error('Cannot divide by zero.');
                }

                values.push(operator === '*'
                    ? leftValue * rightValue
                    : leftValue / rightValue);
            } else {
                additionOperators.push(operator);
                values.push(rightValue);
            }
        }

        const result = additionOperators.reduce((total, operator, index) =>
            operator === '+'
                ? total + values[index + 1]
                : total - values[index + 1], values[0]);

        if (!Number.isFinite(result)) {
            throw new Error('The result is outside the supported range.');
        }

        return result;
    }

    global.CalculatorMath = Object.freeze({ evaluate });
}(globalThis));
