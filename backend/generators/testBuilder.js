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

const generatorCatalog = [
  {
    name: "algebra",
    fn: algebra,
    skills: ["Algebra"],
    types: ["multiple", "fill"],
    categoryTags: ["Expressions and Order of Operations", "Solving Equations and Inequalities"]
  },
  {
    name: "barGraph",
    fn: barGraph,
    skills: ["Bar Graph"],
    types: ["multiple"],
    categoryTags: ["Data Tables and Graph Interpretation"]
  },
  {
    name: "dataTable",
    fn: dataTable,
    skills: ["Data Table"],
    types: ["multiple"],
    categoryTags: ["Data Tables and Graph Interpretation"]
  },
  {
    name: "geometry",
    fn: geometry,
    skills: ["Geometry"],
    types: ["multiple"],
    categoryTags: ["Area, Perimeter, Surface Area, and Volume", "Lines, Angles, and Coordinate Plane"]
  },
  {
    name: "linearEquations",
    fn: linearEquations,
    skills: ["Linear Equations"],
    types: ["multiple", "fill"],
    categoryTags: ["Solving Equations and Inequalities"]
  },
  {
    name: "lineGraph",
    fn: lineGraph,
    skills: ["Line Graph"],
    types: ["multiple"],
    categoryTags: ["Data Tables and Graph Interpretation"]
  },
  {
    name: "percent",
    fn: percent,
    skills: ["Percent"],
    types: ["multiple", "fill"],
    categoryTags: ["Fractions, Decimals, and Percents", "Ratios, Proportions, and Percent Change"]
  },
  {
    name: "percentChange",
    fn: percentChange,
    skills: ["Percent Change"],
    types: ["multiple"],
    categoryTags: ["Ratios, Proportions, and Percent Change"]
  },
  {
    name: "probability",
    fn: probability,
    skills: ["Probability"],
    types: ["multiple"],
    categoryTags: ["Mean, Median, and Probability"]
  },
  {
    name: "scatterPlot",
    fn: scatterPlot,
    skills: ["Scatter Plot"],
    types: ["multiple"],
    categoryTags: ["Data Tables and Graph Interpretation"]
  },
  {
    name: "slope",
    fn: slope,
    skills: ["Slope"],
    types: ["multiple"],
    categoryTags: ["Linear Equations and Slope", "Lines, Angles, and Coordinate Plane"]
  },
  {
    name: "multiStep",
    fn: multiStep,
    skills: ["Percent", "Graphs + Computation", "Geometry + Cost", "Data + Average"],
    types: ["multiple", "fill"],
    categoryTags: [
      "Fractions, Decimals, and Percents",
      "Ratios, Proportions, and Percent Change",
      "Data Tables and Graph Interpretation",
      "Area, Perimeter, Surface Area, and Volume",
      "Mean, Median, and Probability"
    ]
  },
  {
    name: "dragDrop",
    fn: dragDrop,
    skills: ["Algebra", "Percent", "Linear Equations", "Geometry"],
    types: ["dragdrop"],
    categoryTags: [
      "Fractions, Decimals, and Percents",
      "Ratios, Proportions, and Percent Change",
      "Solving Equations and Inequalities",
      "Area, Perimeter, Surface Area, and Volume"
    ]
  },
  {
    name: "hotspot",
    fn: hotspot,
    skills: ["Number Line"],
    types: ["hotspot"],
    categoryTags: ["Lines, Angles, and Coordinate Plane"]
  }
].filter((entry) => typeof entry.fn === "function");

function normalizeExplanation(text, fallbackAnswer) {
  if (text && String(text).trim()) return text;
  return `The correct answer is ${fallbackAnswer}. Review the numbers in the problem carefully, identify the operation or formula that applies, and work step by step to confirm the result.`;
}

function normalizeQuestion(q, index, difficulty) {
  return {
    id: index + 1,
    skill: q.skill || "Mixed Practice",
    subskill: q.subskill || q.skill || "Mixed Practice",
    topic: q.topic || q.subskill || q.skill || "Mixed Practice",
    type: q.type || "multiple",
    question: q.question || "Question unavailable.",
    choices: Array.isArray(q.choices) ? q.choices : [],
    answer: q.answer,
    chart: q.chart || null,
    diagram: q.diagram || null,
    hotspot: q.hotspot || null,
    formulaRequired: !!q.formulaRequired,
    calculatorAllowed: true,
    explanation: normalizeExplanation(q.explanation, q.answer),
    difficulty: q.difficulty || difficulty
  };
}

function isAlgebraSkill(skill) {
  return ["Algebra", "Linear Equations", "Slope"].includes(skill);
}

