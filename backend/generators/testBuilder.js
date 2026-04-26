const algebra = require("./algebra");
const barGraph = require("./barGraph");
const dataTable = require("./dataTable");
const geometry = require("./geometry");
const linearEquations = require("./linearEquations");
const lineGraph = require("./lineGraph");
const percent = require("./percent");
const percentChange = require("./percentChange");
const probability = require("./probability");
const scatterPlot = require("./scatterPlot");
const slope = require("./slope");
const multiStep = require("./multiStep");
const dragDrop = require("./dragDrop");
const hotspot = require("./hotspot");

const generators = [
  algebra,
  barGraph,
  dataTable,
  geometry,
  linearEquations,
  lineGraph,
  percent,
  percentChange,
  probability,
  scatterPlot,
  slope,
  multiStep,
  dragDrop,
  hotspot
].filter((g) => typeof g === "function");

function normalizeExplanation(text, fallbackAnswer) {
  if (text && String(text).trim()) return text;
  return `The correct answer is ${fallbackAnswer}. Review the numbers in the problem carefully, identify the operation or formula that applies, and work step by step to confirm the result.`;
}

function normalizeQuestion(q, index, difficulty) {
  return {
    id: index + 1,
    skill: q.skill || "Mixed Practice",
    type: q.type || "multiple",
    question: q.question || "Question unavailable.",
    choices: Array.isArray(q.choices) ? q.choices : [],
    answer: q.answer,
    chart: q.chart || null,
    diagram: q.diagram || null,
    hotspot: q.hotspot || null,
    explanation: normalizeExplanation(q.explanation, q.answer),
    difficulty: q.difficulty || difficulty
  };
}

function skillMatches(selectedSkill, questionSkill) {
  const map = {
    "Fractions, Decimals, and Percents": ["Percent"],
    "Ratios, Proportions, and Percent Change": ["Percent Change", "Percent"],
    "Measurement and Unit Conversion": [],
    "Area, Perimeter, Surface Area, and Volume": ["Geometry"],
    "Lines, Angles, and Coordinate Plane": ["Slope", "Geometry"],
    "Data Tables and Graph Interpretation": ["Bar Graph", "Line Graph", "Scatter Plot", "Data Table"],
    "Mean, Median, and Probability": ["Probability"],
    "Expressions and Order of Operations": ["Algebra"],
    "Solving Equations and Inequalities": ["Linear Equations", "Algebra"],
    "Linear Equations and Slope": ["Linear Equations", "Slope", "Algebra"]
  };

  const allowed = map[selectedSkill] || [];
  return allowed.includes(questionSkill);
}

function generatorCanProduceType(generator, difficulty, desiredType) {
  try {
    for (let i = 0; i < 6; i += 1) {
      const sample = generator({ difficulty });
      if (sample && sample.type === desiredType) {
        return true;
      }
    }
  } catch (e) {
    return false;
  }
  return false;
}

function drawQuestionFromPool(pool, difficulty, preferredType = null) {
  const attempts = 20;

  if (preferredType) {
    for (let i = 0; i < attempts; i += 1) {
      const generator = pool[Math.floor(Math.random() * pool.length)];
      const question = generator({ difficulty });
      if (question && question.type === preferredType) {
        return question;
      }
    }
  }

  const generator = pool[Math.floor(Math.random() * pool.length)];
  return generator({ difficulty });
}

function buildTest(options = {}) {
  const requestedCount = Number(options.count);
  const count = Number.isFinite(requestedCount) && requestedCount > 1 ? requestedCount : 46;
  const difficulty = options.difficulty || "GED-Level";
  const skill = options.skill || "";

  const eligible = skill
    ? generators.filter((g) => {
        try {
          const sample = g({ difficulty });
          return sample && skillMatches(skill, sample.skill);
        } catch (e) {
          return false;
        }
      })
    : generators;

  const pool = eligible.length ? eligible : [];
  if (!pool.length) {
    throw new Error(`No generators matched selected skill: ${skill}`);
  }

  const fillCapablePool = pool.filter((g) =>
  generatorCanProduceType(g, difficulty, "fill")
);

const dragDropCapablePool = pool.filter((g) =>
  generatorCanProduceType(g, difficulty, "dragdrop")
);

const hotspotCapablePool = pool.filter((g) =>
  generatorCanProduceType(g, difficulty, "hotspot")
);

const isFullTest = count >= 40;

const targetFillCount =
  fillCapablePool.length > 0
    ? (isFullTest ? 4 : 1)
    : 0;

const targetDragDropCount =
  dragDropCapablePool.length > 0
    ? (isFullTest ? 2 : 1)
    : 0;

const targetHotspotCount =
  hotspotCapablePool.length > 0
    ? (isFullTest ? 1 : 1)
    : 0;

const questions = [];
let fillCount = 0;
let dragDropCount = 0;
let hotspotCount = 0;

for (let i = 0; i < count; i += 1) {
  const needsMoreHotspot = hotspotCount < targetHotspotCount;
  const needsMoreDragDrop =
    !needsMoreHotspot && dragDropCount < targetDragDropCount;
  const needsMoreFill =
    !needsMoreHotspot && !needsMoreDragDrop && fillCount < targetFillCount;

  let sourcePool = pool;
  let preferredType = null;

  if (needsMoreHotspot && hotspotCapablePool.length) {
    sourcePool = hotspotCapablePool;
    preferredType = "hotspot";
  } else if (needsMoreDragDrop && dragDropCapablePool.length) {
    sourcePool = dragDropCapablePool;
    preferredType = "dragdrop";
  } else if (needsMoreFill && fillCapablePool.length) {
    sourcePool = fillCapablePool;
    preferredType = "fill";
  }

  const question = drawQuestionFromPool(sourcePool, difficulty, preferredType);
  const normalized = normalizeQuestion(question, i, difficulty);

  if (normalized.type === "hotspot") {
    hotspotCount += 1;
  }

  if (normalized.type === "dragdrop") {
    dragDropCount += 1;
  }

  if (normalized.type === "fill") {
    fillCount += 1;
  }

  questions.push(normalized);
}

return questions;
}

module.exports = buildTest;