export function coerceDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (value && typeof value === "object" && typeof value.toJSDate === "function") {
    const date = value.toJSDate();
    if (date instanceof Date && !Number.isNaN(date.getTime())) return date;
  }
  if (typeof value === "string" && value.trim()) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (match) {
      const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
      return Number.isNaN(date.getTime()) ? null : date;
    }
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

export function toIso(value) {
  const date = coerceDate(value);
  return date ? date.toISOString() : "";
}

export function toW3cDate(value) {
  const iso = toIso(value);
  return iso ? iso.replace(/\.\d{3}Z$/, "Z") : "";
}

export function formatDisplayDate(value) {
  const date = coerceDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function toRfc822(value) {
  const date = coerceDate(value);
  return date ? date.toUTCString() : "";
}

// SCHEDULE_NOW is an ISO timestamp for tests and preview builds.
// Production leaves it unset and uses the clock.
export function scheduleNow(now) {
  if (typeof now === "number" && Number.isFinite(now)) return now;
  if (now instanceof Date && !Number.isNaN(now.getTime())) return now.getTime();
  if (now !== undefined && now !== null && !(typeof now === "string" && now.trim() === "")) {
    const date = coerceDate(now);
    if (date) return date.getTime();
  }
  const override = process.env.SCHEDULE_NOW;
  if (override && String(override).trim()) {
    const date = coerceDate(override);
    if (date) return date.getTime();
  }
  return Date.now();
}

export function isFutureDated(value, now) {
  const date = coerceDate(value);
  if (!date) return false;
  return date.getTime() > scheduleNow(now);
}

export function isFreshNews(value, now) {
  const date = coerceDate(value);
  if (!date) return false;
  const age = scheduleNow(now) - date.getTime();
  return age >= 0 && age <= 2 * 24 * 60 * 60 * 1000;
}
