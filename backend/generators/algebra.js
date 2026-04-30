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
    const wrong = answer + rand(-10, 12);
    if (wrong !== answer) choices.add(wrong);
  }

  return shuffle(Array.from(choices));
}

function orderOfOperationsMultiple(difficulty) {
  const a = rand(2, difficulty === "Easy" ? 6 : 9);
  const b = rand(2, difficulty === "Easy" ? 6 : 9);
  const c = rand(2, difficulty === "Easy" ? 5 : 8);

  const answer = a + b * c;

  return {
    skill: "Algebra",
    subskill: "Expressions and Order of Operations",
    topic: "Evaluating expressions using order of operations",
    difficulty,
    type: "multiple",
    question: `Evaluate the expression: ${a} + ${b} × ${c}`,
    choices: uniqueNumberChoices(answer, [
      (a + b) * c,
      a * b + c,
      answer + rand(2, 8),
      answer - rand(2, 8)
    ]),
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

  return {
    skill: "Algebra",
    subskill: "Expression Substitution",
    topic: "Evaluating expressions with a given value",
    difficulty,
    type: "multiple",
    question: `If x = ${x}, what is the value of ${a}x + ${b}?`,
    choices: uniqueNumberChoices(answer, [
      a + x + b,
      a * (x + b),
      answer + rand(2, 8),
      answer - rand(2, 8)
    ]),
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

function simpleWordExpressionMultiple(difficulty) {
  const cost = rand(3, difficulty === "Easy" ? 8 : 12);
  const fee = rand(2, difficulty === "Easy" ? 6 : 10);
  const tickets = rand(2, difficulty === "Easy" ? 6 : 9);
  const answer = cost * tickets + fee;

  return {
    skill: "Algebra",
    subskill: "Expression Word Problems",
    topic: "Evaluating expressions from real-world situations",
    difficulty,
    type: "multiple",
    question: `A ticket costs $${cost}. There is a one-time service fee of $${fee}. What is the total cost for ${tickets} tickets?`,
    choices: uniqueNumberChoices(answer, [
      cost + fee + tickets,
      cost * tickets,
      cost * (tickets + fee),
      answer + rand(2, 10)
    ]),
    answer,
    explanation: `Multiply the ticket cost by the number of tickets, then add the fee: ${cost} × ${tickets} + ${fee} = ${answer}.`
  };
}

module.exports = function generateAlgebra(options = {}) {
  const difficulty = options.difficulty || "GED-Level";

  const bank = [
    orderOfOperationsMultiple,
    orderOfOperationsFill,
    expressionSubstitutionMultiple,
    expressionSubstitutionFill,
    simpleWordExpressionMultiple
  ];

  return bank[rand(0, bank.length - 1)](difficulty);
};