function shuffleQuestions(arr) {
  const copy = [...arr];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function getQuestionSignature(question) {
  return JSON.stringify({
    skill: question.skill || "",
    subskill: question.subskill || "",
    type: question.type || "",
    question: String(question.question || "").replace(/\s+/g, " ").trim(),
    answer: question.answer,
    choices: Array.isArray(question.choices)
      ? [...question.choices].map(String).sort()
      : [],
    chart: question.chart ? JSON.stringify(question.chart.data || {}) : "",
    diagram: question.diagram ? String(question.diagram).replace(/\s+/g, " ").trim() : "",
    hotspot: question.hotspot ? JSON.stringify(question.hotspot) : ""
  });
}

function entryMatchesSkill(entry, selectedSkill) {
  if (!selectedSkill) return true;
  return entry.categoryTags.includes(selectedSkill);
}

function pickRandomEntry(entries) {
  return entries[Math.floor(Math.random() * entries.length)];
}

function generateFromEntries(entries, difficulty, desiredType = null) {
  if (!entries.length) return null;

  const filtered = desiredType
    ? entries.filter((entry) => entry.types.includes(desiredType))
    : entries;

  const usable = filtered.length ? filtered : entries;

  for (let i = 0; i < 40; i += 1) {
    const entry = pickRandomEntry(usable);

    try {
      const q = entry.fn({ difficulty });
      if (!q) continue;

      if (desiredType && q.type !== desiredType) continue;

      return q;
    } catch (error) {
      console.warn(`Generator failed: ${entry.name}`, error.message);
    }
  }

  return null;
}

function buildTest(options = {}) {
  const requestedCount = Number(options.count);
  const count = Number.isFinite(requestedCount) && requestedCount > 1 ? requestedCount : 46;
  const difficulty = options.difficulty || "GED-Level";
  const skill = options.skill || "";

  const pool = generatorCatalog.filter((entry) => entryMatchesSkill(entry, skill));

  if (!pool.length) {
    throw new Error(`No generators matched selected skill: ${skill}`);
  }

  const rawQuestions = [];
  const seenQuestionSignatures = new Set();

  let algebraCount = 0;
  let quantitativeCount = 0;

  const shouldBalanceSkills = !skill;
  const targetAlgebra = shouldBalanceSkills ? Math.round(count * 0.55) : count;
  const targetQuantitative = shouldBalanceSkills ? count - targetAlgebra : count;

  const isFullTest = count >= 40;

  const availableTypes = new Set(
    pool.flatMap((entry) => entry.types)
  );

  const targetFillCount =
    availableTypes.has("fill") ? (isFullTest ? 9 : Math.min(2, count)) : 0;

  const targetDragDropCount =
    availableTypes.has("dragdrop") ? (isFullTest ? 5 : Math.min(1, count)) : 0;

  const targetHotspotCount =
    availableTypes.has("hotspot") ? (isFullTest ? 4 : Math.min(1, count)) : 0;

  function canAcceptQuestion(question) {
    const isAlgebra = isAlgebraSkill(question.skill);

    if (shouldBalanceSkills && isAlgebra && algebraCount >= targetAlgebra) {
      return false;
    }

    if (shouldBalanceSkills && !isAlgebra && quantitativeCount >= targetQuantitative) {
      return false;
    }

    return true;
  }

  function addQuestion(question, allowDuplicate = false) {
    if (!question) return false;

    const signature = getQuestionSignature(question);

    if (!allowDuplicate && seenQuestionSignatures.has(signature)) {
      return false;
    }

    seenQuestionSignatures.add(signature);
    rawQuestions.push(question);

    if (isAlgebraSkill(question.skill)) {
      algebraCount += 1;
    } else {
      quantitativeCount += 1;
    }

    return true;
  }

  function addPreferredQuestions(type, amount) {
    let added = 0;
    let attempts = 0;
    const maxAttempts = amount * 80;

    while (added < amount && attempts < maxAttempts) {
      attempts += 1;

      const question = generateFromEntries(pool, difficulty, type);

      if (!question) continue;
      if (!canAcceptQuestion(question)) continue;

      if (addQuestion(question)) {
        added += 1;
      }
    }

    if (added < amount) {
      console.warn(`Only generated ${added}/${amount} preferred ${type} questions.`);
    }
  }

  addPreferredQuestions("fill", targetFillCount);
  addPreferredQuestions("dragdrop", targetDragDropCount);
  addPreferredQuestions("hotspot", targetHotspotCount);

  let attempts = 0;
  const maxAttempts = count * 120;

  while (rawQuestions.length < count && attempts < maxAttempts) {
    attempts += 1;

    let question = generateFromEntries(pool, difficulty);

    if (!question) continue;

    let typeSafety = 0;
    while (
      typeSafety < 20 &&
      ["fill", "dragdrop", "hotspot"].includes(question.type)
    ) {
      question = generateFromEntries(pool, difficulty);
      typeSafety += 1;
    }

    if (!question) continue;
    if (!canAcceptQuestion(question)) continue;

    addQuestion(question);
  }

  let fallbackAttempts = 0;

  while (rawQuestions.length < count && fallbackAttempts < count * 40) {
    fallbackAttempts += 1;

    const question = generateFromEntries(pool, difficulty);

    if (question) {
      addQuestion(question);
    }
  }

  while (rawQuestions.length < count) {
    const question = generateFromEntries(pool, difficulty);

    if (!question) {
      throw new Error(`Unable to generate enough questions for selected skill: ${skill || "Mixed Test"}`);
    }

    addQuestion(question, true);
  }

  const shuffledQuestions = shuffleQuestions(rawQuestions);

  return shuffledQuestions.map((question, index) =>
    normalizeQuestion(question, index, difficulty)
  );
}

module.exports = buildTest;