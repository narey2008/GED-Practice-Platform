function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function integerNumberLine(difficulty) {
  const min = difficulty === "Easy" ? -5 : -8;
  const max = difficulty === "Easy" ? 5 : 8;
  const answer = rand(min + 1, max - 1);

  return {
    skill: "Number Line",
    subskill: "Integer Number Line",
    topic: "Locating integers on a number line",
    difficulty,
    type: "hotspot",
    question: `Click the point on the number line that represents ${answer}.`,
    answer: String(answer),
    hotspot: {
      type: "numberLine",
      min,
      max,
      target: answer
    },
    explanation: `${answer} is located at the tick mark labeled ${answer} on the number line.`
  };
}

function oppositeNumberLine(difficulty) {
  const min = difficulty === "Easy" ? -5 : -8;
  const max = difficulty === "Easy" ? 5 : 8;

  let value = rand(1, difficulty === "Easy" ? 5 : 8);
  const answer = -value;

  return {
    skill: "Number Line",
    subskill: "Opposites on a Number Line",
    topic: "Locating opposites on a number line",
    difficulty,
    type: "hotspot",
    question: `Click the point on the number line that represents the opposite of ${value}.`,
    answer: String(answer),
    hotspot: {
      type: "numberLine",
      min,
      max,
      target: answer
    },
    explanation: `The opposite of ${value} is ${answer}, so the correct point is ${answer} on the number line.`
  };
}

function temperatureNumberLine(difficulty) {
  const min = difficulty === "Easy" ? -5 : -10;
  const max = difficulty === "Easy" ? 5 : 10;
  const answer = rand(min + 1, max - 1);

  return {
    skill: "Number Line",
    subskill: "Temperature Number Line",
    topic: "Locating signed numbers on a number line",
    difficulty,
    type: "hotspot",
    question: `The temperature is ${answer} degrees. Click the point on the number line that represents this temperature.`,
    answer: String(answer),
    hotspot: {
      type: "numberLine",
      min,
      max,
      target: answer
    },
    explanation: `${answer} degrees is represented by the tick mark labeled ${answer}.`
  };
}

module.exports = function generateHotspot(options = {}) {
  const difficulty = options.difficulty || "GED-Level";

  const bank = [
    integerNumberLine,
    oppositeNumberLine,
    temperatureNumberLine
  ];

  return bank[rand(0, bank.length - 1)](difficulty);
};