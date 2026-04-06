function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function positive() {
  const points = [];
  for (let x = 1; x <= 7; x += 1) {
    points.push({ x, y: x + rand(0, 2) });
  }
  return { points, answer: "Positive correlation" };
}

function negative() {
  const points = [];
  for (let x = 1; x <= 7; x += 1) {
    points.push({ x, y: 9 - x + rand(-1, 1) });
  }
  return { points, answer: "Negative correlation" };
}

function none() {
  const points = [];
  for (let i = 0; i < 7; i += 1) {
    points.push({ x: rand(1, 10), y: rand(1, 10) });
  }
  return { points, answer: "No correlation" };
}

module.exports = function generateScatterPlot(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  const builders = [positive, negative, none];
  const selected = builders[Math.floor(Math.random() * builders.length)]();

  return {
    skill: "Scatter Plot",
    difficulty,
    type: "multiple",
    question: "Based on the scatter plot, what type of relationship is shown?",
    choices: shuffle([
      "Positive correlation",
      "Negative correlation",
      "No correlation",
      "Constant relationship"
    ]),
    answer: selected.answer,
    chart: {
      type: "scatter",
      data: {
        datasets: [
          {
            data: selected.points,
            pointRadius: 5,
            backgroundColor: "#1f4f95"
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
          x: {
            min: 0,
            max: 10,
            ticks: { stepSize: 1 }
          },
          y: {
            min: 0,
            max: 10,
            ticks: { stepSize: 1 }
          }
        }
      }
    },
    explanation: `Look at the overall direction of the points. If they rise from left to right, the relationship is positive. If they fall, it is negative. If there is no clear trend, it is no correlation.`
  };
};