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
      choices.add(Number(w.toFixed ? w.toFixed(2) : w));
    }
  });

  while (choices.size < 4) {
    const wrong = Number((answer + rand(-15, 18)).toFixed(2));
    if (wrong > 0 && wrong !== answer) choices.add(wrong);
  }

  return shuffle(Array.from(choices));
}

function percentOfNumberMultiple(difficulty, p) {
  const percent = p.percents[rand(0, p.percents.length - 1)];
  const base = rand(Math.ceil(p.largeMin / 10), Math.ceil(p.largeMax / 10)) * 10;
  const answer = Number(((percent / 100) * base).toFixed(2));

  const easyQuestion = `What is ${percent}% of ${base}?`;

  const scenarios = [
    `A store has ${base} items in stock. ${percent}% of the items are notebooks. How many notebooks are in stock?`,
    `There are ${base} students at an event. ${percent}% of them bought lunch. How many students bought lunch?`,
    `A worker completed ${percent}% of ${base} tasks. How many tasks did the worker complete?`
  ];

  return {
    skill: "Percent",
    subskill: "Percent of a Number",
    topic: "Finding a percent of a whole",
    difficulty,
    type: "multiple",
    question: difficulty === "Easy" ? easyQuestion : scenarios[rand(0, scenarios.length - 1)],
    choices: uniqueNumberChoices(answer, [
      Number((base / Math.max(percent, 1)).toFixed(2)),
      Number((base + percent).toFixed(2)),
      Number((base - answer).toFixed(2)),
      Number((answer + rand(5, 15)).toFixed(2))
    ]),
    answer,
    explanation: `Convert ${percent}% to decimal form, ${percent / 100}. Then multiply by ${base}: ${base} × ${percent / 100} = ${answer}.`
  };
}

function percentOfNumberFill(difficulty, p) {
  const percent = p.percents[rand(0, p.percents.length - 1)];
  const base = rand(Math.ceil(p.largeMin / 10), Math.ceil(p.largeMax / 10)) * 10;
  const answer = Number(((percent / 100) * base).toFixed(2));

  return {
    skill: "Percent",
    subskill: "Percent of a Number",
    topic: "Finding a percent of a whole",
    difficulty,
    type: "fill",
    question:
      difficulty === "Easy"
        ? `What is ${percent}% of ${base}?`
        : `A class goal is to read ${base} pages. The class has read ${percent}% of the pages. How many pages has the class read?`,
    answer: String(answer),
    explanation: `Convert ${percent}% to decimal form, ${percent / 100}. Then multiply by ${base}: ${base} × ${percent / 100} = ${answer}.`
  };
}

function percentDiscountMultiple(difficulty, p) {
  const price = rand(Math.ceil(p.largeMin / 10), Math.ceil(p.largeMax / 10)) * 10;
  const discount = p.discounts[rand(0, p.discounts.length - 1)];

  const discountAmount = Number((price * (discount / 100)).toFixed(2));
  const answer = Number((price - discountAmount).toFixed(2));

  const items = ["jacket", "backpack", "pair of shoes", "desk lamp", "calculator"];
  const item = items[rand(0, items.length - 1)];

  return {
    skill: "Percent",
    subskill: "Percent Discount",
    topic: "Finding sale price after discount",
    difficulty,
    type: "multiple",
    question:
      difficulty === "Easy"
        ? `A $${price} item is ${discount}% off. What is the sale price?`
        : `A ${item} costs $${price}. It is on sale for ${discount}% off. What is the sale price?`,
    choices: uniqueNumberChoices(answer, [
      discountAmount,
      Number((price + discountAmount).toFixed(2)),
      Number((price - discount).toFixed(2)),
      Number((answer + rand(4, 12)).toFixed(2))
    ]),
    answer,
    explanation: `Find the discount amount first: ${price} × ${discount / 100} = ${discountAmount}. Then subtract from the original price: ${price} - ${discountAmount} = ${answer}.`
  };
}

function percentDiscountFill(difficulty, p) {
  const price = rand(Math.ceil(p.largeMin / 10), Math.ceil(p.largeMax / 10)) * 10;
  const discount = p.discounts[rand(0, p.discounts.length - 1)];

  const discountAmount = Number((price * (discount / 100)).toFixed(2));
  const answer = Number((price - discountAmount).toFixed(2));

  return {
    skill: "Percent",
    subskill: "Percent Discount",
    topic: "Finding sale price after discount",
    difficulty,
    type: "fill",
    question:
      difficulty === "Easy"
        ? `A $${price} item is ${discount}% off. What is the sale price?`
        : `A store marks down a $${price} item by ${discount}%. What is the sale price?`,
    answer: String(answer),
    explanation: `Find the discount amount first: ${price} × ${discount / 100} = ${discountAmount}. Then subtract from the original price: ${price} - ${discountAmount} = ${answer}.`
  };
}

function percentOfTotalMultiple(difficulty, p) {
  const total = rand(Math.ceil(p.largeMin / 10), Math.ceil(p.largeMax / 10)) * 10;
  const percent = p.percents[rand(0, p.percents.length - 1)];
  const answer = Number(((percent / 100) * total).toFixed(2));

  return {
    skill: "Percent",
    subskill: "Percent of a Total",
    topic: "Finding part of a total using a percent",
    difficulty,
    type: "multiple",
    question:
      difficulty === "Easy"
        ? `${percent}% of ${total} people chose online classes. How many people is that?`
        : `A survey included ${total} people. ${percent}% chose online classes. How many people chose online classes?`,
    choices: uniqueNumberChoices(answer, [
      total - answer,
      total + percent,
      Math.round(total / Math.max(1, percent)),
      answer + rand(5, 15)
    ]),
    answer,
    explanation: `${percent}% of ${total} = (${percent}/100) × ${total} = ${answer}.`
  };
}

module.exports = function generatePercent(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  const p = getDifficultyProfile(difficulty);

  const easyBank = [
    percentOfNumberMultiple,
    percentOfNumberFill,
    percentDiscountMultiple
  ];

  const mediumBank = [
    percentOfNumberMultiple,
    percentOfNumberFill,
    percentDiscountMultiple,
    percentDiscountFill,
    percentOfTotalMultiple
  ];

  const gedBank = [
    percentOfNumberMultiple,
    percentOfNumberFill,
    percentDiscountMultiple,
    percentDiscountFill,
    percentOfTotalMultiple
  ];

  const bank =
    difficulty === "Easy"
      ? easyBank
      : difficulty === "Medium"
      ? mediumBank
      : gedBank;

  return bank[rand(0, bank.length - 1)](difficulty, p);
};