function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = function generateHotspot(options = {}) {
  const difficulty = options.difficulty || "GED-Level";

  const answer = rand(-4, 4);

  return {
    skill: "Number Line",
    difficulty,
    type: "hotspot",
    question: `Click the point on the number line that represents ${answer}.`,
    answer: String(answer),
    hotspot: {
      type: "numberLine",
      min: -5,
      max: 5,
      target: answer
    },
    explanation: `${answer} is located at the tick mark labeled ${answer} on the number line.`
  };
};