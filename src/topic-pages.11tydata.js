import { fitDescription } from "../lib/seo-text.js";
import { listingRobots, listingSitemapIgnore, siteListingCounts } from "../lib/listing-index.js";

function hubCount(data) {
  const slug = data.topic?.slug;
  if (!slug) return null;
  return siteListingCounts().hubs.get(slug) || 0;
}

export default {
  eleventyComputed: {
    title: (data) => `${data.topic.name} news hub`,
    summary: (data) => data.topic.intro,
    seoTitle: (data) => `${data.topic.name} News Hub — FiscalHour`,
    seoDescription: (data) => fitDescription(data.topic.intro),
    robots(data) {
      const count = hubCount(data);
      return count === null ? undefined : listingRobots(count);
    },
    sitemapIgnore(data) {
      const count = hubCount(data);
      return count === null ? undefined : listingSitemapIgnore(count);
    },
  },
};
