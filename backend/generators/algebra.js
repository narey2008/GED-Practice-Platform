function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function ranges(difficulty) {
  if (difficulty === "Easy") {
    return { coord: 4, rise: 4, slope: 3 };
  }
  if (difficulty === "Medium") {
    return { coord: 6, rise: 6, slope: 4 };
  }
  return { coord: 8, rise: 8, slope: 5 };
}

function slopeFromPoints(difficulty) {
  const r = ranges(difficulty);

  let x1 = rand(-r.coord, r.coord - 1);
  let y1 = rand(-r.coord, r.coord);
  let run = rand(1, difficulty === "Easy" ? 3 : 5);
  let rise = rand(-r.rise, r.rise);

  while (rise === 0) {
    rise = rand(-r.rise, r.rise);
  }

  const x2 = x1 + run;
  const y2 = y1 + rise;
  const slope = rise / run;

  return {
    skill: "Slope",
    difficulty,
    type: "fill",
    question: `Find the slope of the line passing through (${x1}, ${y1}) and (${x2}, ${y2}).`,
    answer: String(slope),
    explanation: `Use the slope formula: (y2 - y1) / (x2 - x1). Here that is (${y2} - ${y1}) / (${x2} - ${x1}) = ${rise}/${run} = ${slope}.`
  };
}

function slopeFromGraph(difficulty) {
  const r = ranges(difficulty);
  let m = rand(-r.slope, r.slope);

  while (m === 0) {
    m = rand(-r.slope, r.slope);
  }

  const b = rand(-5, 5);
  const points = [];

  for (let x = -5; x <= 5; x += 1) {
    points.push({ x, y: m * x + b });
  }

  const choices = new Set([m]);
  while (choices.size < 4) {
    choices.add(rand(-r.slope - 1, r.slope + 1));
  }

  return {
    skill: "Slope",
    difficulty,
    type: "multiple",
    question: "What is the slope of the line shown on the graph?",
    choices: Array.from(choices).sort(() => Math.random() - 0.5),
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
    explanation: `The slope is rise over run. Reading the graph, the line changes by ${m} vertically for every 1 unit horizontally, so the slope is ${m}.`
  };
}

module.exports = function generateAlgebra(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  const bank = [slopeFromPoints, slopeFromGraph];
  return bank[Math.floor(Math.random() * bank.length)](difficulty);
};