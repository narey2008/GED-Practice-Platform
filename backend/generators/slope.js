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
  const viewWidth = 570;
  const viewHeight = 390;

  const graphLeft = 90;
  const graphTop = 42;
  const graphSize = 300;
  const graphRight = graphLeft + graphSize;
  const graphBottom = graphTop + graphSize;
  const calloutLeft = graphRight + 28;
  const calloutTop = graphTop + 18;
  const calloutWidth = 140;
  const calloutHeight = 168;
  const unit = graphSize / (gridMax - gridMin);

  const toSvgX = (x) => graphLeft + (x - gridMin) * unit;
  const toSvgY = (y) => graphTop + (gridMax - y) * unit;

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
        <text x="${x}" y="${graphBottom + 21}" text-anchor="middle" class="diagramLabel" style="font-size:13px;">
          ${value}
        </text>
      `);

      tickLabels.push(`
        <text x="${graphLeft - 13}" y="${y + 4}" text-anchor="end" class="diagramLabel" style="font-size:13px;">
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
      width="570"
      height="390"
      xmlns="http://www.w3.org/2000/svg"
      style="display:block; margin:0 auto; width:630px; max-width:100%; height:auto;"
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

      <text x="${graphRight + 14}" y="${graphBottom + 21}" class="diagramLabel" style="font-size:15px; font-weight:700;">x</text>
      <text x="${graphLeft - 13}" y="${graphTop - 14}" text-anchor="middle" class="diagramLabel" style="font-size:15px; font-weight:700;">y</text>

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

      <circle cx="${pointAX}" cy="${pointAY}" r="10" fill="#ffffff" stroke="#153e75" stroke-width="2.75"/>
      <circle cx="${pointBX}" cy="${pointBY}" r="10" fill="#ffffff" stroke="#153e75" stroke-width="2.75"/>
      <text x="${pointAX}" y="${pointAY + 4}" text-anchor="middle" class="diagramLabel" style="font-size:10px; font-weight:700;">A</text>
      <text x="${pointBX}" y="${pointBY + 4}" text-anchor="middle" class="diagramLabel" style="font-size:10px; font-weight:700;">B</text>

      <g aria-label="Point coordinates and slope triangle values">
        <rect
          x="${calloutLeft}"
          y="${calloutTop}"
          width="${calloutWidth}"
          height="${calloutHeight}"
          rx="9"
          fill="#f8fafc"
          stroke="#cbd5e1"
          stroke-width="1.5"
        />
        <text x="${calloutLeft + 12}" y="${calloutTop + 23}" class="diagramLabel" style="font-size:13px; font-weight:700;">Points</text>
        <text x="${calloutLeft + 12}" y="${calloutTop + 48}" class="diagramLabel" style="font-size:12px;">A = (${x1}, ${y1})</text>
        <text x="${calloutLeft + 12}" y="${calloutTop + 70}" class="diagramLabel" style="font-size:12px;">B = (${x2}, ${y2})</text>
        <line
          x1="${calloutLeft + 12}"
          y1="${calloutTop + 94}"
          x2="${calloutLeft + 35}"
          y2="${calloutTop + 94}"
          stroke="#d97706"
          stroke-width="2.5"
          stroke-dasharray="6,4"
        />
        <line
          x1="${calloutLeft + 35}"
          y1="${calloutTop + 94}"
          x2="${calloutLeft + 35}"
          y2="${calloutTop + 78}"
          stroke="#d97706"
          stroke-width="2.5"
          stroke-dasharray="6,4"
        />
        <text x="${calloutLeft + 46}" y="${calloutTop + 91}" class="diagramLabel" style="font-size:12px; font-weight:700;">rise / run</text>
        <text x="${calloutLeft + 12}" y="${calloutTop + 120}" class="diagramLabel" style="font-size:12px;">run = ${run}</text>
        <text x="${calloutLeft + 12}" y="${calloutTop + 145}" class="diagramLabel" style="font-size:12px;">rise = ${rise}</text>
      </g>
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
