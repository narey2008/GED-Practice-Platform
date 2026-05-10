function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function normalizeSkill(value) {
  return String(value || "").trim().toLowerCase();
}

function valueKey(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return String(Number(n.toFixed(5)));
}

function buildNumberLineQuestion({
  subskill,
  topic,
  difficulty,
  question,
  answer,
  min,
  max,
  step = 1,
  tickLabels = null,
  explanation
}) {
  return {
    skill: "Number Line",
    subskill,
    topic,
    difficulty,
    type: "hotspot",
    question,
    answer: valueKey(answer),
    hotspot: {
      type: "numberLine",
      min,
      max,
      step,
      target: answer,
      tickLabels
    },
    explanation
  };
}

function integerNumberLine(difficulty) {
  const min = difficulty === "Easy" ? -5 : -8;
  const max = difficulty === "Easy" ? 5 : 8;
  const answer = rand(min + 1, max - 1);

  return buildNumberLineQuestion({
    subskill: "Integer Number Line",
    topic: "Locating integers on a number line",
    difficulty,
    question: `Click the point on the number line that represents ${answer}.`,
    answer,
    min,
    max,
    explanation: `${answer} is located at the tick mark labeled ${answer} on the number line.`
  });
}

function oppositeNumberLine(difficulty) {
  const min = difficulty === "Easy" ? -5 : -8;
  const max = difficulty === "Easy" ? 5 : 8;

  const value = rand(1, difficulty === "Easy" ? 5 : 8);
  const answer = -value;

  return buildNumberLineQuestion({
    subskill: "Opposites on a Number Line",
    topic: "Locating opposites on a number line",
    difficulty,
    question: `Click the point on the number line that represents the opposite of ${value}.`,
    answer,
    min,
    max,
    explanation: `The opposite of ${value} is ${answer}, so the correct point is ${answer} on the number line.`
  });
}

function temperatureNumberLine(difficulty) {
  const min = difficulty === "Easy" ? -5 : -10;
  const max = difficulty === "Easy" ? 5 : 10;
  const answer = rand(min + 1, max - 1);

  return buildNumberLineQuestion({
    subskill: "Temperature Number Line",
    topic: "Locating signed numbers on a number line",
    difficulty,
    question: `The temperature is ${answer} degrees. Click the point on the number line that represents this temperature.`,
    answer,
    min,
    max,
    explanation: `${answer} degrees is represented by the tick mark labeled ${answer}.`
  });
}

function temperatureChangeNumberLine(difficulty) {
  const min = -10;
  const max = 10;

  let start = rand(-5, 7);
  let change = rand(-6, 6);
  while (change === 0 || start + change <= min || start + change >= max) {
    start = rand(-5, 7);
    change = rand(-6, 6);
  }

  const answer = start + change;
  const direction = change > 0 ? "rose" : "dropped";

  return buildNumberLineQuestion({
    subskill: "Temperature Number Line",
    topic: "Finding a final temperature on a number line",
    difficulty,
    question: `The temperature was ${start} degrees. It ${direction} by ${Math.abs(change)} degrees. Click the final temperature on the number line.`,
    answer,
    min,
    max,
    explanation: `${start} ${change > 0 ? "+" : "-"} ${Math.abs(change)} = ${answer}, so the final temperature is ${answer} degrees.`
  });
}

function decimalNumberLine(difficulty) {
  const possibleTargets = [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5];
  const answer = possibleTargets[rand(0, possibleTargets.length - 1)];

  return buildNumberLineQuestion({
    subskill: "Decimal Number Line",
    topic: "Locating decimals on a number line",
    difficulty,
    question: `Click the point on the number line that represents ${answer}.`,
    answer,
    min: -3,
    max: 3,
    step: 0.5,
    explanation: `${answer} is halfway between ${Math.floor(answer)} and ${Math.ceil(answer)} on the number line.`
  });
}

function fractionNumberLine(difficulty) {
  const options = [
    { value: 0.25, label: "1/4" },
    { value: 0.5, label: "1/2" },
    { value: 0.75, label: "3/4" }
  ];

  const selected = options[rand(0, options.length - 1)];

  return buildNumberLineQuestion({
    subskill: "Fraction Number Line",
    topic: "Locating fractions on a number line",
    difficulty,
    question: `Click the point on the number line that represents ${selected.label}.`,
    answer: selected.value,
    min: 0,
    max: 1,
    step: 0.25,
    tickLabels: {
      "0": "0",
      "0.25": "1/4",
      "0.5": "1/2",
      "0.75": "3/4",
      "1": "1"
    },
    explanation: `${selected.label} is located at ${selected.value} on the number line from 0 to 1.`
  });
}

function inequalityNumberLine(difficulty) {
  const min = -6;
  const max = 6;
  const boundary = rand(-4, 4);
  const useGreaterThan = rand(0, 1) === 1;

  const answer = useGreaterThan ? boundary + 1 : boundary - 1;
  const phrase = useGreaterThan
    ? `the least integer greater than ${boundary}`
    : `the greatest integer less than ${boundary}`;

  return buildNumberLineQuestion({
    subskill: "Inequality Number Line",
    topic: "Choosing values that satisfy inequalities",
    difficulty,
    question: `Click ${phrase}.`,
    answer,
    min,
    max,
    explanation: useGreaterThan
      ? `The integers greater than ${boundary} start at ${boundary + 1}, so the least integer greater than ${boundary} is ${answer}.`
      : `The integers less than ${boundary} go down from ${boundary - 1}, so the greatest integer less than ${boundary} is ${answer}.`
  });
}

module.exports = function generateHotspot(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  const selectedSkill = normalizeSkill(options.skill);

  const directMap = {
    "integer number line": integerNumberLine,
    "opposites on a number line": oppositeNumberLine,
    "temperature number line": temperatureNumberLine,
    "decimal number line": decimalNumberLine,
    "fraction number line": fractionNumberLine,
    "inequality number line": inequalityNumberLine
  };

  if (directMap[selectedSkill]) {
    return directMap[selectedSkill](difficulty);
  }

  const easyBank = [
    integerNumberLine,
    oppositeNumberLine,
    temperatureNumberLine,
    fractionNumberLine
  ];

  const mediumBank = [
    oppositeNumberLine,
    temperatureChangeNumberLine,
    decimalNumberLine,
    fractionNumberLine,
    inequalityNumberLine
  ];

  const gedBank = [
    temperatureChangeNumberLine,
    decimalNumberLine,
    fractionNumberLine,
    inequalityNumberLine,
    oppositeNumberLine
  ];

  const bank =
    difficulty === "Easy"
      ? easyBank
      : difficulty === "Medium"
      ? mediumBank
      : gedBank;

  return bank[rand(0, bank.length - 1)](difficulty);
};