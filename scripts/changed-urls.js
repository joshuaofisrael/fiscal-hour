// Prints the site URLs touched between two commits, one per line.
// New or edited posts -> their article URLs plus the listing pages that show
// them. Any template, data or lib change -> every URL in the sitemap.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import site from "../src/_data/site.js";
import topics from "../src/_data/topics.js";
import { urlsFromSitemap } from "../lib/indexnow.js";
import { heldUrlsIn, isHeldPost } from "../lib/legal-gate.js";

const [base, head = "HEAD"] = process.argv.slice(2);
const all = urlsFromSitemap(fs.readFileSync("_site/sitemap.xml", "utf8"));
let files = [];
try {
  files = execFileSync("git", ["diff", "--name-only", base, head], { encoding: "utf8" }).split("\n").filter(Boolean);
} catch {
  console.log(all.join("\n"));
  process.exit(0);
}
const root = site.url.replace(/\/$/, "");
const posts = files.filter((f) => /^src\/content\/posts\/[^/]+\.md$/.test(f) && !isHeldPost(f));
const siteWide = files.some((f) => /^(src\/(?!content\/posts\/)|lib\/|eleventy\.config)/.test(f));
let urls = siteWide
  ? all
  : posts.length
    ? [
        ...posts.map((f) => `${root}/articles/${f.split("/").pop().replace(/\.md$/, "")}/`),
        `${root}/`,
        `${root}/archive/`,
        ...topics.map((t) => `${root}/topics/${t.slug}/`),
        ...site.categories.map((c) => `${root}/category/${c.slug}/`),
      ]
    : [];
const live = new Set(all);
const liveUrls = [...new Set(urls)].filter((u) => live.has(u));
const blocked = new Set(heldUrlsIn(liveUrls));
console.log(liveUrls.filter((u) => !blocked.has(u)).join("\n"));
