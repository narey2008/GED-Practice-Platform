function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

module.exports = function generateBarGraph(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  const labels = ["Mon", "Tue", "Wed", "Thu"];
  const values = [
    rand(4, 10),
    rand(5, 11),
    rand(6, 12),
    rand(3, 9)
  ];

  const maxValue = Math.max(...values);
  const correctDay = labels[values.indexOf(maxValue)];

  return {
    skill: "Bar Graph",
    difficulty,
    type: "multiple",
    question: "According to the bar graph, which day has the highest value?",
    choices: shuffle([...labels]),
    answer: correctDay,
    chart: {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: "#1f4f95",
            borderColor: "#153e75",
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }
    },
    explanation: `Compare the heights of the bars. The tallest bar is for ${correctDay}, so ${correctDay} has the highest value.`
  };
};