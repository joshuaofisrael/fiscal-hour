import { coerceDate } from "./dates.js";

function postTime(post) {
  const raw = post?.data?.publishAt || post?.data?.date || post?.date;
  const date = coerceDate(raw);
  return date ? date.getTime() : NaN;
}

function resolvePinned(posts, urls) {
  const byUrl = new Map((posts || []).filter((post) => post?.url).map((post) => [post.url, post]));
  const picked = [];
  const seen = new Set();
  for (const url of urls || []) {
    const key = String(url ?? "").trim();
    const post = byUrl.get(key);
    if (!post || seen.has(post.url)) continue;
    seen.add(post.url);
    picked.push(post);
  }
  return picked;
}

function taggedPeers(posts, current, limit = 24) {
  const pageUrl = current?.url || current?.page?.url || "";
  const tags = new Set(
    (current?.tags || []).filter((tag) => typeof tag === "string" && tag.trim() && tag !== "post"),
  );
  if (!tags.size) return [];
  return (posts || [])
    .filter((post) => post?.url && post.url !== pageUrl && post.data?.draft !== true && post.data?.sample !== true)
    .map((post) => ({
      post,
      shared: (post.data?.tags || []).filter((tag) => tags.has(tag)).length,
    }))
    .filter((item) => item.shared > 0)
    .sort((a, b) => {
      if (b.shared !== a.shared) return b.shared - a.shared;
      return postTime(b.post) - postTime(a.post);
    })
    .slice(0, limit)
    .map((item) => item.post);
}

// Earlier same-thread stories are "Background". Later ones are "What happened
// next". A shared tag is required, so a mere category match is not described
// as earlier coverage. Front matter `background` and `followUp` are pinned first.
export function coveragePlan(posts, current, limit = 4) {
  const pageUrl = current?.url || current?.page?.url || "";
  const when = postTime({ data: current, date: current?.date });
  const pinnedBackground = resolvePinned(posts, current?.background);
  const pinnedFollow = resolvePinned(posts, current?.followUp);
  const pinned = new Set([...pinnedBackground, ...pinnedFollow].map((post) => post.url));
  const peers = taggedPeers(posts, current, 24).filter((post) => !pinned.has(post.url));
  const earlier = [];
  const later = [];
  for (const post of peers) {
    const time = postTime(post);
    if (!Number.isFinite(time) || !Number.isFinite(when) || time === when) continue;
    if (time < when) earlier.push(post);
    else later.push(post);
  }
  later.sort((a, b) => postTime(a) - postTime(b));
  const background = [...pinnedBackground, ...earlier].slice(0, limit);
  const followUp = [...pinnedFollow, ...later].slice(0, limit);
  const shown = new Set([...background, ...followUp].map((post) => post.url));
  let end = relatedStories(posts, current, 12).filter((post) => post.url !== pageUrl && !shown.has(post.url));
  if (end.length < limit) {
    const seen = new Set(end.map((post) => post.url));
    const rest = (posts || [])
      .filter((post) => post?.url && post.url !== pageUrl && !shown.has(post.url) && !seen.has(post.url) && post.data?.draft !== true && post.data?.sample !== true)
      .sort((a, b) => postTime(b) - postTime(a));
    end = [...end, ...rest];
  }
  let mid = background;
  let midHeading = "Background";
  let followBlock = followUp;
  if (!mid.length && followUp.length) {
    mid = followUp;
    midHeading = "What happened next";
    followBlock = [];
  } else if (!mid.length) {
    mid = end.slice(0, limit);
    midHeading = "Keep reading";
    const midUrls = new Set(mid.map((post) => post.url));
    end = end.filter((post) => !midUrls.has(post.url));
    followBlock = [];
  }
  return {
    mid,
    midHeading,
    followUp: followBlock,
    end: end.slice(0, limit),
  };
}

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
