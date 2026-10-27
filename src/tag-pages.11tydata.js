import { fitDescription, humanize } from "../lib/seo-text.js";
import { listingRobots, listingSitemapIgnore, siteListingCounts } from "../lib/listing-index.js";

function tagCount(data) {
  if (!data.tag) return null;
  return siteListingCounts().tags.get(data.tag) || 0;
}

export default {
  eleventyComputed: {
    title(data) {
      return data.tag || "Tag";
    },
    seoTitle(data) {
      return data.tag ? `${humanize(data.tag)} News — FiscalHour` : undefined;
    },
    summary(data) {
      return data.tag ? `Stories tagged ${data.tag}.` : "";
    },
    seoDescription(data) {
      if (!data.tag) return undefined;
      return fitDescription(`FiscalHour coverage tagged ${humanize(data.tag)}: news reports with linked, named sources, original wording and plain context. News only, not investment advice.`);
    },
    robots(data) {
      const count = tagCount(data);
      return count === null ? undefined : listingRobots(count);
    },
    sitemapIgnore(data) {
      const count = tagCount(data);
      return count === null ? undefined : listingSitemapIgnore(count);
    },
  },
};
