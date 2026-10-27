import { fitDescription } from "../lib/seo-text.js";
import { listingRobots, listingSitemapIgnore, siteListingCounts } from "../lib/listing-index.js";

function categoryCount(data) {
  const name = data.desk?.name;
  if (!name) return null;
  return siteListingCounts().categories.get(name) || 0;
}

export default {
  eleventyComputed: {
    title(data) {
      return data.desk?.name || "Section";
    },
    seoTitle(data) {
      return data.desk ? `${data.desk.name} Section: Latest Stories — FiscalHour` : undefined;
    },
    summary(data) {
      return data.desk?.description || "";
    },
    seoDescription(data) {
      if (!data.desk) return undefined;
      return fitDescription(`The FiscalHour ${data.desk.name} section. ${data.desk.description} Every story links its sources. News only, not investment advice.`);
    },
    robots(data) {
      const count = categoryCount(data);
      return count === null ? undefined : listingRobots(count);
    },
    sitemapIgnore(data) {
      const count = categoryCount(data);
      return count === null ? undefined : listingSitemapIgnore(count);
    },
  },
};
