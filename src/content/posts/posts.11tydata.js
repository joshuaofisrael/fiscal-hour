import site from "../../_data/site.js";
import topics from "../../_data/topics.js";
import { topicsFor } from "../../../lib/topics.js";
import { isDraft } from "../../../lib/validate-posts.js";
import { isHeldPost } from "../../../lib/legal-gate.js";

const includeDrafts = process.env.ELEVENTY_ENV === "development";

function held(data) {
  return Boolean(data.page?.inputPath && isHeldPost(data.page.inputPath));
}

export default {
  layout: "layouts/article.njk",
  kind: "article",
  eleventyComputed: {
    topics(data) {
      return topicsFor(data, topics);
    },
    author() {
      return site.author;
    },
    legalHold(data) {
      return held(data);
    },
    permalink(data) {
      if (isDraft(data.draft) && !includeDrafts) return false;
      if (held(data) && !includeDrafts) return false;
      const file = String(data.page.inputPath).split("/").pop().replace(/\.md$/, "");
      return `/articles/${file}/`;
    },
    eleventyExcludeFromCollections(data) {
      if (isDraft(data.draft) && !includeDrafts) return true;
      if (held(data) && !includeDrafts) return true;
      return false;
    },
  },
};
