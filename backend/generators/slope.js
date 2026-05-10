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
  if (run === 0) return "undefined";

  const sign = rise * run < 0 ? "-" : "";
  const absRise = Math.abs(rise);
  const absRun = Math.abs(run);

  if (absRise === 0) return "0";

  const g = gcd(absRise, absRun);
  const n = absRise / g;
  const d = absRun / g;

  if (d === 1) return `${sign}${n}`;

  return `${sign}${n}/${d}`;
}

function getDifficultyRun(difficulty) {
  if (difficulty === "Easy") return 1;
  if (difficulty === "Medium") return rand(1, 2);
  return rand(1, 4);
}

function getDifficultyRise(difficulty, p) {
  const safeMax = Math.max(2, Math.min(Number(p.smallMax || 5), 5));
  const maxRise =
    difficulty === "Easy"
      ? Math.min(3, safeMax)
      : difficulty === "Medium"
      ? Math.min(4, safeMax)
      : safeMax;

  let rise = rand(-maxRise, maxRise);

  while (rise === 0) {
    rise = rand(-maxRise, maxRise);
  }

  return rise;
}

function generatePointPair(difficulty, p) {
  const gridMin = -6;
  const gridMax = 6;

  for (let attempt = 0; attempt < 120; attempt += 1) {
    const run = getDifficultyRun(difficulty);
    const rise = getDifficultyRise(difficulty, p);

    const x1 = rand(gridMin + 1, gridMax - run - 1);
    const y1 = rand(gridMin + 1, gridMax - 1);
    const x2 = x1 + run;
    const y2 = y1 + rise;

    if (y2 >= gridMin + 1 && y2 <= gridMax - 1) {
      return {
        run,
        rise,
        x1,
        y1,
        x2,
        y2,
        gridMin,
        gridMax
      };
    }
  }

  return {
    run: 2,
    rise: 1,
    x1: -2,
    y1: 1,
    x2: 0,
    y2: 2,
    gridMin: -6,
    gridMax: 6
  };
}

function buildSlopeChoices(answer, rise, run, difficulty, p) {
  const choices = new Set([answer]);

  const addChoice = (value) => {
    if (value && value !== answer && choices.size < 4) {
      choices.add(value);
    }
  };

  addChoice(formatSlope(run, rise));
  addChoice(formatSlope(-rise, run));
  addChoice(formatSlope(rise + 1, run));
  addChoice(formatSlope(rise, run + 1));

  while (choices.size < 4) {
    const wrongRise = getDifficultyRise(difficulty, p);
    const wrongRun = getDifficultyRun(difficulty);
    addChoice(formatSlope(wrongRise, wrongRun));
  }

  return shuffle(Array.from(choices));
}

