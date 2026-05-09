const { getDifficultyProfile } = require("./difficultyProfile");

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
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

function uniqueChoices(correct, wrongs) {
  const choices = new Set([String(correct)]);

  wrongs.forEach((choice) => {
    if (choices.size < 4 && String(choice) !== String(correct)) {
      choices.add(String(choice));
    }
  });

  const fallback = ["1/2", "1/3", "1/4", "2/3", "3/4", "1/6", "5/6", "3/8", "2/5", "3/5"];

  fallback.forEach((choice) => {
    if (choices.size < 4 && String(choice) !== String(correct)) {
      choices.add(choice);
    }
  });

  return shuffle(Array.from(choices));
}

function buildSpinnerSections(difficulty, p) {
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
  const r = 58;
  const labelR = 35;
  const n = labels.length;

  const lines = [];
  const labelText = [];

  for (let i = 0; i < n; i += 1) {
    const boundaryAngle = -Math.PI / 2 + (2 * Math.PI * i) / n;
    const x = cx + r * Math.cos(boundaryAngle);
    const y = cy + r * Math.sin(boundaryAngle);

    lines.push(
      `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(2)}" y2="${y.toFixed(2)}" stroke="#153e75" stroke-width="2"/>`
    );

    const midAngle = -Math.PI / 2 + (2 * Math.PI * (i + 0.5)) / n;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);

    labelText.push(
      `<text x="${lx.toFixed(2)}" y="${ly.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" class="diagramLabel" style="font-size:12px;">${labels[i]}</text>`
    );
  }

  return `
    <svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg">
      <text x="180" y="26" text-anchor="middle" class="diagramLabel">Spinner</text>

      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#f8fbff" stroke="#153e75" stroke-width="4"/>
      ${lines.join("")}
      ${labelText.join("")}

      <line x1="${cx}" y1="58" x2="${cx}" y2="88" stroke="#153e75" stroke-width="4"/>
      <polygon points="${cx},92 ${cx - 8},78 ${cx + 8},78" fill="#153e75"/>
    </svg>
  `;
}

function spinnerProbability(difficulty, p) {
  const labels = buildSpinnerSections(difficulty, p);
  const uniqueColors = Array.from(new Set(labels));
  const selectedColor = uniqueColors[rand(0, uniqueColors.length - 1)];
  const favorable = labels.filter((label) => label === selectedColor).length;
  const total = labels.length;
  const answer = simplifyFraction(favorable, total);

  return {
    skill: "Probability",
    subskill: "Spinner Probability",
    topic: "Probability with spinner sections",
    difficulty,
    type: "multiple",
    question: `The spinner is divided into ${total} equal sections. What is the probability of landing on ${selectedColor}?`,
    choices: uniqueChoices(answer, [
      simplifyFraction(1, total),
      simplifyFraction(Math.min(total, favorable + 1), total),
      simplifyFraction(Math.max(1, total - favorable), total),
      "1/2"
    ]),
    answer,
    diagram: buildSpinnerDiagram(labels),
    explanation: `There are ${total} equal sections and ${favorable} section(s) labeled ${selectedColor}. The probability is ${favorable}/${total}, which simplifies to ${answer}.`
  };
}

