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

function spinnerProbability(difficulty) {
  const colors = ["Red", "Blue", "Green", "Yellow"];
  const selectedColor = colors[rand(0, colors.length - 1)];
  const answer = "1/4";

  return {
    skill: "Probability",
    subskill: "Spinner Probability",
topic: "Probability with equally likely spinner sections",
    difficulty,
    type: "multiple",
    question: `A spinner is divided into 4 equal sections as shown. What is the probability of landing on ${selectedColor}?`,
    choices: shuffle(["1/4", "1/2", "1/3", "3/4"]),
    answer,
    diagram: `
      <svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg">
        <circle cx="140" cy="120" r="70" fill="none" stroke="#153e75" stroke-width="4"/>
        <line x1="140" y1="120" x2="140" y2="50" stroke="#153e75" stroke-width="3"/>
        <line x1="140" y1="120" x2="210" y2="120" stroke="#153e75" stroke-width="3"/>
        <line x1="140" y1="120" x2="140" y2="190" stroke="#153e75" stroke-width="3"/>
        <line x1="140" y1="120" x2="70" y2="120" stroke="#153e75" stroke-width="3"/>

        <text x="140" y="85" text-anchor="middle" class="diagramLabel">Red</text>
        <text x="178" y="125" text-anchor="middle" class="diagramLabel">Blue</text>
        <text x="140" y="165" text-anchor="middle" class="diagramLabel">Green</text>
        <text x="100" y="125" text-anchor="middle" class="diagramLabel">Yellow</text>

        <line x1="250" y1="120" x2="300" y2="90" stroke="#153e75" stroke-width="4"/>
        <polygon points="300,90 288,89 294,100" fill="#153e75"/>

        <text x="260" y="35" text-anchor="middle" class="diagramLabel">Spinner</text>
      </svg>
    `,
    explanation: `There are 4 equal sections on the spinner, and only 1 section is ${selectedColor}. So the probability is 1 out of 4, or 1/4.`
  };
}

function marblesProbability(difficulty) {
  const red = rand(2, difficulty === "Easy" ? 5 : 7);
  const blue = rand(2, difficulty === "Easy" ? 5 : 7);
  const green = rand(1, difficulty === "Easy" ? 4 : 5);
  const total = red + blue + green;

  const targets = [
    { color: "red", count: red },
    { color: "blue", count: blue },
    { color: "green", count: green }
  ];
  const target = targets[rand(0, targets.length - 1)];
  const answer = simplifyFraction(target.count, total);

  const wrong1 = simplifyFraction(Math.max(1, target.count + 1), total);
  const wrong2 = simplifyFraction(Math.max(1, target.count), Math.max(1, total - 1));
  const wrong3 = simplifyFraction(Math.max(1, total - target.count), total);

  // 🔥 Build dynamic marble visuals
  const marbles = [];

  function addMarbles(count, stroke) {
    for (let i = 0; i < count; i++) {
      marbles.push({ stroke });
    }
  }

  addMarbles(red, "#ef4444");   // red
  addMarbles(blue, "#3b82f6");  // blue
  addMarbles(green, "#22c55e"); // green

  // layout (grid inside bag)
  const startX = 120;
  const startY = 90;
  const spacing = 22;
  const perRow = 4;

  const circles = marbles.map((m, i) => {
    const col = i % perRow;
    const row = Math.floor(i / perRow);

    const x = startX + col * spacing;
    const y = startY + row * spacing;

    return `<circle cx="${x}" cy="${y}" r="8" fill="none" stroke="${m.stroke}" stroke-width="3"/>`;
  }).join("");

  return {
    skill: "Probability",
    subskill: "Marble Probability",
topic: "Probability with colored marbles",
    difficulty,
    type: "multiple",
    question: `A bag contains ${red} red marbles, ${blue} blue marbles, and ${green} green marbles. If 1 marble is chosen at random, what is the probability of picking a ${target.color} marble?`,
    choices: shuffle([answer, wrong1, wrong2, wrong3]),
    answer,
    diagram: `
      <svg viewBox="0 0 360 260" xmlns="http://www.w3.org/2000/svg">
        <!-- bag -->
        <path d="M110 50 Q140 35 170 50 L200 190 Q155 225 110 190 Z"
              fill="none" stroke="#153e75" stroke-width="4"/>

        <!-- marbles -->
        ${circles}

        <!-- legend -->
        <text x="265" y="90" class="diagramLabel">Red: ${red}</text>
        <text x="265" y="125" class="diagramLabel">Blue: ${blue}</text>
        <text x="265" y="160" class="diagramLabel">Green: ${green}</text>
        <text x="265" y="195" class="diagramLabel">Total: ${total}</text>
      </svg>
    `,
    explanation: `Probability = favorable outcomes / total outcomes. There are ${target.count} ${target.color} marbles out of ${total} total marbles, so the probability is ${target.count}/${total}, which simplifies to ${answer}.`
  };
}

function diceProbability(difficulty) {
  const targets = [
    { label: "an even number", favorable: 3 },
    { label: "a number greater than 4", favorable: 2 },
    { label: "a number less than 3", favorable: 2 },
    { label: "a number greater than 1", favorable: 5 }
  ];
  const target = targets[rand(0, targets.length - 1)];
  const answer = simplifyFraction(target.favorable, 6);

  return {
    skill: "Probability",
    subskill: "Number Cube Probability",
topic: "Probability with a fair number cube",
    difficulty,
    type: "multiple",
    question: `A fair number cube is rolled once. What is the probability of rolling ${target.label}?`,
    choices: shuffle([
      answer,
      simplifyFraction(Math.max(1, target.favorable - 1), 6),
      simplifyFraction(Math.min(6, target.favorable + 1), 6),
      simplifyFraction(6 - target.favorable, 6)
    ]),
    answer,
    diagram: `
      <svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg">
        <rect x="110" y="65" width="90" height="90" rx="10" ry="10" fill="none" stroke="#153e75" stroke-width="4"/>
        <circle cx="135" cy="90" r="5" fill="#153e75"/>
        <circle cx="175" cy="90" r="5" fill="#153e75"/>
        <circle cx="155" cy="110" r="5" fill="#153e75"/>
        <circle cx="135" cy="130" r="5" fill="#153e75"/>
        <circle cx="175" cy="130" r="5" fill="#153e75"/>

        <text x="155" y="182" text-anchor="middle" class="diagramLabel">Fair Number Cube</text>
      </svg>
    `,
    explanation: `A fair number cube has 6 equally likely outcomes. The favorable outcomes for rolling ${target.label} are ${target.favorable}, so the probability is ${target.favorable}/6, which simplifies to ${answer}.`
  };
}

module.exports = function generateProbability(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  const bank = [
    spinnerProbability,
    marblesProbability,
    diceProbability
  ];
  return bank[rand(0, bank.length - 1)](difficulty);
};