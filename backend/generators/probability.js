const { getDifficultyProfile } = require("./difficultyProfile");

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function normalizeSkill(value) {
  return String(value || "").trim().toLowerCase();
}

function pick(arr) {
  return arr[rand(0, arr.length - 1)];
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);

  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }

  return a || 1;
}

function simplifyFraction(numerator, denominator) {
  const g = gcd(numerator, denominator);
  return `${numerator / g}/${denominator / g}`;
}

const PROBABILITY_COLORS = {
  Red: "#ef4444",
  Blue: "#3b82f6",
  Green: "#22c55e",
  Yellow: "#facc15",
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#facc15"
};

function getProbabilityColor(label) {
  return PROBABILITY_COLORS[label] || "#153e75";
}

function getProbabilityFill(label) {
  const fills = {
    Red: "#fee2e2",
    Blue: "#dbeafe",
    Green: "#dcfce7",
    Yellow: "#fef9c3",
    red: "#fee2e2",
    blue: "#dbeafe",
    green: "#dcfce7",
    yellow: "#fef9c3"
  };

  return fills[label] || "#f8fbff";
}

function uniqueChoices(correct, wrongs) {
  const choices = new Set([String(correct)]);

  wrongs.forEach((choice) => {
    if (choices.size < 4 && String(choice) !== String(correct)) {
      choices.add(String(choice));
    }
  });

  const fallback = [
    "1/2",
    "1/3",
    "1/4",
    "2/3",
    "3/4",
    "1/6",
    "5/6",
    "3/8",
    "2/5",
    "3/5"
  ];

  fallback.forEach((choice) => {
    if (choices.size < 4 && String(choice) !== String(correct)) {
      choices.add(choice);
    }
  });

  return shuffle(Array.from(choices));
}

function buildSpinnerSections(difficulty) {
  if (difficulty === "Easy") {
    return ["Red", "Blue", "Green", "Yellow"];
  }

  if (difficulty === "Medium") {
    return ["Red", "Blue", "Green", "Yellow", "Red"];
  }

  return ["Red", "Blue", "Green", "Yellow", "Red", "Blue"];
}

function buildSpinnerDiagram(labels) {
  const cx = 180;
  const cy = 128;
  const r = 62;
  const n = labels.length;

  const wedges = [];

  for (let i = 0; i < n; i += 1) {
    const startAngle = -Math.PI / 2 + (2 * Math.PI * i) / n;
    const endAngle = -Math.PI / 2 + (2 * Math.PI * (i + 1)) / n;

    const startX = cx + r * Math.cos(startAngle);
    const startY = cy + r * Math.sin(startAngle);
    const endX = cx + r * Math.cos(endAngle);
    const endY = cy + r * Math.sin(endAngle);

    const label = labels[i];

    wedges.push(`
      <path
        d="M ${cx} ${cy} L ${startX.toFixed(2)} ${startY.toFixed(2)} A ${r} ${r} 0 0 1 ${endX.toFixed(2)} ${endY.toFixed(2)} Z"
        fill="${getProbabilityFill(label)}"
        stroke="${getProbabilityColor(label)}"
        stroke-width="2.5"
      />
    `);
  }

  return `
    <svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${cx}" cy="${cy}" r="${r + 6}" fill="#f8fbff" stroke="#d7e1ee" stroke-width="2"/>
      ${wedges.join("")}

      <circle cx="${cx}" cy="${cy}" r="5" fill="#153e75"/>

      <line x1="${cx}" y1="58" x2="${cx}" y2="88" stroke="#153e75" stroke-width="4"/>
      <polygon points="${cx},94 ${cx - 9},79 ${cx + 9},79" fill="#153e75"/>
    </svg>
  `;
}

