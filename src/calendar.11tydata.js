export default {
  eleventyComputed: {
    faq(data) {
      return data.releaseCalendar?.faq || [];
    },
  },
};
