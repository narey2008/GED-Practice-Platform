const { getDifficultyProfile } = require("./difficultyProfile");

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function uniqueNumberChoices(answer, wrongs) {
  const choices = new Set([answer]);

  wrongs.forEach((w) => {
    if (Number.isFinite(w) && w >= 0 && w !== answer && choices.size < 4) {
      choices.add(w);
    }
  });

  while (choices.size < 4) {
    const wrong = Number((answer + rand(-15, 18)).toFixed(2));
    if (wrong >= 0 && wrong !== answer) choices.add(wrong);
  }

  return shuffle(Array.from(choices));
}

function percentOfTotal(difficulty, p) {
  const total = rand(
    Math.ceil(p.largeMin / 10),
    Math.ceil(p.largeMax / 10)
  ) * 10;

  const percent = p.percents[rand(0, p.percents.length - 1)];
  const answer = Math.round((percent / 100) * total);

  const scenarios =
    difficulty === "Easy"
      ? [
          "A store sold " + total + " items. " + percent + "% were notebooks. How many notebooks were sold?",
          "A class has a goal of " + total + " pages. They read " + percent + "% of the pages. How many pages did they read?"
        ]
      : difficulty === "Medium"
      ? [
          "A store sold " + total + " items in one day. " + percent + "% of the items were sold in the morning. How many items were sold in the morning?",
          "A school ordered " + total + " supplies. " + percent + "% of them were notebooks. How many notebooks were ordered?"
        ]
      : [
          "A school event had " + total + " tickets available. By noon, " + percent + "% of the tickets had been sold. How many tickets had been sold by noon?",
          "A warehouse received " + total + " packages. If " + percent + "% were delivered the same day, how many packages were delivered that day?"
        ];

  return {
    skill: "Percent",
    subskill: "Percent of a Total",
    topic: "Finding a percent of a total in a word problem",
    difficulty,
    type: p.allowFill && rand(0, 3) === 0 ? "fill" : "multiple",
    question: scenarios[rand(0, scenarios.length - 1)],
    choices: uniqueNumberChoices(answer, [
      answer + rand(5, 20),
      Math.max(1, answer - rand(5, 20)),
      total - answer,
      Math.round(total / Math.max(1, percent))
    ]),
    answer: p.allowFill && rand(0, 3) === 0 ? String(answer) : answer,
    explanation:
      percent +
      "% of " +
      total +
      " = (" +
      percent +
      "/100) × " +
      total +
      " = " +
      answer +
      "."
  };
}

