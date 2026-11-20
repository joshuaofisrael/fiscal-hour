function cell(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export const CSV_COLUMNS = [
  "series",
  "agency",
  "event",
  "reference_period",
  "release_date",
  "release_time",
  "status",
  "source_title",
  "source_url",
  "time_note",
  "checked",
];

export function rowsToCsv(rows) {
  const lines = [CSV_COLUMNS.join(",")];
  for (const row of rows || []) {
    lines.push(CSV_COLUMNS.map((key) => cell(row[key])).join(","));
  }
  return `${lines.join("\n")}\n`;
}
