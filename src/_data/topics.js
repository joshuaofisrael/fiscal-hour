// Topic hubs. A story joins a hub when its category, a tag, or a keyword in
// its title/description matches, so new daily batches fill hubs automatically.
export default [
  {
    slug: "markets", name: "Markets",
    intro: "Stocks, bonds, oil and the dollar: daily FiscalHour reports on how markets moved, each tied to the named sources that recorded the prices. News only, not investment advice.",
    categories: ["Markets"], tags: ["stocks", "oil", "commodities", "treasuries", "bonds"],
    keywords: ["s&p 500", "dow", "nasdaq", "brent", "stocks", "treasury yield"],
  },
  {
    slug: "fed-rates", name: "Fed & Rates",
    intro: "Federal Reserve meetings, policy statements, interest rates and inflation readings, reported from the Fed’s own calendar and releases and from named news outlets.",
    categories: [], tags: ["federal-reserve", "rates", "inflation", "treasuries"],
    keywords: ["federal reserve", "fed ", "fomc", "interest rate", "inflation", "mortgage rate"],
  },
  {
    slug: "earnings", name: "Earnings",
    intro: "Quarterly results and company filings: what businesses reported for profit, revenue and guidance, drawn from their releases, SEC filings and named coverage.",
    categories: ["Companies"], tags: ["earnings", "filings"],
    keywords: ["earnings", "quarter", "quarterly", "profit", "revenue", "10-q", "8-k"],
  },
  {
    slug: "crypto", name: "Crypto",
    intro: "Bitcoin, stablecoins, tokenization and the companies building on them, reported from company statements, regulators and named outlets, with no price calls.",
    categories: ["Crypto"], tags: ["crypto", "tokenization", "bitcoin", "stablecoins"],
    keywords: ["bitcoin", "crypto", "token", "stablecoin", "ether", "blockchain"],
  },
  {
    slug: "personal-finance", name: "Personal Finance",
    intro: "Housing, borrowing, saving and household budgets: sourced reporting on the surveys and data that shape everyday money decisions. Context, never personal advice.",
    categories: ["Personal Finance"], tags: ["housing", "consumer-sentiment", "mortgages", "savings"],
    keywords: ["homebuying", "mortgage", "household", "consumer", "savings", "credit card"],
  },
];
