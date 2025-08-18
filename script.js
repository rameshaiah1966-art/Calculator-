document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const buttons = document.querySelector('.buttons');

    let displayValue = '0';
    let firstOperand = null;
    let operator = null;
    let waitingForSecondOperand = false;

    function updateDisplay() {
        display.textContent = displayValue;
    }

    updateDisplay();

    buttons.addEventListener('click', (event) => {
        const { target } = event;
        // Use .closest('button') to handle clicks on child elements if any
        const button = target.closest('button');

        if (!button) {
            return;
        }

        const { value } = button.dataset;

        switch (value) {
            case '+':
            case '-':
            case '*':
            case '/':
            case '=':
                handleOperator(value);
                break;
            case '.':
                inputDecimal();
                break;
            case 'C':
                resetCalculator();
                break;
            default:
                if (Number.isInteger(parseInt(value))) {
                    inputDigit(value);
                }
        }
        updateDisplay();
    });

    function inputDigit(digit) {
        if (waitingForSecondOperand) {
            displayValue = digit;
            waitingForSecondOperand = false;
        } else {
            displayValue = displayValue === '0' ? digit : displayValue + digit;
        }
    }

    function inputDecimal() {
        if (waitingForSecondOperand) {
            displayValue = '0.';
            waitingForSecondOperand = false;
            return;
        }
        if (!displayValue.includes('.')) {
            displayValue += '.';
        }
    }

    const performCalculation = {
        '/': (first, second) => first / second,
        '*': (first, second) => first * second,
        '+': (first, second) => first + second,
        '-': (first, second) => first - second,
        '=': (first, second) => second // The result is simply the second operand
    };

    function handleOperator(nextOperator) {
        const inputValue = parseFloat(displayValue);

        if (operator && waitingForSecondOperand) {
            operator = nextOperator;
            return;
        }

        if (firstOperand === null) {
            firstOperand = inputValue;
        } else if (operator) {
            const result = performCalculation[operator](firstOperand, inputValue);

            if (result === Infinity || result === -Infinity) {
                displayValue = 'Error';
                firstOperand = null;
                operator = null;
                waitingForSecondOperand = true;
                return;
            }

            displayValue = `${parseFloat(result.toFixed(7))}`;
            firstOperand = result;
        }

        waitingForSecondOperand = true;
        operator = nextOperator;

        // Special case for equals, we want to finalize the calculation
        if (nextOperator === '=') {
            // The result is already in displayValue, just reset state
            firstOperand = null;
            operator = null;
            // Keep waitingForSecondOperand = true so next digit starts a new calculation
        }
    }

    function resetCalculator() {
        displayValue = '0';
        firstOperand = null;
        operator = null;
        waitingForSecondOperand = false;
    }
});
