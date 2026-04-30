function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function uniqueNumberChoices(answer, wrongs) {
  const choices = new Set([answer]);

  wrongs.forEach((w) => {
    if (Number.isFinite(w) && w >= 0 && w !== answer && choices.size < 4) {
      choices.add(w);
    }
  });

  while (choices.size < 4) {
    const wrong = Number((answer + rand(-12, 15)).toFixed(2));
    if (wrong >= 0 && wrong !== answer) choices.add(wrong);
  }

  return shuffle(Array.from(choices));
}

function increase(difficulty) {
  const original = rand(5, difficulty === "Easy" ? 12 : 20) * 10;
  const changes = difficulty === "Easy" ? [10, 20, 25] : [10, 15, 20, 25, 30, 35];
  const change = changes[rand(0, changes.length - 1)];

  const amount = Number((original * (change / 100)).toFixed(2));
  const answer = Number((original + amount).toFixed(2));

  const scenarios = [
    `A store sold ${original} items last week. This week, sales increased by ${change}%. How many items were sold this week?`,
    `A club had ${original} members. Membership increased by ${change}%. How many members are in the club now?`,
    `A worker earned $${original} in bonuses. The bonus amount increased by ${change}%. What is the new bonus amount?`
  ];

  return {
    skill: "Percent Change",
    subskill: "Percent Increase",
    topic: "Finding a new value after percent increase",
    difficulty,
    type: "multiple",
    question: scenarios[rand(0, scenarios.length - 1)],
    choices: uniqueNumberChoices(answer, [
      amount,
      Number((original - amount).toFixed(2)),
      Number((original + change).toFixed(2)),
      Number((answer + rand(5, 15)).toFixed(2))
    ]),
    answer,
    explanation: `Find the increase: ${original} × ${change / 100} = ${amount}. Add it to the original value: ${original} + ${amount} = ${answer}.`
  };
}

function decrease(difficulty) {
  const original = rand(5, difficulty === "Easy" ? 12 : 20) * 10;
  const changes = difficulty === "Easy" ? [10, 20, 25] : [10, 15, 20, 25, 30, 35];
  const change = changes[rand(0, changes.length - 1)];

  const amount = Number((original * (change / 100)).toFixed(2));
  const answer = Number((original - amount).toFixed(2));

  const scenarios = [
    `A store had ${original} items in stock. The number of items decreased by ${change}%. How many items are left?`,
    `A price of $${original} is reduced by ${change}%. What is the new price?`,
    `A class had ${original} assignments to complete. The remaining work decreased by ${change}%. How many assignments remain?`
  ];

  return {
    skill: "Percent Change",
    subskill: "Percent Decrease",
    topic: "Finding a new value after percent decrease",
    difficulty,
    type: "multiple",
    question: scenarios[rand(0, scenarios.length - 1)],
    choices: uniqueNumberChoices(answer, [
      amount,
      Number((original + amount).toFixed(2)),
      Number((original - change).toFixed(2)),
      Number((answer + rand(5, 15)).toFixed(2))
    ]),
    answer,
    explanation: `Find the decrease: ${original} × ${change / 100} = ${amount}. Subtract it from the original value: ${original} - ${amount} = ${answer}.`
  };
}

function findPercentIncrease(difficulty) {
  const original = rand(5, difficulty === "Easy" ? 12 : 18) * 10;
  const percent = [10, 20, 25, 30, 40, 50][rand(0, 5)];
  const newValue = Number((original + original * (percent / 100)).toFixed(2));

  return {
    skill: "Percent Change",
    subskill: "Finding Percent Increase",
    topic: "Finding the percent increase between two values",
    difficulty,
    type: "multiple",
    question: `A value increased from ${original} to ${newValue}. What was the percent increase?`,
    choices: shuffle([percent, percent + 5, Math.max(1, percent - 5), 100 - percent]),
    answer: percent,
    explanation: `The increase is ${newValue} - ${original} = ${newValue - original}. Divide by the original value: ${(newValue - original)} ÷ ${original} = ${percent / 100}, or ${percent}%.`
  };
}

module.exports = function generatePercentChange(options = {}) {
  const difficulty = options.difficulty || "GED-Level";

  const bank = [
    increase,
    decrease,
    findPercentIncrease
  ];

  return bank[rand(0, bank.length - 1)](difficulty);
};