function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

module.exports = function generateDataTable(options = {}) {
  const difficulty = options.difficulty || "GED-Level";

  const rows = [
    { item: "Pens", sold: 12 },
    { item: "Pencils", sold: 18 },
    { item: "Notebooks", sold: 9 },
    { item: "Markers", sold: 15 }
  ];

  const total = rows.reduce((sum, row) => sum + row.sold, 0);

  const tableHtml = `
<table style="border-collapse:collapse;margin-top:10px;background:#fff;">
  <tr>
    <th style="border:1px solid #9aa7b8;padding:6px;background:#edf3fb;">Item</th>
    <th style="border:1px solid #9aa7b8;padding:6px;background:#edf3fb;">Sold</th>
  </tr>
  ${rows.map((r) => `
    <tr>
      <td style="border:1px solid #9aa7b8;padding:6px;">${r.item}</td>
      <td style="border:1px solid #9aa7b8;padding:6px;text-align:center;">${r.sold}</td>
    </tr>
  `).join("")}
</table>`;

  return {
    skill: "Data Table",
    difficulty,
    type: "multiple",
    question: `The table shows the number of items sold in one day.${tableHtml}<div style="margin-top:10px;">How many items were sold in all?</div>`,
    choices: shuffle([total, total + 4, total - 5, total + 9]),
    answer: total,
    explanation: `Add all values in the Sold column: 12 + 18 + 9 + 15 = ${total}.`
  };
};