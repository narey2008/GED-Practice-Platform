function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function rectangleArea(difficulty) {
  const limit = difficulty === "Easy" ? 10 : difficulty === "Medium" ? 14 : 18;
  const w = rand(3, limit);
  const h = rand(3, limit);
  const answer = w * h;

  return {
    skill: "Geometry",
    difficulty,
    type: "multiple",
    question: `What is the area of the rectangle shown?`,
    choices: shuffle([answer, 2 * (w + h), w + h, answer + rand(3, 12)]),
    answer,
    diagram: `
  <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg">
    <rect x="95" y="45" width="130" height="100"
          fill="none" stroke="#153e75" stroke-width="4"/>

    <text x="160" y="165" text-anchor="middle" class="diagramLabel">
      L = ${w}
    </text>

    <text x="62" y="100" text-anchor="middle" dominant-baseline="middle" class="diagramLabel">
      W = ${h}
    </text>
  </svg>
`,
    explanation: `Area of a rectangle = length × width. So ${w} × ${h} = ${answer}.`
  };
}

function triangleArea(difficulty) {
  const limit = difficulty === "Easy" ? 12 : difficulty === "Medium" ? 16 : 20;
  const b = rand(4, limit);
  const h = rand(4, limit);
  const answer = (b * h) / 2;

  return {
    skill: "Geometry",
    difficulty,
    type: "multiple",
    question: `What is the area of the triangle shown?`,
    choices: shuffle([answer, b * h, b + h, answer + rand(2, 10)]),
    answer,
    diagram: `
  <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg">
    <polygon points="80,160 240,160 160,60"
             fill="none" stroke="#153e75" stroke-width="4"/>

    <line x1="160" y1="160" x2="160" y2="60"
          stroke="#153e75" stroke-dasharray="4,4"/>

    <text x="160" y="182" text-anchor="middle" class="diagramLabel">
      Base = ${b}
    </text>

    <text x="176" y="110" dominant-baseline="middle" class="diagramLabel">
      H = ${h}
    </text>
  </svg>
`,
    explanation: `Area of a triangle = (base × height) / 2. So (${b} × ${h}) / 2 = ${answer}.`
  };
}

function perimeter(difficulty) {
  const l = rand(5, difficulty === "Easy" ? 12 : 18);
  const w = rand(3, difficulty === "Easy" ? 8 : 12);
  const answer = 2 * (l + w);

  return {
    skill: "Geometry",
    difficulty,
    type: "multiple",
    question: `What is the perimeter of the rectangle shown?`,
    choices: shuffle([answer, l * w, l + w, answer + rand(2, 8)]),
    answer,
    diagram: `
  <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg">
    <rect x="95" y="45" width="130" height="100"
          fill="none" stroke="#153e75" stroke-width="4"/>

    <text x="160" y="165" text-anchor="middle" class="diagramLabel">
      L = ${l}
    </text>

    <text x="62" y="100" text-anchor="middle" dominant-baseline="middle" class="diagramLabel">
      W = ${w}
    </text>
  </svg>
`,
    explanation: `Perimeter of a rectangle = 2(length + width). So 2(${l} + ${w}) = ${answer}.`
  };
}

module.exports = function generateGeometry(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  const bank = [rectangleArea, triangleArea, perimeter];
  return bank[Math.floor(Math.random() * bank.length)](difficulty);
};