function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function percentOfNumberMultiple(difficulty) {
  const percent = rand(5, difficulty === "Easy" ? 25 : 50);
  const base = rand(20, difficulty === "Easy" ? 100 : 200);
  const answer = Number(((percent / 100) * base).toFixed(2));

  return {
    skill: "Percent",
    subskill: "Percent of a Number",
topic: "Finding a percent of a whole",
    difficulty,
    type: "multiple",
    question: `What is ${percent}% of ${base}?`,
    choices: shuffle([
      answer,
      Number((base / Math.max(percent, 1)).toFixed(2)),
      Number((base + percent).toFixed(2)),
      Number((answer + rand(2, 15)).toFixed(2))
    ]),
    answer,
    explanation: `Convert ${percent}% to decimal form, ${percent / 100}. Then multiply by ${base}: ${base} × ${percent / 100} = ${answer}.`
  };
}

function percentOfNumberFill(difficulty) {
  const percent = rand(5, difficulty === "Easy" ? 25 : 50);
  const base = rand(20, difficulty === "Easy" ? 100 : 200);
  const answer = Number(((percent / 100) * base).toFixed(2));

  return {
    skill: "Percent",
    subskill: "Percent of a Number",
topic: "Finding a percent of a whole",
    difficulty,
    type: "fill",
    question: `What is ${percent}% of ${base}?`,
    answer: String(answer),
    explanation: `Convert ${percent}% to decimal form, ${percent / 100}. Then multiply by ${base}: ${base} × ${percent / 100} = ${answer}.`
  };
}

function percentDiscountMultiple(difficulty) {
  const price = rand(20, difficulty === "Easy" ? 100 : 150);
  const discount = rand(5, 40);
  const discountAmount = Number((price * (discount / 100)).toFixed(2));
  const answer = Number((price - discountAmount).toFixed(2));

  return {
    skill: "Percent",
    subskill: "Percent Discount",
topic: "Finding sale price after discount",
    difficulty,
    type: "multiple",
    question: `A jacket costs $${price}. It is on sale for ${discount}% off. What is the sale price?`,
    choices: shuffle([answer, discountAmount, price + discount, answer + rand(3, 12)]),
    answer,
    explanation: `Find the discount amount first: ${price} × ${discount / 100} = ${discountAmount}. Then subtract from the original price: ${price} - ${discountAmount} = ${answer}.`
  };
}

function percentDiscountFill(difficulty) {
  const price = rand(20, difficulty === "Easy" ? 100 : 150);
  const discount = rand(5, 40);
  const discountAmount = Number((price * (discount / 100)).toFixed(2));
  const answer = Number((price - discountAmount).toFixed(2));

  return {
    skill: "Percent",
    subskill: "Percent Discount",
topic: "Finding sale price after discount",
    difficulty,
    type: "fill",
    question: `A jacket costs $${price}. It is on sale for ${discount}% off. What is the sale price?`,
    answer: String(answer),
    explanation: `Find the discount amount first: ${price} × ${discount / 100} = ${discountAmount}. Then subtract from the original price: ${price} - ${discountAmount} = ${answer}.`
  };
}

module.exports = function generatePercent(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  const bank = [
    percentOfNumberMultiple,
    percentOfNumberFill,
    percentDiscountMultiple,
    percentDiscountFill
  ];
  return bank[Math.floor(Math.random() * bank.length)](difficulty);
};