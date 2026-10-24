export default {
  eleventyComputed: {
    title(data) {
      return data.tag || "Tag";
    },
    summary(data) {
      return data.tag ? `Stories tagged ${data.tag}.` : "";
    },
  },
};
