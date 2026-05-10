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
        pointRadius: 6,
        pointHoverRadius: 7,
        hitRadius: 10,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#153e75",
        pointBorderWidth: 3,
        backgroundColor: "#153e75",
        borderColor: "#153e75",
        clip: false
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
layout: {
  padding: {
    top: 10,
    right: 28,
    bottom: 10,
    left: 120
  }
},
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: selected.title,
        font: {
          size: 17,
          weight: "bold"
        },
        padding: {
          top: 4,
          bottom: 14
        }
      },
      horizontalYAxisTitle: {
        display: true,
        text: selected.yLabel,
        font: {
          size: 17,
          weight: "bold"
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `(${context.parsed.x}, ${context.parsed.y})`;
          }
        }
      }
    },
    scales: {
      x: {
        type: "linear",
        min: 0,
        max: 11,
        grid: {
          display: true
        },
        ticks: {
          stepSize: 1,
          font: {
            size: 13,
            weight: "bold"
          },
          callback: function(value) {
            return value <= 10 ? value : "";
          }
        },
        title: {
          display: true,
          text: selected.xLabel,
          font: {
            size: 14,
            weight: "bold"
          }
        }
      },
      y: {
        min: 0,
        max: 11,
        grid: {
          display: true
        },
        ticks: {
          stepSize: 1,
          font: {
            size: 13,
            weight: "bold"
          },
          callback: function(value) {
            return value <= 10 ? value : "";
          }
        },
        title: {
          display: false
        }
      }
    }
  }
},
    explanation: selected.explanation
  };
};