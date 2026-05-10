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
      choices.add(w);
    }
  });

  while (choices.size < 4) {
    const wrong = answer + rand(-8, 10);
    if (wrong >= 0 && wrong !== answer) choices.add(wrong);
  }

  return shuffle(Array.from(choices));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildTableHtml(headers, rows, title = "Data Table") {
  return `
<div style="
  margin:16px auto 14px;
  max-width:520px;
  border:1px solid #d7e1ee;
  border-radius:14px;
  overflow:hidden;
  background:#ffffff;
  box-shadow:0 6px 18px rgba(8,24,46,0.08);
">
  <div style="
    background:#153e75;
    color:#ffffff;
    font-weight:800;
    text-align:center;
    padding:10px 12px;
    font-size:16px;
  ">
    ${escapeHtml(title)}
  </div>

  <table style="
    width:100%;
    border-collapse:collapse;
    background:#ffffff;
    color:#10233f;
  ">
    <thead>
      <tr>
        <th style="
          border-bottom:1px solid #d7e1ee;
          border-right:1px solid #d7e1ee;
          padding:10px 12px;
          background:#f8fbff;
          color:#153e75;
          text-align:left;
          font-weight:900;
        ">
          ${escapeHtml(headers[0])}
        </th>

        <th style="
          border-bottom:1px solid #d7e1ee;
          padding:10px 12px;
          background:#f8fbff;
          color:#153e75;
          text-align:center;
          font-weight:900;
        ">
          ${escapeHtml(headers[1])}
        </th>
      </tr>
    </thead>

    <tbody>
      ${rows
        .map(
          (r, index) => `
        <tr style="background:${index % 2 === 0 ? "#ffffff" : "#f8fbff"};">
          <td style="
            border-top:1px solid #eef2f7;
            border-right:1px solid #d7e1ee;
            padding:10px 12px;
            font-weight:800;
            text-align:left;
          ">
            ${escapeHtml(r.item)}
          </td>

          <td style="
            border-top:1px solid #eef2f7;
            padding:10px 12px;
            text-align:center;
            font-weight:900;
          ">
            ${escapeHtml(r.value)}
          </td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>
</div>`;
}

module.exports = function generateDataTable(options = {}) {
  const difficulty = options.difficulty || "GED-Level";
  const p = getDifficultyProfile(difficulty);

  const low = difficulty === "Easy" ? 2 : 8;
  const high = difficulty === "Easy" ? p.graphMax : p.graphMax + 8;

  const scenarios = [
{
  title: "School Store Sales",
  intro: "The table shows the number of items sold at a school store in one day.",
  headers: ["Item", "Sold"],
      rows: [
        { item: "Pens", value: rand(low, high) },
        { item: "Pencils", value: rand(low, high) },
        { item: "Notebooks", value: rand(low, high) },
        { item: "Markers", value: rand(low, high) }
      ],
      unit: "items"
    },
{
  title: "Books Read by Students",
  intro: "The table shows the number of books read by students in one month.",
  headers: ["Student", "Books"],
      rows: [
        { item: "Ava", value: rand(low, high) },
        { item: "Liam", value: rand(low, high) },
        { item: "Noah", value: rand(low, high) },
        { item: "Emma", value: rand(low, high) }
      ],
      unit: "books"
    },
{
  title: "Cans Collected by Groups",
  intro: "The table shows the number of cans collected by four groups.",
  headers: ["Group", "Cans"],
      rows: [
        { item: "Group A", value: rand(low, high) },
        { item: "Group B", value: rand(low, high) },
        { item: "Group C", value: rand(low, high) },
        { item: "Group D", value: rand(low, high) }
      ],
      unit: "cans"
    }
  ];

  const selected = scenarios[rand(0, scenarios.length - 1)];
  const values = selected.rows.map((row) => row.value);
  const total = values.reduce((sum, value) => sum + value, 0);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const maxRow = selected.rows[values.indexOf(maxValue)];
  const minRow = selected.rows[values.indexOf(minValue)];
  const difference = maxValue - minValue;

  const questionTypes =
    difficulty === "Easy"
      ? ["greatest", "least"]
      : difficulty === "Medium"
      ? ["total", "greatest", "least"]
      : ["total", "greatest", "least", "difference"];

  const selectedType = questionTypes[rand(0, questionTypes.length - 1)];

  let question;
  let choices;
  let answer;
  let explanation;
  let subskill;
  let topic;

  if (selectedType === "total") {
    answer = total;
    question = `Using the table, how many ${selected.unit} were there in all?`;
    choices = uniqueNumberChoices(answer, [
      total + rand(4, 9),
      total - rand(4, 9),
      maxValue,
      difference
    ]);
    explanation = `Add all values in the table: ${values.join(" + ")} = ${total}.`;
    subskill = "Data Table Totals";
    topic = "Finding totals from a data table";
  } else if (selectedType === "greatest") {
    answer = maxRow.item;
    question = `Using the table, which ${selected.headers[0].toLowerCase()} had the greatest number of ${selected.unit}?`;
    choices = shuffle(selected.rows.map((row) => row.item));
    explanation = `${maxRow.item} has the greatest value in the table, ${maxValue}.`;
    subskill = "Data Table Greatest Value";
    topic = "Finding the greatest value in a data table";
  } else if (selectedType === "least") {
    answer = minRow.item;
    question = `Using the table, which ${selected.headers[0].toLowerCase()} had the least number of ${selected.unit}?`;
    choices = shuffle(selected.rows.map((row) => row.item));
    explanation = `${minRow.item} has the least value in the table, ${minValue}.`;
    subskill = "Data Table Least Value";
    topic = "Finding the least value in a data table";
  } else {
    answer = difference;
    question = `Using the table, how many more ${selected.unit} did ${maxRow.item} have than ${minRow.item}?`;
    choices = uniqueNumberChoices(answer, [
      maxValue,
      minValue,
      total,
      difference + rand(2, 6)
    ]);
    explanation = `Subtract the smaller value from the larger value: ${maxValue} - ${minValue} = ${difference}.`;
    subskill = "Data Table Difference";
    topic = "Finding differences from a data table";
  }

  const tableHtml = buildTableHtml(selected.headers, selected.rows, selected.title);

  return {
    skill: "Data Table",
    subskill,
    topic,
    difficulty,
    type: "multiple",
    question: `${selected.intro}${tableHtml}<div style="margin-top:10px;">${question}</div>`,
    choices,
    answer,
    explanation
  };
};