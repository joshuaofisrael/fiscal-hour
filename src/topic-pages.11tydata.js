import { fitDescription } from "../lib/seo-text.js";
export default {
  eleventyComputed: {
    title: (data) => `${data.topic.name} news hub`,
    summary: (data) => data.topic.intro,
    seoTitle: (data) => `${data.topic.name} News Hub — FiscalHour`,
    seoDescription: (data) => fitDescription(data.topic.intro),
  },
};
