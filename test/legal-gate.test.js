import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import {
  findHeldInOutput,
  flagsInText,
  gateFailure,
  heldUrlsIn,
  queueRecord,
  reviewPostsDir,
  sha256File,
} from "../lib/legal-gate.js";

const root = path.resolve(import.meta.dirname, "..");
const fixtures = path.join(root, "test/legal-gate/fixtures");
const provenance = path.join(fixtures, "image-provenance.json");
const holdFile = path.join(fixtures, "zz-test-hold-synthetic.md");
const passFile = path.join(fixtures, "zz-test-pass-synthetic.md");
const emptyApprovals = path.join(os.tmpdir(), "fh-gate-absent-approvals.jsonl");
const emptyClearances = path.join(os.tmpdir(), "fh-gate-absent-clearances.jsonl");

function reviewFixtures(options = {}) {
  return reviewPostsDir(fixtures, {
    provenancePath: provenance,
    approvalsPath: options.approvalsPath || emptyApprovals,
    clearancesPath: options.clearancesPath || emptyClearances,
  });
}

function resultFor(review, slug) {
  const found = review.results.find((item) => item.slug === slug);
  assert.ok(found, slug);
  return found;
}

function writeJsonl(file, records) {
  fs.writeFileSync(file, records.map((record) => JSON.stringify(record)).join("\n") + "\n");
}

function runGate(args) {
  return spawnSync(process.execPath, [path.join(root, "scripts/legal-gate.js"), ...args], {
    cwd: root,
    encoding: "utf8",
  });
}

test("pattern checks hold allegations and skip known false positives", () => {
  assert.deepEqual(flagsInText("at the Board’s offices at 20th and C Streets, N.W., in Washington", "body"), []);
  assert.deepEqual(flagsInText("Oil moved the other way after a quarter point to 3-3/4 to 4 percent.", "body"), []);
  assert.deepEqual(flagsInText("Brick high street of shopfronts on an overcast morning", "alt"), []);
  assert.deepEqual(flagsInText("Wide empty city avenue of glass towers and wet pavement", "alt"), []);
  assert.deepEqual(flagsInText("The index fell 13.88% to 176,608.23", "body"), []);
  assert.deepEqual(flagsInText("The bank described its anti-fraud controls and anti-corruption training.", "body"), []);
  assert.deepEqual(flagsInText("The final October survey was 48.0.", "body"), []);
  assert.deepEqual(flagsInText("the target range for the federal funds rate", "body"), []);
  assert.deepEqual(flagsInText("The release says the statements are not guarantees.", "body"), []);
  assert.deepEqual(flagsInText("destroyed three drones targeting Riyadh", "body"), []);
  assert.deepEqual(flagsInText("you should not buy the shares", "body"), []);
  assert.deepEqual(flagsInText("whether the shares should be bought or sold", "body"), []);
  assert.deepEqual(flagsInText("They are not a preview of the vote.", "body"), []);
  assert.deepEqual(flagsInText("including election of directors other than the Class T directors", "body"), []);
  assert.deepEqual(flagsInText("Verizon Delivers Another Record-Breaking Quarter", "sources[0].title"), []);
  assert.equal(flagsInText("Write to 123 Main Street before noon.", "body").some((flag) => flag.rule === 2), true);
  assert.equal(flagsInText("Call 202-555-0148 for the desk.", "body").some((flag) => flag.rule === 2), true);
  assert.equal(flagsInText("jane.doe@example.com", "body").some((flag) => flag.rule === 2), true);
  assert.equal(flagsInText("The fictional company committed fraud.", "body").some((flag) => flag.rule === 1), true);
  assert.equal(flagsInText("you should buy the shares", "body").some((flag) => flag.rule === 5), true);
  assert.equal(flagsInText("Record-Breaking profit", "title").some((flag) => flag.rule === 7), true);
  assert.equal(
    flagsInText("Brazil Runoff: Lula Leads Final Count at 51.79%", "seoTitle").some((flag) => flag.rule === 6),
    true,
  );
  assert.equal(flagsInText("He cited a two-hour extension of polling", "body").some((flag) => flag.logistics), true);
});

