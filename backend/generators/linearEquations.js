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
    if (Number.isFinite(w) && w !== answer && choices.size < 4) {
      choices.add(w);
    }
  });

  while (choices.size < 4) {
    const wrong = answer + rand(-5, 6);
    if (wrong !== answer) choices.add(wrong);
  }

  return shuffle(Array.from(choices));
}

function twoStepMultiple(difficulty, p) {
  const x = rand(2, p.smallMax);
  const a = rand(2, difficulty === "Easy" ? 6 : p.smallMax);
  const b = rand(1, p.mediumMax);
  const useAddition = rand(0, 1) === 1;

  const c = useAddition ? a * x + b : a * x - b;
  const equation = useAddition ? `${a}x + ${b} = ${c}` : `${a}x - ${b} = ${c}`;

  return {
    skill: "Linear Equations",
    subskill: "Two-Step Equations",
    topic: "Solving two-step linear equations",
    difficulty,
    type: "multiple",
    question: `Solve for x: ${equation}`,
    choices: uniqueNumberChoices(x, [x + 1, x + 2, x - 1, Math.max(1, x - 2)]),
    answer: x,
    explanation: useAddition
      ? `Subtract ${b} from both sides to get ${a}x = ${c - b}. Then divide by ${a}, so x = ${x}.`
      : `Add ${b} to both sides to get ${a}x = ${c + b}. Then divide by ${a}, so x = ${x}.`
  };
}

function twoStepFill(difficulty, p) {
  const x = rand(2, p.smallMax);
  const a = rand(2, difficulty === "Easy" ? 6 : p.smallMax);
  const b = rand(1, p.mediumMax);
  const useAddition = rand(0, 1) === 1;

  const c = useAddition ? a * x + b : a * x - b;
  const equation = useAddition ? `${a}x + ${b} = ${c}` : `${a}x - ${b} = ${c}`;

  return {
    skill: "Linear Equations",
    subskill: "Two-Step Equations",
    topic: "Solving two-step linear equations",
    difficulty,
    type: "fill",
    question: `Solve for x: ${equation}`,
    answer: String(x),
    explanation: useAddition
      ? `Subtract ${b} from both sides to get ${a}x = ${c - b}. Then divide by ${a}, so x = ${x}.`
      : `Add ${b} to both sides to get ${a}x = ${c + b}. Then divide by ${a}, so x = ${x}.`
  };
}

function variablesBothSidesMultiple(difficulty, p) {
  const x = rand(2, p.smallMax);
  const a = rand(3, p.smallMax);
  const d = rand(1, a - 1);
  const b = rand(1, p.mediumMax);
  const c = a * x + b - d * x;

  return {
    skill: "Linear Equations",
    subskill: "Variables on Both Sides",
    topic: "Solving equations with variables on both sides",
    difficulty,
    type: "multiple",
    question: `Solve for x: ${a}x + ${b} = ${d}x + ${c}`,
    choices: uniqueNumberChoices(x, [x + 1, x - 1, x + 2, x + 3]),
    answer: x,
    explanation: `Subtract ${d}x from both sides to get ${a - d}x + ${b} = ${c}. Then subtract ${b} and divide by ${a - d}. That gives x = ${x}.`
  };
}

function variablesBothSidesFill(difficulty, p) {
  const x = rand(2, p.smallMax);
  const a = rand(3, p.smallMax);
  const d = rand(1, a - 1);
  const b = rand(1, p.mediumMax);
  const c = a * x + b - d * x;

  return {
    skill: "Linear Equations",
    subskill: "Variables on Both Sides",
    topic: "Solving equations with variables on both sides",
    difficulty,
    type: "fill",
    question: `Solve for x: ${a}x + ${b} = ${d}x + ${c}`,
    answer: String(x),
    explanation: `Subtract ${d}x from both sides to get ${a - d}x + ${b} = ${c}. Then subtract ${b} and divide by ${a - d}. That gives x = ${x}.`
  };
}

function equationWordProblemMultiple(difficulty, p) {
  const x = rand(3, p.smallMax);
  const rate = rand(2, p.smallMax);
  const fee = rand(3, p.mediumMax);
  const total = rate * x + fee;

  return {
    skill: "Linear Equations",
    subskill: "Equation Word Problems",
    topic: "Writing and solving one-variable equations",
    difficulty,
    type: "multiple",
    question: `A repair service charges a $${fee} fee plus $${rate} per hour. The total cost was $${total}. How many hours did the repair take?`,
    choices: uniqueNumberChoices(x, [x + 1, x - 1, x + 2, Math.max(1, x - 2)]),
    answer: x,
    explanation: `Set up the equation ${rate}x + ${fee} = ${total}. Subtract ${fee}, then divide by ${rate}. The number of hours is ${x}.`
  };
}

module.exports = function generateLinearEquations(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  const p = getDifficultyProfile(difficulty);

  const easyBank = [
    twoStepMultiple,
    twoStepFill
  ];

  const mediumBank = [
    twoStepMultiple,
    twoStepFill,
    variablesBothSidesMultiple,
    equationWordProblemMultiple
  ];

  const gedBank = [
    twoStepMultiple,
    twoStepFill,
    variablesBothSidesMultiple,
    variablesBothSidesFill,
    equationWordProblemMultiple
  ];

  const bank =
    difficulty === "Easy"
      ? easyBank
      : difficulty === "Medium"
      ? mediumBank
      : gedBank;

  return bank[rand(0, bank.length - 1)](difficulty, p);
};