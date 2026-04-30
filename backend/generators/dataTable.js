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

function buildTableHtml(headers, rows) {
  return `
<table style="border-collapse:collapse;margin-top:10px;background:#fff;">
  <tr>
    <th style="border:1px solid #9aa7b8;padding:6px;background:#edf3fb;">${headers[0]}</th>
    <th style="border:1px solid #9aa7b8;padding:6px;background:#edf3fb;">${headers[1]}</th>
  </tr>
  ${rows
    .map(
      (r) => `
    <tr>
      <td style="border:1px solid #9aa7b8;padding:6px;">${r.item}</td>
      <td style="border:1px solid #9aa7b8;padding:6px;text-align:center;">${r.value}</td>
    </tr>
  `
    )
    .join("")}
</table>`;
}

module.exports = function generateDataTable(options = {}) {
  const difficulty = options.difficulty || "GED-Level";

  const scenarios = [
    {
      intro: "The table shows the number of items sold at a school store in one day.",
      headers: ["Item", "Sold"],
      rows: [
        { item: "Pens", value: rand(10, 16) },
        { item: "Pencils", value: rand(12, 20) },
        { item: "Notebooks", value: rand(6, 12) },
        { item: "Markers", value: rand(8, 15) }
      ],
      unit: "items"
    },
    {
      intro: "The table shows the number of books read by students in one month.",
      headers: ["Student", "Books"],
      rows: [
        { item: "Ava", value: rand(2, 6) },
        { item: "Liam", value: rand(3, 7) },
        { item: "Noah", value: rand(1, 5) },
        { item: "Emma", value: rand(2, 6) }
      ],
      unit: "books"
    },
    {
      intro: "The table shows the number of cans collected by four groups.",
      headers: ["Group", "Cans"],
      rows: [
        { item: "Group A", value: rand(15, 25) },
        { item: "Group B", value: rand(12, 22) },
        { item: "Group C", value: rand(10, 20) },
        { item: "Group D", value: rand(14, 24) }
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

  const questionTypes = ["total", "greatest", "least", "difference"];
  const selectedType = questionTypes[rand(0, questionTypes.length - 1)];

  let question;
  let choices;
  let answer;
  let explanation;
  let subskill;
  let topic;

  if (selectedType === "total") {
    answer = total;
    question = "How many were there in all?";
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
    question = `Which ${selected.headers[0].toLowerCase()} had the greatest number?`;
    choices = shuffle(selected.rows.map((row) => row.item));
    explanation = `${maxRow.item} has the greatest value in the table, ${maxValue}.`;
    subskill = "Data Table Greatest Value";
    topic = "Finding the greatest value in a data table";
  } else if (selectedType === "least") {
    answer = minRow.item;
    question = `Which ${selected.headers[0].toLowerCase()} had the least number?`;
    choices = shuffle(selected.rows.map((row) => row.item));
    explanation = `${minRow.item} has the least value in the table, ${minValue}.`;
    subskill = "Data Table Least Value";
    topic = "Finding the least value in a data table";
  } else {
    answer = difference;
    question = `How many more did ${maxRow.item} have than ${minRow.item}?`;
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

  const tableHtml = buildTableHtml(selected.headers, selected.rows);

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