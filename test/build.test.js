import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import site from "../src/_data/site.js";
import faq from "../src/_data/faq.js";

const root = path.resolve(import.meta.dirname, "..");
const bin = path.join(root, "node_modules", ".bin", "eleventy");
const EV_INDEXNOW_KEY = "e636da750714fc9967b0f4946b707533";
const EV_ADSENSE = "ca-pub-5681559774142917";

function runEleventy(args, env) {
  return spawnSync(bin, args, {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

function read(outputDir, file) {
  return fs.readFileSync(path.join(root, outputDir, file), "utf8");
}

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

function decodeAttr(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

test("production build passes with zero posts and keeps the legal name off the chrome", { timeout: 120000 }, () => {
  const failed = runEleventy(["--output=_site-invalid"], {
    ELEVENTY_ENV: "production",
    POSTS_DIR: "test/fixtures/invalid-posts",
  });
  assert.notEqual(failed.status, 0, failed.stdout + failed.stderr);
  assert.match(`${failed.stdout}\n${failed.stderr}`, /sources/i);

  fs.rmSync(path.join(root, "_site"), { recursive: true, force: true });
  const prod = runEleventy(["--output=_site"], { ELEVENTY_ENV: "production" });
  assert.equal(prod.status, 0, prod.stdout + prod.stderr);

  const home = read("_site", "index.html");
  const robots = read("_site", "robots.txt");
  const sitemap = read("_site", "sitemap.xml");
  const news = read("_site", "news-sitemap.xml");
  const feed = read("_site", "feed.xml");
  const atom = read("_site", "atom.xml");
  const llms = read("_site", "llms.txt");
  const ads = read("_site", "ads.txt");
  const about = read("_site", "about/index.html");
  const contact = read("_site", "contact/index.html");
  const terms = read("_site", "terms/index.html");
  const privacy = read("_site", "privacy/index.html");
  const disclaimer = read("_site", "disclaimer/index.html");
  const copyright = read("_site", "copyright/index.html");
  const advertising = read("_site", "advertising/index.html");
  const corrections = read("_site", "corrections/index.html");
  const ethics = read("_site", "sources-ethics/index.html");
  const markets = read("_site", "category/markets/index.html");

  assert.equal(read("_site", "CNAME").trim(), "fiscalhour.com");
  assert.equal(read("_site", `${site.indexNowKey}.txt`).trim(), site.indexNowKey);
  assert.notEqual(site.indexNowKey, EV_INDEXNOW_KEY);
  assert.equal(fs.readFileSync(path.join(root, "CNAME"), "utf8").trim(), "fiscalhour.com");

  assert.match(home, /No story has been published yet/);
  assert.match(home, /FiscalHour/);
  assert.match(home, /Sourced financial news/);
  assert.match(home, /href="\/category\/markets\/"/);
  assert.match(home, /href="\/category\/personal-finance\/"/);
  assert.match(home, /href="\/contact\/"/);
  assert.match(home, />Contact Us</);
  assert.match(home, /href="\/disclaimer\/"/);
  assert.match(home, /Skip to content/);
  assert.match(home, /lang="en"/);
  assert.match(home, new RegExp(`rel="canonical" href="${site.url}/"`));
  assert.match(home, /name="robots" content="index, follow"/);
  assert.match(home, /property="og:title"/);
  assert.match(home, /name="twitter:card" content="summary"/);
  assert.match(home, /NewsMediaOrganization/);
  assert.match(home, /BreadcrumbList/);
  assert.match(home, /FAQPage/);
  assert.doesNotMatch(home, /"sameAs"/);
  assert.doesNotMatch(home, /NewsArticle/);
  assert.match(home, /id="faq-heading"/);
  assert.ok(faq.length >= 5 && faq.length <= 6);
  for (const item of faq) {
    assert.ok(home.includes(item.question), item.question);
    assert.ok(home.includes(item.answer), item.question);
    assert.doesNotMatch(`${item.question} ${item.answer}`, /Joshua|Ventures/);
  }
  const homeJson = JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const homeFaq = homeJson["@graph"].find((node) => node["@type"] === "FAQPage");
  assert.deepEqual(
    homeFaq.mainEntity.map((item) => item.acceptedAnswer.text),
    faq.map((item) => item.answer),
  );
  assert.equal(Object.hasOwn(homeJson["@graph"].find((node) => node["@type"] === "NewsMediaOrganization"), "sameAs"), false);
  assert.doesNotMatch(home, /Joshua|Ventures|All rights reserved|©/);
  assert.doesNotMatch(home, /adsbygoogle|google-adsense-account/);
  assert.match(home, /pagead2\.googlesyndication\.com/);
  assert.match(home, /static\.cloudflareinsights\.com/);
  assert.match(home, /form-action 'none'/);
  const footer = home.slice(home.indexOf("<footer"));
  assert.doesNotMatch(footer, /©|All rights reserved|Joshua|Ventures/);
  assert.match(footer, /News only, not investment advice/);

  for (const page of [home, about, contact, terms, privacy, disclaimer, copyright, advertising, corrections, ethics, markets]) {
    assert.match(page, /rel="canonical" href="https:\/\/fiscalhour\.com\//);
    assert.match(page, /application\/ld\+json/);
    for (const content of [...page.matchAll(/<meta\s+(?:name="description"|property="og:description"|name="twitter:description")\s+content="([^"]*)"/g)].map(
      (match) => decodeAttr(match[1]),
    )) {
      assert.ok(content.length <= 155, content);
      assert.ok(content.length > 0);
    }
  }

  assert.doesNotMatch(about + corrections + ethics + markets, /Joshua|Ventures/);
  assert.match(ethics, /“X says,” “according to X”/);
  assert.match(ethics, /original/i);
  assert.match(ethics, /brief, and it is attributed/);
  assert.match(ethics, /Opinion, analysis, and speculation are labeled/);
  assert.match(ethics, /AI-generated imagery/);
  assert.match(ethics, /do not recommend buying, selling, or holding/);
  assert.match(disclaimer, /Not investment advice/);
  assert.match(disclaimer, /informational only/i);
  assert.match(disclaimer, /do not publish price predictions, price targets, or buy and sell calls/);
  assert.match(disclaimer, /<h2>AI-generated imagery<\/h2>/);
  assert.match(disclaimer, /do not depict real identifiable people or actual news events/);
  assert.match(privacy, /<h2>Advertising<\/h2>/);
  assert.match(privacy, /policies\.google\.com\/technologies\/ads/);
  assert.match(advertising, /does not load|not loaded|until a publisher id is set/i);

  const legalPages = [
    ["terms/index.html", terms],
    ["privacy/index.html", privacy],
    ["disclaimer/index.html", disclaimer],
    ["copyright/index.html", copyright],
    ["advertising/index.html", advertising],
    ["contact/index.html", contact],
  ];
  for (const [file, html] of legalPages) {
    assert.ok(html.includes(site.legalNotice), file);
  }

  const legalFiles = new Set(legalPages.map(([file]) => path.normalize(path.join(root, "_site", file))));
  const identityHits = [];
  for (const file of walk(path.join(root, "_site"))) {
    if (!/\.(html|xml|txt)$/.test(file)) continue;
    const text = fs.readFileSync(file, "utf8");
    if (/Joshua|Ventures/.test(text) && !legalFiles.has(path.normalize(file))) identityHits.push(path.relative(root, file));
    if (/gmail\.com/i.test(text)) identityHits.push(`gmail in ${path.relative(root, file)}`);
  }
  assert.deepEqual(identityHits, []);

  assert.match(contact, new RegExp(`action="${site.contactFormEndpoint}"`));
  assert.equal(site.contactFormEndpoint, "https://formsubmit.co/REPLACE_WITH_ALIAS");
  assert.match(contact, /name="_honey"/);
  assert.match(contact, /name="_captcha" value="false"/);
  assert.match(contact, /name="_subject"/);
  assert.match(contact, /form-action https:\/\/formsubmit\.co/);
  assert.match(contact, /do not publish a street address/i);
  assert.doesNotMatch(contact, /Suite|P\.O\. Box|streetAddress|gmail\.com/i);
  const thanks = read("_site", "contact/thanks/index.html");
  assert.match(thanks, /noindex, nofollow/);
  assert.doesNotMatch(thanks, /Joshua|Ventures|gmail\.com/i);
  assert.doesNotMatch(sitemap, /contact\/thanks|404\.html/);

  for (const name of site.crawlers) assert.match(robots, new RegExp(`User-agent: ${name}\\nAllow: /`));
  assert.match(robots, /User-agent: \*\nAllow: \//);
  assert.doesNotMatch(robots, /disallow|noai|noimageai|news-sitemap/i);
  assert.match(robots, new RegExp(`Sitemap: ${site.url}/sitemap\\.xml`));
  assert.match(news, /<!-- No articles were published in the last two days. -->/);
  assert.match(news, /xmlns:news="http:\/\/www.google.com\/schemas\/sitemap-news\/0.9"/);
  assert.doesNotMatch(news, /<url>/);
  assert.doesNotMatch(llms, /news-sitemap|Joshua|Ventures/);
  assert.match(llms, /No article has been published yet/);
  assert.match(feed, /<rss version="2.0">/);
  assert.match(atom, /<feed xmlns="http:\/\/www.w3.org\/2005\/Atom">/);
  assert.doesNotMatch(feed + atom, /<item>|<entry>/);
  assert.match(ads, /ads\.txt placeholder/);
  assert.doesNotMatch(ads, /^google\.com,/m);
  assert.doesNotMatch(ads, new RegExp(EV_ADSENSE));
  assert.equal(site.adsenseClient, "");
  assert.match(site.cloudflareAnalyticsToken, /^([0-9a-f]{32})?$/);

  for (const url of [
    `${site.url}/`,
    `${site.url}/about/`,
    `${site.url}/contact/`,
    `${site.url}/terms/`,
    `${site.url}/privacy/`,
    `${site.url}/disclaimer/`,
    `${site.url}/copyright/`,
    `${site.url}/advertising/`,
    `${site.url}/corrections/`,
    `${site.url}/sources-ethics/`,
    `${site.url}/archive/`,
    `${site.url}/category/markets/`,
    `${site.url}/category/economy/`,
    `${site.url}/category/companies/`,
    `${site.url}/category/crypto/`,
    `${site.url}/category/personal-finance/`,
    `${site.url}/ads.txt`,
  ]) {
    assert.ok(sitemap.includes(url), url);
  }
  const sourceHits = [];
  for (const file of walk(root)) {
    if (file.includes(`${path.sep}node_modules${path.sep}`) || file.includes(`${path.sep}_site`) || file.includes(`${path.sep}.git${path.sep}`)) {
      continue;
    }
    if (!/\.(js|njk|md|yml|css|svg|json|txt)$/.test(file) && path.basename(file) !== "CNAME") continue;
    if (/gmail\.com/i.test(fs.readFileSync(file, "utf8"))) sourceHits.push(path.relative(root, file));
  }
  assert.deepEqual(sourceHits, []);
  assert.doesNotMatch(sitemap, /\/articles\//);

  const layout = fs.readFileSync(path.join(root, "src/_includes/layouts/article.njk"), "utf8");
  assert.match(layout, /Not investment advice/);
  assert.match(layout, /\/disclaimer\//);
  assert.match(layout, /Last updated/);
  assert.match(layout, /relatedPosts/);

  const draftPath = path.join(root, "src/content/posts/2026-10-24-layout-check.md");
  fs.writeFileSync(
    draftPath,
    `---
title: "Layout check"
description: "Template check only. This is not a news report."
date: 2026-10-24
updatedAt: 2026-10-24
category: Markets
tags:
  - layout-check
draft: true
hero:
  src: fixture-hero
  alt: "Solid color square used only to check the article template, with no scene and no people"
  width: 8
  height: 8
images:
  - src: fixture-body-a
    alt: "Solid color square used only to check a body image slot, with no scene and no people"
    width: 8
    height: 8
  - src: fixture-body-b
    alt: "Solid color square used only to check a second body image slot, with no scene and no people"
    width: 8
    height: 8
sources:
  - title: "U.S. Securities and Exchange Commission"
    url: "https://www.sec.gov/"
    publisher: "U.S. Securities and Exchange Commission"
    date: 2026-10-24
---

This page checks the article template. It is not a news report.
`,
  );
  try {
    const dev = runEleventy(["--output=_site-dev"], { ELEVENTY_ENV: "development" });
    assert.equal(dev.status, 0, dev.stdout + dev.stderr);
    const article = read("_site-dev", "articles/2026-10-24-layout-check/index.html");
    assert.match(article, /Not investment advice\. <a href="\/disclaimer\/">Read the disclaimer<\/a>/);
    assert.match(article, /Last updated/);
    assert.match(article, /"@type":"NewsArticle"/);
    assert.match(article, /More in <a href="\/category\/markets\/">Markets<\/a>/);
    assert.match(article, /noindex, nofollow/);
    assert.doesNotMatch(article, /Joshua|Ventures/);
    assert.doesNotMatch(article, /<h2 id="related-heading">/);
    assert.equal(fs.existsSync(path.join(root, "_site/articles/2026-10-24-layout-check/index.html")), false);
  } finally {
    fs.rmSync(draftPath, { force: true });
    fs.rmSync(path.join(root, "_site-dev"), { recursive: true, force: true });
    fs.rmSync(path.join(root, "_site-invalid"), { recursive: true, force: true });
  }
});