function marblesProbability(difficulty, p) {
  const marbleMax = Number(marbleMax || p.smallMax || 6);
  const red = rand(1, marbleMax);
  const blue = rand(1, marbleMax);
  const green = difficulty === "Easy" ? rand(1, Math.max(2, Math.floor(marbleMax / 2))) : rand(1, marbleMax);
  const total = red + blue + green;

  const targets = [
    { label: "red", count: red, stroke: "#ef4444" },
    { label: "blue", count: blue, stroke: "#3b82f6" },
    { label: "green", count: green, stroke: "#22c55e" }
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

  function addMarbles(count, stroke) {
    for (let i = 0; i < count; i += 1) {
      marbles.push({ stroke });
    }
  }

  addMarbles(red, "#ef4444");
  addMarbles(blue, "#3b82f6");
  addMarbles(green, "#22c55e");

  const startX = 95;
  const startY = 88;
  const spacing = 20;
  const perRow = 5;

  const circles = marbles.map((m, i) => {
    const col = i % perRow;
    const row = Math.floor(i / perRow);
    const x = startX + col * spacing;
    const y = startY + row * spacing;

    return `<circle cx="${x}" cy="${y}" r="7" fill="none" stroke="${m.stroke}" stroke-width="3"/>`;
  }).join("");

  return {
    skill: "Probability",
    subskill: "Marble Probability",
    topic: "Probability with colored marbles",
    difficulty,
    type: "multiple",
    question: `A bag contains ${red} red marbles, ${blue} blue marbles, and ${green} green marbles. If 1 marble is chosen at random, what is the probability of choosing a ${target.label} marble?`,
    choices: uniqueChoices(answer, wrongChoices),
    answer,
    diagram: `
      <svg viewBox="0 0 380 260" xmlns="http://www.w3.org/2000/svg">
        <text x="150" y="30" text-anchor="middle" class="diagramLabel">Bag of Marbles</text>

        <path d="M80 52 Q145 24 210 52 L230 198 Q145 232 60 198 Z"
              fill="#f8fbff" stroke="#153e75" stroke-width="4"/>

        ${circles}

        <rect x="260" y="62" width="95" height="130" rx="8"
              fill="#f8fbff" stroke="#d7e1ee" stroke-width="2"/>

        <text x="275" y="92" class="diagramLabel">Red: ${red}</text>
        <text x="275" y="125" class="diagramLabel">Blue: ${blue}</text>
        <text x="275" y="158" class="diagramLabel">Green: ${green}</text>
        <text x="275" y="185" class="diagramLabel">Total: ${total}</text>
      </svg>
    `,
    explanation: `Probability = favorable outcomes / total outcomes. There are ${target.count} ${target.label} marbles out of ${total} total marbles, so the probability is ${target.count}/${total}, which simplifies to ${answer}.`
  };
}

function diceProbability(difficulty, p) {
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

  return {
    skill: "Probability",
    subskill: "Number Cube Probability",
    topic: "Probability with a fair number cube",
    difficulty,
    type: "multiple",
    question: `A fair number cube has faces numbered 1 through 6. If the cube is rolled once, what is the probability of rolling ${target.label}?`,
    choices: uniqueChoices(answer, [
      simplifyFraction(Math.max(1, target.favorable - 1), 6),
      simplifyFraction(Math.min(6, target.favorable + 1), 6),
      simplifyFraction(6 - target.favorable, 6),
      "1/6"
    ]),
    answer,
    diagram: `
      <svg viewBox="0 0 380 220" xmlns="http://www.w3.org/2000/svg">
        <text x="190" y="30" text-anchor="middle" class="diagramLabel">Fair Number Cube Outcomes</text>

        <g>
          <rect x="55" y="70" width="40" height="40" rx="6" fill="#f8fbff" stroke="#153e75" stroke-width="3"/>
          <text x="75" y="97" text-anchor="middle" class="diagramLabel">1</text>

          <rect x="105" y="70" width="40" height="40" rx="6" fill="#f8fbff" stroke="#153e75" stroke-width="3"/>
          <text x="125" y="97" text-anchor="middle" class="diagramLabel">2</text>

          <rect x="155" y="70" width="40" height="40" rx="6" fill="#f8fbff" stroke="#153e75" stroke-width="3"/>
          <text x="175" y="97" text-anchor="middle" class="diagramLabel">3</text>

          <rect x="205" y="70" width="40" height="40" rx="6" fill="#f8fbff" stroke="#153e75" stroke-width="3"/>
          <text x="225" y="97" text-anchor="middle" class="diagramLabel">4</text>

          <rect x="255" y="70" width="40" height="40" rx="6" fill="#f8fbff" stroke="#153e75" stroke-width="3"/>
          <text x="275" y="97" text-anchor="middle" class="diagramLabel">5</text>

          <rect x="305" y="70" width="40" height="40" rx="6" fill="#f8fbff" stroke="#153e75" stroke-width="3"/>
          <text x="325" y="97" text-anchor="middle" class="diagramLabel">6</text>
        </g>

        <text x="190" y="155" text-anchor="middle" class="diagramLabel">
          Favorable outcomes: ${target.outcomes}
        </text>
      </svg>
    `,
    explanation: `A fair number cube has 6 equally likely outcomes. The favorable outcomes for rolling ${target.label} are ${target.outcomes}, which gives ${target.favorable} favorable outcomes out of 6. The probability is ${target.favorable}/6, which simplifies to ${answer}.`
  };
}

module.exports = function generateProbability(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  const p = getDifficultyProfile(difficulty);

  const bank = [
    spinnerProbability,
    marblesProbability,
    diceProbability
  ];

  return bank[rand(0, bank.length - 1)](difficulty, p);
};