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

const BROAD_PRACTICE_CATEGORIES = new Set([
  "Fractions, Decimals, and Percents",
  "Ratios, Proportions, and Percent Change",
  "Area, Perimeter, Surface Area, and Volume",
  "Lines, Angles, and Coordinate Plane",
  "Data Tables and Graph Interpretation",
  "Mean, Median, and Probability",
  "Solving Equations and Inequalities",
  "Linear Equations and Slope"
]);
const BROAD_CATEGORY_ALLOWED_TAGS = {
  "Fractions, Decimals, and Percents": [
    "Fractions",
    "Decimals",
    "Percent",
    "Percent of a Number",
    "Percent Discount",
    "Percent of a Total",
    "Comparing Percents"
  ],

  "Ratios, Proportions, and Percent Change": [
    "Percent",
    "Percent Change",
    "Percent Increase",
    "Percent Decrease",
    "Finding Percent Increase",
    "Percent Discount",
    "Percent of a Total",
    "Comparing Percents"
  ],

  "Area, Perimeter, Surface Area, and Volume": [
    "Geometry",
    "Rectangle Area",
    "Rectangle Perimeter",
    "Triangle Area",
    "Area Cost Problems",
    "Volume",
    "Surface Area"
  ],

"Lines, Angles, and Coordinate Plane": [
  "Slope",
  "Slope From Graph",
  "Number Line",
  "Integer Number Line",
  "Opposites on a Number Line",
  "Temperature Number Line",
  "Decimal Number Line",
  "Fraction Number Line",
  "Inequality Number Line"
],

  "Data Tables and Graph Interpretation": [
    "Bar Graph",
    "Bar Graph Greatest Value",
    "Bar Graph Least Value",
    "Bar Graph Difference",
    "Bar Graph Total",
    "Bar Graph Interpretation",
    "Data Table",
    "Data Table Totals",
    "Data Table Greatest Value",
    "Data Table Least Value",
    "Data Table Difference",
    "Line Graph",
    "Line Graph Change",
    "Line Graph Greatest Value",
    "Line Graph Least Value",
    "Line Graph Difference",
    "Scatter Plot",
    "Scatter Plot Correlation",
    "Graphs + Computation",
    "Graph Totals",
    "Graph Difference"
  ],

"Mean, Median, and Probability": [
  "Probability",
  "Spinner Probability",
  "Marble Probability",
  "Number Cube Probability",
  "Average",
  "Median",
  "Data + Average"
],

"Solving Equations and Inequalities": [
  "Linear Equations",
  "Expressions and Order of Operations",
  "Expression Substitution",
  "Expression Word Problems",
  "Combining Like Terms",
  "Distributive Property",
  "Variables on Both Sides",
  "Equation Word Problems",
  "Equation Steps",
  "Two-Step Equations",
],

  "Linear Equations and Slope": [
"Linear Equations",
"Two-Step Equations",
"Variables on Both Sides",
"Equation Word Problems",
"Slope",
"Slope From Graph"
  ]
};

function questionHasAnyAllowedTag(question, allowedTags) {
  const normalizedAllowed = new Set((allowedTags || []).map(normalizePracticeTag));

  const questionTags = [
    question.skill,
    question.subskill,
    question.topic
  ].map(normalizePracticeTag);

  return questionTags.some((tag) => normalizedAllowed.has(tag));
}

function normalizePracticeTag(value) {
  return String(value || "").trim().toLowerCase();
}

function tagListIncludes(list, selectedSkill) {
  const selected = normalizePracticeTag(selectedSkill);
  return (list || []).some((tag) => normalizePracticeTag(tag) === selected);
}

function isBroadPracticeCategory(selectedSkill) {
  return BROAD_PRACTICE_CATEGORIES.has(selectedSkill);
}

function getSelectionTags(selectedSkill) {
  const tags = [selectedSkill];

  if (isBroadPracticeCategory(selectedSkill)) {
    tags.push(...(BROAD_CATEGORY_ALLOWED_TAGS[selectedSkill] || []));
  }

  return new Set(tags.map(normalizePracticeTag).filter(Boolean));
}

function entryTypeMatchesSelection(entry, type, selectedSkill) {
  if (!entry.types.includes(type)) return false;

  const typeTags = entry.typeTags && entry.typeTags[type];
  if (!selectedSkill || !Array.isArray(typeTags) || !typeTags.length) return true;

  const selectedTags = getSelectionTags(selectedSkill);
  return typeTags.some((tag) => selectedTags.has(normalizePracticeTag(tag)));
}

