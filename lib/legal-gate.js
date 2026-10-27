import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import site from "../src/_data/site.js";

function isDraft(value) {
  return value === true || value === "true" || value === "yes";
}

export const SITE_ID = new URL(site.url).hostname;
export const BOT_NAME = "Financial News Bot";

export const DEFAULT_POSTS_DIR = path.resolve("src/content/posts");
export const DEFAULT_PROVENANCE = path.resolve("content/image-provenance.json");
export const DEFAULT_APPROVALS = path.resolve("content-review/approvals.jsonl");
export const DEFAULT_CLEARANCES = path.resolve("content-review/moderate-clearances.jsonl");
export const DEFAULT_HELD_FILE = path.resolve("content-review/held.jsonl");

const HIGH_RULES = new Set([1, 2, 6, 8]);

const ALLEGATIONS = [
  [/(?<!anti-)(?<!anti\s)\bfraud(?:ulent(?:ly)?)?\b/i, "fraud"],
  [/\baccused\b/i, "accused"],
  [/\bcharged with\b/i, "charged with"],
  [/\blawsuit alleges\b/i, "lawsuit alleges"],
  [/\bmisconduct\b/i, "misconduct"],
  [/(?<!anti-)(?<!anti\s)\bcorrupt(?:ion|ed)?\b/i, "corruption"],
  [/\bembezzl(?:e|ed|ing|ement)\b/i, "embezzlement"],
  [/\bbrib(?:e|ery|ed|ing)\b/i, "bribery"],
  [/\bmoney laundering\b/i, "money laundering"],
  [/\binsider trading\b/i, "insider trading"],
  [/\bindict(?:ed|ment)\b/i, "indictment"],
  [/\bconvicted of\b/i, "convicted of"],
  [/\barrested for\b/i, "arrested for"],
  [/\bperjury\b/i, "perjury"],
  [/\bracketeer(?:ing)?\b/i, "racketeering"],
  [/\bponzi\b/i, "ponzi"],
  [/\balleg(?:e|es|ed|edly|ing|ation|ations)\b/i, "allegation"],
];

