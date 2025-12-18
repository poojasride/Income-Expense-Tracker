// Donut chart add data and config

const chart = document.getElementById("myChart");

// ✅ Category-wise data
const data = {
  labels: ["Food", "Travel", "Medicine", "Shopping", "Bills"],
  datasets: [
    {
      label: "Expenses by Category",
      data: [2500, 1800, 1200, 2200, 1500], // example amounts
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
