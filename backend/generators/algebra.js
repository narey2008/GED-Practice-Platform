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

  let x1 = rand(-r.coord, r.coord - 2);
  let y1 = rand(-r.coord, r.coord);
  let run = rand(1, difficulty === "Easy" ? 3 : 5);
  let rise = rand(-r.rise, r.rise);

  while (rise === 0) {
    rise = rand(-r.rise, r.rise);
  }

  const x2 = x1 + run;
  const y2 = y1 + rise;
  const slope = rise / run;

  const xMin = Math.min(x1, x2) - 2;
  const xMax = Math.max(x1, x2) + 2;
  const yMin = Math.min(y1, y2) - 2;
  const yMax = Math.max(y1, y2) + 2;

  return {
    skill: "Slope",
    difficulty,
    type: "fill",
    question: `Find the slope of the line passing through (${x1}, ${y1}) and (${x2}, ${y2}).`,
    answer: String(slope),
    chart: {
      type: "line",
      data: {
        datasets: [
          {
            data: [
              { x: x1, y: y1 },
              { x: x2, y: y2 }
            ],
            parsing: false,
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 4,
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
    explanation: `Use the slope formula: (y2 - y1) / (x2 - x1). Here that is (${y2} - ${y1}) / (${x2} - ${x1}) = ${rise}/${run} = ${slope}.`
  };
}

function slopeFromGraph(difficulty) {
  const r = ranges(difficulty);

  let m = rand(-r.slope, r.slope);
  while (m === 0) {
    m = rand(-r.slope, r.slope);
  }

  const anchorX = rand(-3, 3);
  const anchorY = rand(-3, 3);

  const points = [
    { x: anchorX - 1, y: anchorY - m },
    { x: anchorX, y: anchorY },
    { x: anchorX + 1, y: anchorY + m }
  ];

  const xMin = anchorX - 4;
  const xMax = anchorX + 4;
  const yMin = Math.min(...points.map((p) => p.y)) - 2;
  const yMax = Math.max(...points.map((p) => p.y)) + 2;

  const choices = new Set([m]);
  while (choices.size < 4) {
    const wrong = rand(-r.slope - 1, r.slope + 1);
    if (wrong !== 0) {
      choices.add(wrong);
    }
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
            parsing: false,
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 4,
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
    explanation: `The slope is rise over run. Reading the graph, the line changes by ${m} vertically for every 1 unit horizontally, so the slope is ${m}.`
  };
}

module.exports = function generateAlgebra(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  const bank = [slopeFromPoints, slopeFromGraph];
  return bank[Math.floor(Math.random() * bank.length)](difficulty);
};