const SENSITIVE = [
  [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, "email"],
  [/(?:\+\d{1,3}[\s.-])?(?:\(?\d{3}\)?[\s.-])\d{3}[\s.-]\d{4}\b/, "phone"],
  [/\b\d{3}-\d{2}-\d{4}\b/, "ssn"],
  [
    /\b\d{1,6}\s+(?:[A-Z][A-Za-z0-9'-]*\s+){1,4}(?:Street|Avenue|Road|Boulevard|Lane|Drive|Court|Place|Terrace|Way)\b/,
    "street address",
  ],
  [
    /\b\d{1,6}\s+(?:[A-Z][A-Za-z0-9'-]*\s+){1,4}(?:St|Ave|Rd|Blvd|Ln|Dr|Ct|Pl)\.?(?:,|\s+\d{5}\b)/,
    "street address",
  ],
];

const ADVICE = [
  [/\bguaranteed (?:returns|profits?|gains|yields?|income|payouts?)\b/i, "guaranteed return"],
  [/\bguarantee of (?:a )?(?:profit|return|gain)s?\b/i, "guaranteed return"],
  [/\byou should(?!\s+not\b)(?:\s+\w+){0,3}\s+(?:buy|sell|short|invest)\b/i, "personalised advice"],
  [/\binvestors should(?!\s+not\b)\s+(?:buy|sell|hold|own|short)\b/i, "personalised advice"],
  [/\b(?:i|we) recommend (?:buying|selling)\b/i, "personalised advice"],
  [/\bprice targets?\b/i, "price target"],
  [/\b(?:our|my) target price\b/i, "price target"],
  [/\bpersonalised (?:financial |investment |tax |legal |medical )?advice\b/i, "personalised advice"],
  [/\bpersonalized (?:financial |investment |tax |legal |medical )?advice\b/i, "personalised advice"],
];

const LOGISTICS = [
  [/\bpolling places?\b/i, "polling place"],
  [/\bpolling locations?\b/i, "polling location"],
  [/\bpolling stations?\b/i, "polling station"],
  [/\bwhere to vote\b/i, "where to vote"],
  [/\bhow to vote\b/i, "how to vote"],
  [/\bvoter registration\b/i, "voter registration"],
  [/\bregistration deadline\b/i, "registration deadline"],
  [/\bregister to vote\b/i, "register to vote"],
  [/\beligib(?:le|ility) to vote\b/i, "eligibility"],
  [/\babsentee ballots?\b/i, "absentee ballot"],
  [/\bballot drops?\b/i, "ballot drop"],
  [/\bpolls? opens?\b/i, "polls open"],
  [/\bpolls? closes?\b/i, "polls close"],
  [/\bvoting hours\b/i, "voting hours"],
  [/\bpolling hours\b/i, "polling hours"],
  [/\bextension of polling\b/i, "extension of polling"],
  [/\bstations to stay open\b/i, "stations to stay open"],
  [/\bprecincts?\b/i, "precinct"],
];

const FINAL_RESULTS = [
  [/\bfinal (?:count|tally|results)\b/i, "final result"],
  [/\bcertified (?:results|winner|election|victory|tally|count)\b/i, "certified result"],
  [/\bofficial results\b/i, "official results"],
  [/\bofficial winner\b/i, "official winner"],
];

const OVERCLAIM = [
  [/\bbombshell\b/i, "bombshell"],
  [/\bshocking\b/i, "shocking"],
  [/\byou won'?t believe\b/i, "you won't believe"],
  [/\bexplosive\b/i, "explosive"],
  [/\bscandal\b/i, "scandal"],
  [/\bmust[- ]buy\b/i, "must-buy"],
  [/\bslam[- ]dunk\b/i, "slam dunk"],
  [/\bexposed\b/i, "exposed"],
  [/\bsecrets?\b/i, "secret"],
  [/\burgent\b/i, "urgent"],
  [/\bunbelievable\b/i, "unbelievable"],
  [/\bdestroys?\b/i, "destroys"],
  [/\bcrushed\b/i, "crushed"],
  [/\bbreaking\b/i, "breaking"],
  [/\bexclusive\b/i, "exclusive"],
  [/\bguaranteed\b/i, "guaranteed"],
  [/\bact now\b/i, "act now"],
  [/\bcan'?t[- ]miss\b/i, "can't miss"],
];

const LEGAL_MARKERS = [
  [/\bunder embargo\b/i, "embargo"],
  [/\bembargoed\b/i, "embargo"],
  [/\bnews embargo\b/i, "embargo"],
  [/\blegal notice\b/i, "legal notice"],
  [/\bcease[- ]and[- ]desist\b/i, "cease and desist"],
  [/\brights? complaint\b/i, "rights complaint"],
  [/\bcorrection request\b/i, "correction request"],
  [/\bnot for publication\b/i, "not for publication"],
  [/\breporting restriction\b/i, "reporting restriction"],
  [/\btakedown(?: notice| request)?\b/i, "takedown"],
  [/\bdo not publish\b/i, "do not publish"],
  [/\bdo not distribute\b/i, "do not distribute"],
  [/\bpublication ban\b/i, "publication ban"],
];

const SUGGESTIONS = {
  1: "Hold for Joshua. Do not soften or rephrase the allegation to get past the gate.",
  2: "Remove the private contact detail, address, or number. Joshua has to approve the exact file that remains.",
  3: "Add a licence record for the image in content/image-provenance.json, or mark the image optional and drop it.",
  4: "Add at least one http(s) source URL for a page that was actually opened.",
  5: "Remove the personalised advice, promised return, or price-target call. Sourced reporting of what a company or market did can stay.",
  6: "This is election logistics or an uncertified final result. Joshua has to approve the exact file. A moderate clearance cannot clear it.",
  7: "Tone the headline down so it is no stronger than the sourced facts.",
  8: "Stop. This looks like a legal notice, embargo, or correction demand. Joshua has to see it. A moderate clearance cannot clear it.",
};

const ELECTION_AUTHORITY_HOSTS = [
  /(^|\.)fec\.gov$/i,
  /(^|\.)eac\.gov$/i,
  /(^|\.)tse\.jus\.br$/i,
  /(^|\.)justicaeleitoral\.jus\.br$/i,
  /(^|\.)electoralcommission\.org\.uk$/i,
  /(^|\.)elections\.ca$/i,
  /(^|\.)aec\.gov\.au$/i,
];

let cachedReview = null;
let cachedProvenance = null;

export function clearLegalGateCache() {
  cachedReview = null;
  cachedProvenance = null;
}

export function sha256File(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

export function readJsonl(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return [];
  const lines = fs.readFileSync(filePath, "utf8").split(/\n/);
  const records = [];
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
      records.push(JSON.parse(trimmed));
    } catch (error) {
      throw new Error(`LEGAL GATE: ${filePath}:${index + 1} is not valid JSON. Refusing to build.`);
    }
  });
  return records;
}

export function isSafeVerdict(value) {
  const text = String(value ?? "").trim();
  if (!/^SAFE(?:$|[\s:—–-])/i.test(text)) return false;
  if (/\b(UNSAFE|UNSURE|ESCALAT)/i.test(text)) return false;
  return true;
}

export function isElectionAuthorityUrl(url) {
  let host = "";
  try {
    host = new URL(String(url)).hostname.toLowerCase();
  } catch {
    return false;
  }
  if (!host) return false;
  if (ELECTION_AUTHORITY_HOSTS.some((pattern) => pattern.test(host))) return true;
  if (
    (host.endsWith(".gov") || host.endsWith(".gov.uk") || host.endsWith(".jus.br")) &&
    host.includes("election")
  ) {
    return true;
  }
  return false;
}

function excerptAround(text, index, length) {
  const start = Math.max(0, index - 48);
  const end = Math.min(text.length, index + length + 48);
  let slice = text.slice(start, end).replace(/\s+/g, " ").trim();
  if (start > 0) slice = `…${slice}`;
  if (end < text.length) slice = `${slice}…`;
  return slice;
}

function stripUrls(text) {
  return String(text ?? "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/[^\s)>\]]+/gi, " ");
}

function pushMatches(flags, rule, tier, field, text, patterns, extra = {}) {
  const source = String(text ?? "");
  if (!source.trim()) return;
  for (const [pattern, label] of patterns) {
    const match = pattern.exec(source);
    if (!match) continue;
    flags.push({
      rule,
      tier,
      field,
      label,
      logistics: Boolean(extra.logistics),
      excerpt: excerptAround(source, match.index, match[0].length),
    });
  }
}

function describesElectionResult(text) {
  return /\b(runoff|polling|ballot|presidential|electoral)\b/i.test(String(text ?? ""));
}

function isHeadlineField(field) {
  return field === "title" || field === "seoTitle";
}

export function flagsInText(text, field = "body") {
  const flags = [];
  const value = String(text ?? "");
  pushMatches(flags, 1, "HIGH", field, value, ALLEGATIONS);
  pushMatches(flags, 2, "HIGH", field, value, SENSITIVE);
  pushMatches(flags, 5, "MODERATE", field, value, ADVICE);
  pushMatches(flags, 6, "HIGH", field, value, LOGISTICS, { logistics: true });
  if (describesElectionResult(value)) {
    pushMatches(flags, 6, "HIGH", field, value, FINAL_RESULTS, { logistics: false });
  }
  pushMatches(flags, 8, "HIGH", field, value, LEGAL_MARKERS);
  if (isHeadlineField(field)) pushMatches(flags, 7, "MODERATE", field, value, OVERCLAIM);
  return flags;
}

function storyFields(data, content) {
  const fields = [
    ["title", data?.title],
    ["seoTitle", data?.seoTitle],
    ["description", data?.description],
    ["seoDescription", data?.seoDescription],
    ["summary", data?.summary],
    ["body", stripUrls(content)],
  ];
  for (const image of imageRefs(data)) {
    if (image.alt) fields.push([`${image.role} alt`, image.alt]);
    if (image.caption) fields.push([`${image.role} caption`, image.caption]);
  }
  if (Array.isArray(data?.sources)) {
    data.sources.forEach((source, index) => {
      if (source?.title) fields.push([`sources[${index}].title`, source.title]);
    });
  }
  return fields;
}

function isOptionalImage(image) {
  return image?.optional === true || image?.optional === "true" || image?.optional === "yes";
}

function imageRefs(data) {
  const refs = [];
  if (data?.hero && typeof data.hero === "object" && !Array.isArray(data.hero)) {
    refs.push({
      src: String(data.hero.src ?? "").trim(),
      role: "hero",
      optional: isOptionalImage(data.hero),
      alt: data.hero.alt,
      caption: data.hero.caption,
    });
  }
  if (Array.isArray(data?.images)) {
    data.images.forEach((image, index) => {
      if (!image || typeof image !== "object" || Array.isArray(image)) return;
      refs.push({
        src: String(image.src ?? "").trim(),
        role: `images[${index}]`,
        optional: isOptionalImage(image),
        alt: image.alt,
        caption: image.caption,
      });
    });
  }
  const press = String(data?.image ?? "").trim();
  if (press) {
    refs.push({
      src: press,
      role: "image",
      optional: data?.imageOptional === true || data?.imageOptional === "true",
      alt: data?.imageAlt,
      caption: data?.imageCaption,
    });
  }
  return refs.filter((ref) => ref.src);
}

export function loadProvenance(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`LEGAL GATE: ${displayPath(filePath)} missing; refusing to build.`);
  }
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    throw new Error(`LEGAL GATE: ${displayPath(filePath)} is not valid JSON. Refusing to build.`);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || !parsed.images || typeof parsed.images !== "object" || Array.isArray(parsed.images)) {
    throw new Error(`LEGAL GATE: ${displayPath(filePath)} must contain an images object. Refusing to build.`);
  }
  return parsed;
}

export function imageHasRecord(src, provenance) {
  const record = provenance?.images?.[src];
  if (!record || typeof record !== "object" || Array.isArray(record)) return false;
  return String(record.licence ?? record.license ?? "").trim().length > 0;
}

function listedSourceUrls(data) {
  if (!Array.isArray(data?.sources)) return [];
  return data.sources
    .map((source) => String(source?.url ?? "").trim())
    .filter((url) => /^https?:\/\/\S+$/i.test(url));
}

function bodyUrls(content) {
  const urls = [];
  for (const match of String(content ?? "").matchAll(/https?:\/\/[^\s)>\]]+/gi)) {
    urls.push(match[0].replace(/[.,;]+$/, ""));
  }
  return urls;
}