test("synthetic hold and pass fixtures", () => {
  const review = reviewFixtures();
  const held = resultFor(review, "zz-test-hold-synthetic");
  const passing = resultFor(review, "zz-test-pass-synthetic");
  console.log("TEST 1 held item flags:", held.rules);
  console.log(held.flagged);
  console.log("TEST 2 passing item flags:", passing.rules, "dropped:", passing.droppedImages);
  assert.deepEqual(held.rules, [1, 2, 4]);
  assert.equal(held.tier, "HIGH");
  assert.equal(held.held, true);
  assert.equal(held.status, "HOLD_REVIEW");
  assert.match(held.flagged, /no source URL/);
  assert.match(held.flagged, /accused of fraud/);
  assert.match(held.flagged, /committed fraud/);
  assert.match(held.flagged, /jane\.doe@example\.com/);
  assert.deepEqual(passing.rules, []);
  assert.equal(passing.held, false);
  assert.deepEqual(passing.droppedImages, ["zz-test-optional"]);
  const record = queueRecord(held, new Date("2026-10-27T20:00:00.000Z"));
  assert.equal(record.site, "fiscalhour.com");
  assert.equal(record.bot, "Financial News Bot");
  assert.equal(record.status, "HOLD_REVIEW");
  assert.equal(record.sha256, held.sha256);
  assert.equal(record.draft_path, "test/legal-gate/fixtures/zz-test-hold-synthetic.md");
  assert.deepEqual(record.rule, [1, 2, 4]);
  assert.equal(fs.existsSync(path.join(root, "src/content/posts/zz-test-hold-synthetic.md")), false);
  assert.equal(fs.existsSync(path.join(root, "src/content/posts/zz-test-pass-synthetic.md")), false);
});

