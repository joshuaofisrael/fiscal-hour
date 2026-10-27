import { fitDescription } from "../lib/seo-text.js";
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
  },
};