function hasElectionAuthority(data, content) {
  return [...listedSourceUrls(data), ...bodyUrls(content)].some((url) => isElectionAuthorityUrl(url));
}

function uniqueRules(flags) {
  return [...new Set(flags.map((flag) => flag.rule))].sort((a, b) => a - b);
}

function tierOf(flags, manual) {
  if (manual && flags.length === 0) return "HIGH";
  if (flags.some((flag) => flag.tier === "HIGH" || HIGH_RULES.has(flag.rule))) return "HIGH";
  if (flags.length) return "MODERATE";
  return null;
}

function flaggedText(flags, manual) {
  const parts = [];
  if (flags.some((flag) => flag.rule === 4)) parts.push("no source URL");
  for (const flag of flags) {
    if (flag.rule === 4) continue;
    parts.push(`${flag.field}: ${flag.excerpt}`);
  }
  if (!parts.length && manual) parts.push("status is HOLD_REVIEW");
  return parts.join(" | ");
}

function suggestionFor(flags, manual) {
  const rules = uniqueRules(flags);
  const lines = rules.map((rule) => SUGGESTIONS[rule]).filter(Boolean);
  if (manual && rules.length === 0) {
    lines.push(
      "Front matter is HOLD_REVIEW and no code rule matched. Joshua has to approve this exact file. A moderate clearance cannot clear a hold with no code rule.",
    );
  }
  return lines.join(" ");
}