function spinnerProbability(difficulty) {
  const labels = buildSpinnerSections(difficulty);
  const uniqueColors = Array.from(new Set(labels));
  const selectedColor = uniqueColors[rand(0, uniqueColors.length - 1)];
  const favorable = labels.filter((label) => label === selectedColor).length;
  const total = labels.length;
  const answer = simplifyFraction(favorable, total);

  const scenario = pick([
    `A game spinner has ${total} equal sections. If the spinner is spun once, what is the probability of landing on ${selectedColor}?`,
    `At a school activity, a spinner is divided into ${total} equal sections. What is the probability that one spin lands on ${selectedColor}?`,
    `A prize spinner has ${total} equal sections. If a student spins it one time, what is the probability that it lands on ${selectedColor}?`
  ]);

  return {
    skill: "Probability",
    subskill: "Spinner Probability",
    topic: "Probability with spinner sections",
    difficulty,
    type: "multiple",
    question: scenario,
    choices: uniqueChoices(answer, [
      simplifyFraction(1, total),
      simplifyFraction(Math.min(total, favorable + 1), total),
      simplifyFraction(Math.max(1, total - favorable), total),
      "1/2"
    ]),
    answer,
    diagram: buildSpinnerDiagram(labels),
    explanation: `Count the sections that match the event. There are ${favorable} ${selectedColor} section(s) out of ${total} total sections, so the probability is ${favorable}/${total}, which simplifies to ${answer}.`
  };
}

function marblesProbability(difficulty, p) {
  const marbleMax = Number(p.marbleMax || p.smallMax || 6);
  const red = rand(1, marbleMax);
  const blue = rand(1, marbleMax);
  const green =
    difficulty === "Easy"
      ? rand(1, Math.max(2, Math.floor(marbleMax / 2)))
      : rand(1, marbleMax);

  const total = red + blue + green;

  const targets = [
    { label: "red", count: red, stroke: "#ef4444", fill: "#fee2e2" },
    { label: "blue", count: blue, stroke: "#3b82f6", fill: "#dbeafe" },
    { label: "green", count: green, stroke: "#22c55e", fill: "#dcfce7" }
  ];

  const target = targets[rand(0, targets.length - 1)];
  const answer = simplifyFraction(target.count, total);

  const wrongChoices = [
    simplifyFraction(Math.max(1, target.count + 1), total),
    simplifyFraction(Math.max(1, target.count), Math.max(1, total - 1)),
    simplifyFraction(Math.max(1, total - target.count), total),
    simplifyFraction(1, total)
  ];

  const marbles = [];

  function addMarbles(count, stroke, fill, label) {
    for (let i = 0; i < count; i += 1) {
      marbles.push({ stroke, fill, label });
    }
  }

  addMarbles(red, "#ef4444", "#fee2e2", "red");
  addMarbles(blue, "#3b82f6", "#dbeafe", "blue");
  addMarbles(green, "#22c55e", "#dcfce7", "green");

  const startX = 95;
  const startY = 88;
  const spacing = 20;
  const perRow = 5;

  const circles = marbles
    .map((m, i) => {
      const col = i % perRow;
      const row = Math.floor(i / perRow);
      const x = startX + col * spacing;
      const y = startY + row * spacing;

      return `
        <circle
          cx="${x}"
          cy="${y}"
          r="7"
          fill="${m.fill}"
          stroke="${m.stroke}"
          stroke-width="3"
        />
      `;
    })
    .join("");

  const scenario = pick([
    `A bag contains ${red} red marbles, ${blue} blue marbles, and ${green} green marbles. If 1 marble is chosen at random, what is the probability of choosing a ${target.label} marble?`,
    `For a classroom game, a bag has ${red} red marbles, ${blue} blue marbles, and ${green} green marbles. One marble is picked without looking. What is the probability of picking a ${target.label} marble?`,
    `A student randomly chooses 1 marble from a bag with ${red} red, ${blue} blue, and ${green} green marbles. What is the probability the marble is ${target.label}?`
  ]);

  return {
    skill: "Probability",
    subskill: "Marble Probability",
    topic: "Probability with colored marbles",
    difficulty,
    type: "multiple",
    question: scenario,
    choices: uniqueChoices(answer, wrongChoices),
    answer,
    diagram: `
      <svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">
        <path d="M80 52 Q145 24 210 52 L230 198 Q145 232 60 198 Z"
              fill="#f8fbff" stroke="#153e75" stroke-width="4"/>

        ${circles}
      </svg>
    `,
    explanation: `Probability = favorable outcomes / total outcomes. There are ${target.count} ${target.label} marbles out of ${total} total marbles, so the probability is ${target.count}/${total}, which simplifies to ${answer}.`
  };
}

