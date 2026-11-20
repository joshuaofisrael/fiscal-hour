import { rowsToCsv } from "../lib/release-csv.js";

export const data = {
  permalink: "/calendar/releases.csv",
  eleventyExcludeFromCollections: true,
  sitemapIgnore: true,
};

export function render({ releaseCalendar }) {
  return rowsToCsv(releaseCalendar.rows);
}
