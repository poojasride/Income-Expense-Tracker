// Donut chart add data and config

const chart = document.getElementById("myChart");

// ✅ Category-wise data
const data = {
  labels: ["Food", "Travel", "Medicine", "Shopping", "Bills"],
  datasets: [
    {
      label: "Expenses by Category",
      data: [2500, 1800, 1200, 2200, 1500],
      backgroundColor: [
        "#f97316", // Food - orange
        "#38bdf8", // Travel - sky blue
        "#22c55e", // Medicine - green
        "#a855f7", // Shopping - purple
        "#ef4444", // Bills - red
      ],
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
        position: "right",
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
        text: "Spending overview",
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

//Get Transactions

async function getTransctions() {
  const url = "https://6944a75e7dd335f4c360d98f.mockapi.io/transaction";
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

  } catch (error) {
    console.error(error);
  }
}

getTransctions();

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
