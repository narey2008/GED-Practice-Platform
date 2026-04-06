function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

module.exports = function generateLineGraph(options = {}) {
  const difficulty = options.difficulty || "GED-Level";

  const labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
  const values = [rand(4, 8), rand(6, 10), rand(5, 11), rand(7, 12)];
  const increase = values[3] - values[0];

  return {
    skill: "Line Graph",
    difficulty,
    type: "multiple",
    question: "According to the line graph, how much did the value increase from Week 1 to Week 4?",
    choices: shuffle([increase, increase + 1, increase - 1, increase + 3]),
    answer: increase,
    chart: {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            data: values,
            borderColor: "#153e75",
            backgroundColor: "#1f4f95",
            fill: false,
            tension: 0.2,
            pointRadius: 4
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
    explanation: `Find the difference between Week 4 and Week 1. That is ${values[3]} - ${values[0]} = ${increase}.`
  };
};