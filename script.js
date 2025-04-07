// DOM Elements
const expenseForm = document.getElementById('expense-form');
const expensesTableBody = document.getElementById('expenses-table-body');
const totalAmountElement = document.getElementById('total-amount');
const monthAmountElement = document.getElementById('month-amount');
const averageAmountElement = document.getElementById('average-amount');
const searchExpense = document.getElementById('search-expense');
const filterCategory = document.getElementById('filter-category');
const sortBy = document.getElementById('sort-by');
const editModal = document.getElementById('edit-modal');
const deleteModal = document.getElementById('delete-modal');
const editExpenseForm = document.getElementById('edit-expense-form');
const deleteExpenseId = document.getElementById('delete-expense-id');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const clearDataBtn = document.getElementById('clear-data');

// Constants
const EXPENSES_PER_PAGE = 10;
const STORAGE_KEY = 'expenseTrackerData';

// State
let expenses = [];
let filteredExpenses = [];
let currentPage = 1;
let totalPages = 1;

// Initialize the app
function initApp() {
    // Set default date to today
    document.getElementById('expense-date').valueAsDate = new Date();
    
    // Load expenses from localStorage
    loadExpenses();
    
    // Render expenses
    renderExpenses();
    
    // Update summary
    updateSummary();
    
    // Add event listeners
    addEventListeners();
}

// Load expenses from localStorage
function loadExpenses() {
    const storedExpenses = localStorage.getItem(STORAGE_KEY);
    if (storedExpenses) {
        expenses = JSON.parse(storedExpenses);
    }
}

// Save expenses to localStorage
function saveExpenses() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

// Add event listeners
function addEventListeners() {
    // Form submission
    expenseForm.addEventListener('submit', handleAddExpense);
    
    // Search and filter
    searchExpense.addEventListener('input', handleSearch);
    filterCategory.addEventListener('change', handleFilter);
    sortBy.addEventListener('change', handleSort);
    
    // Edit expense
    editExpenseForm.addEventListener('submit', handleEditExpense);
    
    // Delete expense
    document.querySelector('.btn-delete-confirm').addEventListener('click', handleDeleteExpense);
    
    // Pagination
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderExpenses();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderExpenses();
        }
    });
    
    // Modal close buttons
    document.querySelectorAll('.close-modal, .btn-cancel').forEach(button => {
        button.addEventListener('click', () => {
            editModal.style.display = 'none';
            deleteModal.style.display = 'none';
        });
    });
    
    // Notification close button
    document.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.display = 'none';
    });
    
    // Clear all data
    clearDataBtn.addEventListener('click', handleClearData);
    
    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === editModal) {
            editModal.style.display = 'none';
        }
        if (event.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
    });
}

// Handle adding a new expense
function handleAddExpense(event) {
    event.preventDefault();
    
    const name = document.getElementById('expense-name').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;
    const date = document.getElementById('expense-date').value;
    const notes = document.getElementById('expense-notes').value;
    
    const newExpense = {
        id: Date.now().toString(),
        name,
        amount,
        category,
        date,
        notes,
        createdAt: new Date().toISOString()
    };
    
    expenses.push(newExpense);
    saveExpenses();
    
    // Reset form
    expenseForm.reset();
    document.getElementById('expense-date').valueAsDate = new Date();
    
    // Update UI
    renderExpenses();
    updateSummary();
    
    // Show notification
    showNotification('Expense added successfully!');
}

// Handle editing an expense
function handleEditExpense(event) {
    event.preventDefault();
    
    const id = document.getElementById('edit-expense-id').value;
    const name = document.getElementById('edit-expense-name').value;
    const amount = parseFloat(document.getElementById('edit-expense-amount').value);
    const category = document.getElementById('edit-expense-category').value;
    const date = document.getElementById('edit-expense-date').value;
    const notes = document.getElementById('edit-expense-notes').value;
    
    const expenseIndex = expenses.findIndex(expense => expense.id === id);
    
    if (expenseIndex !== -1) {
        expenses[expenseIndex] = {
            ...expenses[expenseIndex],
            name,
            amount,
            category,
            date,
            notes,
            updatedAt: new Date().toISOString()
        };
        
        saveExpenses();
        
        // Update UI
        renderExpenses();
        updateSummary();
        
        // Close modal
        editModal.style.display = 'none';
        
        // Show notification
        showNotification('Expense updated successfully!');
    }
}

// Handle deleting an expense
function handleDeleteExpense() {
    const id = deleteExpenseId.value;
    
    expenses = expenses.filter(expense => expense.id !== id);
    saveExpenses();
    
    // Update UI
    renderExpenses();
    updateSummary();
    
    // Close modal
    deleteModal.style.display = 'none';
    
    // Show notification
    showNotification('Expense deleted successfully!');
}

// Handle search
function handleSearch() {
    currentPage = 1;
    renderExpenses();
}

// Handle filter
function handleFilter() {
    currentPage = 1;
    renderExpenses();
}

// Handle sort
function handleSort() {
    renderExpenses();
}

// Handle clear all data
function handleClearData(event) {
    event.preventDefault();
    
    if (confirm('Are you sure you want to reset all data? This will delete all your expenses.')) {
        expenses = [];
        saveExpenses();
        
        // Update UI
        renderExpenses();
        updateSummary();
        
        // Show notification
        showNotification('All data has been reset!');
    }
}

