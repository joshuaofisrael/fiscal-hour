import { absoluteUrl, pathPrefixFromSiteUrl } from "./site-url.js";
import { toIso } from "./dates.js";
import faq from "../src/_data/faq.js";

function sitePath(siteUrl, pathname) {
  const prefix = pathPrefixFromSiteUrl(siteUrl);
  const clean = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (prefix === "/") return clean;
  if (clean === prefix.slice(0, -1) || clean.startsWith(prefix)) return clean;
  return `${prefix.slice(0, -1)}${clean}`;
}

function newsroomId(site) {
  return absoluteUrl(site.url, "/#newsroom");
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildCrumbs(data, site) {
  const home = sitePath(site.url, "/");
  const pageUrl = data.page?.url || home;
  const crumbs = [{ name: "Home", url: home }];
  if (pageUrl === home) return crumbs;

  if (data.desk?.name && data.desk?.slug) {
    crumbs.push({
      name: data.desk.name,
      url: sitePath(site.url, `/category/${data.desk.slug}/`),
    });
    return crumbs;
  }

  if (data.kind === "article") {
    const desk = site.categories.find((category) => category.name === data.category);
    if (desk) {
      crumbs.push({
        name: desk.name,
        url: sitePath(site.url, `/category/${desk.slug}/`),
      });
    }
    crumbs.push({ name: data.title || "Story", url: pageUrl });
    return crumbs;
  }

  if (data.tag) {
    crumbs.push({ name: String(data.tag), url: pageUrl });
    return crumbs;
  }

  if (data.title) crumbs.push({ name: data.title, url: pageUrl });
  return crumbs;
}

export function renderBreadcrumbNav(crumbs) {
  if (!crumbs || crumbs.length < 2) return "";
  const items = crumbs
    .map((crumb, index) => {
      const name = escapeHtml(crumb.name);
      const last = index === crumbs.length - 1;
      if (last) return `<li aria-current="page">${name}</li>`;
      return `<li><a href="${escapeHtml(crumb.url)}">${name}</a> <span aria-hidden="true">/</span></li>`;
    })
    .join("");
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${items}</ol></nav>`;
}

function logo(site) {
  return {
    "@type": "ImageObject",
    url: absoluteUrl(site.url, "/assets/logo.png"),
    width: 192,
    height: 192,
  };
}

export function organizationSameAs(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item ?? "").trim()).filter((item) => /^https?:\/\/\S+$/i.test(item));
}

function faqEntities(items) {
  return (Array.isArray(items) ? items : [])
    .filter((item) => item && String(item.question ?? "").trim() && String(item.answer ?? "").trim())
    .map((item) => ({
      "@type": "Question",
      name: String(item.question).trim(),
      acceptedAnswer: {
        "@type": "Answer",
        text: String(item.answer).trim(),
      },
    }));
}

export function buildGraph(data, site) {
  const pageUrl = absoluteUrl(site.url, data.page?.url || "/");
  const newsroom = {
    "@type": "NewsMediaOrganization",
    "@id": newsroomId(site),
    name: site.name,
    url: absoluteUrl(site.url, "/"),
    description: site.description,
    publishingPrinciples: absoluteUrl(site.url, "/sources-ethics/"),
    logo: logo(site),
  };
  const sameAs = organizationSameAs(site.sameAs);
  if (sameAs.length) newsroom.sameAs = sameAs;

  const email = String(site.contactEmail ?? "").trim().toLowerCase();
  if (email && !email.endsWith("@example.com") && !email.endsWith("@example.org")) {
    newsroom.contactPoint = {
      "@type": "ContactPoint",
      contactType: "editorial",
      email: site.contactEmail,
      availableLanguage: "English",
    };
  }

  const crumbs = buildCrumbs(data, site);
  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(site.url, crumb.url),
    })),
  };

  const graph = [newsroom, breadcrumb];

  if (data.kind === "home") {
    const mainEntity = faqEntities(faq);
    if (mainEntity.length) {
      graph.push({
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity,
      });
    }
  }

  if (data.kind === "article") {
    const tags = Array.isArray(data.tags) ? data.tags.filter((tag) => tag && tag !== "post") : [];
    const description = data.description || data.summary || "";
    const article = {
      "@type": "NewsArticle",
      "@id": `${pageUrl}#article`,
      mainEntityOfPage: pageUrl,
      headline: data.title,
      description,
      datePublished: toIso(data.page?.date || data.date),
      dateModified: toIso(data.updatedAt || data.updated || data.page?.date || data.date),
      articleSection: data.category,
      inLanguage: "en",
      isAccessibleForFree: true,
      author: {
        "@type": "Organization",
        name: site.author,
        url: absoluteUrl(site.url, "/about/"),
      },
      publisher: {
        "@type": "NewsMediaOrganization",
        "@id": newsroomId(site),
        name: site.name,
        url: absoluteUrl(site.url, "/"),
        logo: logo(site),
      },
      image: data.hero?.src
        ? {
            "@type": "ImageObject",
            url: absoluteUrl(site.url, `/assets/images/${data.hero.src}.webp`),
            width: data.hero.width || 1280,
            height: data.hero.height || 720,
          }
        : logo(site),
      copyrightHolder: {
        "@type": "NewsMediaOrganization",
        name: site.name,
      },
      isPartOf: { "@id": newsroomId(site) },
    };
    if (tags.length) article.keywords = tags.join(", ");
    if (data.draft === true) article.creativeWorkStatus = "Draft";
    graph.push(article);
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export function renderJsonLd(data, site) {
  const json = JSON.stringify(buildGraph(data, site)).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">${json}</script>`;
}
