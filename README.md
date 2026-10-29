# FiscalHour

FiscalHour is a fast static site for sourced financial news: markets, the economy, companies, crypto, and personal finance. The public name and the canonical URL each live in one place: [`src/_data/site.js`](src/_data/site.js).

The site URL is `https://fiscalhour.com`. [`CNAME`](CNAME) contains `fiscalhour.com`, and the build copies that file into the Pages output. The build fails if `CNAME` does not match the hostname of `url`.

Stories are informational. They are not investment advice, they do not recommend buying or selling, and they do not predict prices. There are no sample articles in this repository. The production build passes with an empty `src/content/posts/` markdown folder.

The publisher name in metadata and JSON-LD is **FiscalHour**. The legal name is printed only on the Terms, Privacy, Disclaimer, Copyright, Advertising disclosure, and Contact pages. It is not in the header, the home page, About, trust copy, or the footer. The footer has no copyright line.

There is no third-party font host. Optional scripts stay off until configured in `src/_data/site.js`. Google Analytics 4 also waits for the visitor to accept:

- `cloudflareAnalyticsToken` — empty omits the Cloudflare Web Analytics beacon. The Content-Security-Policy still allows `static.cloudflareinsights.com`. The beacon stays the last script on the page.
- `gaMeasurementId` — Google Analytics 4 measurement id. Consent Mode v2 defaults to denied (`ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`) before any tag configuration. Accept stores the choice and loads `gtag.js`. Decline stores the choice and loads nothing. Withdrawal is on the privacy policy.
- `adsenseClient` — empty omits the AdSense loader and the account meta tag. Set it to a `ca-pub-` id to enable them. `/ads.txt` stays a comment placeholder until then. The Content-Security-Policy allows `pagead2.googlesyndication.com` either way. There are no ad units.

## Develop

```bash
npm install
npm test
npm run dev
```

`npm run dev` serves the site at `http://localhost:8080` and includes drafts.

`npm run build` is the production build. Drafts are left out of `_site`. `npm run build:preview` writes a draft-inclusive build to `_site-preview`, which must not be deployed.

## Add an article

Create a new file. Do not invent a fact, a quote, a price, or an event to fill a gap.

1. Add `src/content/posts/YYYY-MM-DD-short-slug.md`. The date in the filename and the calendar day of the `date` field should match. A date written as `YYYY-MM-DD` publishes on the next production build. A full timestamp, `2026-10-29T11:00:00.000Z`, waits until that time. Set the same timestamp on `publishAt`. The production build leaves the story out of the pages, feeds, and sitemaps until then. `npm run dev` still shows it.
2. Copy the front matter below. Keep `draft: true` while you check the sources.
3. Write the story in Markdown. Link each factual claim to a named source in the sentence it supports.
4. Add a hero and at least two body pictures. Save each as WebP and AVIF under `src/assets/images/`, about 1280 by 720. Do not put a visible AI caption on a picture. The disclosure lives on `/disclaimer/`.
5. Run `npm run dev` and open `/articles/YYYY-MM-DD-short-slug/`.
6. When the source list is complete, remove the `draft` line (or set `draft: false`).
7. Run `npm test`. The production build fails if a published article has no sources, a source is missing `title`, `url`, `publisher`, or `date`, `updatedAt` is missing, `description` is missing, or the story is missing a hero, two body images, or alt text.
8. Run `node scripts/legal-gate.js`. Every new story has to pass that gate. Stdout is JSONL of anything held. A held story stays in the repo with `status: HOLD_REVIEW` and is not published. Do not delete it, do not soften the wording to dodge the hold, and do not write an approval or a clearance yourself.

```yaml
---
title: "Headline"
description: "One or two sentences. This is the dek and the meta description."
date: 2026-10-24
updatedAt: 2026-10-24
category: Markets
tags:
  - rates
draft: true
hero:
  src: story-hero
  alt: "Describe the photograph. No real person, no staged event, no readable brand name."
  width: 1280
  height: 720
images:
  - src: story-body-a
    alt: "Describe the first body photograph."
    after: 2
    width: 1280
    height: 720
  - src: story-body-b
    alt: "Describe the second body photograph."
    after: 4
    width: 1280
    height: 720
sources:
  - title: "Page title from the publisher"
    url: "https://example.org/the-document"
    publisher: "Publisher name"
    date: 2026-10-24
---
```

`category` must be one of: Markets, Economy, Companies, Crypto, Personal Finance.

