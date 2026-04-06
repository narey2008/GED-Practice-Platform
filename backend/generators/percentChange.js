function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function increase(difficulty) {
  const original = rand(20, difficulty === "Easy" ? 90 : 150);
  const change = rand(5, 35);
  const amount = Number((original * (change / 100)).toFixed(2));
  const answer = Number((original + amount).toFixed(2));

  return {
    skill: "Percent Change",
    difficulty,
    type: "multiple",
    question: `A value of ${original} is increased by ${change}%. What is the new value?`,
    choices: shuffle([answer, amount, original - amount, answer + rand(2, 9)]),
    answer,
    explanation: `Find the increase: ${original} × ${change / 100} = ${amount}. Add it to the original value: ${original} + ${amount} = ${answer}.`
  };
}

function decrease(difficulty) {
  const original = rand(20, difficulty === "Easy" ? 90 : 150);
  const change = rand(5, 35);
  const amount = Number((original * (change / 100)).toFixed(2));
  const answer = Number((original - amount).toFixed(2));

  return {
    skill: "Percent Change",
    difficulty,
    type: "multiple",
    question: `A value of ${original} is decreased by ${change}%. What is the new value?`,
    choices: shuffle([answer, amount, original + amount, answer + rand(2, 9)]),
    answer,
    explanation: `Find the decrease: ${original} × ${change / 100} = ${amount}. Subtract it from the original value: ${original} - ${amount} = ${answer}.`
  };
}

module.exports = function generatePercentChange(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  const bank = [increase, decrease];
  return bank[Math.floor(Math.random() * bank.length)](difficulty);
};