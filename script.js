document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const display = document.getElementById('display');
    const buttons = document.querySelector('.buttons');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history');

    // --- STATE ---
    let history = [];
    let displayValue = '0';

    // --- THEME LOGIC ---
    const setTheme = (isDark) => {
        body.classList.toggle('dark-mode', isDark);
        themeToggle.checked = isDark;
    };
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    setTheme(savedTheme === 'dark' || (savedTheme === null && prefersDark));
    themeToggle.addEventListener('change', () => {
        setTheme(themeToggle.checked);
        localStorage.setItem('theme', themeToggle.checked ? 'dark' : 'light');
    });

    // --- HISTORY LOGIC ---
    function updateHistoryView() {
        historyList.innerHTML = history.map(item => `<li>${item}</li>`).join('');
        historyList.scrollTop = historyList.scrollHeight;
    }
    function addToHistory(calculation) {
        history.unshift(calculation);
        if (history.length > 20) history.pop();
        localStorage.setItem('calculatorHistory', JSON.stringify(history));
        updateHistoryView();
    }
    clearHistoryBtn.addEventListener('click', () => {
        history = [];
        localStorage.removeItem('calculatorHistory');
        updateHistoryView();
    });
    const savedHistory = localStorage.getItem('calculatorHistory');
    if (savedHistory) {
        history = JSON.parse(savedHistory);
        updateHistoryView();
    }

    // --- CALCULATOR LOGIC ---
    function updateDisplay() {
        display.textContent = displayValue;
    }
    updateDisplay();

    buttons.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;
        const { value } = button.dataset;

        if (value === '=') {
            calculate();
        } else if (value === 'C') {
            resetCalculator();
        } else {
            appendToDisplay(value);
        }
        updateDisplay();
    });

    function appendToDisplay(value) {
        if (displayValue === '0' || displayValue === 'Error') {
            // Don't allow starting with an operator other than '-' or '('
            if (['+', '*', '/', ')'].includes(value)) return;
            displayValue = value;
        } else {
            displayValue += value;
        }
    }

    function calculate() {
        const expression = displayValue;
        try {
            // Sanitize expression to only allow numbers, operators, and parentheses
            const sanitizedExpression = expression.replace(/[^-()\d/*+.]/g, '');
            if (sanitizedExpression !== expression) {
                throw new Error("Invalid characters in expression");
            }

            const result = eval(sanitizedExpression);
            if (result === Infinity || result === -Infinity || isNaN(result)) {
                throw new Error("Invalid calculation");
            }

            displayValue = result.toString();
            addToHistory(`${expression} = ${displayValue}`);
        } catch (error) {
            displayValue = 'Error';
        }
    }

    function resetCalculator() {
        displayValue = '0';
    }
});
