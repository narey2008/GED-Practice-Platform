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
  return {
    points,
    answer: "Positive correlation",
    title: "Hours Studied vs. Quiz Score",
    xLabel: "Hours Studied",
    yLabel: "Quiz Score"
  };
}

function negative() {
  const points = [];
  for (let x = 1; x <= 7; x += 1) {
    points.push({ x, y: 9 - x + rand(-1, 1) });
  }
  return {
    points,
    answer: "Negative correlation",
    title: "Absences vs. Final Grade",
    xLabel: "Absences",
    yLabel: "Final Grade"
  };
}

function none() {
  const points = [];
  const used = new Set();

  while (points.length < 7) {
    const x = rand(1, 10);
    const y = rand(1, 10);
    const key = `${x},${y}`;

    if (!used.has(key)) {
      used.add(key);
      points.push({ x, y });
    }
  }

  return {
    points,
    answer: "No correlation",
    title: "Shoe Size vs. Number of Books Read",
    xLabel: "Shoe Size",
    yLabel: "Books Read"
  };
}

module.exports = function generateScatterPlot(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  const builders = [positive, negative, none];
  const selected = builders[rand(0, builders.length - 1)]();

  return {
    skill: "Scatter Plot",
    subskill: "Scatter Plot Correlation",
topic: "Identifying correlation from a scatter plot",
    difficulty,
    type: "multiple",
    question: `The scatter plot compares ${selected.xLabel.toLowerCase()} and ${selected.yLabel.toLowerCase()}. What type of relationship is shown?`,
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
            label: selected.title,
            data: selected.points,
            parsing: false,
            pointRadius: 5,
            pointHoverRadius: 5,
            backgroundColor: "#1f4f95"
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
          x: {
            type: "linear",
            min: 0,
            max: 10,
            ticks: { stepSize: 1 },
            title: {
              display: true,
              text: selected.xLabel
            }
          },
          y: {
            min: 0,
            max: 10,
            ticks: { stepSize: 1 },
            title: {
              display: true,
              text: selected.yLabel
            }
          }
        }
      }
    },
    explanation: `Look at the overall direction of the points. If they rise from left to right, the relationship is positive. If they fall from left to right, it is negative. If there is no clear pattern, it is no correlation.`
  };
};