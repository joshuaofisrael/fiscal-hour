import { fitDescription, humanize } from "../lib/seo-text.js";
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
  },
};
