function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

module.exports = function generateLineGraph(options = {}) {
  const difficulty = options.difficulty || "GED-Level";

  const scenarios = [
    {
      title: "Miles Walked",
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      unit: "miles"
    },
    {
      title: "Books Read",
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      unit: "books"
    },
    {
      title: "Plant Height",
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      unit: "centimeters"
    },
    {
      title: "Savings Account Balance",
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      unit: "dollars"
    }
  ];

  const selected = scenarios[rand(0, scenarios.length - 1)];

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

  const change = values[3] - values[0];

  const choices = new Set([change]);
  while (choices.size < 4) {
    const wrong = change + rand(-3, 3);
    if (wrong !== change) {
      choices.add(wrong);
    }
  }

  return {
    skill: "Line Graph",
    subskill: "Line Graph Change",
topic: "Finding change over time from a line graph",
    difficulty,
    type: "multiple",
    question: `The line graph shows ${selected.title.toLowerCase()} over time. How much did the value change from ${selected.labels[0]} to ${selected.labels[3]}?`,
    choices: shuffle(Array.from(choices)),
    answer: change,
    chart: {
      type: "line",
      data: {
        labels: selected.labels,
        datasets: [
          {
            label: selected.title,
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
          legend: { display: false },
          title: {
            display: true,
            text: selected.title
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            min: 0,
            max: Math.max(...values) + 2,
            ticks: { stepSize: 1 },
            title: {
              display: true,
              text: selected.unit.charAt(0).toUpperCase() + selected.unit.slice(1)
            }
          }
        }
      }
    },
    explanation: `Find the difference between ${selected.labels[3]} and ${selected.labels[0]}. That is ${values[3]} - ${values[0]} = ${change}.`
  };
};