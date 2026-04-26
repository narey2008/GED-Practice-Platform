function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function fractionToDecimalOrdering() {
  const items = [
    { label: "1/4", value: 0.25 },
    { label: "1/2", value: 0.5 },
    { label: "3/4", value: 0.75 }
  ];

  const shuffled = shuffle(items.map((x) => x.label));
  const correctOrder = items
    .slice()
    .sort((a, b) => a.value - b.value)
    .map((x) => x.label)
    .join(" | ");

  return {
    skill: "Algebra",
    difficulty: "GED-Level",
    type: "dragdrop",
    question: "Drag the values into order from least to greatest.",
    choices: shuffled,
    answer: correctOrder,
    explanation: `Convert or compare the fractions: 1/4 = 0.25, 1/2 = 0.5, and 3/4 = 0.75. So the order from least to greatest is 1/4, 1/2, 3/4.`
  };
}

function decimalOrdering() {
  const items = [
    { label: "0.6", value: 0.6 },
    { label: "0.08", value: 0.08 },
    { label: "0.75", value: 0.75 }
  ];

  const shuffled = shuffle(items.map((x) => x.label));
  const correctOrder = items
    .slice()
    .sort((a, b) => a.value - b.value)
    .map((x) => x.label)
    .join(" | ");

  return {
    skill: "Algebra",
    difficulty: "GED-Level",
    type: "dragdrop",
    question: "Drag the decimals into order from least to greatest.",
    choices: shuffled,
    answer: correctOrder,
    explanation: `Compare the place values. 0.08 is smallest, then 0.6, then 0.75.`
  };
}

function percentOrdering() {
  const items = [
    { label: "15%", value: 15 },
    { label: "40%", value: 40 },
    { label: "65%", value: 65 }
  ];

  const shuffled = shuffle(items.map((x) => x.label));
  const correctOrder = items
    .slice()
    .sort((a, b) => a.value - b.value)
    .map((x) => x.label)
    .join(" | ");

  return {
    skill: "Percent",
    difficulty: "GED-Level",
    type: "dragdrop",
    question: "Drag the percents into order from least to greatest.",
    choices: shuffled,
    answer: correctOrder,
    explanation: `Compare the percent values directly: 15%, 40%, 65%.`
  };
}

module.exports = function generateDragDrop(options = {}) {
  const bank = [
    fractionToDecimalOrdering,
    decimalOrdering,
    percentOrdering
  ];
  return bank[rand(0, bank.length - 1)]();
};