function joshuaApproved(approvals, hash) {
  return approvals.some((entry) => {
    const approvedBy = String(entry?.approved_by ?? "").trim();
    const sha = String(entry?.sha256 ?? "").trim().toLowerCase();
    return approvedBy === "Joshua" && sha === hash;
  });
}

function clearanceCovers(entry, hash, flag) {
  const sha = String(entry?.sha256 ?? "").trim().toLowerCase();
  if (!sha || sha !== hash) return false;
  if (!isSafeVerdict(entry?.chatgpt_verdict ?? entry?.verdict)) return false;
  if (flag.tier === "HIGH" || HIGH_RULES.has(flag.rule)) return false;
  if (entry.rule === undefined || entry.rule === null || entry.rule === "") return true;
  const rules = (Array.isArray(entry.rule) ? entry.rule : [entry.rule]).map((value) => Number(value));
  return rules.includes(flag.rule);
}

function moderateCleared(flags, clearances, hash) {
  if (!flags.length) return false;
  if (flags.some((flag) => flag.tier === "HIGH" || HIGH_RULES.has(flag.rule))) return false;
  return flags.every((flag) => clearances.some((entry) => clearanceCovers(entry, hash, flag)));
}

function displayPath(filePath) {
  const relative = path.relative(process.cwd(), filePath);
  return relative && !relative.startsWith("..") ? relative.split(path.sep).join("/") : filePath;
}

