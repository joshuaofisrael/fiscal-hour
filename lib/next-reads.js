import fs from "node:fs";
import path from "node:path";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rootPath(pathPrefix, urlPath) {
  if (!pathPrefix || pathPrefix === "/") return urlPath;
  const base = pathPrefix.endsWith("/") ? pathPrefix.slice(0, -1) : pathPrefix;
  return `${base}${urlPath}`;
}

function thumbSrc(src) {
  const name = String(src ?? "").trim();
  if (!/^[a-z0-9-]+$/.test(name)) return "";
  const thumb = path.join("src/assets/images/thumbs", `${name}-640.webp`);
  if (fs.existsSync(thumb)) return `/assets/images/thumbs/${name}-640.webp`;
  const full = path.join("src/assets/images", `${name}.webp`);
  if (fs.existsSync(full)) return `/assets/images/${name}.webp`;
  return "";
}

export function asReads(posts) {
  return (posts || [])
    .map((post) => ({
      url: post?.url || "",
      title: post?.data?.title || post?.title || "",
      src: post?.data?.hero?.src || post?.src || "",
      alt: post?.data?.hero?.alt || post?.alt || "",
    }))
    .filter((item) => item.url && item.title);
}

export function renderNextReads(reads, pathPrefix = "/", { heading = "Keep reading", id = "" } = {}) {
  const items = (reads || []).filter((item) => item?.url && item?.title).slice(0, 4);
  if (!items.length) return "";
  const headingId = id ? ` id="${escapeHtml(id)}"` : "";
  const cards = items
    .map((item) => {
      const imagePath = thumbSrc(item.src);
      const image = imagePath
        ? `<img src="${escapeHtml(rootPath(pathPrefix, imagePath))}" alt="" width="160" height="90" loading="lazy" decoding="async">`
        : "";
      const policy = image
        ? `<a class="next-read-source" href="${escapeHtml(rootPath(pathPrefix, "/image-policy/"))}">AI-generated</a>`
        : "";
      return `<li>
      <a class="next-read" href="${escapeHtml(item.url)}">${image}<span>${escapeHtml(item.title)}</span></a>
      ${policy}
    </li>`;
    })
    .join("");
  return `<aside class="next-reads" aria-label="${escapeHtml(heading)}">
    <h2${headingId}>${escapeHtml(heading)}</h2>
    <ul>${cards}</ul>
  </aside>`;
}

export function insertReadNext(html, reads, pathPrefix = "/") {
  const block = renderNextReads(reads, pathPrefix, { heading: "Background", id: "background-heading" });
  if (!block) return String(html || "");
  const source = String(html || "");
  const chunks = source.split(/(<\/p>)/i);
  let paragraph = 0;
  let total = 0;
  for (const chunk of chunks) {
    if (/^<\/p>$/i.test(chunk)) total += 1;
  }
  const target = total >= 3 ? 3 : Math.max(total, 1);
  let out = "";
  let placed = false;
  for (const chunk of chunks) {
    out += chunk;
    if (!/^<\/p>$/i.test(chunk)) continue;
    paragraph += 1;
    if (!placed && paragraph === target) {
      out += block;
      placed = true;
    }
  }
  return placed ? out : `${source}${block}`;
}