`description` is the dek. A `summary` field is accepted as an alias. The rendered meta description is trimmed to 155 characters on a word boundary.

`sources` is a list. Every entry needs `title`, `url`, `publisher`, and `date`. Prefer a primary document: a filing, a regulator, a court, a statistical agency, or the company page that made the statement. Company announcements are reported as what the company says (“X says”), not as independently verified, unless another source confirms them.

The byline is **FiscalHour**. The article template prints the date, a **Last updated** line from `updatedAt`, that byline, a **Not investment advice** line linking to `/disclaimer/`, the tags, related stories in the same section or with a shared tag, and a Sources section.

`opinion: true` or `label: opinion`, `label: analysis`, or `label: speculation` prints that label at the top. Do not publish a buy, sell, or hold recommendation, or a price prediction, in any label.

An AI-generated picture uses `hero` or an `images` entry with `src`, `alt`, `width`, and `height`. `src` is a basename, not a URL. `caption` is optional and is not an AI label. A third-party press image uses `image`, `imageAlt`, `imageCaption`, `imageCredit`, `imageSource`, and `imageLicense`. Fair use stays at most 640 by 480. Do not depict a real person or stage an event that did not happen.

The rules are also on the [Sources & Ethics](src/sources-ethics.njk) page. Corrections go through the [Corrections](src/corrections.njk) page.

## Legal hold gate

`node scripts/legal-gate.js` is the check a future batch run should use. It prints one JSON object per held story to stdout and writes the same lines to `content-review/held.jsonl`. The object fields are `ts`, `site` (`fiscalhour.com`), `bot` (`Financial News Bot`), `title`, `flagged`, `rule`, `sources`, `suggestion`, `draft_path`, `sha256`, `status` (`HOLD_REVIEW`), plus `tier` and `slug`.

The same check runs inside `npm run build`. [`.github/workflows/pages.yml`](.github/workflows/pages.yml) runs it on pull requests and, on `main`, again on `_site` before the Pages upload. A story flagged under any of the eight rules is left out of the article page, the homepage, tag and category and topic pages, both feeds, and both sitemaps. If that story’s page is still in the built site, the workflow fails. IndexNow and `scripts/changed-urls.js` refuse a URL for a held story, so a retry cannot announce it.

Set `status: HOLD_REVIEW` on a story the gate flags. The file stays in `src/content/posts/`. Removing that status, or changing any character, changes the sha256 and the story is checked again. `content-review/approvals.jsonl` can publish a held file only when a line has that exact `sha256` and `"approved_by": "Joshua"`. `content-review/moderate-clearances.jsonl` can publish a file only when every code flag is moderate, the `sha256` matches, and `chatgpt_verdict` starts with `SAFE`. A clearance never publishes a high-tier hold. Do not add either line yourself.

High tier, Joshua only: rules 1, 2, and 8, and every code hit on rule 6 (logistics and final or certified result wording). Moderate tier: rules 3, 4, 5, and 7. A `HOLD_REVIEW` story with no code hit is also Joshua only.

Code-enforced:

1. Allegation wording: fraud, accused, charged with, lawsuit alleges, misconduct, corruption, embezzlement, bribery, money laundering, insider trading, indictment, convicted of, arrested for, perjury, racketeering, ponzi, allege and allegedly. `anti-fraud` and `anti-corruption` are not matches.
2. An email address, a phone number, an SSN-shaped number, or a numbered street address such as `123 Main Street`.
3. `content/image-provenance.json` has to exist or the build refuses to run. A required image with no licence record holds the story. An image with `optional: true` and no record is dropped instead.
4. The story has at least one `http` or `https` URL in `sources`.
5. Personalised advice or a promised return: guaranteed returns, you should buy or sell, investors should buy, a price target.
6. Election logistics (polling place, hours, registration, eligibility, where or how to vote) and final, certified, or official result wording in an election context. A source URL on an election-authority host, such as `fec.gov` or `tse.jus.br`, suppresses this code hit. That is not a story allowlist.
7. Overclaim words in `title` or `seoTitle` only: bombshell, shocking, explosive, scandal, must-buy, exposed, secret, urgent, breaking, exclusive, guaranteed, and the same kind of wording. A source headline is not this site’s headline. `Record-Breaking` in a publisher’s title is not a hit. The same word in our `title` is.
8. Embargo, legal notice, cease and desist, rights complaint, correction request, not for publication, reporting restriction, takedown, do not publish.

Judgement only, not decided by these patterns:

