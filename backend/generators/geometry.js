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
    question: `What is the area of a rectangle with width ${w} and height ${h}?`,
    choices: shuffle([answer, 2 * (w + h), w + h, answer + rand(3, 12)]),
    answer,
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
    question: `What is the area of a triangle with base ${b} and height ${h}?`,
    choices: shuffle([answer, b * h, b + h, answer + rand(2, 10)]),
    answer,
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
    question: `What is the perimeter of a rectangle with length ${l} and width ${w}?`,
    choices: shuffle([answer, l * w, l + w, answer + rand(2, 8)]),
    answer,
    explanation: `Perimeter of a rectangle = 2(length + width). So 2(${l} + ${w}) = ${answer}.`
  };
}

module.exports = function generateGeometry(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  const bank = [rectangleArea, triangleArea, perimeter];
  return bank[Math.floor(Math.random() * bank.length)](difficulty);
};