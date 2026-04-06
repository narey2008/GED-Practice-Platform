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
  slope
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
    explanation: normalizeExplanation(q.explanation, q.answer),
    difficulty: q.difficulty || difficulty
  };
}

function buildTest(options = {}) {
  const count = options.count || 46;
  const difficulty = options.difficulty || "GED-Level";
  const skill = options.skill || "";

  const eligible = skill
    ? generators.filter((g) => {
        try {
          const sample = g({ difficulty });
          return sample && sample.skill === skill;
        } catch (e) {
          return false;
        }
      })
    : generators;

  const pool = eligible.length ? eligible : generators;
  const questions = [];

  for (let i = 0; i < count; i += 1) {
    const generator = pool[Math.floor(Math.random() * pool.length)];
    const question = generator({ difficulty });
    questions.push(normalizeQuestion(question, i, difficulty));
  }

  return questions;
}

module.exports = buildTest;