function holdStatus(data) {
  return String(data?.status ?? "").trim() === "HOLD_REVIEW";
}

export function reviewPost(filePath, context) {
  const absolute = path.resolve(filePath);
  const parsed = matter(fs.readFileSync(absolute, "utf8"));
  const data = parsed.data || {};
  const slug = path.basename(absolute, ".md");
  const hash = sha256File(absolute);
  const base = {
    slug,
    title: String(data.title ?? slug),
    filePath: absolute,
    draftPath: displayPath(absolute),
    sha256: hash,
    status: holdStatus(data) ? "HOLD_REVIEW" : String(data.status ?? "").trim(),
    flags: [],
    held: false,
    clearedBy: null,
    tier: null,
    rules: [],
    sources: [...new Set([...listedSourceUrls(data), ...bodyUrls(parsed.content)])],
    droppedImages: [],
    skipped: false,
    suggestion: "",
    flagged: "",
    site: context.site,
    bot: context.bot,
  };

  if (isDraft(data.draft) || data.sample === true) {
    base.skipped = true;
    return base;
  }

  const flags = [];
  for (const [field, value] of storyFields(data, parsed.content)) {
    flags.push(...flagsInText(value, field));
  }
  if (hasElectionAuthority(data, parsed.content)) {
    for (let index = flags.length - 1; index >= 0; index -= 1) {
      if (flags[index].rule === 6) flags.splice(index, 1);
    }
  }
  if (listedSourceUrls(data).length === 0) {
    flags.push({
      rule: 4,
      tier: "MODERATE",
      field: "sources",
      label: "no source URL",
      logistics: false,
      excerpt: "no source URL",
    });
  }
  for (const image of imageRefs(data)) {
    if (imageHasRecord(image.src, context.provenance)) continue;
    if (image.optional) {
      base.droppedImages.push(image.src);
      continue;
    }
    flags.push({
      rule: 3,
      tier: "MODERATE",
      field: image.role,
      label: "missing provenance",
      logistics: false,
      excerpt: `${image.src}: no provenance/licence record`,
    });
  }

  const manual = holdStatus(data) && flags.length === 0;
  const approved = joshuaApproved(context.approvals, hash);
  const cleared = !approved && moderateCleared(flags, context.clearances, hash);
  base.flags = flags;
  base.rules = uniqueRules(flags);
  base.tier = tierOf(flags, manual || holdStatus(data));
  base.flagged = flaggedText(flags, manual || (holdStatus(data) && !approved && !cleared));
  base.suggestion = suggestionFor(flags, manual);
  if (approved) {
    base.clearedBy = "approval";
    base.held = false;
  } else if (cleared) {
    base.clearedBy = "moderate";
    base.held = false;
  } else {
    base.held = manual || flags.length > 0 || holdStatus(data);
  }
  if (base.held && !base.tier) base.tier = "HIGH";
  if (base.held && holdStatus(data) && flags.length === 0) base.tier = "HIGH";
  return base;
}

export function reviewPostsDir(dir, options = {}) {
  const postsDir = path.resolve(dir);
  const provenancePath = path.resolve(options.provenancePath || DEFAULT_PROVENANCE);
  const approvalsPath = options.approvalsPath ? path.resolve(options.approvalsPath) : DEFAULT_APPROVALS;
  const clearancesPath = options.clearancesPath ? path.resolve(options.clearancesPath) : DEFAULT_CLEARANCES;
  const provenance = loadProvenance(provenancePath);
  const approvals = readJsonl(approvalsPath);
  const clearances = readJsonl(clearancesPath);
  if (!fs.existsSync(postsDir)) {
    throw new Error(`LEGAL GATE: posts directory ${displayPath(postsDir)} does not exist. Refusing to build.`);
  }
  const context = {
    provenance,
    approvals,
    clearances,
    site: options.site || SITE_ID,
    bot: options.bot || BOT_NAME,
  };
  const names = fs
    .readdirSync(postsDir)
    .filter((name) => name.endsWith(".md") && !name.startsWith("_"))
    .sort();
  const results = names.map((name) => reviewPost(path.join(postsDir, name), context));
  const active = results.filter((result) => !result.skipped);
  return {
    ok: true,
    provenancePath,
    results,
    holds: active.filter((result) => result.held),
    passed: active.filter((result) => !result.held && !result.clearedBy),
    approved: active.filter((result) => result.clearedBy === "approval"),
    moderateCleared: active.filter((result) => result.clearedBy === "moderate"),
  };
}