function buildNumberCubeDiagram(target) {
  const matchingOutcomes = new Set(
    String(target.outcomes || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
  );

  const boxes = [1, 2, 3, 4, 5, 6]
    .map((number, index) => {
      const x = 55 + index * 50;
      const isMatch = matchingOutcomes.has(String(number));

      return `
        <rect
          x="${x}"
          y="82"
          width="40"
          height="40"
          rx="7"
          fill="${isMatch ? "#dbeafe" : "#ffffff"}"
          stroke="${isMatch ? "#153e75" : "#94a3b8"}"
          stroke-width="${isMatch ? "3" : "2"}"
        />

        <text
          x="${x + 20}"
          y="109"
          text-anchor="middle"
          class="diagramLabel"
          style="font-weight:${isMatch ? "900" : "700"}; fill:#10233f;"
        >
          ${number}
        </text>
      `;
    })
    .join("");

  return `
    <svg viewBox="0 0 380 220" xmlns="http://www.w3.org/2000/svg">
      <g>
        ${boxes}
      </g>
    </svg>
  `;
}

function diceProbability(difficulty) {
  const easyTargets = [
    { label: "a 2", favorable: 1, outcomes: "2" },
    { label: "a 5", favorable: 1, outcomes: "5" },
    { label: "an even number", favorable: 3, outcomes: "2, 4, 6" }
  ];

  const mediumTargets = [
    { label: "an even number", favorable: 3, outcomes: "2, 4, 6" },
    { label: "a number greater than 4", favorable: 2, outcomes: "5, 6" },
    { label: "a number less than 3", favorable: 2, outcomes: "1, 2" }
  ];

  const gedTargets = [
    { label: "an even number or a 5", favorable: 4, outcomes: "2, 4, 5, 6" },
    { label: "a number greater than 1", favorable: 5, outcomes: "2, 3, 4, 5, 6" },
    { label: "an odd number less than 6", favorable: 3, outcomes: "1, 3, 5" },
    { label: "a number less than 3 or greater than 5", favorable: 3, outcomes: "1, 2, 6" }
  ];

  const pool =
    difficulty === "Easy"
      ? easyTargets
      : difficulty === "Medium"
      ? mediumTargets
      : gedTargets;

  const target = pool[rand(0, pool.length - 1)];
  const answer = simplifyFraction(target.favorable, 6);

  const scenario = pick([
    `A board game uses a fair number cube with faces numbered 1 through 6. If the cube is rolled once, what is the probability of rolling ${target.label}?`,
    `A fair number cube is rolled one time during a classroom game. What is the probability of rolling ${target.label}?`,
    `In a game, a fair number cube has faces numbered 1 through 6. What is the probability that one roll is ${target.label}?`
  ]);

  return {
    skill: "Probability",
    subskill: "Number Cube Probability",
    topic: "Probability with a fair number cube",
    difficulty,
    type: "multiple",
    question: scenario,
    choices: uniqueChoices(answer, [
      simplifyFraction(Math.max(1, target.favorable - 1), 6),
      simplifyFraction(Math.min(6, target.favorable + 1), 6),
      simplifyFraction(6 - target.favorable, 6),
      "1/6"
    ]),
    answer,
    diagram: buildNumberCubeDiagram(target),
    explanation: `A fair number cube has 6 equally likely outcomes. The numbers that match rolling ${target.label} are ${target.outcomes}. That gives ${target.favorable} matching outcome(s) out of 6, so the probability is ${target.favorable}/6, which simplifies to ${answer}.`
  };
}

module.exports = function generateProbability(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  const p = getDifficultyProfile(difficulty);
  const selectedSkill = normalizeSkill(options.skill);

  const directMap = {
    "spinner probability": spinnerProbability,
    "marble probability": marblesProbability,
    "number cube probability": diceProbability
  };

  if (directMap[selectedSkill]) {
    return directMap[selectedSkill](difficulty, p);
  }

  const bank = [
    spinnerProbability,
    marblesProbability,
    diceProbability
  ];

  return bank[rand(0, bank.length - 1)](difficulty, p);
};