// Filter and sort expenses
function getFilteredAndSortedExpenses() {
    const searchTerm = searchExpense.value.toLowerCase();
    const categoryFilter = filterCategory.value;
    const sortOption = sortBy.value;
    
    // Filter
    let result = expenses.filter(expense => {
        const matchesSearch = expense.name.toLowerCase().includes(searchTerm) || 
                             expense.notes.toLowerCase().includes(searchTerm);
        const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
    });
    
    // Sort
    result.sort((a, b) => {
        switch (sortOption) {
            case 'date-desc':
                return new Date(b.date) - new Date(a.date);
            case 'date-asc':
                return new Date(a.date) - new Date(b.date);
            case 'amount-desc':
                return b.amount - a.amount;
            case 'amount-asc':
                return a.amount - b.amount;
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            default:
                return new Date(b.date) - new Date(a.date);
        }
    });
    
    return result;
}

// Render expenses
function renderExpenses() {
    filteredExpenses = getFilteredAndSortedExpenses();
    
    // Calculate pagination
    totalPages = Math.ceil(filteredExpenses.length / EXPENSES_PER_PAGE);
    if (totalPages === 0) totalPages = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    
    // Update pagination controls
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    // Get current page expenses
    const startIndex = (currentPage - 1) * EXPENSES_PER_PAGE;
    const endIndex = startIndex + EXPENSES_PER_PAGE;
    const currentPageExpenses = filteredExpenses.slice(startIndex, endIndex);
    
    // Clear table
    expensesTableBody.innerHTML = '';
    
    // Show message if no expenses
    if (currentPageExpenses.length === 0) {
        const noExpensesRow = document.createElement('tr');
        noExpensesRow.className = 'no-expenses-row';
        
        const noExpensesCell = document.createElement('td');
        noExpensesCell.colSpan = 5;
        noExpensesCell.className = 'no-expenses-message';
        
        if (expenses.length === 0) {
            noExpensesCell.textContent = 'No expenses added yet. Add your first expense above!';
        } else {
            noExpensesCell.textContent = 'No expenses match your search criteria.';
        }
        
        noExpensesRow.appendChild(noExpensesCell);
        expensesTableBody.appendChild(noExpensesRow);
        return;
    }
    
    // Add expense rows
    currentPageExpenses.forEach(expense => {
        const row = document.createElement('tr');
        
        // Format date
        const expenseDate = new Date(expense.date);
        const formattedDate = expenseDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Format amount
        const formattedAmount = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(expense.amount);
        
        // Create category label
        const categoryLabel = getCategoryLabel(expense.category);
        
        row.innerHTML = `
            <td title="${expense.notes ? expense.notes : ''}">${expense.name}</td>
            <td><span class="category-badge ${expense.category}">${categoryLabel}</span></td>
            <td>${formattedDate}</td>
            <td class="amount">${formattedAmount}</td>
            <td class="actions">
                <button class="btn-edit" data-id="${expense.id}"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn-delete" data-id="${expense.id}"><i class="fas fa-trash"></i> Delete</button>
            </td>
        `;
        
        expensesTableBody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', () => openEditModal(button.dataset.id));
    });
    
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', () => openDeleteModal(button.dataset.id));
    });
}

// Update summary
function updateSummary() {
    // Calculate total amount
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate this month's amount
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthAmount = expenses
        .filter(expense => new Date(expense.date) >= firstDayOfMonth)
        .reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate average per day
    let avgAmount = 0;
    if (expenses.length > 0) {
        const oldestExpense = expenses.reduce((oldest, expense) => {
            return new Date(expense.date) < new Date(oldest.date) ? expense : oldest;
        }, expenses[0]);
        
        const oldestDate = new Date(oldestExpense.date);
        const daysDiff = Math.max(1, Math.ceil((today - oldestDate) / (1000 * 60 * 60 * 24)));
        avgAmount = totalAmount / daysDiff;
    }
    
    // Format amounts
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });
    
    totalAmountElement.textContent = formatter.format(totalAmount);
    monthAmountElement.textContent = formatter.format(monthAmount);
    averageAmountElement.textContent = formatter.format(avgAmount);
}

// Open edit modal
function openEditModal(id) {
    const expense = expenses.find(expense => expense.id === id);
    
    if (expense) {
        document.getElementById('edit-expense-id').value = expense.id;
        document.getElementById('edit-expense-name').value = expense.name;
        document.getElementById('edit-expense-amount').value = expense.amount;
        document.getElementById('edit-expense-category').value = expense.category;
        document.getElementById('edit-expense-date').value = expense.date;
        document.getElementById('edit-expense-notes').value = expense.notes || '';
        
        editModal.style.display = 'block';
    }
}

// Open delete modal
function openDeleteModal(id) {
    deleteExpenseId.value = id;
    deleteModal.style.display = 'block';
}

// Show notification
function showNotification(message) {
    notificationMessage.textContent = message;
    notification.style.display = 'block';
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Get category label
function getCategoryLabel(category) {
    switch (category) {
        case 'food': return 'Food & Groceries';
        case 'transportation': return 'Transportation';
        case 'housing': return 'Housing & Rent';
        case 'utilities': return 'Utilities';
        case 'entertainment': return 'Entertainment';
        case 'healthcare': return 'Healthcare';
        case 'education': return 'Education';
        case 'shopping': return 'Shopping';
        case 'other': return 'Other';
        default: return category.charAt(0).toUpperCase() + category.slice(1);
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);