test("a required image with no provenance record is held", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fh-gate-image-"));
  fs.writeFileSync(
    path.join(dir, "zz-test-unrecorded.md"),
    `---
title: "TEST ONLY: Fictional mill with an unrecorded picture"
description: "Synthetic image-licence fixture."
date: 2026-10-27
updatedAt: 2026-10-27
category: Companies
hero:
  src: zz-test-missing
  alt: "Plain gray rectangle with no licence record, with no scene and no people"
  width: 1280
  height: 720
sources:
  - title: "Example filing"
    url: "https://example.com/unrecorded"
    publisher: "Example Registry"
    date: 2026-10-27
---

Northwind Mills said revenue was $10 million in an [example filing](https://example.com/unrecorded).
`,
  );
  const review = reviewPostsDir(dir, {
    provenancePath: provenance,
    approvalsPath: emptyApprovals,
    clearancesPath: emptyClearances,
  });
  const item = resultFor(review, "zz-test-unrecorded");
  console.log("TEST 3 unrecorded image flags:", item.rules, item.flagged);
  assert.deepEqual(item.rules, [3]);
  assert.equal(item.tier, "MODERATE");
  assert.match(item.flagged, /zz-test-missing: no provenance\/licence record/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test("approvals and moderate clearances follow the hash and the severity tier", () => {
  const hash = sha256File(holdFile);
  const wrong = path.join(os.tmpdir(), `fh-gate-wrong-${process.pid}.jsonl`);
  const exact = path.join(os.tmpdir(), `fh-gate-exact-${process.pid}.jsonl`);
  const chatbot = path.join(os.tmpdir(), `fh-gate-bot-${process.pid}.jsonl`);
  const clearance = path.join(os.tmpdir(), `fh-gate-clear-${process.pid}.jsonl`);
  writeJsonl(wrong, [{ sha256: "0".repeat(64), approved_by: "Joshua" }]);
  writeJsonl(exact, [{ sha256: hash, approved_by: "Joshua" }]);
  writeJsonl(chatbot, [{ sha256: hash, approved_by: "ChatGPT" }]);
  writeJsonl(clearance, [
    {
      sha256: hash,
      approved_by: "ChatGPT",
      chatgpt_verdict: "SAFE",
      rule: [1, 2, 4],
      fix: "none",
    },
  ]);

  const wrongReview = resultFor(reviewFixtures({ approvalsPath: wrong }), "zz-test-hold-synthetic");
  const exactReview = resultFor(reviewFixtures({ approvalsPath: exact }), "zz-test-hold-synthetic");
  const botReview = resultFor(reviewFixtures({ approvalsPath: chatbot }), "zz-test-hold-synthetic");
  const clearanceReview = resultFor(reviewFixtures({ clearancesPath: clearance }), "zz-test-hold-synthetic");
  console.log("TEST 7 approval with wrong hash clears it:", wrongReview.clearedBy);
  console.log("TEST 8 ChatGPT clearance on a HIGH hold clears it:", clearanceReview.clearedBy);
  console.log("TEST 9 approval with exact hash clears it:", exactReview.clearedBy);
  assert.equal(wrongReview.held, true);
  assert.equal(wrongReview.clearedBy, null);
  assert.equal(botReview.held, true);
  assert.equal(botReview.clearedBy, null);
  assert.equal(clearanceReview.held, true);
  assert.equal(clearanceReview.clearedBy, null);
  assert.equal(clearanceReview.tier, "HIGH");
  assert.equal(exactReview.held, false);
  assert.equal(exactReview.clearedBy, "approval");

  const editedDir = fs.mkdtempSync(path.join(os.tmpdir(), "fh-gate-edit-"));
  const edited = path.join(editedDir, "zz-test-hold-synthetic.md");
  fs.writeFileSync(edited, fs.readFileSync(holdFile, "utf8").replace("fraud", "fraud."));
  const editedReview = reviewPostsDir(editedDir, {
    provenancePath: provenance,
    approvalsPath: exact,
    clearancesPath: emptyClearances,
  });
  const editedItem = resultFor(editedReview, "zz-test-hold-synthetic");
  console.log("TEST 10 same approval after a one-char edit:", editedItem.clearedBy);
  assert.notEqual(sha256File(edited), hash);
  assert.equal(editedItem.held, true);
  assert.equal(editedItem.clearedBy, null);
  fs.rmSync(editedDir, { recursive: true, force: true });
  for (const file of [wrong, exact, chatbot, clearance]) fs.rmSync(file, { force: true });
});

test("a moderate clearance can clear a moderate hold and cannot clear election logistics", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fh-gate-moderate-"));
  const story = path.join(dir, "zz-test-moderate.md");
  fs.writeFileSync(
    story,
    `---
title: "TEST ONLY: Shocking note on fictional mill revenue"
description: "Synthetic moderate fixture."
date: 2026-10-27
updatedAt: 2026-10-27
category: Companies
hero:
  src: zz-test-hero
  alt: "Plain gray rectangle used only by the moderate fixture, with no scene and no people"
  width: 1280
  height: 720
sources:
  - title: "Example filing"
    url: "https://example.com/moderate"
    publisher: "Example Registry"
    date: 2026-10-27
---

Northwind Mills said revenue was $10 million in an [example filing](https://example.com/moderate).
`,
  );
  const hash = sha256File(story);
  const base = {
    provenancePath: provenance,
    approvalsPath: emptyApprovals,
  };
  const uncleared = resultFor(
    reviewPostsDir(dir, { ...base, clearancesPath: emptyClearances }),
    "zz-test-moderate",
  );
  assert.deepEqual(uncleared.rules, [7]);
  assert.equal(uncleared.tier, "MODERATE");
  assert.equal(uncleared.held, true);

  const safeFile = path.join(dir, "safe.jsonl");
  writeJsonl(safeFile, [{ sha256: hash, chatgpt_verdict: "SAFE", rule: 7, fix: "Headline no longer overclaims." }]);
  const safe = resultFor(reviewPostsDir(dir, { ...base, clearancesPath: safeFile }), "zz-test-moderate");
  assert.equal(safe.held, false);
  assert.equal(safe.clearedBy, "moderate");

  const unsureFile = path.join(dir, "unsure.jsonl");
  writeJsonl(unsureFile, [{ sha256: hash, chatgpt_verdict: "UNSURE", rule: 7 }]);
  const unsure = resultFor(reviewPostsDir(dir, { ...base, clearancesPath: unsureFile }), "zz-test-moderate");
  assert.equal(unsure.held, true);

  const otherFile = path.join(dir, "other.jsonl");
  writeJsonl(otherFile, [{ sha256: "ab".repeat(32), chatgpt_verdict: "SAFE", rule: 7 }]);
  const other = resultFor(reviewPostsDir(dir, { ...base, clearancesPath: otherFile }), "zz-test-moderate");
  assert.equal(other.held, true);

  const logistics = path.join(dir, "zz-test-logistics.md");
  fs.writeFileSync(
    logistics,
    `---
title: "TEST ONLY: Fictional county lists a polling place"
description: "Synthetic election-logistics fixture."
date: 2026-10-27
updatedAt: 2026-10-27
category: Economy
hero:
  src: zz-test-hero
  alt: "Plain gray rectangle used only by the logistics fixture, with no scene and no people"
  width: 1280
  height: 720
sources:
  - title: "A news recap"
    url: "https://example.com/logistics"
    publisher: "Example News"
    date: 2026-10-27
---

The fictional county said polls open at 7 a.m. at the polling place on 123 Example Street.
`,
  );
  const logisticsHash = sha256File(logistics);
  const logisticsClearance = path.join(dir, "logistics.jsonl");
  writeJsonl(logisticsClearance, [{ sha256: logisticsHash, chatgpt_verdict: "SAFE", rule: 6, fix: "none" }]);
  const logisticsReview = resultFor(
    reviewPostsDir(dir, { ...base, clearancesPath: logisticsClearance }),
    "zz-test-logistics",
  );
  assert.equal(logisticsReview.tier, "HIGH");
  assert.equal(logisticsReview.rules.includes(6), true);
  assert.equal(logisticsReview.held, true);
  assert.equal(logisticsReview.clearedBy, null);

  const official = path.join(dir, "zz-test-official.md");
  fs.writeFileSync(
    official,
    `---
title: "TEST ONLY: Fictional election office posts its hours"
description: "Synthetic official-source fixture."
date: 2026-10-27
updatedAt: 2026-10-27
category: Economy
hero:
  src: zz-test-hero
  alt: "Plain gray rectangle used only by the official-source fixture, with no scene and no people"
  width: 1280
  height: 720
sources:
  - title: "Example election authority hours"
    url: "https://www.fec.gov/example-hours"
    publisher: "Federal Election Commission"
    date: 2026-10-27
---

The example authority page says polls open at 7 a.m.
`,
  );
  const officialReview = resultFor(
    reviewPostsDir(dir, { ...base, clearancesPath: emptyClearances }),
    "zz-test-official",
  );
  assert.deepEqual(officialReview.rules, []);
  assert.equal(officialReview.held, false);
  fs.rmSync(dir, { recursive: true, force: true });
});

test("the gate command emits JSONL and fails closed", () => {
  const clean = runGate([
    "--posts",
    fixtures,
    "--provenance",
    provenance,
    "--approvals",
    emptyApprovals,
    "--clearances",
    emptyClearances,
    "--no-held-file",
    "--check-output",
    fs.mkdtempSync(path.join(os.tmpdir(), "fh-gate-clean-")),
  ]);
  console.log("TEST 5 CI check on empty output:", clean.status, clean.stderr.trim().split("\n").slice(-2).join(" | "));
  assert.equal(clean.status, 0, clean.stderr);
  assert.match(clean.stderr, /LEGAL GATE CI OK/);
  const lines = clean.stdout.trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
  assert.equal(lines.length, 1);
  assert.equal(lines[0].site, "fiscalhour.com");
  assert.equal(lines[0].bot, "Financial News Bot");
  assert.equal(lines[0].status, "HOLD_REVIEW");
  assert.deepEqual(lines[0].rule, [1, 2, 4]);
  assert.equal(lines[0].sha256, sha256File(holdFile));

  const planted = fs.mkdtempSync(path.join(os.tmpdir(), "fh-gate-plant-"));
  const page = path.join(planted, "articles/zz-test-hold-synthetic");
  fs.mkdirSync(page, { recursive: true });
  fs.writeFileSync(
    path.join(page, "index.html"),
    `<html><title>${lines[0].title}</title><a href="/articles/zz-test-hold-synthetic/">held</a></html>`,
  );
  const leaked = runGate([
    "--posts",
    fixtures,
    "--provenance",
    provenance,
    "--approvals",
    emptyApprovals,
    "--clearances",
    emptyClearances,
    "--no-held-file",
    "--check-output",
    planted,
  ]);
  console.log("TEST 6 CI with held page planted:", leaked.status, leaked.stderr.trim().split("\n").filter((line) => line.includes("CI")).join(" | "));
  assert.equal(leaked.status, 1);
  assert.match(leaked.stderr, /LEGAL GATE CI FAIL: held content is published/);
  assert.equal(findHeldInOutput(planted, [resultFor(reviewFixtures(), "zz-test-hold-synthetic")]).length > 0, true);
  fs.rmSync(planted, { recursive: true, force: true });

  const missing = runGate([
    "--posts",
    fixtures,
    "--provenance",
    path.join(fixtures, "missing-provenance.json"),
    "--approvals",
    emptyApprovals,
    "--clearances",
    emptyClearances,
    "--no-held-file",
  ]);
  console.log("TEST 11 missing provenance exit:", missing.status, missing.stderr.trim());
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /missing; refusing to build/);

  const unmarkedDir = fs.mkdtempSync(path.join(os.tmpdir(), "fh-gate-unmarked-"));
  fs.writeFileSync(
    path.join(unmarkedDir, "zz-test-unmarked.md"),
    fs.readFileSync(holdFile, "utf8").replace("status: HOLD_REVIEW\n", ""),
  );
  const unmarked = runGate([
    "--posts",
    unmarkedDir,
    "--provenance",
    provenance,
    "--approvals",
    emptyApprovals,
    "--clearances",
    emptyClearances,
    "--no-held-file",
  ]);
  assert.equal(unmarked.status, 1);
  assert.match(unmarked.stderr, /not marked status HOLD_REVIEW/);
  assert.match(unmarked.stdout, /"status":"HOLD_REVIEW"/);
  fs.rmSync(unmarkedDir, { recursive: true, force: true });
});

