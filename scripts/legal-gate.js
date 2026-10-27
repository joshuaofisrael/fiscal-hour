#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {
  DEFAULT_APPROVALS,
  DEFAULT_CLEARANCES,
  DEFAULT_HELD_FILE,
  DEFAULT_POSTS_DIR,
  DEFAULT_PROVENANCE,
  findHeldInOutput,
  gateFailure,
  queueRecord,
  reviewPostsDir,
} from "../lib/legal-gate.js";

function argValue(name) {
  const flag = `--${name}`;
  const inline = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  if (inline) return inline.slice(flag.length + 1);
  const index = process.argv.indexOf(flag);
  if (index !== -1 && process.argv[index + 1] && !process.argv[index + 1].startsWith("--")) {
    return process.argv[index + 1];
  }
  return undefined;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

const postsDir = path.resolve(argValue("posts") || DEFAULT_POSTS_DIR);
const provenancePath = path.resolve(argValue("provenance") || DEFAULT_PROVENANCE);
const approvalsPath = path.resolve(argValue("approvals") || DEFAULT_APPROVALS);
const clearancesPath = path.resolve(argValue("clearances") || DEFAULT_CLEARANCES);
const checkOutput = argValue("check-output");
const heldFile = hasFlag("no-held-file") ? null : path.resolve(argValue("held-file") || DEFAULT_HELD_FILE);
const defaultPosts = path.resolve(postsDir) === path.resolve(DEFAULT_POSTS_DIR);
const writeHeldFile = heldFile && (defaultPosts || argValue("held-file"));

let review;
try {
  review = reviewPostsDir(postsDir, { provenancePath, approvalsPath, clearancesPath });
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const lines = review.holds.map((hold) => JSON.stringify(queueRecord(hold)));
process.stdout.write(lines.length ? `${lines.join("\n")}\n` : "");
if (writeHeldFile) {
  fs.mkdirSync(path.dirname(heldFile), { recursive: true });
  fs.writeFileSync(heldFile, lines.length ? `${lines.join("\n")}\n` : "");
}

for (const hold of review.holds) {
  console.error(`[HOLD_REVIEW] ${hold.slug}: rules [${hold.rules.join(", ")}] -> not rendered`);
}
console.error(
  `LEGAL GATE: ${review.passed.length} passed, ${review.approved.length} approved, ${review.moderateCleared.length} moderate-cleared, ${review.holds.length} held`,
);

let failed = false;
if (checkOutput) {
  const hits = findHeldInOutput(path.resolve(checkOutput), review.holds);
  if (hits.length) {
    const summary = [...new Map(hits.map((hit) => [hit.slug, hit.rules])).entries()];
    console.error(`LEGAL GATE CI FAIL: held content is published: ${JSON.stringify(summary)}`);
    failed = true;
  } else {
    console.error("LEGAL GATE CI OK");
  }
}

const unmarked = gateFailure(review);
if (unmarked) {
  console.error(unmarked);
  failed = true;
}

process.exit(failed ? 1 : 0);
