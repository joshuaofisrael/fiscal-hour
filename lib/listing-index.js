import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { topicsFor } from "./topics.js";
import topicDefs from "../src/_data/topics.js";
import { isHeldPost } from "./legal-gate.js";

export const MIN_INDEXABLE_LISTING_POSTS = 2;
export const THIN_LISTING_ROBOTS = "noindex,follow";

const postsDir = path.resolve(import.meta.dirname, "../src/content/posts");

export function readPublishedPosts(dir = postsDir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".md") && !name.startsWith("_"))
    .map((name) => {
      const filePath = path.join(dir, name);
      const parsed = matter(fs.readFileSync(filePath, "utf8"));
      return { file: name.replace(/\.md$/, ""), data: parsed.data, filePath };
    })
    .filter((post) => post.data.draft !== true && post.data.sample !== true && !isHeldPost(post.filePath))
    .map(({ file, data }) => ({ file, data }));
}

export function listingCounts(posts, topics = topicDefs) {
  const tags = new Map();
  const categories = new Map();
  const hubs = new Map();
  for (const topic of topics || []) hubs.set(topic.slug, 0);

  for (const post of posts || []) {
    const data = post.data || post;
    for (const tag of data.tags || []) {
      if (typeof tag !== "string") continue;
      const key = tag.trim();
      if (!key || key === "post") continue;
      tags.set(key, (tags.get(key) || 0) + 1);
    }
    if (typeof data.category === "string" && data.category.trim()) {
      const category = data.category.trim();
      categories.set(category, (categories.get(category) || 0) + 1);
    }
    for (const slug of topicsFor(data, topics || [])) {
      hubs.set(slug, (hubs.get(slug) || 0) + 1);
    }
  }

  return { tags, categories, hubs };
}

export function isThinListing(count) {
  return Number(count) < MIN_INDEXABLE_LISTING_POSTS;
}

export function listingRobots(count) {
  return isThinListing(count) ? THIN_LISTING_ROBOTS : undefined;
}

export function listingSitemapIgnore(count) {
  return isThinListing(count) ? true : undefined;
}

let cachedCounts;

export function siteListingCounts() {
  if (!cachedCounts) cachedCounts = listingCounts(readPublishedPosts());
  return cachedCounts;
}

export function clearListingCountCache() {
  cachedCounts = undefined;
}

function listingPostCount(data, counts) {
  if (!data || typeof data !== "object") return null;
  if (typeof data.tag === "string" && data.tag && !data.desk && !data.topic) {
    return counts.tags.get(data.tag) || 0;
  }
  if (data.desk?.name && !data.topic) {
    return counts.categories.get(data.desk.name) || 0;
  }
  if (data.topic?.slug) {
    return counts.hubs.get(data.topic.slug) || 0;
  }
  return null;
}

export function isSitemapEntry(item, counts = siteListingCounts()) {
  if (!item?.url) return false;
  const data = item.data || {};
  if (data.draft === true || data.sitemapIgnore === true || data.sample === true) return false;
  if (item.inputPath && isHeldPost(item.inputPath)) return false;
  if (data.robots === THIN_LISTING_ROBOTS) return false;
  const count = listingPostCount(data, counts);
  if (count !== null && isThinListing(count)) return false;
  return true;
}
