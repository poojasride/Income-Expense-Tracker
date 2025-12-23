let donutChartInstance = null; // Chart.js instance
let transactions = []; // Store all transactions
let editMode = false; // Edit mode
let editTransactionId = null; // Id of edited data
let selectedType = "Income"; // Default type for new transactions

// Create or update the donut chart
async function donutChart(categoryTotal) {
  const catLabels = Object.keys(categoryTotal);
  const catValues = Object.values(categoryTotal);

  const chartText = document.getElementById("chartEmptyText");

  if (Object.keys(categoryTotal).length === 0) {
    chartText.classList.remove("hidden");
    return;
  }
  chartText.classList.add("hidden");

  // Generate random RGB color for each category
  function dynamicColors() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgb(${r},${g},${b})`;
  }

  const backgroundColors = catLabels.map(() => dynamicColors());

  const loader = document.getElementById("chartLoader");
  const chartWrapper = document.getElementById("chartWrapper");
  const noChartData = document.getElementById("chartEmptyText");
  const chart = document.getElementById("myChart");

  //  Show loader first
  loader.classList.remove("hidden");
  chartWrapper.classList.add("hidden");
  noChartData.classList.add("hidden");

  setTimeout(() => {
    const data = {
      labels: catLabels,
      datasets: [
        {
          label: "amount", // Hover label
          data: catValues,
          backgroundColor: backgroundColors,
          borderWidth: 1,
          hoverOffset: 2,
        },
      ],
    };

    const config = {
      type: "doughnut",
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#374151",
              font: { size: 14, weight: "600" },
            },
          },
          title: {
            display: true,
            text: "Income & Expense Spending Overview",
            color: "#4d525bff",
            font: { size: 16, weight: "600" },
            padding: { bottom: 10 },
          },
        },
      },
    };

    if (donutChartInstance) {
      donutChartInstance.destroy();
    }

    donutChartInstance = new Chart(chart, config);
    loader.classList.add("hidden");
    chartWrapper.classList.remove("hidden");
  }, 200);
}

// Helper to calculate category totals for chart
function calculateCategoryTotals(transactionArray) {
  return transactionArray.reduce((acc, item) => {
    const category = item.category.trim();
    const amount = Number(item.amount);

    if (!acc[category]) acc[category] = 0;
    acc[category] += amount;
    return acc;
  }, {});
}

// Fetch all transactions from API
async function getTransactions() {
  const url = "https://6944a75e7dd335f4c360d98f.mockapi.io/transaction-entry";
  try {
    const response = await fetch(url);
    if (!response) throw new Error(`Response: ${response.status}`);

    const transactionsData = await response.json();

    const totalIncome = await calculateIncome(transactionsData);
    const formattedIncome = await formattedNumber(totalIncome);

    const totalExpense = await calculateExpense(transactionsData);
    const formattedExpense = await formattedNumber(totalExpense);

    const balance = totalIncome - totalExpense;
    const formattedBalance = await formattedNumber(balance);

    // Update overview cards
    document.getElementById("income").innerHTML = `+ ${formattedIncome}`;
    document.getElementById("expense").innerHTML = `- ${formattedExpense}`;
    document.getElementById("balance").innerHTML = `- ${formattedBalance}`;

    return transactionsData;
  } catch (error) {
    console.error(error);
  }
}

// Calculate total income
async function calculateIncome(transactions) {
  return transactions
    .filter((t) => t.type === "Income")
    .reduce((sum, t) => sum + t.amount, 0);
}

// Calculate total expense
async function calculateExpense(transactions) {
  return transactions
    .filter((t) => t.type === "Expense")
    .reduce((sum, t) => sum + t.amount, 0);
}

// Format number as USD currency
async function formattedNumber(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date as DD-MMM-YYYY
function formatDate(dateValue) {
  return new Date(dateValue)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ /g, "-");
}

// This is transaction table
async function setDataForTable(transactionArray) {
  const tableBody = document.getElementById("transaction-body");
  tableBody.innerHTML = "";

  //  Handle 0 records
  if (!transactionArray || transactionArray.length === 0) {
    const row = document.createElement("tr");

    const td = document.createElement("td");
    td.colSpan = 6; // number of table columns
    td.className = "text-center py-6 text-gray-500 font-medium";
    td.textContent = "No records found";

    row.appendChild(td);
    tableBody.appendChild(row);
    return;
  }

  transactionArray.forEach((item) => {
    const row = document.createElement("tr");
    row.className = "hover:bg-cyan-50 transition";

    const descTd = document.createElement("td");
    descTd.className = "px-6 py-3";
    descTd.textContent = item.description;

    const amountTd = document.createElement("td");
    amountTd.className =
      "px-6 py-3 font-medium " +
      (item.type === "Expense" ? "text-red-500" : "text-green-600");
    amountTd.textContent = `$${item.amount}`;

    const categoryTd = document.createElement("td");
    categoryTd.className = "px-6 py-3";
    categoryTd.textContent = item.category;

    const typeTd = document.createElement("td");
    typeTd.className = "px-6 py-3";
    typeTd.textContent = item.type;

    const dateTd = document.createElement("td");
    dateTd.className = "px-6 py-3";
    dateTd.textContent = formatDate(item.date);

    const actionTd = document.createElement("td");
    actionTd.className = "px-3 py-1 text-center space-x-2";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className =
      "px-3 py-1 text-sm border rounded text-blue-600 hover:bg-blue-50";
    editBtn.addEventListener("click", () => updateHandler(item));

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className =
      "px-3 py-1 text-sm border rounded text-red-600 hover:bg-red-50";
    deleteBtn.addEventListener("click", async () => {
      const confirmDelete = confirm(
        "Are you sure you want to delete this transaction?"
      );
      if (!confirmDelete) return;
      await deleteTransaction(item.id);
      startFun();
    });

    actionTd.append(editBtn, deleteBtn);
    row.append(descTd, amountTd, categoryTd, typeTd, dateTd, actionTd);
    tableBody.appendChild(row);
  });
}

// Add transaction
async function addTransaction(data) {
  try {
    const url = "https://6944a75e7dd335f4c360d98f.mockapi.io/transaction-entry";
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    console.log(await response.json());
  } catch (error) {
    console.error(error);
  }
}

// Update transaction
async function updateTransaction(id, data) {
  try {
    const url = `https://6944a75e7dd335f4c360d98f.mockapi.io/transaction-entry/${id}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    console.log("Updated:", await response.json());
  } catch (error) {
    console.error(error);
  }
}

