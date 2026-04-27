function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function rectangleAreaScenario(difficulty) {
  const scenarios = [
    { object: "garden", unit: "feet" },
    { object: "patio", unit: "feet" },
    { object: "room", unit: "feet" },
    { object: "banner", unit: "inches" }
  ];

  const selected = scenarios[rand(0, scenarios.length - 1)];
  const limit = difficulty === "Easy" ? 10 : difficulty === "Medium" ? 14 : 18;

  const length = rand(4, limit);
  const width = rand(3, limit);
  const answer = length * width;

  return {
    skill: "Geometry",
    difficulty,
    type: "multiple",
    formulaRequired: true,
    question: `The ${selected.object} shown below is a rectangle. What is its area in square ${selected.unit}?`,
    choices: shuffle([
      answer,
      2 * (length + width),
      length + width,
      answer + rand(4, 12)
    ]),
    answer,
    diagram: `
      <svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg">
        <rect x="95" y="55" width="170" height="105"
              fill="none" stroke="#153e75" stroke-width="4"/>

        <text x="180" y="185" text-anchor="middle" class="diagramLabel">
          L = ${length} ${selected.unit}
        </text>

        <text x="62" y="108" text-anchor="middle" dominant-baseline="middle" class="diagramLabel">
          W = ${width} ${selected.unit}
        </text>

        <text x="180" y="28" text-anchor="middle" class="diagramLabel">
          ${selected.object.charAt(0).toUpperCase() + selected.object.slice(1)}
        </text>
      </svg>
    `,
    explanation: `Area of a rectangle = length × width. So ${length} × ${width} = ${answer} square ${selected.unit}.`
  };
}

function rectanglePerimeterScenario(difficulty) {
  const scenarios = [
    { object: "garden fence", unit: "feet" },
    { object: "picture frame", unit: "inches" },
    { object: "playground border", unit: "feet" },
    { object: "room border", unit: "feet" }
  ];

  const selected = scenarios[rand(0, scenarios.length - 1)];
  const length = rand(5, difficulty === "Easy" ? 12 : 18);
  const width = rand(3, difficulty === "Easy" ? 8 : 12);
  const answer = 2 * (length + width);

  return {
    skill: "Geometry",
    difficulty,
    type: "multiple",
    formulaRequired: true,
    question: `The ${selected.object} shown below forms a rectangle. What is its perimeter in ${selected.unit}?`,
    choices: shuffle([
      answer,
      length * width,
      length + width,
      answer + rand(2, 8)
    ]),
    answer,
    diagram: `
      <svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg">
        <rect x="95" y="55" width="170" height="105"
              fill="none" stroke="#153e75" stroke-width="4"/>

        <text x="180" y="185" text-anchor="middle" class="diagramLabel">
          L = ${length} ${selected.unit}
        </text>

        <text x="62" y="108" text-anchor="middle" dominant-baseline="middle" class="diagramLabel">
          W = ${width} ${selected.unit}
        </text>

        <text x="180" y="28" text-anchor="middle" class="diagramLabel">
          ${selected.object.charAt(0).toUpperCase() + selected.object.slice(1)}
        </text>
      </svg>
    `,
    explanation: `Perimeter of a rectangle = 2(length + width). So 2(${length} + ${width}) = ${answer} ${selected.unit}.`
  };
}

function triangleAreaScenario(difficulty) {
  const scenarios = [
    { object: "triangular sign", unit: "inches" },
    { object: "shade sail", unit: "feet" },
    { object: "triangular garden section", unit: "feet" },
    { object: "roof panel", unit: "feet" }
  ];

  const selected = scenarios[rand(0, scenarios.length - 1)];
  const limit = difficulty === "Easy" ? 12 : difficulty === "Medium" ? 16 : 20;

  const base = rand(4, limit);
  const height = rand(4, limit);
  const answer = (base * height) / 2;

  return {
    skill: "Geometry",
    difficulty,
    type: "multiple",
    formulaRequired: true,
    question: `The ${selected.object} shown below is triangular. What is its area in square ${selected.unit}?`,
    choices: shuffle([
      answer,
      base * height,
      base + height,
      answer + rand(2, 10)
    ]),
    answer,
    diagram: `
      <svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg">
        <polygon points="95,175 265,175 180,70"
                 fill="none" stroke="#153e75" stroke-width="4"/>

        <line x1="180" y1="175" x2="180" y2="70"
              stroke="#153e75" stroke-dasharray="5,5" stroke-width="2"/>

        <text x="180" y="198" text-anchor="middle" class="diagramLabel">
          Base = ${base} ${selected.unit}
        </text>

        <text x="194" y="124" dominant-baseline="middle" class="diagramLabel">
          H = ${height} ${selected.unit}
        </text>

        <text x="180" y="32" text-anchor="middle" class="diagramLabel">
          ${selected.object.charAt(0).toUpperCase() + selected.object.slice(1)}
        </text>
      </svg>
    `,
    explanation: `Area of a triangle = (base × height) / 2. So (${base} × ${height}) / 2 = ${answer} square ${selected.unit}.`
  };
}

module.exports = function generateGeometry(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  const bank = [
    rectangleAreaScenario,
    rectanglePerimeterScenario,
    triangleAreaScenario
  ];
  return bank[rand(0, bank.length - 1)](difficulty);
};