1. Defamation nuance: implication, innuendo, and whether a named person is identifiable when the wording above is absent.
2. Health, sexuality, children, victims, private messages, or leaked financial records that are not an email, phone number, SSN, or street address.
3. Whether a recorded licence is actually valid for the use, and whether a picture shows a real person or a real event.
4. Sources that disagree, a confused identity, a quote that cannot be checked, or a source page that will not open.
5. Advice or a dangerous instruction that does not use the phrases above. Ordinary sourced reporting on markets, medicine, tax, or law is not a hold by itself.
6. A projection, a partial count, or a certified result when the logistics and final-result phrases are absent, and whether an official page is current.
7. A headline that is stronger than the evidence without using the word list, an implied endorsement, or a synthetic image that could be mistaken for evidence.
8. A legal complaint, embargo, or correction demand that does not use the marker phrases.

Fixtures under `test/legal-gate/` are not an Eleventy input. They are never built or deployed.

## Name placement

`Joshua Israel Ventures LLC` and `Joshua Israel` appear only on the legal pages: Terms, Disclaimer, Privacy, Copyright and DMCA, Advertising disclosure, and Contact. Each of those pages ends with:

> © 2026 Joshua Israel Ventures LLC. All rights reserved. FiscalHour is a trade name of Joshua Israel Ventures LLC, a Florida limited liability company.

Do not add that line, or either name, to the header, the home page, About, a banner (including the analytics consent banner), or the footer. Do not add a copyright line to the footer. The contact form endpoint is `contactFormEndpoint` in `src/_data/site.js`. The default is `https://formsubmit.co/REPLACE_WITH_ALIAS`. Replace it with the FormSubmit alias. Do not commit the inbox address.

## Discovery files

The production build writes:

- `/sitemap.xml` for pages and published articles. A tag page, category page, or topic hub with fewer than two published stories is left out, and that page sends `noindex,follow`. The count updates when stories are added.
- `/news-sitemap.xml` in the Google News format, for published articles from the last two days. With none in the window, the file stays valid XML and contains a comment instead of URL entries. `robots.txt` and `llms.txt` list that file only when it has articles.
- `/feed.xml` (RSS) and `/atom.xml` (Atom)
- `/robots.txt`, which allows Googlebot, Bingbot, GPTBot, ClaudeBot, CCBot, Google-Extended, Bytespider, OAI-SearchBot, PerplexityBot, and Applebot-Extended
- `/llms.txt`
- `/{indexNowKey}.txt`, the IndexNow key file
- `/ads.txt`

The site does not send `noai` or `noimageai` directives.

After the site is deployed:

```bash
npm run build
npm run indexnow
```

`npm run indexnow -- --dry-run` prints the JSON payload without sending it. The request is a POST to `https://api.indexnow.org/indexnow` with the host, the key, the key location, and every `<loc>` in `_site/sitemap.xml`.

## Pages deploy

[`.github/workflows/pages.yml`](.github/workflows/pages.yml) runs the tests, the legal hold gate, and the production build on pull requests and on pushes to `main`. Pushes to `main` run the gate again on `_site` before they upload it, including `CNAME`, and deploy it to GitHub Pages. The upload does not run when the gate fails.

[`.github/workflows/publish-scheduled.yml`](.github/workflows/publish-scheduled.yml) rebuilds and deploys `main` when a story's `publishAt` has come due. The crons are 11:05, 11:35, 15:05, 15:35, 19:05, 19:35, and 22:05 UTC. On 29 Oct 2026 London is UTC+0, so those first slots are 11:00, 15:00, and 19:00 London, with a half-hour retry and a 22:05 catch-up. The workflow does not edit the story. It runs the tests and the legal hold gate, then uploads the site. A missed earlier slot is still picked up by a later run the same day, because the build includes every story whose time has passed.

## Layout

```text
src/_data/site.js          name, url, publisher, contact form, IndexNow, ads, analytics
src/content/posts/         one Markdown file per story
src/_includes/             layouts and partials
lib/validate-posts.js      fails the build when a published story is incomplete
lib/legal-gate.js          pre-publish hold checks used by the build
scripts/legal-gate.js      prints held stories as JSONL; fails if a hold would ship
scripts/ping-indexnow.js   IndexNow submitter, refused when a held URL is in the sitemap
scripts/build-logo.js      regenerates the FH monogram at src/assets/logo.png
```

Body text uses the reader’s system fonts. The mark is an original geometric FH monogram.
