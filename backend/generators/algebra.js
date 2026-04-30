function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function orderOfOperationsMultiple(difficulty) {
  const a = rand(2, difficulty === "Easy" ? 6 : 9);
  const b = rand(2, difficulty === "Easy" ? 6 : 9);
  const c = rand(2, difficulty === "Easy" ? 5 : 8);

  const answer = a + b * c;

  const choices = new Set([
    answer,
    (a + b) * c,
    a * b + c,
    answer + rand(2, 8)
  ]);

  while (choices.size < 4) {
    choices.add(answer + rand(-10, 10));
  }

  return {
    skill: "Algebra",
    subskill: "Expressions and Order of Operations",
    topic: "Evaluating expressions using order of operations",
    difficulty,
    type: "multiple",
    question: `Evaluate the expression: ${a} + ${b} × ${c}`,
    choices: shuffle(Array.from(choices)),
    answer,
    explanation: `Use order of operations. Multiply first: ${b} × ${c} = ${b * c}. Then add ${a}: ${a} + ${b * c} = ${answer}.`
  };
}

function orderOfOperationsFill(difficulty) {
  const a = rand(2, difficulty === "Easy" ? 6 : 9);
  const b = rand(2, difficulty === "Easy" ? 6 : 9);
  const c = rand(2, difficulty === "Easy" ? 5 : 8);

  const answer = a * (b + c);

  return {
    skill: "Algebra",
    subskill: "Expressions and Order of Operations",
    topic: "Evaluating expressions with parentheses",
    difficulty,
    type: "fill",
    question: `Evaluate the expression: ${a}(${b} + ${c})`,
    answer: String(answer),
    explanation: `Evaluate inside the parentheses first: ${b} + ${c} = ${b + c}. Then multiply: ${a} × ${b + c} = ${answer}.`
  };
}

function expressionSubstitutionMultiple(difficulty) {
  const x = rand(2, difficulty === "Easy" ? 6 : 10);
  const a = rand(2, difficulty === "Easy" ? 5 : 8);
  const b = rand(1, difficulty === "Easy" ? 8 : 12);
  const answer = a * x + b;

  const choices = new Set([
    answer,
    a + x + b,
    a * (x + b),
    answer + rand(2, 8)
  ]);

  while (choices.size < 4) {
    choices.add(answer + rand(-10, 10));
  }

  return {
    skill: "Algebra",
    subskill: "Expression Substitution",
    topic: "Evaluating expressions with a given value",
    difficulty,
    type: "multiple",
    question: `If x = ${x}, what is the value of ${a}x + ${b}?`,
    choices: shuffle(Array.from(choices)),
    answer,
    explanation: `Substitute ${x} for x: ${a}(${x}) + ${b} = ${a * x} + ${b} = ${answer}.`
  };
}

function expressionSubstitutionFill(difficulty) {
  const x = rand(2, difficulty === "Easy" ? 6 : 10);
  const a = rand(2, difficulty === "Easy" ? 5 : 8);
  const b = rand(1, difficulty === "Easy" ? 8 : 12);
  const answer = a * x - b;

  return {
    skill: "Algebra",
    subskill: "Expression Substitution",
    topic: "Evaluating expressions with a given value",
    difficulty,
    type: "fill",
    question: `If x = ${x}, what is the value of ${a}x - ${b}?`,
    answer: String(answer),
    explanation: `Substitute ${x} for x: ${a}(${x}) - ${b} = ${a * x} - ${b} = ${answer}.`
  };
}

module.exports = function generateAlgebra(options = {}) {
  const difficulty = options.difficulty || "GED-Level";

  const bank = [
    orderOfOperationsMultiple,
    orderOfOperationsFill,
    expressionSubstitutionMultiple,
    expressionSubstitutionFill
  ];

  return bank[rand(0, bank.length - 1)](difficulty);
};