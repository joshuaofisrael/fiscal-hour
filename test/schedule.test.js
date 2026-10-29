import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import matter from "gray-matter";
import { isFreshNews, isFutureDated } from "../lib/dates.js";
import { lookbackMs, postsDue } from "../scripts/scheduled-publish.js";

const root = path.resolve(import.meta.dirname, "..");

const stories = [
  { file: "fed", date: "2026-10-29T11:00:00.000Z" },
  { file: "microsoft", date: "2026-10-29T15:00:00.000Z" },
  { file: "fdic", date: "2026-10-29T19:00:00.000Z" },
];

function dueAt(iso) {
  return postsDue(stories, Date.parse(iso)).map((post) => post.file);
}

test("the three Oct 29 stories are stamped for 11:00, 15:00 and 19:00 UTC", () => {
  const expected = [
    ["2026-10-29-fed-holds-funds-rate.md", "2026-10-29T11:00:00.000Z"],
    ["2026-10-29-microsoft-fiscal-first-quarter-revenue.md", "2026-10-29T15:00:00.000Z"],
    ["2026-10-29-fdic-deposit-insurance-limit.md", "2026-10-29T19:00:00.000Z"],
  ];
  for (const [name, stamp] of expected) {
    const parsed = matter(fs.readFileSync(path.join(root, "src/content/posts", name), "utf8"));
    assert.equal(String(parsed.data.publishAt), stamp, name);
    assert.equal(String(parsed.data.date), stamp, name);
    assert.equal(parsed.data.draft, undefined, name);
  }
});

test("a future publishAt stays unpublished until that time", () => {
  const morning = Date.parse("2026-10-29T08:00:00.000Z");
  assert.equal(isFutureDated("2026-10-29T11:00:00.000Z", morning), true);
  assert.equal(isFutureDated("2026-10-29T11:00:00.000Z", Date.parse("2026-10-29T11:00:00.000Z")), false);
  assert.equal(isFreshNews("2026-10-29T11:00:00.000Z", morning), false);
  assert.equal(isFreshNews("2026-10-29T11:00:00.000Z", Date.parse("2026-10-29T12:00:00.000Z")), true);
});

test("slot runs and the 22:05 catch-up cover the day's three stamps", () => {
  assert.equal(lookbackMs(Date.parse("2026-10-29T11:05:00.000Z")), 5 * 60 * 60 * 1000);
  assert.equal(lookbackMs(Date.parse("2026-10-29T22:05:00.000Z")), 14 * 60 * 60 * 1000);
  assert.deepEqual(dueAt("2026-10-29T11:05:00.000Z"), ["fed"]);
  assert.deepEqual(dueAt("2026-10-29T11:35:00.000Z"), ["fed"]);
  assert.deepEqual(dueAt("2026-10-29T15:05:00.000Z"), ["fed", "microsoft"]);
  assert.deepEqual(dueAt("2026-10-29T19:05:00.000Z"), ["microsoft", "fdic"]);
  assert.deepEqual(dueAt("2026-10-29T22:05:00.000Z"), ["fed", "microsoft", "fdic"]);
  assert.deepEqual(dueAt("2026-10-30T11:05:00.000Z"), []);
  assert.deepEqual(postsDue([{ file: "draft", date: "2026-10-29T11:00:00.000Z", draft: true }], Date.parse("2026-10-29T11:05:00.000Z")), []);
  assert.deepEqual(postsDue([{ file: "held", date: "2026-10-29T11:00:00.000Z", held: true }], Date.parse("2026-10-29T11:05:00.000Z")), []);
});

test("the schedule workflow names the London slots and the catch-up", () => {
  const yml = fs.readFileSync(path.join(root, ".github/workflows/publish-scheduled.yml"), "utf8");
  for (const cron of ["5 11 * * *", "35 11 * * *", "5 15 * * *", "35 15 * * *", "5 19 * * *", "35 19 * * *", "5 22 * * *"]) {
    assert.match(yml, new RegExp(cron.replaceAll("*", "\\*")));
  }
  assert.match(yml, /npm test/);
  assert.match(yml, /scripts\/legal-gate\.js/);
  assert.match(yml, /actions\/deploy-pages@v4/);
});
