export function relatedPosts(posts, current, limit = 3) {
  const pageUrl = current?.url || current?.page?.url || "";
  const category = current?.category || "";
  const tags = new Set(
    (current?.tags || []).filter((tag) => typeof tag === "string" && tag.trim() && tag !== "post"),
  );
  return (posts || [])
    .filter((post) => post?.url && post.url !== pageUrl && post.data?.draft !== true && post.data?.sample !== true)
    .map((post) => {
      const shared = (post.data?.tags || []).filter((tag) => tags.has(tag)).length;
      const sameCategory = post.data?.category && post.data.category === category ? 2 : 0;
      return { post, score: shared + sameCategory };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.post.date) - new Date(a.post.date);
    })
    .slice(0, limit)
    .map((item) => item.post);
}