function productionReview() {
  if (!cachedReview) {
    const review = reviewPostsDir(DEFAULT_POSTS_DIR);
    review.heldByPath = new Map(review.holds.map((hold) => [hold.filePath, hold]));
    cachedReview = review;
  }
  return cachedReview;
}

export function isHeldPost(inputPath) {
  if (!inputPath) return false;
  const review = productionReview();
  return review.heldByPath.has(path.resolve(inputPath));
}

export function heldUrlsIn(urls) {
  const review = productionReview();
  const slugs = new Set(review.holds.map((hold) => `/articles/${hold.slug}/`));
  return (urls || []).filter((url) => {
    try {
      let pathname = new URL(url).pathname;
      if (!pathname.endsWith("/")) pathname = `${pathname}/`;
      return slugs.has(pathname);
    } catch {
      return false;
    }
  });
}

export function queueRecord(result, now = new Date()) {
  return {
    ts: now.toISOString(),
    site: result.site || SITE_ID,
    bot: result.bot || BOT_NAME,
    title: result.title,
    flagged: result.flagged,
    rule: result.rules,
    sources: result.sources,
    suggestion: result.suggestion,
    draft_path: result.draftPath,
    sha256: result.sha256,
    status: "HOLD_REVIEW",
    tier: result.tier,
    slug: result.slug,
  };
}

export function gateFailure(review) {
  const unmarked = review.holds.filter((hold) => hold.status !== "HOLD_REVIEW");
  if (!unmarked.length) return null;
  const detail = unmarked.map((hold) => `${hold.slug} [${hold.rules.join(", ")}]`).join("; ");
  return `LEGAL GATE: flagged stories are not marked status HOLD_REVIEW: ${detail}. Set status HOLD_REVIEW or fix the story. Do not soften the wording.`;
}

export function enforceLegalGate() {
  clearLegalGateCache();
  const review = productionReview();
  for (const hold of review.holds) {
    console.error(`[HOLD_REVIEW] ${hold.slug}: rules [${hold.rules.join(", ")}] -> not rendered`);
  }
  console.error(
    `LEGAL GATE: ${review.passed.length} passed, ${review.approved.length} approved, ${review.moderateCleared.length} moderate-cleared, ${review.holds.length} held`,
  );
  const failure = gateFailure(review);
  if (failure) throw new Error(failure);
  return review;
}

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

export function findHeldInOutput(outputDir, holds) {
  const hits = [];
  if (!outputDir || !fs.existsSync(outputDir)) return hits;
  const files = walk(outputDir).filter((file) => /\.(html|xml|txt|json)$/i.test(file));
  const seen = new Set();
  for (const hold of holds) {
    const needle = `/articles/${hold.slug}/`;
    const title = String(hold.title ?? "");
    for (const file of files) {
      const text = fs.readFileSync(file, "utf8");
      if (!text.includes(needle) && !(title && text.includes(title))) continue;
      const key = `${hold.slug}:${file}`;
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push({
        file: path.relative(outputDir, file),
        slug: hold.slug,
        rules: hold.rules,
        title: hold.title,
      });
    }
  }
  return hits;
}

function defaultProvenance() {
  if (!cachedProvenance) cachedProvenance = loadProvenance(DEFAULT_PROVENANCE);
  return cachedProvenance;
}

export function hasImageRecord(src) {
  return imageHasRecord(String(src ?? "").trim(), defaultProvenance());
}

export function keepImage(image) {
  if (!image || typeof image !== "object" || Array.isArray(image) || !image.src) return null;
  if (isOptionalImage(image) && !imageHasRecord(String(image.src).trim(), defaultProvenance())) return null;
  return image;
}

export function keepImages(images) {
  if (!Array.isArray(images)) return [];
  return images.map((image) => keepImage(image)).filter(Boolean);
}