function getEntryTypesForSelection(entry, selectedSkill) {
  return (entry.types || []).filter((type) =>
    entryTypeMatchesSelection(entry, type, selectedSkill)
  );
}

const generatorCatalog = [
  {
    name: "algebra",
    fn: algebra,
    skills: ["Algebra"],
    types: ["multiple", "fill"],
    typeTags: {
      fill: ["Algebra", "Expressions and Order of Operations", "Expression Substitution"]
    },
    categoryTags: ["Expressions and Order of Operations", "Solving Equations and Inequalities"],
subskillTags: [
  "Expressions and Order of Operations",
  "Expression Substitution",
  "Expression Word Problems",
  "Combining Like Terms",
  "Distributive Property"
]
  },
  {
    name: "barGraph",
    fn: barGraph,
    skills: ["Bar Graph"],
    types: ["multiple"],
    categoryTags: ["Data Tables and Graph Interpretation"],
    subskillTags: [
      "Bar Graph",
      "Bar Graph Greatest Value",
      "Bar Graph Least Value",
      "Bar Graph Difference",
      "Bar Graph Total",
      "Bar Graph Interpretation"
    ]
  },
  {
    name: "dataTable",
    fn: dataTable,
    skills: ["Data Table"],
    types: ["multiple"],
    categoryTags: ["Data Tables and Graph Interpretation"],
    subskillTags: [
      "Data Table",
      "Data Table Totals",
      "Data Table Greatest Value",
      "Data Table Least Value",
      "Data Table Difference"
    ]
  },
  {
    name: "geometry",
    fn: geometry,
    skills: ["Geometry"],
    types: ["multiple"],
    categoryTags: ["Area, Perimeter, Surface Area, and Volume"],
 subskillTags: [
  "Geometry",
  "Rectangle Area",
  "Rectangle Perimeter",
  "Triangle Area",
  "Area Cost Problems",
  "Volume",
  "Surface Area"
]
  },
  {
    name: "linearEquations",
    fn: linearEquations,
    skills: ["Linear Equations"],
    types: ["multiple", "fill"],
    typeTags: {
      fill: ["Linear Equations", "Two-Step Equations", "Variables on Both Sides"]
    },
    categoryTags: ["Solving Equations and Inequalities", "Linear Equations and Slope"],
subskillTags: [
  "Linear Equations",
  "Two-Step Equations",
  "Variables on Both Sides",
  "Equation Word Problems"
]
  },
  {
    name: "lineGraph",
    fn: lineGraph,
    skills: ["Line Graph"],
    types: ["multiple"],
    categoryTags: ["Data Tables and Graph Interpretation"],
    subskillTags: [
      "Line Graph",
      "Line Graph Change",
      "Line Graph Greatest Value",
      "Line Graph Least Value",
      "Line Graph Difference"
    ]
  },
  {
    name: "percent",
    fn: percent,
    skills: ["Percent"],
    types: ["multiple", "fill"],
    typeTags: {
      fill: ["Percent", "Percent of a Number", "Percent Discount"]
    },
    categoryTags: ["Fractions, Decimals, and Percents", "Ratios, Proportions, and Percent Change"],
    subskillTags: [
      "Percent",
      "Percent of a Number",
      "Percent Discount",
      "Percent of a Total"
    ]
  },
  {
    name: "percentChange",
    fn: percentChange,
    skills: ["Percent Change"],
    types: ["multiple"],
    categoryTags: ["Ratios, Proportions, and Percent Change"],
    subskillTags: [
      "Percent Change",
      "Percent Increase",
      "Percent Decrease",
      "Finding Percent Increase"
    ]
  },
  {
    name: "probability",
    fn: probability,
    skills: ["Probability"],
    types: ["multiple"],
    categoryTags: ["Mean, Median, and Probability"],
    subskillTags: [
      "Probability",
      "Spinner Probability",
      "Marble Probability",
      "Number Cube Probability"
    ]
  },
  {
    name: "scatterPlot",
    fn: scatterPlot,
    skills: ["Scatter Plot"],
    types: ["multiple"],
    categoryTags: ["Data Tables and Graph Interpretation"],
    subskillTags: [
      "Scatter Plot",
      "Scatter Plot Correlation"
    ]
  },
  {
    name: "slope",
    fn: slope,
    skills: ["Slope"],
    types: ["multiple"],
    categoryTags: ["Linear Equations and Slope", "Lines, Angles, and Coordinate Plane"],
    subskillTags: [
      "Slope",
      "Slope From Graph"
    ]
  },
  {
    name: "multiStep",
    fn: multiStep,
    skills: ["Percent", "Graphs + Computation", "Geometry", "Geometry + Cost", "Data + Average"],
    types: ["multiple", "fill"],
    typeTags: {
      fill: ["Percent", "Percent of a Total"]
    },
    categoryTags: [
      "Fractions, Decimals, and Percents",
      "Ratios, Proportions, and Percent Change",
      "Data Tables and Graph Interpretation",
      "Area, Perimeter, Surface Area, and Volume",
      "Mean, Median, and Probability"
    ],
subskillTags: [
  "Percent of a Total",
  "Graph Totals",
  "Graph Difference",
  "Area Cost Problems",
  "Average",
  "Median"
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
    ],
subskillTags: [
  "Fractions",
  "Decimals",
  "Comparing Percents",
  "Equation Steps",
  "Percent Discount",
  "Area Cost Problems"
]
  },
  {
    name: "hotspot",
    fn: hotspot,
    skills: ["Number Line"],
    types: ["hotspot"],
    categoryTags: ["Lines, Angles, and Coordinate Plane"],
subskillTags: [
  "Number Line",
  "Integer Number Line",
  "Opposites on a Number Line",
  "Temperature Number Line",
  "Decimal Number Line",
  "Fraction Number Line",
  "Inequality Number Line"
]
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

  return (
    tagListIncludes(entry.categoryTags, selectedSkill) ||
    tagListIncludes(entry.skills, selectedSkill) ||
    tagListIncludes(entry.subskillTags, selectedSkill)
  );
}

function questionMatchesSelectedSkill(question, selectedSkill) {
  if (!selectedSkill) return true;

  if (isBroadPracticeCategory(selectedSkill)) {
    return questionHasAnyAllowedTag(
      question,
      BROAD_CATEGORY_ALLOWED_TAGS[selectedSkill] || []
    );
  }

  if (normalizePracticeTag(selectedSkill) === "geometry") {
    return questionHasAnyAllowedTag(question, [
      "Geometry",
      "Rectangle Area",
      "Rectangle Perimeter",
      "Triangle Area",
      "Area Cost Problems",
      "Volume",
      "Surface Area"
    ]);
  }

  return (
    normalizePracticeTag(question.skill) === normalizePracticeTag(selectedSkill) ||
    normalizePracticeTag(question.subskill) === normalizePracticeTag(selectedSkill) ||
    normalizePracticeTag(question.topic) === normalizePracticeTag(selectedSkill)
  );
}

function pickRandomEntry(entries) {
  return entries[Math.floor(Math.random() * entries.length)];
}

function generateFromEntries(entries, difficulty, desiredType = null, selectedSkill = "") {
  if (!entries.length) return null;

  const filtered = desiredType
    ? entries.filter((entry) => entryTypeMatchesSelection(entry, desiredType, selectedSkill))
    : entries;

  const usable = filtered.length ? filtered : entries;

  for (let i = 0; i < 80; i += 1) {
    const entry = pickRandomEntry(usable);

    try {
      const q = entry.fn({ difficulty, skill: selectedSkill });
      if (!q) continue;

      if (desiredType && q.type !== desiredType) continue;

      if (!questionMatchesSelectedSkill(q, selectedSkill)) continue;

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
    pool.flatMap((entry) => getEntryTypesForSelection(entry, skill))
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

      const question = generateFromEntries(pool, difficulty, type, skill);

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

    let question = generateFromEntries(pool, difficulty, null, skill);

    if (!question) continue;

    let typeSafety = 0;
    while (
      typeSafety < 20 &&
      ["fill", "dragdrop", "hotspot"].includes(question.type)
    ) {
      question = generateFromEntries(pool, difficulty, null, skill);
      typeSafety += 1;
    }

    if (!question) continue;
    if (!canAcceptQuestion(question)) continue;

    addQuestion(question);
  }

  let fallbackAttempts = 0;

  while (rawQuestions.length < count && fallbackAttempts < count * 40) {
    fallbackAttempts += 1;

    const question = generateFromEntries(pool, difficulty, null, skill);

    if (question) {
      addQuestion(question);
    }
  }

while (rawQuestions.length < count) {
  const question = generateFromEntries(pool, difficulty, null, skill);

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
