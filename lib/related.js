export function relatedPosts(posts, current, limit = 3) {
  const pageUrl = current?.url || current?.page?.url || "";
  const category = current?.category || "";
  const tags = new Set(
    (current?.tags || []).filter((tag) => typeof tag === "string" && tag.trim() && tag !== "post"),
  );
  const topics = new Set(current?.topics || []);
  return (posts || [])
    .filter((post) => post?.url && post.url !== pageUrl && post.data?.draft !== true && post.data?.sample !== true)
    .map((post) => {
      const shared = (post.data?.tags || []).filter((tag) => tags.has(tag)).length;
      const sameCategory = post.data?.category && post.data.category === category ? 2 : 0;
      const sharedTopics = (post.data?.topics || []).filter((t) => topics.has(t)).length;
      return { post, score: shared + sameCategory + sharedTopics };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.post.date) - new Date(a.post.date);
    })
    .slice(0, limit)
    .map((item) => item.post);
}

// Ranked same-topic matches first; if fewer than `limit` share a section or
// tag, top up with the newest other stories so every article links onward.
export function relatedStories(posts, current, limit = 3) {
  const picked = relatedPosts(posts, current, limit);
  if (picked.length >= limit) return picked;
  const pageUrl = current?.url || current?.page?.url || "";
  const seen = new Set(picked.map((post) => post.url));
  const rest = (posts || [])
    .filter((post) => post?.url && post.url !== pageUrl && !seen.has(post.url) && post.data?.draft !== true && post.data?.sample !== true)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return [...picked, ...rest].slice(0, limit);
}
