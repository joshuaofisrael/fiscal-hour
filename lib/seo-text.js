// Fit generated meta descriptions into the 150–160 character window.
export function fitDescription(text, extras = [" Updated daily.", " New stories added each day.", " Free to read.", " Daily."]) {
  let out = String(text).replace(/\s+/g, " ").trim();
  for (const extra of extras) {
    if (out.length >= 150) break;
    if (out.length + extra.length <= 160) out += extra;
  }
  return out;
}
export function humanize(tag) {
  const s = String(tag || "").replace(/-/g, " ");
  return s.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bUk\b/, "UK");
}
