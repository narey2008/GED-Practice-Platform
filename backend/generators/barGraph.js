function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

module.exports = function generateBarGraph(options = {}) {
  const difficulty = options.difficulty || "GED-Level";

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
    rand(4, 8),
    rand(5, 9),
    rand(6, 10),
    rand(3, 7)
  ];

  while (new Set(values).size < values.length) {
    const i = rand(0, values.length - 1);
    values[i] += 1;
  }

  const maxValue = Math.max(...values);
  const correctLabel = selected.labels[values.indexOf(maxValue)];

  return {
    skill: "Bar Graph",
    subskill: "Bar Graph Interpretation",
topic: "Finding greatest value in a bar graph",
    difficulty,
    type: "multiple",
    question: `The bar graph shows ${selected.title.toLowerCase()}. Which category has the greatest number of ${selected.unit}?`,
    choices: shuffle([...selected.labels]),
    answer: correctLabel,
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
            max: maxValue + 2,
            ticks: { stepSize: 1 },
            title: {
              display: true,
              text: selected.unit.charAt(0).toUpperCase() + selected.unit.slice(1)
            }
          }
        }
      }
    },
    explanation: `Compare the heights of the bars. The tallest bar is ${correctLabel}, so ${correctLabel} has the greatest number of ${selected.unit}.`
  };
};