function graphPlusComputation(difficulty, p) {
  const labels =
    difficulty === "Easy"
      ? ["Mon", "Tue", "Wed", "Thu"]
      : ["Week 1", "Week 2", "Week 3", "Week 4"];

  const values = [
    rand(4, p.graphMax),
    rand(5, p.graphMax + 2),
    rand(3, p.graphMax + 3),
    rand(6, p.graphMax + 4)
  ];

  const total = values.reduce((a, b) => a + b, 0);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const difference = maxValue - minValue;

  const askTotal = difficulty === "Easy" ? true : rand(0, 1) === 1;
  const answer = askTotal ? total : difference;

  return {
    skill: "Graphs + Computation",
    subskill: askTotal ? "Graph Totals" : "Graph Difference",
    topic: askTotal ? "Adding values from a graph" : "Finding differences from a graph",
    difficulty,
    type: "multiple",
    question: askTotal
      ? "Use the bar graph to answer the question. What is the total number of customers shown?"
      : "Use the bar graph to answer the question. What is the difference between the greatest and least number of customers?",
    choices: uniqueNumberChoices(answer, [
      total,
      difference,
      maxValue,
      minValue,
      answer + rand(3, 12)
    ]),
    answer,
chart: {
  type: "bar",
  data: {
    labels,
    datasets: [
      {
        label: "Customers",
        data: values,
        backgroundColor: "rgba(21, 62, 117, 0.78)",
        borderColor: "#153e75",
        borderWidth: 2,
        borderRadius: 8,
        maxBarThickness: 160,
        categoryPercentage: 1,
        barPercentage: 0.98
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    layout: {
      padding: {
        top: 8,
        right: 18,
        bottom: 8,
        left: 72
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: "Customers",
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
        text: "Customers",
        font: {
          size: 17,
          weight: "bold"
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.parsed.y} customers`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 13,
            weight: "bold"
          }
        }
      },
      y: {
        beginAtZero: true,
        min: 0,
        max: Math.max(...values) + 4,
        ticks: {
          stepSize: difficulty === "Easy" ? 1 : 2,
          font: {
            size: 13,
            weight: "bold"
          }
        },
        title: {
          display: false
        }
      }
    }
  }
},
    explanation: askTotal
      ? "Add all values: " + values.join(" + ") + " = " + total + "."
      : "Subtract the least value from the greatest value: " + maxValue + " - " + minValue + " = " + difference + "."
  };
}

function rectangleCost(difficulty, p) {
  const length = rand(p.mediumMin, p.lengthMax);
  const width = rand(p.smallMin, p.widthMax);
  const costPerUnit = rand(2, p.costMax);

  const area = length * width;
  const answer = area * costPerUnit;

  return {
    skill: "Geometry + Cost",
    subskill: "Area Cost Problems",
    topic: "Using area to calculate total cost",
    difficulty,
    type: "multiple",
    question:
      difficulty === "Easy"
        ? "A rectangular floor is " + length + " ft by " + width + " ft. What is the area of the floor?"
        : "A rectangular floor is " + length + " ft by " + width + " ft. Tile costs $" + costPerUnit + " per square foot. What is the total cost to cover the floor?",
    choices:
      difficulty === "Easy"
        ? uniqueNumberChoices(area, [
            2 * (length + width),
            length + width,
            area + rand(3, 10)
          ])
        : uniqueNumberChoices(answer, [
            area,
            answer + rand(20, 80),
            area + costPerUnit,
            2 * (length + width) * costPerUnit
          ]),
    answer: difficulty === "Easy" ? area : answer,
    explanation:
      difficulty === "Easy"
        ? "Area = length × width, so " + length + " × " + width + " = " + area + "."
        : "Area = " + length + " × " + width + " = " + area + ". Then multiply by cost: " + area + " × " + costPerUnit + " = " + answer + "."
  };
}

function averageFromTable(difficulty, p) {
  const count = difficulty === "Easy" ? 3 : 4;
  const values = [];

  for (let i = 0; i < count; i += 1) {
    values.push(rand(p.scoreMin, p.scoreMax));
  }

  const sum = values.reduce((a, b) => a + b, 0);
  const avg = Math.round(sum / values.length);

  return {
    skill: "Data + Average",
    subskill: "Average",
    topic: "Finding the mean of a data set",
    difficulty,
    type: "multiple",
    question:
      "A student scored " +
      values.join(", ") +
      " on " +
      values.length +
      " tests. What was the average score?",
    choices: uniqueNumberChoices(avg, [
      avg + rand(2, 8),
      Math.max(1, avg - rand(2, 8)),
      sum,
      Math.round(sum / Math.max(1, values.length - 1))
    ]),
    answer: avg,
    explanation:
      "Add all scores and divide by " +
      values.length +
      ": " +
      sum +
      " ÷ " +
      values.length +
      " = " +
      avg +
      "."
  };
}

module.exports = function generateMultiStep(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  const p = getDifficultyProfile(difficulty);

  const easyBank = [percentOfTotal, graphPlusComputation, rectangleCost, averageFromTable];
  const mediumBank = [percentOfTotal, graphPlusComputation, rectangleCost, averageFromTable];
  const gedBank = [percentOfTotal, graphPlusComputation, rectangleCost, averageFromTable];

  const bank =
    difficulty === "Easy" ? easyBank : difficulty === "Medium" ? mediumBank : gedBank;

  const question = bank[rand(0, bank.length - 1)](difficulty, p);

  return {
    ...question,
    difficulty
  };
};