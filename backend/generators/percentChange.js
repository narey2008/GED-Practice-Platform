const { getDifficultyProfile } = require("./difficultyProfile");

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function uniqueNumberChoices(answer, wrongs) {
  const choices = new Set([answer]);

  wrongs.forEach((w) => {
    if (Number.isFinite(w) && w >= 0 && w !== answer && choices.size < 4) {
      choices.add(Number(w.toFixed ? w.toFixed(2) : w));
    }
  });

  while (choices.size < 4) {
    const wrong = Number((answer + rand(-12, 15)).toFixed(2));
    if (wrong >= 0 && wrong !== answer) choices.add(wrong);
  }

  return shuffle(Array.from(choices));
}

function escapeSvgText(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMoneyOrNumber(value, isMoney = false) {
  const n = Number(value);
  if (!Number.isFinite(n)) return isMoney ? "$0" : "0";

  const formatted = Number.isInteger(n) ? String(n) : n.toFixed(2);
  return isMoney ? `$${formatted}` : formatted;
}

function buildPercentChangeDiagram({ original, change, direction, isMoney = false }) {
  const isIncrease = direction === "increase";

  return `
    <svg viewBox="0 0 460 210" xmlns="http://www.w3.org/2000/svg">
      <text x="128" y="62" text-anchor="middle" class="diagramLabel" style="font-size:14px;">
        Original
      </text>

      <rect
        x="72"
        y="78"
        width="112"
        height="48"
        rx="14"
        fill="#ffffff"
        stroke="#153e75"
        stroke-width="3"
      />

      <text x="128" y="108" text-anchor="middle" dominant-baseline="middle" class="diagramLabel" style="font-size:18px; font-weight:900;">
        ${escapeSvgText(formatMoneyOrNumber(original, isMoney))}
      </text>

      <line
        x1="208"
        y1="102"
        x2="268"
        y2="102"
        stroke="#153e75"
        stroke-width="4"
        stroke-linecap="round"
      />

      <polygon points="268,102 254,93 254,111" fill="#153e75"/>

      <text x="342" y="62" text-anchor="middle" class="diagramLabel" style="font-size:14px;">
        New
      </text>

      <rect
        x="286"
        y="78"
        width="112"
        height="48"
        rx="14"
        fill="${isIncrease ? "#dbeafe" : "#f8fbff"}"
        stroke="#153e75"
        stroke-width="3"
      />

      <text x="342" y="108" text-anchor="middle" dominant-baseline="middle" class="diagramLabel" style="font-size:16px;">
        ?
      </text>

      <text x="230" y="166" text-anchor="middle" class="diagramLabel" style="font-size:15px;">
        ${isIncrease ? "Increase" : "Decrease"} by ${change}%
      </text>
    </svg>
  `;
}

function buildBeforeAfterPercentDiagram({ original, newValue }) {
  return `
    <svg viewBox="0 0 460 210" xmlns="http://www.w3.org/2000/svg">
      <text x="128" y="62" text-anchor="middle" class="diagramLabel" style="font-size:14px;">
        Original
      </text>

      <rect
        x="72"
        y="78"
        width="112"
        height="48"
        rx="14"
        fill="#ffffff"
        stroke="#153e75"
        stroke-width="3"
      />

      <text x="128" y="108" text-anchor="middle" dominant-baseline="middle" class="diagramLabel" style="font-size:18px; font-weight:900;">
        ${escapeSvgText(original)}
      </text>

      <line
        x1="208"
        y1="102"
        x2="268"
        y2="102"
        stroke="#153e75"
        stroke-width="4"
        stroke-linecap="round"
      />

      <polygon points="268,102 254,93 254,111" fill="#153e75"/>

      <text x="342" y="62" text-anchor="middle" class="diagramLabel" style="font-size:14px;">
        New
      </text>

      <rect
        x="286"
        y="78"
        width="112"
        height="48"
        rx="14"
        fill="#dbeafe"
        stroke="#153e75"
        stroke-width="3"
      />

      <text x="342" y="108" text-anchor="middle" dominant-baseline="middle" class="diagramLabel" style="font-size:18px; font-weight:900;">
        ${escapeSvgText(newValue)}
      </text>

      <text x="230" y="166" text-anchor="middle" class="diagramLabel" style="font-size:15px;">
        Percent increase = ?
      </text>
    </svg>
  `;
}

function increase(difficulty, p) {
  const original = rand(Math.ceil(p.largeMin / 10), Math.ceil(p.largeMax / 10)) * 10;
  const change = p.percentChanges[rand(0, p.percentChanges.length - 1)];

  const amount = Number((original * (change / 100)).toFixed(2));
  const answer = Number((original + amount).toFixed(2));

  const easyQuestion = `A value of ${original} is increased by ${change}%. What is the new value?`;

  const scenarios = [
    {
      text: `A store sold ${original} items last week. This week, sales increased by ${change}%. How many items were sold this week?`,
      title: "Percent Increase",
      isMoney: false
    },
    {
      text: `A club had ${original} members. Membership increased by ${change}%. How many members are in the club now?`,
      title: "Membership Increase",
      isMoney: false
    },
    {
      text: `A worker earned $${original} in bonuses. The bonus amount increased by ${change}%. What is the new bonus amount?`,
      title: "Bonus Increase",
      isMoney: true
    }
  ];

  const selected = scenarios[rand(0, scenarios.length - 1)];

  return {
    skill: "Percent Change",
    subskill: "Percent Increase",
    topic: "Finding a new value after percent increase",
    difficulty,
    type: "multiple",
    question: difficulty === "Easy" ? easyQuestion : selected.text,
    choices: uniqueNumberChoices(answer, [
      amount,
      Number((original - amount).toFixed(2)),
      Number((original + change).toFixed(2)),
      Number((answer + rand(5, 15)).toFixed(2))
    ]),
    answer,
    diagram: buildPercentChangeDiagram({
      title: difficulty === "Easy" ? "Percent Increase" : selected.title,
      original,
      change,
      direction: "increase",
      isMoney: difficulty === "Easy" ? false : selected.isMoney
    }),
    explanation: `Find the increase: ${original} × ${change / 100} = ${amount}. Add it to the original value: ${original} + ${amount} = ${answer}.`
  };
}

function decrease(difficulty, p) {
  const original = rand(Math.ceil(p.largeMin / 10), Math.ceil(p.largeMax / 10)) * 10;
  const change = p.percentChanges[rand(0, p.percentChanges.length - 1)];

  const amount = Number((original * (change / 100)).toFixed(2));
  const answer = Number((original - amount).toFixed(2));

  const easyQuestion = `A value of ${original} is decreased by ${change}%. What is the new value?`;

  const scenarios = [
    {
      text: `A store had ${original} items in stock. The number of items decreased by ${change}%. How many items are left?`,
      title: "Percent Decrease",
      isMoney: false
    },
    {
      text: `A price of $${original} is reduced by ${change}%. What is the new price?`,
      title: "Price Decrease",
      isMoney: true
    },
    {
      text: `A class had ${original} assignments to complete. The remaining work decreased by ${change}%. How many assignments remain?`,
      title: "Work Decrease",
      isMoney: false
    }
  ];

  const selected = scenarios[rand(0, scenarios.length - 1)];

  return {
    skill: "Percent Change",
    subskill: "Percent Decrease",
    topic: "Finding a new value after percent decrease",
    difficulty,
    type: "multiple",
    question: difficulty === "Easy" ? easyQuestion : selected.text,
    choices: uniqueNumberChoices(answer, [
      amount,
      Number((original + amount).toFixed(2)),
      Number((original - change).toFixed(2)),
      Number((answer + rand(5, 15)).toFixed(2))
    ]),
    answer,
    diagram: buildPercentChangeDiagram({
      title: difficulty === "Easy" ? "Percent Decrease" : selected.title,
      original,
      change,
      direction: "decrease",
      isMoney: difficulty === "Easy" ? false : selected.isMoney
    }),
    explanation: `Find the decrease: ${original} × ${change / 100} = ${amount}. Subtract it from the original value: ${original} - ${amount} = ${answer}.`
  };
}

function findPercentIncrease(difficulty, p) {
  const original = rand(Math.ceil(p.largeMin / 10), Math.ceil(p.largeMax / 10)) * 10;
  const percent = p.percentChanges[rand(0, p.percentChanges.length - 1)];
  const increaseAmount = Number((original * (percent / 100)).toFixed(2));
  const newValue = Number((original + increaseAmount).toFixed(2));

  return {
    skill: "Percent Change",
    subskill: "Finding Percent Increase",
    topic: "Finding the percent increase between two values",
    difficulty,
    type: "multiple",
    question:
      difficulty === "Medium"
        ? `${original} increased to ${newValue}. What was the percent increase?`
        : `A value increased from ${original} to ${newValue}. What was the percent increase?`,
    choices: shuffle([
      percent,
      percent + 5,
      Math.max(1, percent - 5),
      Math.max(1, 100 - percent)
    ]),
    answer: percent,
    diagram: buildBeforeAfterPercentDiagram({
      original,
      newValue
    }),
    explanation: `The increase is ${newValue} - ${original} = ${increaseAmount}. Divide by the original value: ${increaseAmount} ÷ ${original} = ${percent / 100}, or ${percent}%.`
  };
}

module.exports = function generatePercentChange(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  const p = getDifficultyProfile(difficulty);

  const bank = p.allowHardPercentReverse
    ? [increase, decrease, findPercentIncrease]
    : [increase, decrease];

  return bank[rand(0, bank.length - 1)](difficulty, p);
};