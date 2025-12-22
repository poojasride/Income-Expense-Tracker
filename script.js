// Donut chart add data and config
async function donutChart(categoryTotal) {
  const catLabels = Object.keys(categoryTotal);
  const catValues = Object.values(categoryTotal);

  function dynamicColors() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  // Array to store dynamic colors
  const backgroundColors = [];

  // Loop through your data points and assign a random color for each
  for (let i = 0; i < catLabels.length; i++) {
    backgroundColors.push(dynamicColors()); // Use the RGB function defined above
  }

  const chart = document.getElementById("myChart");

  // ✅ Category-wise data
  const data = {
    labels: catLabels,
    datasets: [
      {
        label: "amount", // this label for hover on chart
        data: catValues,
        backgroundColor: backgroundColors,
        borderWidth: 1,
        hoverOffset: 2,
      },
    ],
  };

  // // ✅ Config AFTER data
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
            color: "#374151", // gray-700
            font: {
              size: 14,
              weight: "600",
            },
          },
        },
        title: {
          display: true,
          text: "Income & Expence Spending Overview",
          color: "#4d525bff",
          font: {
            size: 16,
            weight: "600",
          },
          padding: {
            bottom: 10,
          },
        },
      },
    },
  };

  // ✅ Create chart
  new Chart(chart, config);
}

//Get Transactions
async function getTransactions() {
  const url = "https://6944a75e7dd335f4c360d98f.mockapi.io/transaction-entry";
  try {
    const response = await fetch(url);

    if (!response) throw new Error(`Response : ${response.status} `);

    const transactions = await response.json();

    // Sum income and formatted  $0,000 USD currency formated
    let totalIncome = await calculateIncome(transactions);
    let formattedIncome = await formattedNumber(totalIncome);

    //Sum of expense and formatted  $0,000 USD currency formated
    let totalExpense = await calculateExpense(transactions);
    let formattedExpense = await formattedNumber(totalExpense);

    //sum of balance and formatted  $0,000 USD currency formated
    let balance = totalIncome - totalExpense;
    let formattedBal = await formattedNumber(balance);

    // Handled Overview Cards  Income  &Expense &Balance
    document.getElementById("income").innerHTML = `+ ${formattedIncome}`;
    document.getElementById("expense").innerHTML = `- ${formattedExpense}`;
    document.getElementById("balance").innerHTML = `- ${formattedBal}`;

    return transactions;
  } catch (error) {
    console.error(error);
  }
}

async function calculateIncome(transactions) {
  return transactions
    .filter((transaction) => transaction.type === "Income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
}

async function calculateExpense(transactions) {
  return transactions
    .filter((transaction) => transaction.type === "Expense")

    .reduce((sum, transaction) => sum + transaction.amount, 0);
}

async function formattedNumber(amount) {
  // Format for US Dollar currency
  const formattedNumber = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0, // Set to 0 avoid decimal
    maximumFractionDigits: 0,
  }).format(amount);

  return formattedNumber;
}

function formatDate(dateValue) {
  return new Date(dateValue)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ /g, "-");
}


async function setDataForTable(transaction) {
  const tableBody = document.getElementById("transaction-body");

  tableBody.innerHTML = "";

  transaction.forEach((item) => {
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

    // ✅ ACTION BUTTONS TD
    const actionTd = document.createElement("td");
    actionTd.className = "px-3 py-1 text-center space-x-2";

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className =
      "px-3 py-1 text-sm border rounded text-blue-600 hover:bg-blue-50";

    editBtn.addEventListener("click", () => {
      console.log("Edit clicked for ID:", item.id);
      // openEditModal(item);
    });

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className =
      "px-3 py-1 text-sm border rounded text-red-600 hover:bg-red-50";

    deleteBtn.addEventListener("click", () => {
      console.log("Delete clicked for ID:", item.id);
      // deleteTransaction(item.id);
    });

    actionTd.append(editBtn, deleteBtn);

    row.append(descTd, amountTd, categoryTd, typeTd, dateTd, actionTd);
    tableBody.appendChild(row);
  });
}

//Add transaction  entry
async function addTransaction(data) {
  try {
    const url = "https://6944a75e7dd335f4c360d98f.mockapi.io/transaction-entry";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

// Handle the data for create transaction

let selectedType = "Income"; // default

const incomeBtn = document.getElementById("addTypeIncome");
const expenseButton = document.getElementById("addTypeExpense");

incomeBtn.addEventListener("click", () => {
  selectedType = "Income";

  incomeBtn.style.backgroundColor = "#22D3EE";
  incomeBtn.style.color = "white";

  expenseButton.style.backgroundColor = "#E5E7EB";
  expenseButton.style.color = "black";
});

expenseButton.addEventListener("click", function () {
  expenseButton.style.backgroundColor = "#22D3EE";
  expenseButton.style.color = "white";

  incomeBtn.style.backgroundColor = "#E5E7EB";
  incomeBtn.style.color = "black";

  selectedType = "Expense";
});

document.getElementById("addTypeExpense").addEventListener("click", () => {});

const addEntry = document.getElementById("addEntry");

addEntry.addEventListener("submit", function (event) {
  event.preventDefault();

  const amount = document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value;

  const data = {
    amount: Number(amount), // convert to number
    category: category,
    description: description,
    type: selectedType, // Income or Expense
    date: new Date().toISOString(), // better format
  };

  console.log("Sending:", data);

  addTransaction(data);
});

const resetBtn = document.getElementById("reset");

resetBtn.addEventListener("click", resetData);

const resetAddEntry = document.getElementById("resetEntry");

resetAddEntry.addEventListener("click", resetData);

function resetData() {
  document.getElementById("amount").value = "";
  document.getElementById("category").value = "";
  document.getElementById("description").value = "";

  incomeBtn.style.backgroundColor = "#22D3EE";
  incomeBtn.style.color = "white";

  expenseButton.style.backgroundColor = "#E5E7EB";
  expenseButton.style.color = "black";
}

async function startFun() {
  const transactions = await getTransactions();
  console.log(`transactions : ${transactions}`);

  const categoryTotal = transactions.reduce((acc, item) => {
    const category = item.category.trim();
    const amount = Number(item.amount);

    if (!acc[category]) {
      acc[category] = 0;
    }

    acc[category] += amount;
    return acc;
  }, {});

  //This fun handle donut chart data and colors
  donutChart(categoryTotal);

  // This fun handle transaction history
  setDataForTable(transactions);

  console.log(categoryTotal);
}

startFun();
