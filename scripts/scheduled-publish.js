// Decides whether the scheduled Pages rebuild should run.
// Stories carry publishAt (or date) as an ISO timestamp. The production
// build omits a story until that time. This script asks for a rebuild
// when a story became due inside the lookback window, so a delayed or
// skipped cron still publishes it on a later run the same day.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { coerceDate, scheduleNow } from "../lib/dates.js";
import { isHeldPost } from "../lib/legal-gate.js";

const SLOT_LOOKBACK_MS = 5 * 60 * 60 * 1000;
const CATCHUP_LOOKBACK_MS = 14 * 60 * 60 * 1000;

export function lookbackMs(now) {
  const hour = new Date(now).getUTCHours();
  return hour >= 21 ? CATCHUP_LOOKBACK_MS : SLOT_LOOKBACK_MS;
}

export function postsDue(posts, now = scheduleNow()) {
  const lookback = lookbackMs(now);
  return (posts || []).filter((post) => {
    if (post.draft || post.held) return false;
    const date = coerceDate(post.date);
    if (!date) return false;
    const stamp = date.getTime();
    return stamp <= now && now - stamp <= lookback;
  });
}

function isDraft(value) {
  return value === true || value === "true" || value === "yes";
}

export function readSchedulePosts(dir = "src/content/posts") {
  const postsDir = path.resolve(dir);
  if (!fs.existsSync(postsDir)) return [];
  return fs
    .readdirSync(postsDir)
    .filter((name) => name.endsWith(".md") && !name.startsWith("_"))
    .sort()
    .map((name) => {
      const filePath = path.join(postsDir, name);
      const parsed = matter(fs.readFileSync(filePath, "utf8"));
      const data = parsed.data || {};
      return {
        file: name.replace(/\.md$/, ""),
        draft: isDraft(data.draft) || data.sample === true,
        held: isHeldPost(filePath),
        date: data.publishAt || data.date,
      };
    });
}

function runCli() {
  const now = scheduleNow();
  const duePosts = postsDue(readSchedulePosts(), now);
  const force = process.env.FORCE === "true";
  const due = force || duePosts.length > 0;
  console.log(`due=${due}`);
  if (duePosts.length) console.log(`slugs=${duePosts.map((post) => post.file).join(",")}`);
  console.error(
    `scheduled publish: ${duePosts.length} due at ${new Date(now).toISOString()} (lookback ${lookbackMs(now) / 3600000}h)${force ? "; force" : ""}`,
  );
}

if (process.argv[1] && process.argv[1].endsWith("scheduled-publish.js")) {
  runCli();
}
