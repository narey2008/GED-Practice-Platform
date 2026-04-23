function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

module.exports = function generateLineGraph(options = {}) {
  const difficulty = options.difficulty || "GED-Level";

  const labels = ["Week 1", "Week 2", "Week 3", "Week 4"];

  const start = rand(4, 7);
  const step1 = rand(1, 3);
  const step2 = rand(-1, 2);
  const step3 = rand(1, 3);

  const values = [
    start,
    start + step1,
    start + step1 + step2,
    start + step1 + step2 + step3
  ];

  const increase = values[3] - values[0];

  const choices = new Set([increase]);
  while (choices.size < 4) {
    choices.add(increase + rand(-3, 3));
  }
  choices.delete(null);

  return {
    skill: "Line Graph",
    difficulty,
    type: "multiple",
    question: "According to the line graph, how much did the value increase from Week 1 to Week 4?",
    choices: shuffle(Array.from(choices)),
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
            tension: 0,
            pointRadius: 4,
            pointHoverRadius: 4
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
            min: 0,
            max: Math.max(...values) + 2,
            ticks: { stepSize: 1 }
          }
        }
      }
    },
    explanation: `Find the difference between Week 4 and Week 1. That is ${values[3]} - ${values[0]} = ${increase}.`
  };
};