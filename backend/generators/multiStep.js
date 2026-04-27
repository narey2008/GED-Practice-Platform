function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function percentOfTotalMultiple() {
  const total = rand(80, 200);
  const percent = [10, 20, 25, 30, 40, 50][rand(0, 5)];
  const answer = Math.round((percent / 100) * total);

  return {
    skill: "Percent",
    subskill: "Percent of a Total",
topic: "Finding a percent of a total in a word problem",
    difficulty: "GED-Level",
    type: "multiple",
    question: `A store sold ${total} items in one day. ${percent}% of the items were sold in the morning. How many items were sold in the morning?`,
    choices: shuffle([
      answer,
      answer + rand(5, 15),
      answer - rand(5, 15),
      Math.round(total / percent)
    ]),
    answer,
    explanation: `${percent}% of ${total} = (${percent}/100) × ${total} = ${answer}.`
  };
}

function percentOfTotalFill() {
  const total = rand(80, 200);
  const percent = [10, 20, 25, 30, 40, 50][rand(0, 5)];
  const answer = Math.round((percent / 100) * total);

  return {
    skill: "Percent",
    subskill: "Percent of a Total",
topic: "Finding a percent of a total in a word problem",
    difficulty: "GED-Level",
    type: "fill",
    question: `A store sold ${total} items in one day. ${percent}% of the items were sold in the morning. How many items were sold in the morning?`,
    answer: String(answer),
    explanation: `${percent}% of ${total} = (${percent}/100) × ${total} = ${answer}.`
  };
}

function graphPlusComputationMultiple() {
  const labels = ["Mon", "Tue", "Wed", "Thu"];
  const values = [
    rand(5, 10),
    rand(6, 11),
    rand(4, 9),
    rand(7, 12)
  ];

  const total = values.reduce((a, b) => a + b, 0);

  return {
    skill: "Graphs + Computation",
    subskill: "Graph Totals",
topic: "Adding values from a graph",
    difficulty: "GED-Level",
    type: "multiple",
    question: `The bar graph shows the number of customers over four days. What is the total number of customers for all four days?`,
    choices: shuffle([
      total,
      total + rand(5, 10),
      total - rand(5, 10),
      Math.max(...values)
    ]),
    answer: total,
    chart: {
      type: "bar",
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: "#1f4f95"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    },
    explanation: `Add all values: ${values.join(" + ")} = ${total}.`
  };
}

function graphPlusComputationFill() {
  const labels = ["Mon", "Tue", "Wed", "Thu"];
  const values = [
    rand(5, 10),
    rand(6, 11),
    rand(4, 9),
    rand(7, 12)
  ];

  const total = values.reduce((a, b) => a + b, 0);

  return {
    skill: "Graphs + Computation",
    subskill: "Graph Totals",
topic: "Adding values from a graph",
    difficulty: "GED-Level",
    type: "fill",
    question: `The bar graph shows the number of customers over four days. What is the total number of customers for all four days?`,
    answer: String(total),
    chart: {
      type: "bar",
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: "#1f4f95"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    },
    explanation: `Add all values: ${values.join(" + ")} = ${total}.`
  };
}

function rectangleCostMultiple() {
  const length = rand(8, 15);
  const width = rand(5, 10);
  const costPerUnit = rand(2, 6);

  const area = length * width;
  const answer = area * costPerUnit;

  return {
    skill: "Geometry + Cost",
    subskill: "Area Cost Problems",
topic: "Using area to calculate total cost",
    difficulty: "GED-Level",
    type: "multiple",
    question: `A rectangular floor is ${length} ft by ${width} ft. Tile costs $${costPerUnit} per square foot. What is the total cost to cover the floor?`,
    choices: shuffle([
      answer,
      area,
      answer + rand(20, 50),
      area + costPerUnit
    ]),
    answer,
    explanation: `Area = ${length} × ${width} = ${area}. Then multiply by cost: ${area} × ${costPerUnit} = ${answer}.`
  };
}

function rectangleCostFill() {
  const length = rand(8, 15);
  const width = rand(5, 10);
  const costPerUnit = rand(2, 6);

  const area = length * width;
  const answer = area * costPerUnit;

  return {
    skill: "Geometry + Cost",
    subskill: "Area Cost Problems",
topic: "Using area to calculate total cost",
    difficulty: "GED-Level",
    type: "fill",
    question: `A rectangular floor is ${length} ft by ${width} ft. Tile costs $${costPerUnit} per square foot. What is the total cost to cover the floor?`,
    answer: String(answer),
    explanation: `Area = ${length} × ${width} = ${area}. Then multiply by cost: ${area} × ${costPerUnit} = ${answer}.`
  };
}

function averageFromTableMultiple() {
  const values = [
    rand(60, 80),
    rand(65, 85),
    rand(70, 90),
    rand(75, 95)
  ];

  const sum = values.reduce((a, b) => a + b, 0);
  const avg = Math.round(sum / values.length);

  return {
    skill: "Data + Average",
    subskill: "Average",
topic: "Finding the mean of a data set",
    difficulty: "GED-Level",
    type: "multiple",
    question: `A student scored ${values.join(", ")} on four tests. What was the average score?`,
    choices: shuffle([
      avg,
      avg + rand(2, 5),
      avg - rand(2, 5),
      sum
    ]),
    answer: avg,
    explanation: `Add all scores and divide by 4: ${sum} ÷ 4 = ${avg}.`
  };
}

function averageFromTableFill() {
  const values = [
    rand(60, 80),
    rand(65, 85),
    rand(70, 90),
    rand(75, 95)
  ];

  const sum = values.reduce((a, b) => a + b, 0);
  const avg = Math.round(sum / values.length);

  return {
    skill: "Data + Average",
        subskill: "Average",
topic: "Finding the mean of a data set",
    difficulty: "GED-Level",
    type: "fill",
    question: `A student scored ${values.join(", ")} on four tests. What was the average score?`,
    answer: String(avg),
    explanation: `Add all scores and divide by 4: ${sum} ÷ 4 = ${avg}.`
  };
}

module.exports = function generateMultiStep() {
  const bank = [
    percentOfTotalMultiple,
    percentOfTotalFill,
    graphPlusComputationMultiple,
    graphPlusComputationFill,
    rectangleCostMultiple,
    rectangleCostFill,
    averageFromTableMultiple,
    averageFromTableFill
  ];
  return bank[rand(0, bank.length - 1)]();
};