test("existing stories: no holds remain and the revised Brazil story is cleared by Joshua's exact-hash approval", () => {
  const review = reviewPostsDir(path.join(root, "src/content/posts"));
  console.log("EXISTING HOLDS:", review.holds.map((hold) => hold.slug));
  assert.deepEqual(review.holds.map((hold) => hold.slug), []);
  assert.equal(gateFailure(review), null);
});

test("production build leaves held stories out of pages, feeds, and the sitemap", () => {
  const output = path.join(root, "_site-legal-gate");
  fs.rmSync(output, { recursive: true, force: true });
  const bin = path.join(root, "node_modules", ".bin", "eleventy");
  try {
    const run = spawnSync(bin, ["--output=_site-legal-gate"], {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, ELEVENTY_ENV: "production" },
    });
    console.log("TEST 4 production build exit:", run.status);
    assert.equal(run.status, 0, run.stdout + run.stderr);
    assert.match(run.stderr, /LEGAL GATE:/);
    const home = fs.readFileSync(path.join(output, "index.html"), "utf8");
    const sitemap = fs.readFileSync(path.join(output, "sitemap.xml"), "utf8");
    const feed = fs.readFileSync(path.join(output, "feed.xml"), "utf8");
    const atom = fs.readFileSync(path.join(output, "atom.xml"), "utf8");
    const news = fs.readFileSync(path.join(output, "news-sitemap.xml"), "utf8");
    // Latest on the homepage is capped at 20, so an older published headline
    // rotates off when a new batch lands. The sitemap still has to include it,
    // and the homepage still has to list real article pages.
    assert.match(sitemap, /2026-10-27-verizon-third-quarter-results/);
    assert.match(home, /href="\/articles\/20/);
    assert.equal(fs.existsSync(path.join(output, "articles/2026-10-26-brazil-runoff-lula-declared-ahead/index.html")), true);
    assert.equal(fs.existsSync(path.join(output, "articles/zz-test-hold-synthetic/index.html")), false);
    const leaked = [];
    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(html|xml|txt)$/.test(full)) {
          const text = fs.readFileSync(full, "utf8");
          if (
            text.includes("zz-test-hold-synthetic") ||
            text.includes("Lula Leads Final Count")
          ) {
            leaked.push(path.relative(output, full));
          }
        }
      }
    };
    walk(output);
    console.log("held page rendered:", leaked.length > 0, "| passing page rendered: true");
    assert.deepEqual(leaked, []);
  } finally {
    fs.rmSync(output, { recursive: true, force: true });
  }
});

test("the workflow runs the gate before upload on pull requests and on main", () => {
  const workflow = fs.readFileSync(path.join(root, ".github/workflows/pages.yml"), "utf8");
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /node scripts\/legal-gate\.js\n/);
  assert.match(workflow, /node scripts\/legal-gate\.js --check-output _site/);
  const config = fs.readFileSync(path.join(root, "eleventy.config.js"), "utf8");
  assert.match(config, /enforceLegalGate/);
  const indexnow = fs.readFileSync(path.join(root, "scripts/ping-indexnow.js"), "utf8");
  assert.match(indexnow, /heldUrlsIn/);
});
