function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function uniqueNumberChoices(answer, wrongs) {
  const choices = new Set([answer]);

  wrongs.forEach((w) => {
    if (Number.isFinite(w) && w !== answer && choices.size < 4) {
      choices.add(w);
    }
  });

  while (choices.size < 4) {
    const wrong = answer + rand(-5, 6);
    if (wrong !== answer) choices.add(wrong);
  }

  return shuffle(Array.from(choices));
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

  const start = rand(4, 9);
  const step1 = rand(1, 4);
  const step2 = rand(-2, 3);
  const step3 = rand(1, 4);

  const values = [
    start,
    start + step1,
    start + step1 + step2,
    start + step1 + step2 + step3
  ];

  const change = values[3] - values[0];
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const maxIndex = values.indexOf(maxValue);
  const minIndex = values.indexOf(minValue);

  const questionTypes = ["change", "highest", "lowest", "difference"];
  const selectedType = questionTypes[rand(0, questionTypes.length - 1)];

  let question;
  let choices;
  let answer;
  let explanation;
  let subskill;
  let topic;

  if (selectedType === "change") {
    answer = change;
    question = `Use the line graph to answer the question. How much did the value change from ${selected.labels[0]} to ${selected.labels[3]}?`;
    choices = uniqueNumberChoices(answer, [
      values[3],
      values[0],
      Math.abs(change),
      change + rand(2, 5)
    ]);
    explanation = `Find the difference between the final value and the starting value: ${values[3]} - ${values[0]} = ${change}.`;
    subskill = "Line Graph Change";
    topic = "Finding change over time from a line graph";
  } else if (selectedType === "highest") {
    answer = selected.labels[maxIndex];
    question = `Use the line graph to answer the question. During which week was the value the greatest?`;
    choices = shuffle([...selected.labels]);
    explanation = `The highest point on the graph occurs at ${answer}.`;
    subskill = "Line Graph Greatest Value";
    topic = "Finding the greatest value on a line graph";
  } else if (selectedType === "lowest") {
    answer = selected.labels[minIndex];
    question = `Use the line graph to answer the question. During which week was the value the least?`;
    choices = shuffle([...selected.labels]);
    explanation = `The lowest point on the graph occurs at ${answer}.`;
    subskill = "Line Graph Least Value";
    topic = "Finding the least value on a line graph";
  } else {
    answer = maxValue - minValue;
    question = `Use the line graph to answer the question. What is the difference between the greatest value and the least value?`;
    choices = uniqueNumberChoices(answer, [
      maxValue,
      minValue,
      change,
      answer + rand(2, 5)
    ]);
    explanation = `Subtract the least value from the greatest value: ${maxValue} - ${minValue} = ${answer}.`;
    subskill = "Line Graph Difference";
    topic = "Finding the difference between values on a line graph";
  }

  return {
    skill: "Line Graph",
    subskill,
    topic,
    difficulty,
    type: "multiple",
    question,
    choices,
    answer,
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
            pointRadius: 5,
            pointHoverRadius: 5
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
            max: maxValue + 3,
            ticks: { stepSize: 1 },
            title: {
              display: true,
              text: selected.unit.charAt(0).toUpperCase() + selected.unit.slice(1)
            }
          }
        }
      }
    },
    explanation
  };
};