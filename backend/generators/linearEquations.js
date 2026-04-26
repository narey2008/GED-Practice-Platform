function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function oneStepMultiple(difficulty) {
  const x = rand(2, difficulty === "Easy" ? 9 : 12);
  const a = rand(2, difficulty === "Easy" ? 6 : 9);
  const b = rand(1, 12);
  const c = a * x + b;

  return {
    skill: "Linear Equations",
    difficulty,
    type: "multiple",
    question: `Solve for x: ${a}x + ${b} = ${c}`,
    choices: shuffle([x, x + 1, x + 2, x - 2]),
    answer: x,
    explanation: `Subtract ${b} from both sides to get ${a}x = ${c - b}. Then divide by ${a}, so x = ${x}.`
  };
}

function oneStepFill(difficulty) {
  const x = rand(2, difficulty === "Easy" ? 9 : 12);
  const a = rand(2, difficulty === "Easy" ? 6 : 9);
  const b = rand(1, 12);
  const c = a * x + b;

  return {
    skill: "Linear Equations",
    difficulty,
    type: "fill",
    question: `Solve for x: ${a}x + ${b} = ${c}`,
    answer: String(x),
    explanation: `Subtract ${b} from both sides to get ${a}x = ${c - b}. Then divide by ${a}, so x = ${x}.`
  };
}

function variablesBothSidesMultiple(difficulty) {
  const x = rand(2, 10);
  const a = rand(3, difficulty === "Easy" ? 6 : 8);
  const d = rand(1, a - 1);
  const b = rand(1, 9);
  const c = a * x + b - d * x;

  return {
    skill: "Linear Equations",
    difficulty,
    type: "multiple",
    question: `Solve for x: ${a}x + ${b} = ${d}x + ${c}`,
    choices: shuffle([x, x + 1, x - 1, x + 3]),
    answer: x,
    explanation: `Move variable terms to one side and constants to the other. Then divide both sides by ${a - d}. That gives x = ${x}.`
  };
}

function variablesBothSidesFill(difficulty) {
  const x = rand(2, 10);
  const a = rand(3, difficulty === "Easy" ? 6 : 8);
  const d = rand(1, a - 1);
  const b = rand(1, 9);
  const c = a * x + b - d * x;

  return {
    skill: "Linear Equations",
    difficulty,
    type: "fill",
    question: `Solve for x: ${a}x + ${b} = ${d}x + ${c}`,
    answer: String(x),
    explanation: `Move variable terms to one side and constants to the other. Then divide both sides by ${a - d}. That gives x = ${x}.`
  };
}

module.exports = function generateLinearEquations(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  const bank =
    difficulty === "Easy"
      ? [oneStepMultiple, oneStepFill]
      : [oneStepMultiple, oneStepFill, variablesBothSidesMultiple, variablesBothSidesFill];

  return bank[Math.floor(Math.random() * bank.length)](difficulty);
};