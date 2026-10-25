import assert from "node:assert/strict";
import { test } from "node:test";
import site from "../src/_data/site.js";
import faq from "../src/_data/faq.js";
import { buildGraph, organizationSameAs, renderBreadcrumbNav } from "../lib/structured-data.js";

test("NewsArticle publisher is FiscalHour and breadcrumbs escape text", () => {
  const graph = buildGraph(
    {
      kind: "article",
      title: "A sourced headline",
      description: "A dek.",
      category: "Markets",
      tags: ["rates"],
      updatedAt: "2026-10-24",
      page: { url: "/articles/example/", date: new Date("2026-10-24T00:00:00Z") },
    },
    site,
  );
  const article = graph["@graph"].find((node) => node["@type"] === "NewsArticle");
  const crumbs = graph["@graph"].find((node) => node["@type"] === "BreadcrumbList");
  const newsroom = graph["@graph"].find((node) => node["@type"] === "NewsMediaOrganization");
  assert.equal(article.publisher["@id"], newsroom["@id"]);
  assert.equal(newsroom.name, "FiscalHour");
  assert.equal(article.author.name, "FiscalHour");
  assert.equal(article.copyrightHolder.name, "FiscalHour");
  assert.equal(JSON.stringify(graph).includes("Joshua"), false);
  assert.equal(JSON.stringify(graph).includes("Ventures"), false);
  assert.equal(JSON.stringify(graph).includes("PostalAddress"), false);
  assert.equal(article.dateModified, "2026-10-24T00:00:00.000Z");
  assert.match(newsroom.publishingPrinciples, /\/sources-ethics\/$/);
  assert.equal(crumbs.itemListElement[0].name, "Home");
  assert.equal(crumbs.itemListElement[1].name, "Markets");
  assert.equal(crumbs.itemListElement[2].name, "A sourced headline");

  const home = buildGraph({ title: site.name, page: { url: "/" } }, site);
  assert.equal(
    home["@graph"].some((node) => node["@type"] === "NewsArticle"),
    false,
  );
  assert.ok(home["@graph"].some((node) => node["@type"] === "BreadcrumbList"));
  const homeOrg = home["@graph"].find((node) => node["@type"] === "NewsMediaOrganization");
  assert.equal(homeOrg.name, "FiscalHour");
  assert.equal(Object.hasOwn(homeOrg, "sameAs"), false);
  assert.equal(
    home["@graph"].some((node) => node["@type"] === "FAQPage"),
    false,
  );

  const html = renderBreadcrumbNav([
    { name: "Home", url: "https://fiscalhour.com/" },
    { name: "<script>", url: "https://fiscalhour.com/x/" },
  ]);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>/);
});

test("sameAs is omitted until real profile URLs are listed", () => {
  assert.deepEqual(site.sameAs, []);
  assert.deepEqual(organizationSameAs([]), []);
  assert.deepEqual(organizationSameAs(["", "  ", "not-a-url"]), []);
  const withProfiles = buildGraph(
    { kind: "article", title: "A sourced headline", page: { url: "/articles/example/" } },
    { ...site, sameAs: [" https://example.com/fiscalhour ", ""] },
  );
  const org = withProfiles["@graph"].find((node) => node["@type"] === "NewsMediaOrganization");
  assert.deepEqual(org.sameAs, ["https://example.com/fiscalhour"]);
  assert.equal(JSON.stringify(buildGraph({ page: { url: "/about/" } }, site)).includes("sameAs"), false);
});

test("the homepage FAQ matches the visible questions and names no legal entity", () => {
  assert.ok(faq.length >= 5 && faq.length <= 6);
  const graph = buildGraph({ kind: "home", title: site.name, page: { url: "/" } }, site);
  const page = graph["@graph"].find((node) => node["@type"] === "FAQPage");
  assert.equal(page["@id"], "https://fiscalhour.com/#faq");
  assert.deepEqual(
    page.mainEntity.map((item) => item.name),
    faq.map((item) => item.question),
  );
  assert.deepEqual(
    page.mainEntity.map((item) => item.acceptedAnswer.text),
    faq.map((item) => item.answer),
  );
  const text = JSON.stringify(page);
  assert.equal(text.includes("Joshua"), false);
  assert.equal(text.includes("Ventures"), false);
  assert.match(text, /Is FiscalHour investment advice/);
  assert.match(text, /No\. Articles are not investment/);
  assert.equal(
    graph["@graph"].some((node) => node["@type"] === "NewsArticle"),
    false,
  );
});
