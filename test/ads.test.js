import assert from "node:assert/strict";
import { test } from "node:test";
import { adsenseEnabled, adsensePublisherId } from "../lib/ads.js";
import { coveragePlan, relatedPosts } from "../lib/related.js";

test("AdSense stays off until the publisher id is a real client id", () => {
  assert.equal(adsensePublisherId(""), "");
  assert.equal(adsensePublisherId("pub-5681559774142917"), "");
  assert.equal(adsenseEnabled("ca-pub-not-a-number"), false);
  assert.equal(adsensePublisherId("ca-pub-12345678"), "pub-12345678");
  assert.equal(adsenseEnabled("ca-pub-12345678"), true);
});

test("related stories share a section or a tag and skip the current page", () => {
  const posts = [
    { url: "/articles/a/", date: "2026-10-24", data: { title: "A", category: "Markets", tags: ["rates"], draft: false } },
    { url: "/articles/b/", date: "2026-10-23", data: { title: "B", category: "Markets", tags: ["credit"], draft: false } },
    { url: "/articles/c/", date: "2026-10-22", data: { title: "C", category: "Crypto", tags: ["rates"], draft: false } },
    { url: "/articles/d/", date: "2026-10-21", data: { title: "D", category: "Economy", tags: ["jobs"], draft: false } },
    { url: "/articles/e/", date: "2026-10-20", data: { title: "E", category: "Markets", tags: ["rates"], draft: true } },
  ];
  const related = relatedPosts(posts, { url: "/articles/a/", category: "Markets", tags: ["rates"] });
  assert.deepEqual(
    related.map((post) => post.url),
    ["/articles/b/", "/articles/c/"],
  );
});

test("coverage splits earlier and later stories that share a tag", () => {
  const posts = [
    { url: "/articles/old/", date: "2026-11-01", data: { title: "Old rate note", category: "Economy", tags: ["rates"], hero: { src: "a" } } },
    { url: "/articles/mid/", date: "2026-11-10", data: { title: "Middle", category: "Economy", tags: ["rates"] } },
    { url: "/articles/next/", date: "2026-11-20", data: { title: "Later rate note", category: "Markets", tags: ["rates"], hero: { src: "b" } } },
    { url: "/articles/other/", date: "2026-11-21", data: { title: "Unrelated", category: "Economy", tags: ["oil"] } },
  ];
  const plan = coveragePlan(posts, {
    url: "/articles/mid/",
    date: "2026-11-10",
    category: "Economy",
    tags: ["rates"],
    background: ["/articles/old/"],
  });
  assert.equal(plan.midHeading, "Background");
  assert.equal(plan.mid[0].url, "/articles/old/");
  assert.equal(plan.followUp[0].url, "/articles/next/");
  assert.equal(plan.followUp.some((post) => post.url === "/articles/other/"), false);
  assert.equal(plan.end.some((post) => post.url === "/articles/old/"), false);
});
