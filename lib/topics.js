export function topicsFor(data, topics) {
  const tags = new Set((data?.tags || []).map((t) => String(t).toLowerCase()));
  const text = `${data?.title || ""} ${data?.description || ""}`.toLowerCase();
  return topics
    .filter((t) => t.categories.includes(data?.category) || t.tags.some((tag) => tags.has(tag)) || t.keywords.some((k) => text.includes(k)))
    .map((t) => t.slug);
}
