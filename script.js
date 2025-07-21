const categoryInput = document.getElementById("category-input");
const suggestionBox = document.getElementById("category-suggestions");
let submitButton = document.getElementById("addExpense");
let categories = JSON.parse(localStorage.getItem("categories")) || [
  "Food",
  "Transport",
  "Entertainment",
  "Enjoy",
  "Utilities",
];
let tbody = document.getElementById("expense-table-body");
const searchInput = document.getElementById("search-input");
const minAmountInput = document.getElementById("min-amount");
const maxAmountInput = document.getElementById("max-amount");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");

const applyFiltersBtn = document.getElementById("apply-filters");
const clearFiltersBtn = document.getElementById("clear-filters");
const toggleFiltersBtn = document.getElementById("toggle-filters");

const filtersPanel = document.getElementById("advanced-filters");

let activeSuggestionIndex = -1;
let updateIndex = -1;
let total = 0;
let currentFilteredExpenses = null;

function updateSuggestions() {
  const input = categoryInput.value.trim().toLowerCase();
  suggestionBox.innerHTML = "";
  activeSuggestionIndex = -1;

  const matches = categories.filter((cat) => cat.toLowerCase().includes(input));

  if (matches.length > 0) {
    matches.forEach((cat) => {
      const li = document.createElement("li");
      li.textContent = cat;
      li.classList.add("suggestion-item");
      li.onclick = () => {
        categoryInput.value = cat;
        suggestionBox.classList.add("hidden");
      };
      suggestionBox.appendChild(li);
    });
  } else if (input) {
    const li = document.createElement("li");
    li.textContent = `+ Add "${categoryInput.value}"`;
    li.style.fontStyle = "italic";
    li.classList.add("suggestion-item");
    li.onclick = () => {
      const newCategory = categoryInput.value.trim();
      if (!categories.includes(newCategory)) {
        categories.push(newCategory);
        localStorage.setItem("categories", JSON.stringify(categories));
      }
      categoryInput.value = newCategory;
      suggestionBox.classList.add("hidden");
    };
    suggestionBox.appendChild(li);
  }

  suggestionBox.classList.toggle("hidden", suggestionBox.children.length === 0);
}

function addExpense(event) {
  event.preventDefault();
  let expenseName = document.getElementById("expense-name");
  let expenseAmount = document.getElementById("expense-amount");
  let expenseCategory = document.getElementById("category-input");
  let expenseDate = document.getElementById("expense-date");

  if (validInput()) {
    console.log("input data is valid");
    let expense = JSON.parse(localStorage.getItem("expenses")) || [];
    const newExpense = {
      name: expenseName.value,
      amount: expenseAmount.value,
      category: expenseCategory.value,
      date: expenseDate.value,
    };

    if (updateIndex !== -1) {
      submitButton.innerText = "Update Expense";
      expense[updateIndex] = newExpense;
      localStorage.setItem("expenses", JSON.stringify(expense));
      updateIndex = -1;
      submitButton.innerText = "Add Expense";
    } else {
      expense.push(newExpense);
      localStorage.setItem("expenses", JSON.stringify(expense));
    }

    showTableData();
    resetForm();
  }
}

function resetForm() {
  document.getElementById("expense-name").value = "";
  document.getElementById("expense-amount").value = "";
  document.getElementById("category-input").value = "";
  document.getElementById("expense-date").value = "";
}

function populateForm(name, amount, category, date) {
  document.getElementById("expense-name").value = `${name}`;
  document.getElementById("expense-amount").value = amount;
  document.getElementById("category-input").value = `${category}`;
  document.getElementById("expense-date").value = `${date}`;
}

function validInput() {
  const form = [
    {
      element: document.getElementById("expense-name"),
      error: document.querySelector(".name-error"),
      errorMsg: "Expense name is required",
    },
    {
      element: document.getElementById("category-input"),
      error: document.querySelector(".category-error"),
      errorMsg: "Please select a category",
    },
    {
      element: document.getElementById("expense-date"),
      error: document.querySelector(".date-error"),
      errorMsg: "Please select a valid date",
    },
    {
      element: document.getElementById("expense-amount"),
      error: document.querySelector(".amount-error"),
      errorMsg: "Please enter a valid amount",
    },
  ];

  let isValid = true;

  form.forEach((item) => {
    if (item.element.value.trim() === "") {
      item.element.classList.add("invalid");
      item.error.textContent = item.errorMsg;

      isValid = false;
    } else {
      item.error.textContent = "";
      item.error.style.display = "none";
    }
  });

  return isValid;
}

