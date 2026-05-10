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
    if (Number.isFinite(w) && w > 0 && w !== answer && choices.size < 4) {
      choices.add(w);
    }
  });

  while (choices.size < 4) {
    const wrong = answer + rand(-18, 24);
    if (wrong > 0 && wrong !== answer) choices.add(wrong);
  }

  return shuffle(Array.from(choices));
}
function titleCase(value) {
  return String(value || "")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getSafeDimensionProfile(p) {
  return {
    smallMin: Number(p.smallMin || 2),
    mediumMin: Number(p.mediumMin || 4),
    lengthMax: Number(p.lengthMax || 18),
    widthMax: Number(p.widthMax || 12),
    heightMax: Number(p.heightMax || p.widthMax || 10)
  };
}

function rectangleAreaScenario(difficulty, p) {
  const scenarios = [
    { object: "garden", unit: "feet" },
    { object: "patio", unit: "feet" },
    { object: "room", unit: "feet" },
    { object: "banner", unit: "inches" }
  ];

  const selected = scenarios[rand(0, scenarios.length - 1)];
  const length = rand(p.mediumMin, p.lengthMax);
  const width = rand(p.smallMin, Math.min(p.widthMax, length));
  const answer = length * width;

  return {
    skill: "Geometry",
    subskill: "Rectangle Area",
    topic: "Area of rectangles",
    difficulty,
    type: "multiple",
    formulaRequired: true,
    question:
      difficulty === "Easy"
        ? `The ${selected.object} shown below is a rectangle. What is its area in square ${selected.unit}?`
        : `A rectangular ${selected.object} is shown below. What is its area in square ${selected.unit}?`,
    choices: uniqueNumberChoices(answer, [
      2 * (length + width),
      length + width,
      answer + length,
      Math.max(1, answer - width)
    ]),
    answer,
    diagram: `
  <svg viewBox="0 0 420 260" xmlns="http://www.w3.org/2000/svg">
    <text x="210" y="32" text-anchor="middle" class="diagramLabel">
      ${selected.object.charAt(0).toUpperCase() + selected.object.slice(1)}
    </text>

    <rect x="130" y="70" width="170" height="105"
          fill="#f8fbff" stroke="#153e75" stroke-width="4"/>

    <line x1="130" y1="195" x2="300" y2="195"
          stroke="#153e75" stroke-width="2"/>

    <line x1="105" y1="70" x2="105" y2="175"
          stroke="#153e75" stroke-width="2"/>

    <text x="215" y="220" text-anchor="middle" class="diagramLabel">
      L = ${length} ${selected.unit}
    </text>

    <text x="78" y="126" text-anchor="middle" dominant-baseline="middle" class="diagramLabel">
      W = ${width} ${selected.unit}
    </text>
  </svg>
`,
    explanation: `Area of a rectangle = length × width. So ${length} × ${width} = ${answer} square ${selected.unit}.`
  };
}

function rectanglePerimeterScenario(difficulty, p) {
  const scenarios = [
    { object: "garden fence", unit: "feet" },
    { object: "picture frame", unit: "inches" },
    { object: "playground border", unit: "feet" },
    { object: "room border", unit: "feet" }
  ];

  const selected = scenarios[rand(0, scenarios.length - 1)];
  const length = rand(p.mediumMin, p.lengthMax);
  const width = rand(p.smallMin, Math.min(p.widthMax, length));
  const answer = 2 * (length + width);

  return {
    skill: "Geometry",
    subskill: "Rectangle Perimeter",
    topic: "Perimeter of rectangles",
    difficulty,
    type: "multiple",
    formulaRequired: true,
    question:
      difficulty === "Easy"
        ? `The ${selected.object} shown below forms a rectangle. What is its perimeter in ${selected.unit}?`
        : `A rectangular ${selected.object} is shown below. What is its perimeter in ${selected.unit}?`,
    choices: uniqueNumberChoices(answer, [
      length * width,
      length + width,
      answer + length,
      Math.max(1, answer - width)
    ]),
    answer,
diagram: `
  <svg viewBox="0 0 420 260" xmlns="http://www.w3.org/2000/svg">
    <text x="210" y="32" text-anchor="middle" class="diagramLabel">
      ${selected.object.charAt(0).toUpperCase() + selected.object.slice(1)}
    </text>

    <rect x="130" y="70" width="170" height="105"
          fill="#f8fbff" stroke="#153e75" stroke-width="4"/>

    <line x1="130" y1="195" x2="300" y2="195"
          stroke="#153e75" stroke-width="2"/>

    <line x1="105" y1="70" x2="105" y2="175"
          stroke="#153e75" stroke-width="2"/>

    <text x="215" y="220" text-anchor="middle" class="diagramLabel">
      L = ${length} ${selected.unit}
    </text>

    <text x="78" y="126" text-anchor="middle" dominant-baseline="middle" class="diagramLabel">
      W = ${width} ${selected.unit}
    </text>
  </svg>
`,
    explanation: `Perimeter of a rectangle = 2(length + width). So 2(${length} + ${width}) = ${answer} ${selected.unit}.`
  };
}

function triangleAreaScenario(difficulty, p) {
  const scenarios = [
    { object: "triangular sign", unit: "inches" },
    { object: "shade sail", unit: "feet" },
    { object: "triangular garden section", unit: "feet" },
    { object: "roof panel", unit: "feet" }
  ];

  const selected = scenarios[rand(0, scenarios.length - 1)];
  let base = rand(p.mediumMin, p.triangleMax);
  let height = rand(p.smallMin, p.triangleMax);

  if ((base * height) % 2 !== 0) {
    base += 1;
  }

  const answer = (base * height) / 2;

  return {
    skill: "Geometry",
    subskill: "Triangle Area",
    topic: "Area of triangles",
    difficulty,
    type: "multiple",
    formulaRequired: true,
    question:
      difficulty === "Easy"
        ? `The ${selected.object} shown below is triangular. What is its area in square ${selected.unit}?`
        : `A ${selected.object} is shown below. What is its area in square ${selected.unit}?`,
    choices: uniqueNumberChoices(answer, [
      base * height,
      base + height,
      answer + base,
      Math.max(1, answer - Math.floor(height / 2))
    ]),
    answer,
diagram: `
  <svg viewBox="0 0 420 260" xmlns="http://www.w3.org/2000/svg">
    <text x="210" y="34" text-anchor="middle" class="diagramLabel">
      ${selected.object.charAt(0).toUpperCase() + selected.object.slice(1)}
    </text>

    <polygon points="120,185 300,185 210,65"
             fill="#f8fbff" stroke="#153e75" stroke-width="4"/>

    <line x1="210" y1="185" x2="210" y2="65"
          stroke="#153e75" stroke-dasharray="6,6" stroke-width="2"/>

    <text x="210" y="212" text-anchor="middle" class="diagramLabel">
      Base = ${base} ${selected.unit}
    </text>

    <text x="252" y="126" dominant-baseline="middle" class="diagramLabel">
      H = ${height} ${selected.unit}
    </text>
  </svg>
`,
    explanation: `Area of a triangle = (base × height) / 2. So (${base} × ${height}) / 2 = ${answer} square ${selected.unit}.`
  };
}
function areaCostScenario(difficulty, p) {
  const d = getSafeDimensionProfile(p);

  const scenarios = [
    { object: "rectangular garden", material: "mulch", unit: "feet", costUnit: "square foot" },
    { object: "patio", material: "tile", unit: "feet", costUnit: "square foot" },
    { object: "room floor", material: "flooring", unit: "feet", costUnit: "square foot" },
    { object: "rectangular wall", material: "paint coverage", unit: "feet", costUnit: "square foot" }
  ];

  const selected = scenarios[rand(0, scenarios.length - 1)];
  const length = rand(d.mediumMin, d.lengthMax);
  const width = rand(d.smallMin, Math.min(d.widthMax, length));
  const costPerSquareUnit =
    difficulty === "Easy"
      ? rand(2, 5)
      : difficulty === "Medium"
      ? rand(4, 9)
      : rand(6, 14);

  const area = length * width;
  const answer = area * costPerSquareUnit;

  return {
    skill: "Geometry",
    subskill: "Area Cost Problems",
    topic: "Area with unit cost",
    difficulty,
    type: "multiple",
    formulaRequired: true,
    question: `The ${selected.object} shown below is rectangular. The ${selected.material} costs $${costPerSquareUnit} per ${selected.costUnit}. What is the total cost?`,
    choices: uniqueNumberChoices(answer, [
      area,
      2 * (length + width) * costPerSquareUnit,
      answer + costPerSquareUnit * width,
      Math.max(1, answer - costPerSquareUnit * length)
    ]),
    answer,
diagram: `
  <svg viewBox="0 0 420 260" xmlns="http://www.w3.org/2000/svg">
    <text x="210" y="34" text-anchor="middle" class="diagramLabel">
      ${titleCase(selected.object)}
    </text>

    <rect x="125" y="70" width="190" height="105"
          fill="#f8fbff" stroke="#153e75" stroke-width="4"/>

    <line x1="125" y1="195" x2="315" y2="195"
          stroke="#153e75" stroke-width="2"/>

    <line x1="100" y1="70" x2="100" y2="175"
          stroke="#153e75" stroke-width="2"/>

    <text x="220" y="220" text-anchor="middle" class="diagramLabel">
      ${length} ${selected.unit}
    </text>

    <text x="72" y="126" text-anchor="middle" dominant-baseline="middle" class="diagramLabel">
      ${width} ${selected.unit}
    </text>

    <text x="220" y="244" text-anchor="middle" class="diagramLabel" style="font-size:14px;">
      $${costPerSquareUnit} per ${selected.costUnit}
    </text>
  </svg>
`,
    explanation: `First find the area: ${length} × ${width} = ${area} square ${selected.unit}. Then multiply by the cost: ${area} × $${costPerSquareUnit} = $${answer}.`
  };
}

function rectangularPrismVolumeScenario(difficulty, p) {
  const d = getSafeDimensionProfile(p);

  const scenarios = [
    { object: "storage box", unit: "inches" },
    { object: "shipping box", unit: "inches" },
    { object: "fish tank", unit: "feet" },
    { object: "rectangular container", unit: "feet" }
  ];

  const selected = scenarios[rand(0, scenarios.length - 1)];
  const length = rand(d.mediumMin, d.lengthMax);
  const width = rand(d.smallMin, Math.min(d.widthMax, length));
  const height = rand(d.smallMin, d.heightMax);
  const answer = length * width * height;

  return {
    skill: "Geometry",
    subskill: "Volume",
    topic: "Volume of rectangular prisms",
    difficulty,
    type: "multiple",
    formulaRequired: true,
    question: `The ${selected.object} shown below is a rectangular prism. What is its volume in cubic ${selected.unit}?`,
    choices: uniqueNumberChoices(answer, [
      length * width,
      2 * (length + width + height),
      length * width + height,
      2 * (length * width + length * height + width * height)
    ]),
    answer,
diagram: `
  <svg viewBox="0 0 440 280" xmlns="http://www.w3.org/2000/svg">
    <text x="220" y="34" text-anchor="middle" class="diagramLabel">
      ${titleCase(selected.object)}
    </text>

    <polygon points="120,88 285,88 330,128 165,128"
             fill="#eef5ff" stroke="#153e75" stroke-width="4"/>

    <polygon points="120,88 165,128 165,215 120,175"
             fill="#f8fbff" stroke="#153e75" stroke-width="4"/>

    <polygon points="165,128 330,128 330,215 165,215"
             fill="#ffffff" stroke="#153e75" stroke-width="4"/>

    <line x1="285" y1="88" x2="330" y2="128"
          stroke="#153e75" stroke-width="4"/>

    <text x="248" y="244" text-anchor="middle" class="diagramLabel">
      Length = ${length} ${selected.unit}
    </text>

    <text x="358" y="174" text-anchor="start" dominant-baseline="middle" class="diagramLabel">
      Height = ${height} ${selected.unit}
    </text>

    <text x="112" y="128" text-anchor="end" dominant-baseline="middle" class="diagramLabel">
      Width = ${width} ${selected.unit}
    </text>
  </svg>
`,
    explanation: `Volume of a rectangular prism = length × width × height. So ${length} × ${width} × ${height} = ${answer} cubic ${selected.unit}.`
  };
}

function rectangularPrismSurfaceAreaScenario(difficulty, p) {
  const d = getSafeDimensionProfile(p);

  const scenarios = [
    { object: "storage box", unit: "inches" },
    { object: "rectangular package", unit: "inches" },
    { object: "display case", unit: "feet" },
    { object: "rectangular container", unit: "feet" }
  ];

  const selected = scenarios[rand(0, scenarios.length - 1)];
  const length = rand(d.mediumMin, d.lengthMax);
  const width = rand(d.smallMin, Math.min(d.widthMax, length));
  const height = rand(d.smallMin, d.heightMax);

  const lw = length * width;
  const lh = length * height;
  const wh = width * height;
  const answer = 2 * (lw + lh + wh);

  return {
    skill: "Geometry",
    subskill: "Surface Area",
    topic: "Surface area of rectangular prisms",
    difficulty,
    type: "multiple",
    formulaRequired: true,
    question: `The ${selected.object} shown below is a rectangular prism. What is its surface area in square ${selected.unit}?`,
    choices: uniqueNumberChoices(answer, [
      length * width * height,
      lw + lh + wh,
      2 * (length + width + height),
      answer + length * width
    ]),
    answer,
 diagram: `
  <svg viewBox="0 0 440 280" xmlns="http://www.w3.org/2000/svg">
    <text x="220" y="34" text-anchor="middle" class="diagramLabel">
      ${titleCase(selected.object)}
    </text>

    <polygon points="120,88 285,88 330,128 165,128"
             fill="#eef5ff" stroke="#153e75" stroke-width="4"/>

    <polygon points="120,88 165,128 165,215 120,175"
             fill="#f8fbff" stroke="#153e75" stroke-width="4"/>

    <polygon points="165,128 330,128 330,215 165,215"
             fill="#ffffff" stroke="#153e75" stroke-width="4"/>

    <line x1="285" y1="88" x2="330" y2="128"
          stroke="#153e75" stroke-width="4"/>

    <text x="248" y="244" text-anchor="middle" class="diagramLabel">
      Length = ${length} ${selected.unit}
    </text>

    <text x="358" y="174" text-anchor="start" dominant-baseline="middle" class="diagramLabel">
      Height = ${height} ${selected.unit}
    </text>

    <text x="112" y="128" text-anchor="end" dominant-baseline="middle" class="diagramLabel">
      Width = ${width} ${selected.unit}
    </text>
  </svg>
`,
    explanation: `Surface area of a rectangular prism = 2(length × width + length × height + width × height). So 2(${length} × ${width} + ${length} × ${height} + ${width} × ${height}) = 2(${lw} + ${lh} + ${wh}) = ${answer} square ${selected.unit}.`
  };
}

module.exports = function generateGeometry(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  const p = getDifficultyProfile(difficulty);

  const bank = [
    rectangleAreaScenario,
    rectanglePerimeterScenario,
    triangleAreaScenario,
    areaCostScenario,
    rectangularPrismVolumeScenario,
    rectangularPrismSurfaceAreaScenario
  ];

  return bank[rand(0, bank.length - 1)](difficulty, p);
};