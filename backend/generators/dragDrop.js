function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function orderAnswer(items) {
  return items.join(" | ");
}

function fractionOrdering() {
  const sets = [
    ["1/4", "1/2", "3/4"],
    ["1/5", "2/5", "4/5"],
    ["1/3", "2/3", "5/6"],
    ["1/8", "3/8", "7/8"]
  ];

  const correct = sets[rand(0, sets.length - 1)];

  return {
    skill: "Algebra",
    subskill: "Fractions",
    topic: "Ordering fractions",
    difficulty: "GED-Level",
    type: "dragdrop",
    question: "Drag the fractions into order from least to greatest.",
    choices: shuffle(correct),
    answer: orderAnswer(correct),
    explanation: `Compare the fraction values. From least to greatest, the correct order is ${correct.join(", ")}.`
  };
}

function decimalOrdering() {
  const sets = [
    ["0.08", "0.6", "0.75"],
    ["0.12", "0.4", "0.92"],
    ["0.05", "0.25", "0.7"],
    ["0.3", "0.55", "0.9"]
  ];

  const correct = sets[rand(0, sets.length - 1)];

  return {
    skill: "Algebra",
    subskill: "Decimals",
    topic: "Ordering decimals",
    difficulty: "GED-Level",
    type: "dragdrop",
    question: "Drag the decimals into order from least to greatest.",
    choices: shuffle(correct),
    answer: orderAnswer(correct),
    explanation: `Compare place values. From least to greatest, the correct order is ${correct.join(", ")}.`
  };
}

function percentOrdering() {
  const sets = [
    ["15%", "40%", "65%"],
    ["10%", "25%", "75%"],
    ["20%", "35%", "80%"],
    ["5%", "50%", "90%"]
  ];

  const correct = sets[rand(0, sets.length - 1)];

  return {
    skill: "Percent",
    subskill: "Comparing Percents",
    topic: "Ordering percents",
    difficulty: "GED-Level",
    type: "dragdrop",
    question: "Drag the percents into order from least to greatest.",
    choices: shuffle(correct),
    answer: orderAnswer(correct),
    explanation: `Compare the percent values directly. From least to greatest, the correct order is ${correct.join(", ")}.`
  };
}

function equationStepOrdering() {
  const x = rand(3, 10);
  const a = rand(2, 6);
  const b = rand(4, 12);
  const c = a * x + b;

  const correct = [
    `Start with ${a}x + ${b} = ${c}`,
    `Subtract ${b} from both sides`,
    `Divide both sides by ${a}`,
    `x = ${x}`
  ];

  return {
    skill: "Linear Equations",
    subskill: "Equation Steps",
    topic: "Ordering equation-solving steps",
    difficulty: "GED-Level",
    type: "dragdrop",
    question: `Drag the steps into the correct order to solve ${a}x + ${b} = ${c}.`,
    choices: shuffle(correct),
    answer: orderAnswer(correct),
    explanation: `First subtract ${b} from both sides. Then divide both sides by ${a}. The solution is x = ${x}.`
  };
}

function discountStepOrdering() {
  const price = rand(4, 14) * 10;
  const discount = [10, 15, 20, 25, 30][rand(0, 4)];
  const discountAmount = Number((price * (discount / 100)).toFixed(2));
  const salePrice = Number((price - discountAmount).toFixed(2));

  const correct = [
    `Start with the original price: $${price}`,
    `Find ${discount}% of $${price}`,
    `Subtract $${discountAmount} from $${price}`,
    `Sale price = $${salePrice}`
  ];

  return {
    skill: "Percent",
    subskill: "Percent Discount",
    topic: "Ordering discount steps",
    difficulty: "GED-Level",
    type: "dragdrop",
    question: `Drag the steps into the correct order to find the sale price of a $${price} item with a ${discount}% discount.`,
    choices: shuffle(correct),
    answer: orderAnswer(correct),
    explanation: `${discount}% of $${price} is $${discountAmount}. Then subtract: $${price} - $${discountAmount} = $${salePrice}.`
  };
}

function areaCostStepOrdering() {
  const length = rand(8, 15);
  const width = rand(5, 10);
  const cost = rand(2, 6);
  const area = length * width;
  const total = area * cost;

  const correct = [
    `Find the area: ${length} × ${width}`,
    `Area = ${area} square feet`,
    `Multiply by $${cost} per square foot`,
    `Total cost = $${total}`
  ];

  return {
    skill: "Geometry",
    subskill: "Area Cost Problems",
    topic: "Using area to calculate total cost",
    difficulty: "GED-Level",
    type: "dragdrop",
    question: `A rectangular floor is ${length} ft by ${width} ft. Tile costs $${cost} per square foot. Drag the steps into the correct order.`,
    choices: shuffle(correct),
    answer: orderAnswer(correct),
    explanation: `First find the area: ${length} × ${width} = ${area} square feet. Then multiply by the cost: ${area} × $${cost} = $${total}.`
  };
}

module.exports = function generateDragDrop(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  const bank = [
    fractionOrdering,
    decimalOrdering,
    percentOrdering,
    equationStepOrdering,
    discountStepOrdering,
    areaCostStepOrdering
  ];

  const question = bank[rand(0, bank.length - 1)]();

  return {
    ...question,
    difficulty
  };
};
