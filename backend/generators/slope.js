const { getDifficultyProfile } = require("./difficultyProfile");

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

function formatSlope(rise, run) {
  if (run === 1) return String(rise);
  const g = gcd(rise, run);
  const n = rise / g;
  const d = run / g;
  return `${n}/${d}`;
}

module.exports = function generateSlope(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  const p = getDifficultyProfile(difficulty);

  const run =
    difficulty === "Easy"
      ? 1
      : difficulty === "Medium"
      ? rand(1, 2)
      : rand(1, 4);

  let rise = rand(-p.smallMax, p.smallMax);

  while (rise === 0) {
    rise = rand(-p.smallMax, p.smallMax);
  }

  const slopeAnswer = formatSlope(rise, run);

  const x1 = rand(-4, 0);
  const y1 = rand(-p.smallMax, p.smallMax);
  const x2 = x1 + run;
  const y2 = y1 + rise;

  const xMin = Math.min(x1, x2) - 3;
  const xMax = Math.max(x1, x2) + 3;
  const yMin = Math.min(y1, y2) - 3;
  const yMax = Math.max(y1, y2) + 3;

  const points = [
    { x: x1, y: y1 },
    { x: x2, y: y2 }
  ];

  const choices = new Set([slopeAnswer]);

  while (choices.size < 4) {
    const wrongRise = rand(-p.smallMax, p.smallMax);
    const wrongRun =
      difficulty === "Easy"
        ? 1
        : difficulty === "Medium"
        ? rand(1, 2)
        : rand(1, 4);

    if (wrongRise !== 0) {
      choices.add(formatSlope(wrongRise, wrongRun));
    }
  }

  return {
    skill: "Slope",
    subskill: "Slope From Graph",
    topic: "Finding slope from a graph",
    difficulty,
    type: "multiple",
    question: "What is the slope of the line shown on the coordinate plane?",
    choices: shuffle(Array.from(choices)),
    answer: slopeAnswer,
    chart: {
      type: "line",
      data: {
        datasets: [
          {
            data: points,
            parsing: false,
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 5,
            fill: false,
            tension: 0,
            borderColor: "#153e75",
            pointBackgroundColor: "#153e75",
            pointBorderColor: "#153e75"
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
            min: xMin,
            max: xMax,
            ticks: { stepSize: 1 }
          },
          y: {
            min: yMin,
            max: yMax,
            ticks: { stepSize: 1 }
          }
        }
      }
    },
    explanation: `Use rise over run. From (${x1}, ${y1}) to (${x2}, ${y2}), the rise is ${rise} and the run is ${run}, so the slope is ${slopeAnswer}.`
  };
};