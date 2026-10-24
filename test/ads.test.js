import assert from "node:assert/strict";
import { test } from "node:test";
import { adsenseEnabled, adsensePublisherId } from "../lib/ads.js";
import { relatedPosts } from "../lib/related.js";

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
