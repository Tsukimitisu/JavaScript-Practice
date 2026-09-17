(function attachCalculatorMath(global) {
    'use strict';

    const numberPattern = /^-?(?:\d+\.?\d*|\.\d+)$/;
    const operatorPattern = /^[+\-*/]$/;

    function appendToken(expression, value) {
        const currentExpression = typeof expression === 'string' ? expression.trimEnd() : '';
        const token = String(value).trim();

        if (operatorPattern.test(token)) {
            if (!currentExpression) {
                return expression || '';
            }

            const tokens = currentExpression.split(/\s+/);
            if (tokens.length === 1 && tokens[0] === '-') {
                return expression;
            }

            if (tokens.at(-1) === '-' && operatorPattern.test(tokens.at(-2))) {
                tokens.splice(-2, 2, token);
                return `${tokens.join(' ')} `;
            }

            if (operatorPattern.test(tokens.at(-1))) {
                tokens[tokens.length - 1] = token;
                return `${tokens.join(' ')} `;
            }

            return `${currentExpression} ${token} `;
        }

        if (!/^(?:\d|\.)$/.test(token)) {
            return expression || '';
        }

        if (token === '.' && !currentExpression) {
            return '0.';
        }

        const tokens = currentExpression.split(/\s+/);
        const currentNumber = tokens.at(-1) || '';

        if (token === '.' && currentNumber.includes('.')) {
            return expression || '';
        }

        if (
            currentNumber === '-' &&
            (tokens.length === 1 || operatorPattern.test(tokens.at(-2)))
        ) {
            return `${currentExpression}${token === '.' ? '0.' : token}`;
        }

        if (operatorPattern.test(currentNumber)) {
            return `${currentExpression} ${token === '.' ? '0.' : token}`;
        }

        if (/^-?0$/.test(currentNumber) && /^\d$/.test(token)) {
            tokens[tokens.length - 1] = currentNumber.startsWith('-')
                ? `-${token}`
                : token;
            return tokens.join(' ');
        }

        return `${currentExpression}${token}`;
    }

    function toggleSign(expression) {
        const currentExpression = typeof expression === 'string' ? expression.trimEnd() : '';

        if (!currentExpression) {
            return '-';
        }

        const tokens = currentExpression.split(/\s+/);
        const lastToken = tokens.at(-1);

        if (operatorPattern.test(lastToken)) {
            const isPendingNegative = lastToken === '-' &&
                (tokens.length === 1 || operatorPattern.test(tokens.at(-2)));

            if (isPendingNegative) {
                const expressionWithoutPendingSign = tokens.slice(0, -1).join(' ');

                return operatorPattern.test(tokens.at(-2))
                    ? `${expressionWithoutPendingSign} `
                    : expressionWithoutPendingSign;
            }

            return `${currentExpression} -`;
        }

        if (!numberPattern.test(lastToken)) {
            return expression || '';
        }

        tokens[tokens.length - 1] = lastToken.startsWith('-')
            ? lastToken.slice(1)
            : `-${lastToken}`;

        return tokens.join(' ');
    }

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

    global.CalculatorMath = Object.freeze({ appendToken, evaluate, toggleSign });
}(globalThis));