function buildCoordinatePlaneDiagram({ x1, y1, x2, y2, rise, run, gridMin, gridMax }) {
  const viewWidth = 540;
  const viewHeight = 390;

  const graphLeft = 90;
  const graphTop = 42;
  const graphSize = 300;
  const unit = graphSize / (gridMax - gridMin);

  const toSvgX = (x) => graphLeft + (x - gridMin) * unit;
  const toSvgY = (y) => graphTop + (gridMax - y) * unit;

  const xAxisY = toSvgY(0);
  const yAxisX = toSvgX(0);

  const gridLines = [];
  const tickLabels = [];

  for (let value = gridMin; value <= gridMax; value += 1) {
    const x = toSvgX(value);
    const y = toSvgY(value);
    const isAxis = value === 0;

    gridLines.push(`
      <line
        x1="${x}"
        y1="${graphTop}"
        x2="${x}"
        y2="${graphTop + graphSize}"
        stroke="${isAxis ? "#153e75" : "#d7e1ee"}"
        stroke-width="${isAxis ? "2.5" : "1"}"
      />
    `);

    gridLines.push(`
      <line
        x1="${graphLeft}"
        y1="${y}"
        x2="${graphLeft + graphSize}"
        y2="${y}"
        stroke="${isAxis ? "#153e75" : "#d7e1ee"}"
        stroke-width="${isAxis ? "2.5" : "1"}"
      />
    `);

    if (value !== 0 && value % 2 === 0) {
      tickLabels.push(`
        <text x="${x}" y="${xAxisY + 18}" text-anchor="middle" class="diagramLabel" style="font-size:13px;">
          ${value}
        </text>
      `);

      tickLabels.push(`
        <text x="${yAxisX - 12}" y="${y + 4}" text-anchor="end" class="diagramLabel" style="font-size:13px;">
          ${value}
        </text>
      `);
    }
  }

  const slope = rise / run;
  const lineStartX = gridMin;
  const lineEndX = gridMax;
  const lineStartY = y1 + slope * (lineStartX - x1);
  const lineEndY = y1 + slope * (lineEndX - x1);

  const pointAX = toSvgX(x1);
  const pointAY = toSvgY(y1);
  const pointBX = toSvgX(x2);
  const pointBY = toSvgY(y2);

  const cornerX = toSvgX(x2);
  const cornerY = toSvgY(y1);

  return `
    <svg
      viewBox="0 0 ${viewWidth} ${viewHeight}"
      width="540"
      height="390"
      xmlns="http://www.w3.org/2000/svg"
      style="display:block; margin:0 auto; width:600px; max-width:100%; height:auto;"
    >
      <defs>
        <clipPath id="slopeGraphClip">
          <rect x="${graphLeft}" y="${graphTop}" width="${graphSize}" height="${graphSize}" rx="8"></rect>
        </clipPath>
      </defs>

      <rect
        x="${graphLeft}"
        y="${graphTop}"
        width="${graphSize}"
        height="${graphSize}"
        rx="8"
        fill="#ffffff"
        stroke="#94a3b8"
        stroke-width="2"
      />

      ${gridLines.join("")}
      ${tickLabels.join("")}

      <text x="${graphLeft + graphSize + 18}" y="${xAxisY + 5}" class="diagramLabel" style="font-size:15px; font-weight:700;">x</text>
      <text x="${yAxisX - 4}" y="${graphTop - 14}" class="diagramLabel" style="font-size:15px; font-weight:700;">y</text>

      <g clip-path="url(#slopeGraphClip)">
        <line
          x1="${toSvgX(lineStartX)}"
          y1="${toSvgY(lineStartY)}"
          x2="${toSvgX(lineEndX)}"
          y2="${toSvgY(lineEndY)}"
          stroke="#153e75"
          stroke-width="4.5"
          stroke-linecap="round"
        />

        <line
          x1="${pointAX}"
          y1="${pointAY}"
          x2="${cornerX}"
          y2="${cornerY}"
          stroke="#d97706"
          stroke-width="2.5"
          stroke-dasharray="7,5"
          opacity="0.75"
        />

        <line
          x1="${cornerX}"
          y1="${cornerY}"
          x2="${pointBX}"
          y2="${pointBY}"
          stroke="#d97706"
          stroke-width="2.5"
          stroke-dasharray="7,5"
          opacity="0.75"
        />
      </g>

      <circle cx="${pointAX}" cy="${pointAY}" r="6.5" fill="#153e75" stroke="#ffffff" stroke-width="2.25"/>
      <circle cx="${pointBX}" cy="${pointBY}" r="6.5" fill="#153e75" stroke="#ffffff" stroke-width="2.25"/>

      <text x="${pointAX - 12}" y="${pointAY - 12}" text-anchor="end" class="diagramLabel" style="font-size:14px; font-weight:700;">
        A(${x1}, ${y1})
      </text>

      <text x="${pointBX + 12}" y="${pointBY - 12}" text-anchor="start" class="diagramLabel" style="font-size:14px; font-weight:700;">
        B(${x2}, ${y2})
      </text>
    </svg>
  `;
}

module.exports = function generateSlope(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  const p = getDifficultyProfile(difficulty);

  const pointData = generatePointPair(difficulty, p);
  const { run, rise, x1, y1, x2, y2 } = pointData;

  const slopeAnswer = formatSlope(rise, run);

  return {
    skill: "Slope",
    subskill: "Slope From Graph",
    topic: "Finding slope from a coordinate plane",
    difficulty,
    type: "multiple",
    formulaRequired: true,
    question: "What is the slope of the line shown on the coordinate plane?",
    choices: buildSlopeChoices(slopeAnswer, rise, run, difficulty, p),
    answer: slopeAnswer,
    diagram: buildCoordinatePlaneDiagram(pointData),
    chart: null,
    explanation: `Use slope = rise/run. From A(${x1}, ${y1}) to B(${x2}, ${y2}), the rise is ${y2} - ${y1} = ${rise}, and the run is ${x2} - ${x1} = ${run}. The slope is ${rise}/${run}, which simplifies to ${slopeAnswer}.`
  };
};