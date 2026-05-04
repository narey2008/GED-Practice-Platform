const { getDifficultyProfile } = require("./difficultyProfile");

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function positive(difficulty) {
  const points = [];
  const pointCount = difficulty === "Easy" ? 6 : difficulty === "Medium" ? 8 : 10;
  const noise = difficulty === "Easy" ? 1 : difficulty === "Medium" ? 2 : 3;

  for (let x = 1; x <= pointCount; x += 1) {
    points.push({ x, y: Math.min(10, x + rand(0, noise)) });
  }

  return {
    points,
    answer: "Positive correlation",
    title: "Hours Studied vs. Quiz Score",
    xLabel: "Hours Studied",
    yLabel: "Quiz Score",
    explanation: "The points generally rise from left to right, so the relationship is positive."
  };
}

function negative(difficulty) {
  const points = [];
  const pointCount = difficulty === "Easy" ? 6 : difficulty === "Medium" ? 8 : 10;
  const noise = difficulty === "Easy" ? 1 : difficulty === "Medium" ? 2 : 3;

  for (let x = 1; x <= pointCount; x += 1) {
    points.push({ x, y: Math.max(1, 11 - x + rand(-noise, noise)) });
  }

  return {
    points,
    answer: "Negative correlation",
    title: "Absences vs. Final Grade",
    xLabel: "Absences",
    yLabel: "Final Grade",
    explanation: "The points generally fall from left to right, so the relationship is negative."
  };
}

function none(difficulty) {
  const points = [];
  const used = new Set();
  const pointCount = difficulty === "Easy" ? 6 : difficulty === "Medium" ? 8 : 10;

  while (points.length < pointCount) {
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
    yLabel: "Books Read",
    explanation: "The points do not show a clear upward or downward pattern, so there is no correlation."
  };
}

module.exports = function generateScatterPlot(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  getDifficultyProfile(difficulty);

  const builders =
    difficulty === "Easy"
      ? [positive, negative]
      : [positive, negative, none];

  const selected = builders[rand(0, builders.length - 1)](difficulty);

  return {
    skill: "Scatter Plot",
    subskill: "Scatter Plot Correlation",
    topic: "Identifying correlation from a scatter plot",
    difficulty,
    type: "multiple",
    question: `Use the scatter plot to answer the question. What type of relationship is shown between ${selected.xLabel.toLowerCase()} and ${selected.yLabel.toLowerCase()}?`,
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
    explanation: selected.explanation
  };
};