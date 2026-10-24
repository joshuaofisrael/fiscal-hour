# FiscalHour

FiscalHour is a fast static site for sourced financial news: markets, the economy, companies, crypto, and personal finance. The public name and the canonical URL each live in one place: [`src/_data/site.js`](src/_data/site.js).

The site URL is `https://fiscalhour.com`. [`CNAME`](CNAME) contains `fiscalhour.com`, and the build copies that file into the Pages output. The build fails if `CNAME` does not match the hostname of `url`.

Stories are informational. They are not investment advice, they do not recommend buying or selling, and they do not predict prices. There are no sample articles in this repository. The production build passes with an empty `src/content/posts/` markdown folder.

The publisher name in metadata and JSON-LD is **FiscalHour**. The legal name is printed only on the Terms, Privacy, Disclaimer, Copyright, Advertising disclosure, and Contact pages. It is not in the header, the home page, About, trust copy, or the footer. The footer has no copyright line.

There is no third-party font host. Pages do not load a tracker or an ad script until the matching value is set in `src/_data/site.js`:

- `cloudflareAnalyticsToken` — empty omits the Cloudflare Web Analytics beacon. The Content-Security-Policy still allows `static.cloudflareinsights.com`.
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

1. Add `src/content/posts/YYYY-MM-DD-short-slug.md`. The date in the filename and the `date` field should match, written as `YYYY-MM-DD`.
2. Copy the front matter below. Keep `draft: true` while you check the sources.
3. Write the story in Markdown. Link each factual claim to a named source in the sentence it supports.
4. Add a hero and at least two body pictures. Save each as WebP and AVIF under `src/assets/images/`, about 1280 by 720. Do not put a visible AI caption on a picture. The disclosure lives on `/disclaimer/`.
5. Run `npm run dev` and open `/articles/YYYY-MM-DD-short-slug/`.
6. When the source list is complete, remove the `draft` line (or set `draft: false`).
7. Run `npm test`. The production build fails if a published article has no sources, a source is missing `title`, `url`, `publisher`, or `date`, `updatedAt` is missing, `description` is missing, or the story is missing a hero, two body images, or alt text.

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

## Name placement

`Joshua Israel Ventures LLC` and `Joshua Israel` appear only on the legal pages: Terms, Disclaimer, Privacy, Copyright and DMCA, Advertising disclosure, and Contact. Each of those pages ends with:

> © 2026 Joshua Israel Ventures LLC. All rights reserved. FiscalHour is a trade name of Joshua Israel Ventures LLC, a Florida limited liability company.

Do not add that line, or either name, to the header, the home page, About, a banner, or the footer. Do not add a copyright line to the footer. The contact form endpoint is `contactFormEndpoint` in `src/_data/site.js`. The default is `https://formsubmit.co/REPLACE_WITH_ALIAS`. Replace it with the FormSubmit alias. Do not commit the inbox address.

## Discovery files

The production build writes:

- `/sitemap.xml` for pages and published articles
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

[`.github/workflows/pages.yml`](.github/workflows/pages.yml) runs the tests and production build on pull requests and on pushes to `main`. Pushes to `main` upload `_site`, including `CNAME`, and deploy it to GitHub Pages.

## Layout

```text
src/_data/site.js          name, url, publisher, contact form, IndexNow, ads, analytics
src/content/posts/         one Markdown file per story
src/_includes/             layouts and partials
lib/validate-posts.js      fails the build when a published story is incomplete
scripts/ping-indexnow.js   IndexNow submitter
scripts/build-logo.js      regenerates the FH monogram at src/assets/logo.png
```

Body text uses the reader’s system fonts. The mark is an original geometric FH monogram.