// Delete transaction
async function deleteTransaction(id) {
  try {
    const url = `https://6944a75e7dd335f4c360d98f.mockapi.io/transaction-entry/${id}`;
    await fetch(url, { method: "DELETE" });
    console.log("Deleted transaction:", id);
  } catch (error) {
    console.error(error);
  }
}

// Handle Income / Expense type selection for ui change button colors
const incomeBtn = document.getElementById("addTypeIncome");
const expenseButton = document.getElementById("addTypeExpense");

incomeBtn.addEventListener("click", () => {
  selectedType = "Income";
  incomeBtn.style.backgroundColor = "#22D3EE";
  incomeBtn.style.color = "white";
  expenseButton.style.backgroundColor = "#E5E7EB";
  expenseButton.style.color = "black";
});

expenseButton.addEventListener("click", () => {
  selectedType = "Expense";
  expenseButton.style.backgroundColor = "#22D3EE";
  expenseButton.style.color = "white";
  incomeBtn.style.backgroundColor = "#E5E7EB";
  incomeBtn.style.color = "black";
});

// Submit form handler
document
  .getElementById("addEntry")
  .addEventListener("submit", async (event) => {
    event.preventDefault(); // Browser default action → Reload page && Browser stops the default action

    // trim() removes unwanted spaces from the beginning and end of a string.
    const amount = document.getElementById("amount").value.trim();
    const category = document.getElementById("category").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!amount || !category) {
      alert("Please fill all fields");
      return;
    }

    const data = {
      amount: Number(amount),
      category,
      description,
      type: selectedType,
      date: new Date().toISOString(),
    };

    if (editMode) {
      await updateTransaction(editTransactionId, data);
      editMode = false;
      editTransactionId = null;
    } else {
      await addTransaction(data);
    }

    resetData();
    startFun();
  });

