const CLIENT_RE = /^ca-pub-\d{8,}$/;

export function adsensePublisherId(client) {
  const value = String(client ?? "").trim();
  if (!CLIENT_RE.test(value)) return "";
  return value.replace(/^ca-/, "");
}

export function adsenseEnabled(client) {
  return adsensePublisherId(client) !== "";
}
