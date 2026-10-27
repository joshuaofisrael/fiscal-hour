import assert from "node:assert/strict";
import { test } from "node:test";
import {
  THIN_LISTING_ROBOTS,
  isSitemapEntry,
  isThinListing,
  listingCounts,
  listingRobots,
  listingSitemapIgnore,
} from "../lib/listing-index.js";

const topics = [
  {
    slug: "markets",
    name: "Markets",
    categories: ["Markets"],
    tags: ["stocks"],
    keywords: ["oil"],
  },
  {
    slug: "crypto",
    name: "Crypto",
    categories: ["Crypto"],
    tags: ["crypto"],
    keywords: ["bitcoin"],
  },
];

const posts = [
  { data: { title: "Shares fell", description: "A stocks note", category: "Markets", tags: ["stocks", "post"] } },
  { data: { title: "Oil rose", description: "Brent oil settled higher", category: "Markets", tags: ["stocks", "rare"] } },
  { data: { title: "Token note", description: "One bitcoin mention", category: "Crypto", tags: ["crypto"] } },
  { data: { title: "Draft", description: "Ignored", category: "Markets", tags: ["stocks"], draft: true } },
];

test("tag, category, and topic hubs with fewer than two posts are thin", () => {
  const counts = listingCounts(posts.filter((post) => post.data.draft !== true), topics);
  assert.equal(counts.categories.get("Markets"), 2);
  assert.equal(counts.categories.get("Crypto"), 1);
  assert.equal(counts.tags.get("stocks"), 2);
  assert.equal(counts.tags.get("rare"), 1);
  assert.equal(counts.tags.has("post"), false);
  assert.equal(counts.hubs.get("markets"), 2);
  assert.equal(counts.hubs.get("crypto"), 1);
  assert.equal(isThinListing(0), true);
  assert.equal(isThinListing(1), true);
  assert.equal(isThinListing(2), false);
  assert.equal(listingRobots(1), THIN_LISTING_ROBOTS);
  assert.equal(THIN_LISTING_ROBOTS, "noindex,follow");
  assert.equal(listingRobots(2), undefined);
  assert.equal(listingSitemapIgnore(1), true);
  assert.equal(listingSitemapIgnore(2), undefined);
});

test("thin tag, category, and hub pages stay out of the sitemap", () => {
  const counts = listingCounts(posts.filter((post) => post.data.draft !== true), topics);
  assert.equal(isSitemapEntry({ url: "/tags/rare/", data: { tag: "rare" } }, counts), false);
  assert.equal(isSitemapEntry({ url: "/tags/stocks/", data: { tag: "stocks" } }, counts), true);
  assert.equal(
    isSitemapEntry({ url: "/category/crypto/", data: { desk: { name: "Crypto", slug: "crypto" } } }, counts),
    false,
  );
  assert.equal(
    isSitemapEntry({ url: "/category/markets/", data: { desk: { name: "Markets", slug: "markets" } } }, counts),
    true,
  );
  assert.equal(
    isSitemapEntry({ url: "/topics/crypto/", data: { topic: { slug: "crypto", name: "Crypto" } } }, counts),
    false,
  );
  assert.equal(
    isSitemapEntry({ url: "/topics/markets/", data: { topic: { slug: "markets", name: "Markets" } } }, counts),
    true,
  );
  assert.equal(isSitemapEntry({ url: "/about/", data: {} }, counts), true);
  assert.equal(isSitemapEntry({ url: "/privacy/", data: { sitemapIgnore: true } }, counts), false);
  assert.equal(isSitemapEntry({ url: "/archive/", data: { draft: true } }, counts), false);
  assert.equal(
    isSitemapEntry({ url: "/tags/stocks/", data: { tag: "stocks", robots: "noindex,follow" } }, counts),
    false,
  );
  assert.equal(isSitemapEntry({ data: { tag: "stocks" } }, counts), false);
});
