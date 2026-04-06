function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function simpleProbability(difficulty) {
  const total = rand(6, difficulty === "Easy" ? 12 : 18);
  const favorable = rand(1, total - 1);
  const answer = `${favorable}/${total}`;

  return {
    skill: "Probability",
    difficulty,
    type: "multiple",
    question: `A bag contains ${total} marbles. ${favorable} are blue. What is the probability of drawing a blue marble?`,
    choices: shuffle([
      answer,
      `${total}/${favorable}`,
      `${favorable + 1}/${total}`,
      `${Math.max(1, favorable - 1)}/${total}`
    ]),
    answer,
    explanation: `Probability = favorable outcomes / total outcomes. There are ${favorable} blue marbles out of ${total} total, so the probability is ${favorable}/${total}.`
  };
}

function coinProbability(difficulty) {
  return {
    skill: "Probability",
    difficulty,
    type: "multiple",
    question: "What is the probability of getting heads when a fair coin is flipped once?",
    choices: shuffle(["1/2", "1/4", "1", "0"]),
    answer: "1/2",
    explanation: `A fair coin has 2 equally likely outcomes. One of them is heads, so the probability is 1/2.`
  };
}

module.exports = function generateProbability(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  const bank = [simpleProbability, coinProbability];
  return bank[Math.floor(Math.random() * bank.length)](difficulty);
};