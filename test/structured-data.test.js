import assert from "node:assert/strict";
import { test } from "node:test";
import site from "../src/_data/site.js";
import { buildGraph, renderBreadcrumbNav } from "../lib/structured-data.js";

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
  assert.equal(home["@graph"].find((node) => node["@type"] === "NewsMediaOrganization").name, "FiscalHour");

  const html = renderBreadcrumbNav([
    { name: "Home", url: "https://fiscalhour.com/" },
    { name: "<script>", url: "https://fiscalhour.com/x/" },
  ]);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>/);
});
