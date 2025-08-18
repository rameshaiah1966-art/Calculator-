document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const calcModeBtn = document.getElementById('calc-mode-btn');
    const expenseModeBtn = document.getElementById('expense-mode-btn');
    const calculatorView = document.getElementById('calculator-view');
    const expenseTrackerView = document.getElementById('expense-tracker-view');
    const expenseForm = document.getElementById('expense-form');
    const expenseDescInput = document.getElementById('expense-desc');
    const expenseAmountInput = document.getElementById('expense-amount');
    const expenseCategoryInput = document.getElementById('expense-category');
    const addExpenseBtn = document.getElementById('add-expense-btn'); // New button
    const expenseList = document.getElementById('expense-list');
    const display = document.getElementById('display');
    const buttons = document.querySelector('.buttons');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history');

    // --- STATE ---
    let history = [];
    let expenses = [];
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

    // --- MODE SWITCHING LOGIC ---
    calcModeBtn.addEventListener('click', () => {
        calculatorView.classList.add('active');
        expenseTrackerView.classList.remove('active');
        calcModeBtn.classList.add('active');
        expenseModeBtn.classList.remove('active');
    });
    expenseModeBtn.addEventListener('click', () => {
        calculatorView.classList.remove('active');
        expenseTrackerView.classList.add('active');
        calcModeBtn.classList.remove('active');
        expenseModeBtn.classList.add('active');
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

    // --- EXPENSE TRACKER LOGIC ---
    function renderExpenses() {
        expenseList.innerHTML = '';
        for (const expense of expenses) {
            const li = document.createElement('li');
            const descSpan = document.createElement('span');
            descSpan.textContent = `${expense.desc} (${expense.category})`;
            const amountSpan = document.createElement('span');
            amountSpan.textContent = `$${expense.amount.toFixed(2)}`;
            li.appendChild(descSpan);
            li.appendChild(amountSpan);
            expenseList.appendChild(li);
        }
    }
    function addExpense(desc, amount, category) {
        expenses.push({ desc, amount, category });
        localStorage.setItem('expenses', JSON.stringify(expenses));
        renderExpenses();
    }
    // Changed from form.submit to button.click
    addExpenseBtn.addEventListener('click', () => {
        const desc = expenseDescInput.value;
        const amount = parseFloat(expenseAmountInput.value);
        const category = expenseCategoryInput.value;
        if (desc && !isNaN(amount) && category) {
            addExpense(desc, amount, category);
            expenseForm.reset();
        }
    });
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
        expenses = JSON.parse(savedExpenses);
        renderExpenses();
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
        } else if (value === 'DEL') {
            deleteLastChar();
        } else {
            appendToDisplay(value);
        }
        updateDisplay();
    });

    function appendToDisplay(value) {
        if (displayValue === '0' || displayValue === 'Error') {
            if (['+', '*', '/', ')', '^'].includes(value)) return;
            displayValue = value;
        } else {
            displayValue += value;
        }
    }

    function preprocessExpression(expr) {
        let processed = expr.replace(/\^/g, '**');
        processed = processed.replace(/sin\(/g, 'Math.sin(');
        processed = processed.replace(/cos\(/g, 'Math.cos(');
        processed = processed.replace(/tan\(/g, 'Math.tan(');
        processed = processed.replace(/log\(/g, 'Math.log10(');
        processed = processed.replace(/ln\(/g, 'Math.log(');
        processed = processed.replace(/exp\(/g, 'Math.exp(');
        return processed;
    }

    function calculate() {
        const expression = displayValue;
        try {
            const preprocessedExpression = preprocessExpression(expression);
            const result = eval(preprocessedExpression);
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

    function deleteLastChar() {
        if (displayValue.length > 1 && displayValue !== 'Error') {
            displayValue = displayValue.slice(0, -1);
        } else {
            displayValue = '0';
        }
    }
});
