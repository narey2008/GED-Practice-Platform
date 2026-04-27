function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function orderAnswer(items) {
  return items.join(" | ");
}

function fractionToDecimalOrdering() {
  const correct = ["1/4", "1/2", "3/4"];

  return {
    skill: "Algebra",
    difficulty: "GED-Level",
    type: "dragdrop",
    question: "Drag the values into order from least to greatest.",
    choices: shuffle(correct),
    answer: orderAnswer(correct),
    explanation: "Convert or compare the fractions: 1/4 = 0.25, 1/2 = 0.5, and 3/4 = 0.75."
  };
}

function decimalOrdering() {
  const correct = ["0.08", "0.6", "0.75"];

  return {
    skill: "Algebra",
    difficulty: "GED-Level",
    type: "dragdrop",
    question: "Drag the decimals into order from least to greatest.",
    choices: shuffle(correct),
    answer: orderAnswer(correct),
    explanation: "Compare place values. 0.08 is smallest, then 0.6, then 0.75."
  };
}

function percentOrdering() {
  const correct = ["15%", "40%", "65%"];

  return {
    skill: "Percent",
    difficulty: "GED-Level",
    type: "dragdrop",
    question: "Drag the percents into order from least to greatest.",
    choices: shuffle(correct),
    answer: orderAnswer(correct),
    explanation: "Compare the percent values directly: 15%, 40%, 65%."
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
    difficulty: "GED-Level",
    type: "dragdrop",
    question: `Drag the steps into the correct order to solve: ${a}x + ${b} = ${c}`,
    choices: shuffle(correct),
    answer: orderAnswer(correct),
    explanation: `First subtract ${b}, then divide by ${a}. The solution is x = ${x}.`
  };
}

function discountStepOrdering() {
  const price = rand(40, 120);
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
    difficulty: "GED-Level",
    type: "dragdrop",
    question: `Drag the steps into the correct order to find the sale price of a $${price} item with a ${discount}% discount.`,
    choices: shuffle(correct),
    answer: orderAnswer(correct),
    explanation: `${discount}% of ${price} is ${discountAmount}. Then ${price} - ${discountAmount} = ${salePrice}.`
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
    difficulty: "GED-Level",
    type: "dragdrop",
    question: `A rectangular floor is ${length} ft by ${width} ft. Tile costs $${cost} per square foot. Drag the steps into the correct order.`,
    choices: shuffle(correct),
    answer: orderAnswer(correct),
    explanation: `Area is ${length} × ${width} = ${area}. Then ${area} × ${cost} = ${total}.`
  };
}

module.exports = function generateDragDrop(options = {}) {
  const bank = [
    fractionToDecimalOrdering,
    decimalOrdering,
    percentOrdering,
    equationStepOrdering,
    discountStepOrdering,
    areaCostStepOrdering
  ];

  return bank[rand(0, bank.length - 1)]();
};