import assert from "node:assert/strict";
import { test } from "node:test";
import site from "../src/_data/site.js";
import { freshNewsPosts, renderNewsSitemap } from "../lib/news-sitemap.js";

const now = Date.parse("2026-10-24T12:00:00Z");

test("the news sitemap lists only articles from the last two days", () => {
  const xml = renderNewsSitemap({
    now,
    site,
    posts: [
      {
        url: "/articles/old/",
        date: "2026-10-01",
        data: { title: "Old story", tags: ["markets"] },
      },
      {
        url: "/articles/fresh/",
        date: "2026-10-23",
        data: { title: "Rates & credit", tags: ["markets"] },
      },
      {
        url: "/articles/tomorrow/",
        date: "2026-10-25",
        data: { title: "Not published yet" },
      },
    ],
  });

  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
  assert.match(xml, /xmlns:news="http:\/\/www.google.com\/schemas\/sitemap-news\/0.9"/);
  assert.match(xml, new RegExp(`<loc>${site.url}/articles/fresh/</loc>`));
  assert.match(xml, new RegExp(`<news:name>${site.name}</news:name>`));
  assert.match(xml, /<news:language>en<\/news:language>/);
  assert.match(xml, /<news:publication_date>2026-10-23T00:00:00Z<\/news:publication_date>/);
  assert.match(xml, /<news:title>Rates &amp; credit<\/news:title>/);
  assert.match(xml, /<news:keywords>markets<\/news:keywords>/);
  assert.doesNotMatch(xml, /Old story|Not published yet/);
  assert.equal(freshNewsPosts([{ date: "2026-10-23" }, { date: "2026-10-01" }], now).length, 1);
});

test("an empty news sitemap stays valid XML and is not a bare urlset", () => {
  const xml = renderNewsSitemap({ posts: [], site, now });
  assert.match(xml, /xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/);
  assert.match(xml, /xmlns:news="http:\/\/www.google.com\/schemas\/sitemap-news\/0.9"/);
  assert.match(xml, /<!-- No articles were published in the last two days. -->/);
  assert.doesNotMatch(xml, /<url>/);
  assert.doesNotMatch(xml, /<news:title>/);
});