function showTableData(event, filteredExpenses) {
  let expenses = null;
  if (filteredExpenses == null) {
    expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  } else {
    expenses = filteredExpenses;
    console.log(expenses);
  }

  let totalElem = document.getElementById("total-amount");
  tbody.innerHTML = "";
  total = 0;
  if (expenses.length !== 0) {
    expenses.forEach((expense, index) => {
      let row = document.createElement("tr");
      row.innerHTML = `
      <td>${expense.name}</td>
      <td>${expense.amount}</td>
      <td>${expense.date}</td>
      <td>${expense.category}</td>
      <td><button class="delete-btn" data-id="${index}">Delete </button>
      <button class="update-btn" data-id="${index}">Update</button>

      `;
      tbody.append(row);
      total += parseFloat(expense.amount);
    });
  } else {
    let row = document.createElement("tr");
    let td = document.createElement("td");
    td.setAttribute("colspan", "5"); // adjust this based on your column count
    td.textContent = "No Data Found";
    td.style.textAlign = "center";
    td.style.fontStyle = "italic";
    row.appendChild(td);
    tbody.appendChild(row);
  }
  totalElem.innerHTML = total;
}

function expenseActions(event) {
  if (event.target.classList.contains("delete-btn")) {
    const id = parseInt(event.target.getAttribute("data-id"));
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    expenses.splice(id, 1);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    showTableData();
  }
  if (event.target.classList.contains("update-btn")) {
    resetForm();
    const id = parseInt(event.target.getAttribute("data-id"));
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    let expense = expenses[id];
    populateForm(expense.name, expense.amount, expense.category, expense.date);
    submitButton.innerText = "Update Expense";
    updateIndex = id;
  }
}

function updateActiveSuggestion(suggestions) {
  suggestions.forEach((li, index) => {
    li.classList.toggle("active", index === activeSuggestionIndex);
  });
}

categoryInput.addEventListener("input", updateSuggestions);
document.addEventListener("click", (e) => {
  if (!e.target.closest(".category-combobox")) {
    suggestionBox.classList.add("hidden");
  }
});

document.addEventListener("DOMContentLoaded", showTableData);

tbody.addEventListener("click", expenseActions);

submitButton.addEventListener("click", addExpense);

categoryInput.addEventListener("keydown", function (e) {
  const suggestions = suggestionBox.querySelectorAll(".suggestion-item");

  if (suggestionBox.classList.contains("hidden") || suggestions.length === 0)
    return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeSuggestionIndex = (activeSuggestionIndex + 1) % suggestions.length;
    updateActiveSuggestion(suggestions);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeSuggestionIndex =
      (activeSuggestionIndex - 1 + suggestions.length) % suggestions.length;
    updateActiveSuggestion(suggestions);
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
      suggestions[activeSuggestionIndex].click();
    }
  }
});

function search(event) {
  const allExpenses =
    currentFilteredExpenses ??
    (JSON.parse(localStorage.getItem("expenses")) || []);
  const searchValue = searchInput.value.trim().toLowerCase();

  const filteredExpenses = allExpenses.filter(
    (expense) =>
      expense.name.toLowerCase().includes(searchValue) ||
      expense.category.toLowerCase().includes(searchValue)
  );

  showTableData(event, filteredExpenses);
}

function filterExpenses() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const minAmount = parseFloat(minAmountInput.value) || 0;
  const maxAmount = parseFloat(maxAmountInput.value) || Infinity;
  const startDate = new Date(startDateInput.value);
  const endDate = new Date(endDateInput.value);

  const expenses = JSON.parse(localStorage.getItem("expenses")) || [];

  const filtered = expenses.filter((exp) => {
    const nameMatch = exp.name.toLowerCase().includes(searchTerm);
    const categoryMatch = exp.category.toLowerCase().includes(searchTerm);

    const amount = parseFloat(exp.amount);
    const amountMatch = amount >= minAmount && amount <= maxAmount;

    const expenseDate = new Date(exp.date);
    const dateMatch =
      (!startDateInput.value || expenseDate >= startDate) &&
      (!endDateInput.value || expenseDate <= endDate);

    return (nameMatch || categoryMatch) && amountMatch && dateMatch;
  });

  currentFilteredExpenses = filtered; // ✅ Store filtered data
  showTableData(undefined, filtered);
}

const toggleBtn = document.getElementById("toggle-filters");
const advancedFilters = document.getElementById("advanced-filters");

toggleBtn.addEventListener("click", () => {
  advancedFilters.classList.toggle("hidden");
  toggleBtn.classList.toggle("active");

  toggleBtn.innerText = advancedFilters.classList.contains("hidden")
    ? "More Filters"
    : "Less Filters";
});

searchInput.addEventListener("input", search);

applyFiltersBtn.addEventListener("click", filterExpenses);

clearFiltersBtn.addEventListener("click", () => {
  searchInput.value = "";
  minAmountInput.value = "";
  maxAmountInput.value = "";
  startDateInput.value = "";
  endDateInput.value = "";
  currentFilteredExpenses = null;
  showTableData();
});

//dark mode

const themeToggle = document.getElementById("theme-toggle");
const body = document.body;

// Load theme from localStorage
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  body.classList.add("dark");
  themeToggle.textContent = "☀️ Light Mode";
}

themeToggle.addEventListener("click", () => {
  body.classList.toggle("dark");

  if (body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
    themeToggle.textContent = "☀️ Light Mode";
  } else {
    localStorage.setItem("theme", "light");
    themeToggle.textContent = "🌙 Dark Mode";
  }
});
