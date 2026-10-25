import { normalizeSiteUrl } from "../../lib/site-url.js";
import { adsensePublisherId } from "../../lib/ads.js";

const adsenseClient = "";

const site = {
  name: "FiscalHour",
  tagline: "Sourced financial news. Not investment advice.",
  brandLine: "Reporting on markets, the economy, companies, crypto, and personal finance.",
  description:
    "FiscalHour covers markets, the economy, companies, crypto, and personal finance. Sourced news, not investment advice.",
  url: normalizeSiteUrl("https://fiscalhour.com"),
  locale: "en_US",
  language: "en",
  author: "FiscalHour",
  operator: "Joshua Israel Ventures LLC",
  jurisdiction: "Florida",
  entityDescription: "a Florida limited liability company",
  legalNotice:
    "© 2026 Joshua Israel Ventures LLC. All rights reserved. FiscalHour is a trade name of Joshua Israel Ventures LLC, a Florida limited liability company.",
  contactEmail: "",
  contactFormEndpoint: "https://formsubmit.co/REPLACE_WITH_ALIAS",
  indexNowKey: "95ef7049f3b49637c55b979369df62e9",
  cloudflareAnalyticsToken: "cbf0f8d3bf0e40838131a3a0c174d995",
  adsenseClient,
  adsensePublisher: adsensePublisherId(adsenseClient),
  adsenseCertificationAuthorityId: "f08c47fec0942fa0",
  year: 2026,
  buildTime: new Date().toISOString(),
  crawlers: [
    "Googlebot",
    "Bingbot",
    "GPTBot",
    "ClaudeBot",
    "CCBot",
    "Google-Extended",
    "Bytespider",
    "OAI-SearchBot",
    "PerplexityBot",
    "Applebot-Extended",
  ],
  categories: [
    {
      name: "Markets",
      slug: "markets",
      description: "Prices, indexes, and trading, reported from named sources.",
    },
    {
      name: "Economy",
      slug: "economy",
      description: "Growth, jobs, inflation, and the policy around them.",
    },
    {
      name: "Companies",
      slug: "companies",
      description: "Earnings, deals, and what companies say in their own documents.",
    },
    {
      name: "Crypto",
      slug: "crypto",
      description: "Tokens, platforms, and the rules around them, from named sources.",
    },
    {
      name: "Personal Finance",
      slug: "personal-finance",
      description: "Saving, credit, taxes, and consumer rules. Not a buy or sell call.",
    },
  ],
};

export default site;
