document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const mainAppWrapper = document.querySelector('.main-app-wrapper');
    const viewportBtn = document.getElementById('viewport-btn');
    const calcModeBtn = document.getElementById('calc-mode-btn');
    const expenseModeBtn = document.getElementById('expense-mode-btn');
    const calculatorView = document.getElementById('calculator-view');
    const expenseTrackerView = document.getElementById('expense-tracker-view');
    const expenseForm = document.getElementById('expense-form');
    const expenseDescInput = document.getElementById('expense-desc');
    const expenseAmountInput = document.getElementById('expense-amount');
    const expenseCategoryInput = document.getElementById('expense-category');
    const categorySuggestions = document.getElementById('category-suggestions');
    const customDateCheckbox = document.getElementById('custom-date-checkbox');
    const expenseDateInput = document.getElementById('expense-date');
    const addExpenseBtn = document.getElementById('add-expense-btn');
    const expenseList = document.getElementById('expense-list');
    const expenseSummary = document.getElementById('expense-summary');
    const display = document.getElementById('display');
    const buttons = document.querySelector('.buttons');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history');
    const filterTabs = document.querySelector('.filter-tabs');
    const sortExpensesDropdown = document.getElementById('sort-expenses');

    // --- STATE ---
    let history = [];
    let expenses = [];
    let activeFilter = 'all';
    let currentSort = 'date-desc';
    let displayValue = '0';

    // --- THEME LOGIC ---
    const setTheme = (isDark) => { body.classList.toggle('dark-mode', isDark); themeToggle.checked = isDark; };
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    setTheme(savedTheme === 'dark' || (savedTheme === null && prefersDark));
    themeToggle.addEventListener('change', () => { setTheme(themeToggle.checked); localStorage.setItem('theme', themeToggle.checked ? 'dark' : 'light'); });

    // --- VIEWPORT TOGGLE LOGIC ---
    viewportBtn.addEventListener('click', () => { mainAppWrapper.classList.toggle('mobile-view'); });

    // --- MODE SWITCHING LOGIC ---
    calcModeBtn.addEventListener('click', () => { calculatorView.classList.add('active'); expenseTrackerView.classList.remove('active'); calcModeBtn.classList.add('active'); expenseModeBtn.classList.remove('active'); });
    expenseModeBtn.addEventListener('click', () => { calculatorView.classList.remove('active'); expenseTrackerView.classList.add('active'); calcModeBtn.classList.remove('active'); expenseModeBtn.classList.add('active'); });

    // --- HISTORY LOGIC ---
    function updateHistoryView() { historyList.innerHTML = history.map(item => `<li>${item}</li>`).join(''); historyList.scrollTop = historyList.scrollHeight; }
    function addToHistory(calculation) { history.unshift(calculation); if (history.length > 20) history.pop(); localStorage.setItem('calculatorHistory', JSON.stringify(history)); updateHistoryView(); }
    clearHistoryBtn.addEventListener('click', () => { history = []; localStorage.removeItem('calculatorHistory'); updateHistoryView(); });
    const savedHistory = localStorage.getItem('calculatorHistory');
    if (savedHistory) { history = JSON.parse(savedHistory); updateHistoryView(); }

    // --- EXPENSE TRACKER LOGIC ---
    function renderExpenses(expenseArray) {
        expenseList.innerHTML = '';
        expenseArray.forEach((expense) => {
            const li = document.createElement('li');
            const descSpan = document.createElement('span');
            descSpan.textContent = `${expense.desc} (${expense.category})`;
            const dateString = expense.date.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
            const dateSpan = document.createElement('span');
            dateSpan.className = 'expense-date';
            dateSpan.textContent = dateString;
            const amountSpan = document.createElement('span');
            amountSpan.textContent = `$${expense.amount.toFixed(2)}`;
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'X';
            deleteBtn.dataset.originalIndex = expenses.indexOf(expense);
            const leftDiv = document.createElement('div');
            leftDiv.className = 'expense-item-left';
            leftDiv.appendChild(descSpan);
            leftDiv.appendChild(dateSpan);
            const rightDiv = document.createElement('div');
            rightDiv.className = 'expense-item-right';
            rightDiv.appendChild(amountSpan);
            rightDiv.appendChild(deleteBtn);
            li.appendChild(leftDiv);
            li.appendChild(rightDiv);
            expenseList.appendChild(li);
        });
    }
    function renderSummary(expenseArray) {
        expenseSummary.innerHTML = '';
        if (expenseArray.length === 0) return;
        const total = expenseArray.reduce((sum, exp) => sum + exp.amount, 0);
        const categories = expenseArray.reduce((acc, exp) => { if (!acc[exp.category]) acc[exp.category] = 0; acc[exp.category] += exp.amount; return acc; }, {});
        let summaryHTML = '<h3>Summary</h3>';
        for (const category in categories) { const amount = categories[category]; const percentage = total > 0 ? (amount / total * 100).toFixed(1) : 0; summaryHTML += `<div class="summary-item"><span>${category}</span><span>$${amount.toFixed(2)} (${percentage}%)</span></div>`; }
        summaryHTML += `<div class="summary-item total"><span>Total</span><span>$${total.toFixed(2)}</span></div>`;
        expenseSummary.innerHTML = summaryHTML;
    }
    function updateExpenseView() {
        const now = new Date();
        let filteredExpenses = expenses;

        if (activeFilter === 'weekly') { const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7); filteredExpenses = expenses.filter(exp => exp.date >= oneWeekAgo); }
        else if (activeFilter === 'monthly') { filteredExpenses = expenses.filter(exp => exp.date.getMonth() === now.getMonth() && exp.date.getFullYear() === now.getFullYear()); }
        else if (activeFilter === 'yearly') { filteredExpenses = expenses.filter(exp => exp.date.getFullYear() === now.getFullYear()); }

        const sortValue = currentSort;
        filteredExpenses.sort((a, b) => {
            switch (sortValue) {
                case 'date-asc': return a.date - b.date;
                case 'date-desc': return b.date - a.date;
                case 'amount-asc': return a.amount - b.amount;
                case 'amount-desc': return b.amount - a.amount;
                case 'category-asc': return a.category.localeCompare(b.category);
                default: return b.date - a.date;
            }
        });

        renderExpenses(filteredExpenses);
        renderSummary(filteredExpenses);
    }
    function addExpense(desc, amount, category, date) {
        expenses.push({ desc, amount, category, date });
        localStorage.setItem('expenses', JSON.stringify(expenses));
        updateExpenseView();
    }
    addExpenseBtn.addEventListener('click', () => {
        const desc = expenseDescInput.value;
        const amount = parseFloat(expenseAmountInput.value);
        const category = expenseCategoryInput.value.trim();
        let date = new Date();
        if (customDateCheckbox.checked && expenseDateInput.value) { date = new Date(expenseDateInput.value); }
        if (desc && !isNaN(amount) && category) { addExpense(desc, amount, category, date); expenseForm.reset(); customDateCheckbox.checked = false; expenseDateInput.classList.add('hidden'); }
    });
    expenseList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const index = parseInt(e.target.dataset.originalIndex, 10);
            expenses.splice(index, 1);
            localStorage.setItem('expenses', JSON.stringify(expenses));
            updateExpenseView();
        }
    });
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) { expenses = JSON.parse(savedExpenses); expenses.forEach(exp => exp.date = new Date(exp.date)); updateExpenseView(); }

    customDateCheckbox.addEventListener('change', () => { expenseDateInput.classList.toggle('hidden', !customDateCheckbox.checked); });

    filterTabs.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            const activeBtn = document.querySelector('.filter-btn.active');
            if (activeBtn) activeBtn.classList.remove('active');
            e.target.classList.add('active');
            activeFilter = e.target.dataset.filter;
            updateExpenseView();
        }
    });

    sortExpensesDropdown.addEventListener('change', (e) => {
        currentSort = e.target.value;
        updateExpenseView();
    });

    // --- Autocomplete Logic ---
    expenseCategoryInput.addEventListener('input', () => { const inputText = expenseCategoryInput.value.toLowerCase().trim(); if (!inputText) { categorySuggestions.style.display = 'none'; return; } const uniqueCategories = [...new Set(expenses.map(e => e.category))]; const suggestions = uniqueCategories.filter(cat => cat.toLowerCase().includes(inputText)); categorySuggestions.innerHTML = ''; if (suggestions.length > 0) { suggestions.forEach(suggestion => { const div = document.createElement('div'); div.textContent = suggestion; div.addEventListener('click', () => { expenseCategoryInput.value = suggestion; categorySuggestions.style.display = 'none'; }); categorySuggestions.appendChild(div); }); categorySuggestions.style.display = 'block'; } else { categorySuggestions.style.display = 'none'; } });
    document.addEventListener('click', (e) => { if (!e.target.closest('.autocomplete-wrapper')) { categorySuggestions.style.display = 'none'; } });

    // --- CALCULATOR LOGIC ---
    function updateDisplay() { display.textContent = displayValue; }
    updateDisplay();
    buttons.addEventListener('click', (event) => { const button = event.target.closest('button'); if (!button) return; const { value } = button.dataset; if (value === '=') calculate(); else if (value === 'C') resetCalculator(); else if (value === 'DEL') deleteLastChar(); else appendToDisplay(value); updateDisplay(); });
    function appendToDisplay(value) { if (displayValue === '0' || displayValue === 'Error') { if (['+', '*', '/', ')', '^'].includes(value)) return; displayValue = value; } else { displayValue += value; } }
    function preprocessExpression(expr) { let processed = expr.replace(/\^/g, '**'); processed = processed.replace(/sin\(/g, 'Math.sin('); processed = processed.replace(/cos\(/g, 'Math.cos('); processed = processed.replace(/tan\(/g, 'Math.tan('); processed = processed.replace(/log\(/g, 'Math.log10('); processed = processed.replace(/ln\(/g, 'Math.log('); processed = processed.replace(/exp\(/g, 'Math.exp('); return processed; }
    function calculate() { const expression = displayValue; try { const preprocessedExpression = preprocessExpression(expression); const result = eval(preprocessedExpression); if (result === Infinity || result === -Infinity || isNaN(result)) { throw new Error("Invalid calculation"); } displayValue = result.toString(); addToHistory(`${expression} = ${displayValue}`); } catch (error) { displayValue = 'Error'; } }
    function resetCalculator() { displayValue = '0'; }
    function deleteLastChar() { if (displayValue.length > 1 && displayValue !== 'Error') { displayValue = displayValue.slice(0, -1); } else { displayValue = '0'; } }
});
