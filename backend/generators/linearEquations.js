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

function oneStepMultiple(difficulty) {
  const x = rand(2, difficulty === "Easy" ? 9 : 12);
  const a = rand(2, difficulty === "Easy" ? 6 : 9);
  const b = rand(1, 12);
  const c = a * x + b;

  return {
    skill: "Linear Equations",
    subskill: "One-Step Equations",
    topic: "Solving one-step linear equations",
    difficulty,
    type: "multiple",
    question: `Solve for x: ${a}x + ${b} = ${c}`,
    choices: uniqueNumberChoices(x, [x + 1, x + 2, x - 1, x - 2]),
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
    subskill: "One-Step Equations",
    topic: "Solving one-step linear equations",
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
    subskill: "Variables on Both Sides",
    topic: "Solving equations with variables on both sides",
    difficulty,
    type: "multiple",
    question: `Solve for x: ${a}x + ${b} = ${d}x + ${c}`,
    choices: uniqueNumberChoices(x, [x + 1, x - 1, x + 2, x + 3]),
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
    subskill: "Variables on Both Sides",
    topic: "Solving equations with variables on both sides",
    difficulty,
    type: "fill",
    question: `Solve for x: ${a}x + ${b} = ${d}x + ${c}`,
    answer: String(x),
    explanation: `Move variable terms to one side and constants to the other. Then divide both sides by ${a - d}. That gives x = ${x}.`
  };
}

function equationWordProblemMultiple(difficulty) {
  const x = rand(3, difficulty === "Easy" ? 9 : 14);
  const rate = rand(2, difficulty === "Easy" ? 6 : 9);
  const fee = rand(3, difficulty === "Easy" ? 10 : 15);
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

  const bank =
    difficulty === "Easy"
      ? [oneStepMultiple, oneStepFill, equationWordProblemMultiple]
      : [
          oneStepMultiple,
          oneStepFill,
          variablesBothSidesMultiple,
          variablesBothSidesFill,
          equationWordProblemMultiple
        ];

  return bank[rand(0, bank.length - 1)](difficulty);
};