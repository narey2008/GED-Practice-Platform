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
      choices.add(w);
    }
  });

  while (choices.size < 4) {
    const wrong = Number((answer + rand(-15, 18)).toFixed(2));
    if (wrong > 0 && wrong !== answer) choices.add(wrong);
  }

  return shuffle(Array.from(choices));
}

function percentOfNumberMultiple(difficulty) {
  const percents = difficulty === "Easy"
    ? [10, 20, 25, 50]
    : [10, 15, 20, 25, 30, 40, 50];

  const percent = percents[rand(0, percents.length - 1)];
  const base = rand(4, difficulty === "Easy" ? 12 : 24) * 10;
  const answer = Number(((percent / 100) * base).toFixed(2));

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
    question: scenarios[rand(0, scenarios.length - 1)],
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

function percentOfNumberFill(difficulty) {
  const percents = difficulty === "Easy"
    ? [10, 20, 25, 50]
    : [10, 15, 20, 25, 30, 40, 50];

  const percent = percents[rand(0, percents.length - 1)];
  const base = rand(4, difficulty === "Easy" ? 12 : 24) * 10;
  const answer = Number(((percent / 100) * base).toFixed(2));

  return {
    skill: "Percent",
    subskill: "Percent of a Number",
    topic: "Finding a percent of a whole",
    difficulty,
    type: "fill",
    question: `A class goal is to read ${base} pages. The class has read ${percent}% of the pages. How many pages has the class read?`,
    answer: String(answer),
    explanation: `Convert ${percent}% to decimal form, ${percent / 100}. Then multiply by ${base}: ${base} × ${percent / 100} = ${answer}.`
  };
}

function percentDiscountMultiple(difficulty) {
  const price = rand(4, difficulty === "Easy" ? 12 : 20) * 10;
  const discounts = difficulty === "Easy" ? [10, 20, 25] : [10, 15, 20, 25, 30, 40];
  const discount = discounts[rand(0, discounts.length - 1)];

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
    question: `A ${item} costs $${price}. It is on sale for ${discount}% off. What is the sale price?`,
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

function percentDiscountFill(difficulty) {
  const price = rand(4, difficulty === "Easy" ? 12 : 20) * 10;
  const discounts = difficulty === "Easy" ? [10, 20, 25] : [10, 15, 20, 25, 30, 40];
  const discount = discounts[rand(0, discounts.length - 1)];

  const discountAmount = Number((price * (discount / 100)).toFixed(2));
  const answer = Number((price - discountAmount).toFixed(2));

  return {
    skill: "Percent",
    subskill: "Percent Discount",
    topic: "Finding sale price after discount",
    difficulty,
    type: "fill",
    question: `A store marks down a $${price} item by ${discount}%. What is the sale price?`,
    answer: String(answer),
    explanation: `Find the discount amount first: ${price} × ${discount / 100} = ${discountAmount}. Then subtract from the original price: ${price} - ${discountAmount} = ${answer}.`
  };
}

function percentOfTotalMultiple(difficulty) {
  const total = rand(8, difficulty === "Easy" ? 16 : 25) * 10;
  const percent = [10, 20, 25, 30, 40, 50][rand(0, 5)];
  const answer = Number(((percent / 100) * total).toFixed(2));

  return {
    skill: "Percent",
    subskill: "Percent of a Total",
    topic: "Finding part of a total using a percent",
    difficulty,
    type: "multiple",
    question: `A survey included ${total} people. ${percent}% chose online classes. How many people chose online classes?`,
    choices: uniqueNumberChoices(answer, [
      total - answer,
      total + percent,
      Math.round(total / percent),
      answer + rand(5, 15)
    ]),
    answer,
    explanation: `${percent}% of ${total} = (${percent}/100) × ${total} = ${answer}.`
  };
}

module.exports = function generatePercent(options = {}) {
  const difficulty = options.difficulty || "GED-Level";

  const bank = [
    percentOfNumberMultiple,
    percentOfNumberFill,
    percentDiscountMultiple,
    percentDiscountFill,
    percentOfTotalMultiple
  ];

  return bank[rand(0, bank.length - 1)](difficulty);
};