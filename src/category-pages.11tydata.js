export default {
  eleventyComputed: {
    title(data) {
      return data.desk?.name || "Section";
    },
    summary(data) {
      return data.desk?.description || "";
    },
  },
};
