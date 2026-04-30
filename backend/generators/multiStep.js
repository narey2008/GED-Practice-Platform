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
    const wrong = answer + rand(-10, 12);
    if (wrong >= 0 && wrong !== answer) {
      choices.add(wrong);
    }
  }

  return shuffle(Array.from(choices));
}

function percentOfTotal() {
  const total = rand(8, 20) * 10;
  const percent = [10, 20, 25, 30, 40, 50][rand(0, 5)];
  const answer = Math.round((percent / 100) * total);

  return {
    skill: "Percent",
    subskill: "Percent of a Total",
    topic: "Finding a percent of a total in a word problem",
    difficulty: "GED-Level",
    type: "multiple",
    question:
      "A store sold " +
      total +
      " items in one day. " +
      percent +
      "% of the items were sold in the morning. How many items were sold in the morning?",
    choices: uniqueNumberChoices(answer, [
      answer + rand(5, 15),
      Math.max(1, answer - rand(5, 15)),
      total - answer,
      Math.round(total / percent)
    ]),
    answer,
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

function graphPlusComputation() {
  const labels = ["Mon", "Tue", "Wed", "Thu"];
  const values = [rand(5, 10), rand(6, 12), rand(4, 10), rand(7, 13)];

  const total = values.reduce((a, b) => a + b, 0);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const difference = maxValue - minValue;
  const askTotal = rand(0, 1) === 1;
  const answer = askTotal ? total : difference;

  return {
    skill: "Graphs + Computation",
    subskill: askTotal ? "Graph Totals" : "Graph Difference",
    topic: askTotal ? "Adding values from a graph" : "Finding differences from a graph",
    difficulty: "GED-Level",
    type: "multiple",
    question: askTotal
      ? "Use the bar graph to answer the question. What is the total number of customers for all four days?"
      : "Use the bar graph to answer the question. What is the difference between the greatest and least number of customers?",
    choices: uniqueNumberChoices(answer, [
      total,
      difference,
      maxValue,
      minValue,
      answer + rand(3, 8)
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
          legend: { display: false },
          title: {
            display: true,
            text: "Customers by Day"
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            min: 0,
            max: Math.max(...values) + 3,
            ticks: { stepSize: 1 }
          }
        }
      }
    },
    explanation: askTotal
      ? "Add all values: " + values.join(" + ") + " = " + total + "."
      : "Subtract the least value from the greatest value: " +
        maxValue +
        " - " +
        minValue +
        " = " +
        difference +
        "."
  };
}

function rectangleCost() {
  const length = rand(8, 16);
  const width = rand(5, 12);
  const costPerUnit = rand(2, 7);

  const area = length * width;
  const answer = area * costPerUnit;

  return {
    skill: "Geometry + Cost",
    subskill: "Area Cost Problems",
    topic: "Using area to calculate total cost",
    difficulty: "GED-Level",
    type: "multiple",
    question:
      "A rectangular floor is " +
      length +
      " ft by " +
      width +
      " ft. Tile costs $" +
      costPerUnit +
      " per square foot. What is the total cost to cover the floor?",
    choices: uniqueNumberChoices(answer, [
      area,
      answer + rand(20, 50),
      area + costPerUnit,
      2 * (length + width) * costPerUnit
    ]),
    answer,
    explanation:
      "Area = " +
      length +
      " × " +
      width +
      " = " +
      area +
      ". Then multiply by cost: " +
      area +
      " × " +
      costPerUnit +
      " = " +
      answer +
      "."
  };
}

function averageFromTable() {
  const values = [rand(60, 80), rand(65, 85), rand(70, 90), rand(75, 95)];
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = Math.round(sum / values.length);

  return {
    skill: "Data + Average",
    subskill: "Average",
    topic: "Finding the mean of a data set",
    difficulty: "GED-Level",
    type: "multiple",
    question:
      "A student scored " +
      values.join(", ") +
      " on four tests. What was the average score?",
    choices: uniqueNumberChoices(avg, [
      avg + rand(2, 5),
      Math.max(1, avg - rand(2, 5)),
      sum,
      Math.round(sum / 2)
    ]),
    answer: avg,
    explanation: "Add all scores and divide by 4: " + sum + " ÷ 4 = " + avg + "."
  };
}

module.exports = function generateMultiStep(options = {}) {
  const difficulty = options.difficulty || "GED-Level";

  const bank = [
    percentOfTotal,
    graphPlusComputation,
    rectangleCost,
    averageFromTable
  ];

  const question = bank[rand(0, bank.length - 1)]();

  return {
    ...question,
    difficulty: question.difficulty || difficulty
  };
};