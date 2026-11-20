import assert from "node:assert/strict";
import { test } from "node:test";
import releaseCalendar from "../src/_data/releaseCalendar.js";
import { rowsToCsv } from "../lib/release-csv.js";
import { insertReadNext, renderNextReads } from "../lib/next-reads.js";

test("the release calendar copies the checked agency dates and no others", () => {
  const byKey = (series, date) =>
    releaseCalendar.rows.find((row) => row.series === series && row.release_date === date);
  assert.equal(byKey("CPI", "2026-12-10").reference_period, "November 2026");
  assert.equal(byKey("CPI", "2026-12-10").release_time, "8:30 a.m.");
  assert.equal(byKey("Jobs report", "2026-12-04").reference_period, "November 2026");
  assert.equal(byKey("PCE", "2026-11-25").reference_period, "October 2026");
  assert.equal(byKey("GDP", "2026-11-25").event.includes("second estimate"), true);
  assert.equal(byKey("PMMS", "2026-11-25").release_time, "12:00 p.m. ET");
  assert.equal(byKey("FOMC", "2026-12-09").release_time, "2:00 p.m.");
  assert.equal(releaseCalendar.rows.some((row) => row.series === "GDP" && row.release_date.startsWith("2027")), false);
  assert.equal(releaseCalendar.rows.every((row) => row.source_url.startsWith("https://")), true);
  assert.equal(releaseCalendar.faq.length, 4);
});

test("the csv is the same rows as the page data", () => {
  const csv = rowsToCsv(releaseCalendar.rows);
  assert.match(csv.split("\n")[0], /^series,agency,/);
  assert.equal(csv.trim().split("\n").length, releaseCalendar.rows.length + 1);
  assert.match(csv, /2026-11-25/);
  assert.match(csv, /2026-12-10/);
  assert.doesNotMatch(csv, /price target|you should buy/i);
});

test("background reads are inserted once, after the third paragraph", () => {
  const html = "<p>One</p><p>Two</p><p>Three</p><p>Four</p>";
  const out = insertReadNext(html, [{ url: "/calendar/", title: "Calendar", src: "" }]);
  assert.ok(out.includes("Three</p><aside"));
  assert.ok(out.indexOf("Four</p>") > out.indexOf("background-heading"));
  assert.equal(out.match(/id="background-heading"/g).length, 1);
  const rendered = renderNextReads(
    [{ url: "/a/", title: 'Tom & "Jerry"', src: "nope" }],
    "/",
    { heading: "Related stories", id: "related-heading" },
  );
  assert.match(rendered, /Tom &amp; &quot;Jerry&quot;/);
  assert.match(rendered, /id="related-heading"/);
  assert.doesNotMatch(rendered, /<img/);
});