// Reset form fields using reset button
const resetBtn = document.getElementById("reset");
resetBtn.addEventListener("click", resetData);

function resetData() {
  document.getElementById("amount").value = "";
  document.getElementById("category").value = "";
  document.getElementById("description").value = "";
  incomeBtn.click();
  document.getElementById("submitEntry").innerText = "Add Entry";
  editMode = false;
  editTransactionId = null;
}

// Handle edit action
function updateHandler(item) {
  editMode = true;
  editTransactionId = item.id;
  document.getElementById("amount").value = item.amount;
  document.getElementById("category").value = item.category;
  document.getElementById("description").value = item.description;

  if (item.type === "Income") {
    incomeBtn.click();
  } else {
    expenseButton.click();
  }

  document.getElementById("submitEntry").innerText = "Update Entry";
}

const incomeFilterBtn = document.getElementById("filterIncome");
const expenseFilterBtn = document.getElementById("filterExpense");

// Show only Income transactions
incomeFilterBtn.addEventListener("click", () => {
  const filtered = transactions.filter((item) => item.type === "Income");
  setDataForTable(filtered);
  donutChart(calculateCategoryTotals(filtered));

  incomeFilterBtn.style.backgroundColor = "#22D3EE";
  incomeFilterBtn.style.color = "white";
  expenseFilterBtn.style.backgroundColor = "#E5E7EB";
  expenseFilterBtn.style.color = "black";
});

// Show only Expense transactions
expenseFilterBtn.addEventListener("click", () => {
  const filtered = transactions.filter((item) => item.type === "Expense");
  setDataForTable(filtered);
  donutChart(calculateCategoryTotals(filtered));

  expenseFilterBtn.style.backgroundColor = "#22D3EE";
  expenseFilterBtn.style.color = "white";
  incomeFilterBtn.style.backgroundColor = "#E5E7EB";
  incomeFilterBtn.style.color = "black";
});

//  Show all (reset filter)
const showAllBtn = document.getElementById("filterAll");
if (showAllBtn) {
  showAllBtn.addEventListener("click", () => {
    setDataForTable(transactions);
    donutChart(calculateCategoryTotals(transactions));

    incomeFilterBtn.style.backgroundColor = "#E5E7EB";
    incomeFilterBtn.style.color = "black";
    expenseFilterBtn.style.backgroundColor = "#E5E7EB";
    expenseFilterBtn.style.color = "black";
  });
}

// Search transactions by category or description
const searchInput = document.getElementById("searchCategoryOrDes");

searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.trim().toLowerCase();
  filterBySearchInput(keyword);
});

function filterBySearchInput(keyword) {
  if (!keyword) {
    setDataForTable(transactions);
    donutChart(calculateCategoryTotals(transactions));
    return;
  }

  const filtered = transactions.filter(
    (item) =>
      item.category.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword)
  );

  setDataForTable(filtered);
  donutChart(calculateCategoryTotals(filtered));
}

// Start Function
async function startFun() {
  transactions = await getTransactions();
  const categoryTotal = calculateCategoryTotals(transactions);

  donutChart(categoryTotal);
  setDataForTable(transactions);

  console.log("Transactions:", transactions);
  console.log("Category totals:", categoryTotal);
}

startFun();
