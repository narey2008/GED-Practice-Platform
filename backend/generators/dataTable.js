function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

module.exports = function generateDataTable(options = {}) {
  const difficulty = options.difficulty || "GED-Level";

  const scenarios = [
    {
      intro: "The table shows the number of items sold at a school store in one day.",
      headers: ["Item", "Sold"],
      rows: [
        { item: "Pens", sold: rand(10, 16) },
        { item: "Pencils", sold: rand(12, 20) },
        { item: "Notebooks", sold: rand(6, 12) },
        { item: "Markers", sold: rand(8, 15) }
      ],
      question: "How many items were sold in all?"
    },
    {
      intro: "The table shows the number of books read by students in one month.",
      headers: ["Student", "Books"],
      rows: [
        { item: "Ava", sold: rand(2, 6) },
        { item: "Liam", sold: rand(3, 7) },
        { item: "Noah", sold: rand(1, 5) },
        { item: "Emma", sold: rand(2, 6) }
      ],
      question: "How many books were read in all?"
    },
    {
      intro: "The table shows the number of cans collected by four groups.",
      headers: ["Group", "Cans"],
      rows: [
        { item: "Group A", sold: rand(15, 25) },
        { item: "Group B", sold: rand(12, 22) },
        { item: "Group C", sold: rand(10, 20) },
        { item: "Group D", sold: rand(14, 24) }
      ],
      question: "How many cans were collected in all?"
    }
  ];

  const selected = scenarios[rand(0, scenarios.length - 1)];
  const total = selected.rows.reduce((sum, row) => sum + row.sold, 0);

  const tableHtml = `
<table style="border-collapse:collapse;margin-top:10px;background:#fff;">
  <tr>
    <th style="border:1px solid #9aa7b8;padding:6px;background:#edf3fb;">${selected.headers[0]}</th>
    <th style="border:1px solid #9aa7b8;padding:6px;background:#edf3fb;">${selected.headers[1]}</th>
  </tr>
  ${selected.rows
    .map(
      (r) => `
    <tr>
      <td style="border:1px solid #9aa7b8;padding:6px;">${r.item}</td>
      <td style="border:1px solid #9aa7b8;padding:6px;text-align:center;">${r.sold}</td>
    </tr>
  `
    )
    .join("")}
</table>`;

  const choices = new Set([total]);
  while (choices.size < 4) {
    const wrong = total + rand(-8, 10);
    if (wrong > 0 && wrong !== total) {
      choices.add(wrong);
    }
  }

  return {
    skill: "Data Table",
    subskill: "Data Table Totals",
topic: "Finding totals from a data table",
    difficulty,
    type: "multiple",
    question: `${selected.intro}${tableHtml}<div style="margin-top:10px;">${selected.question}</div>`,
    choices: shuffle(Array.from(choices)),
    answer: total,
    explanation: `Add all values in the table: ${selected.rows.map((r) => r.sold).join(" + ")} = ${total}.`
  };
};