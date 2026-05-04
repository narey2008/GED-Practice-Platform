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
    const wrong = answer + rand(-8, 10);
    if (wrong >= 0 && wrong !== answer) choices.add(wrong);
  }

  return shuffle(Array.from(choices));
}

module.exports = function generateBarGraph(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  const p = getDifficultyProfile(difficulty);

  const scenarios = [
    {
      title: "Library Visitors",
      labels: ["Mon", "Tue", "Wed", "Thu"],
      unit: "visitors"
    },
    {
      title: "Bottles Recycled",
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      unit: "bottles"
    },
    {
      title: "School Fundraiser Tickets Sold",
      labels: ["Class A", "Class B", "Class C", "Class D"],
      unit: "tickets"
    },
    {
      title: "Hours of Study",
      labels: ["Mon", "Tue", "Wed", "Thu"],
      unit: "hours"
    }
  ];

  const selected = scenarios[rand(0, scenarios.length - 1)];

  const values = [
    rand(4, p.graphMax),
    rand(5, p.graphMax + 2),
    rand(6, p.graphMax + 4),
    rand(3, p.graphMax + 1)
  ];

  while (new Set(values).size < values.length) {
    const i = rand(0, values.length - 1);
    values[i] += 1;
  }

  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const maxIndex = values.indexOf(maxValue);
  const minIndex = values.indexOf(minValue);
  const total = values.reduce((sum, value) => sum + value, 0);
  const difference = maxValue - minValue;

  const questionTypes =
    difficulty === "Easy"
      ? ["greatest", "least"]
      : difficulty === "Medium"
      ? ["greatest", "least", "difference"]
      : ["greatest", "least", "difference", "total"];

  const selectedType = questionTypes[rand(0, questionTypes.length - 1)];

  let question;
  let choices;
  let answer;
  let explanation;
  let subskill;
  let topic;

  if (selectedType === "greatest") {
    answer = selected.labels[maxIndex];
    question = `Use the bar graph to answer the question. Which category has the greatest number of ${selected.unit}?`;
    choices = shuffle([...selected.labels]);
    explanation = `The tallest bar is ${answer}, so ${answer} has the greatest number of ${selected.unit}.`;
    subskill = "Bar Graph Greatest Value";
    topic = "Finding the greatest value in a bar graph";
  } else if (selectedType === "least") {
    answer = selected.labels[minIndex];
    question = `Use the bar graph to answer the question. Which category has the least number of ${selected.unit}?`;
    choices = shuffle([...selected.labels]);
    explanation = `The shortest bar is ${answer}, so ${answer} has the least number of ${selected.unit}.`;
    subskill = "Bar Graph Least Value";
    topic = "Finding the least value in a bar graph";
  } else if (selectedType === "difference") {
    answer = difference;
    question = `Use the bar graph to answer the question. How many more ${selected.unit} are shown for ${selected.labels[maxIndex]} than for ${selected.labels[minIndex]}?`;
    choices = uniqueNumberChoices(answer, [
      maxValue,
      minValue,
      total,
      difference + rand(1, 5)
    ]);
    explanation = `Subtract the smaller value from the larger value: ${maxValue} - ${minValue} = ${difference}.`;
    subskill = "Bar Graph Difference";
    topic = "Finding the difference between values in a bar graph";
  } else {
    answer = total;
    question = `Use the bar graph to answer the question. What is the total number of ${selected.unit} shown?`;
    choices = uniqueNumberChoices(answer, [
      total + rand(3, 8),
      total - rand(3, 8),
      maxValue,
      minValue
    ]);
    explanation = `Add all the bar values: ${values.join(" + ")} = ${total}.`;
    subskill = "Bar Graph Total";
    topic = "Finding totals from a bar graph";
  }

  return {
    skill: "Bar Graph",
    subskill,
    topic,
    difficulty,
    type: "multiple",
    question,
    choices,
    answer,
    chart: {
      type: "bar",
      data: {
        labels: selected.labels,
        datasets: [
          {
            label: selected.title,
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
            text: selected.title
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            min: 0,
            max: maxValue + 3,
            ticks: { stepSize: difficulty === "Easy" ? 1 : 2 },
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