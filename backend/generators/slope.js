function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

module.exports = function generateSlope(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  let m = rand(-4, 4);

  while (m === 0) {
    m = rand(-4, 4);
  }

  const b = rand(-5, 5);
  const points = [];

  for (let x = -5; x <= 5; x += 1) {
    points.push({ x, y: m * x + b });
  }

  const choices = new Set([m]);
  while (choices.size < 4) {
    choices.add(rand(-5, 5));
  }

  return {
    skill: "Slope",
    subskill: "Slope From Graph",
topic: "Finding slope from a graph",
    difficulty,
    type: "multiple",
    question: "What is the slope of the line shown in the graph?",
    choices: shuffle(Array.from(choices)),
    answer: m,
    chart: {
      type: "line",
      data: {
        datasets: [
          {
            data: points,
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0,
            borderColor: "#153e75"
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
            type: "linear",
            min: -5,
            max: 5,
            ticks: { stepSize: 1 }
          },
          y: {
            min: -10,
            max: 10,
            ticks: { stepSize: 1 }
          }
        }
      }
    },
    explanation: `Use rise over run. From the graph, the line changes ${m} vertically for each 1 unit horizontally, so the slope is ${m}.`
  };
};