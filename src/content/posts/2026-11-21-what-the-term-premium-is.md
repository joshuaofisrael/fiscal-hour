---
seoTitle: "What the Term Premium Is: 0.70% on 19 Nov"
seoDescription: "NY Fed ACM file: the 10-year term premium was 0.6957% on 19 Nov 2026, the smaller part of a 5.02% fitted yield."
title: "What the term premium is, and how much of the 10-year Treasury yield it was"
description: "On 19 November 2026 the New York Fed’s ACM model put the 10-year term premium at 0.6957 percent, the smaller piece of a fitted yield near 5.02 percent."
summary: "On 19 November 2026 the New York Fed’s ACM model put the 10-year term premium at 0.6957 percent, the smaller piece of a fitted yield near 5.02 percent."
date: "2026-11-21T16:00:00.000Z"
publishAt: "2026-11-21T16:00:00.000Z"
updatedAt: 2026-11-21
sitemapLastmod: 2026-11-21
category: Economy
tags:
  - treasuries
  - federal-reserve
  - rates
  - explainer
hero:
  src: term-premium-hero
  alt: "Stone neoclassical facade with a columned portico under an overcast sky, no people, signs or readable lettering"
  width: 1280
  height: 720
images:
  - src: term-premium-columns
    alt: "Closer view of fluted stone columns and a triangular pediment on a pale masonry facade, no people or lettering"
    after: 3
    width: 1280
    height: 720
  - src: term-premium-windows
    alt: "Rows of tall dark windows in a pale stone wall under a gray sky, no people or readable signs"
    after: 7
    width: 1280
    height: 720
sources:
  - title: "Treasury Term Premia (ACM estimates)"
    url: "https://www.newyorkfed.org/research/data_indicators/term-premia-tabs"
    publisher: "Federal Reserve Bank of New York"
    date: 2026-11-21
  - title: "ACMTermPremium.xls, daily sheet, row dated 19 November 2026"
    url: "https://www.newyorkfed.org/medialibrary/media/research/data_indicators/ACMTermPremium.xls"
    publisher: "Federal Reserve Bank of New York"
    date: 2026-11-21
  - title: "Treasury Term Premia: 1961-Present"
    url: "https://libertystreeteconomics.newyorkfed.org/2014/05/treasury-term-premia-1961-present.html"
    publisher: "Federal Reserve Bank of New York, Liberty Street Economics"
    date: 2026-11-21
  - title: "Staff Report 340: Pricing the Term Structure with Linear Regressions"
    url: "https://www.newyorkfed.org/research/staff_reports/sr340.html"
    publisher: "Federal Reserve Bank of New York"
    date: 2026-11-21
  - title: "Daily Treasury Par Yield Curve Rates, November 2026"
    url: "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve&field_tdr_date_value_month=202611"
    publisher: "U.S. Department of the Treasury"
    date: 2026-11-21
  - title: "Term Premium on a 10 Year Zero Coupon Bond (THREEFYTP10)"
    url: "https://fred.stlouisfed.org/series/THREEFYTP10"
    publisher: "Federal Reserve Bank of St. Louis, FRED"
    date: 2026-11-21
disclaimer: financial
---

A 10-year Treasury yield is not one number with one cause. In the New York Fed’s account, it is two numbers added together: the short-term yields the model expects over the next ten years, and a term premium, which is the extra yield investors require because those short rates may not show up as expected. On the latest row of the Bank’s ACM workbook, checked on 21 November 2026, that premium was the smaller of the two pieces.

## The latest ACM reading

The file is [ACMTermPremium.xls](https://www.newyorkfed.org/medialibrary/media/research/data_indicators/ACMTermPremium.xls), linked from the New York Fed’s [Treasury Term Premia](https://www.newyorkfed.org/research/data_indicators/term-premia-tabs) page. The daily sheet’s last row is dated 19 November 2026. Three columns on that row matter for the 10-year:

| Piece | Column | 19 November 2026 |
| --- | --- | --- |
| Fitted 10-year yield | ACMY10 | 5.0162% |
| Expected short-rate path | ACMRNY10 | 4.3205% |
| Term premium | ACMTP10 | 0.6957% |

Those are the workbook figures rounded to four decimals. Adding the last two, 4.3205 plus 0.6957, gives 5.0162. That addition is ours, and it matches the fitted-yield column. Dividing the premium by the fitted yield, 0.6957 by 5.0162, gives 0.1387, or just under 14 percent of the fitted yield. The New York Fed does not publish that ratio. The page’s own description says the ACM estimates cover term premia, fitted yields and the expected average of short-term rates, from a five-factor no-arbitrage model, at a daily frequency and as end-of-month observations.

The previous daily row, 18 November, has ACMTP10 at 0.6919 percent. The change to 19 November is 0.0038 percentage point, about four tenths of a basis point. That is a small day. It is not a surge.

The same workbook’s monthly sheet ends at 30 October 2026, when ACMTP10 was 0.6817 percent. A monthly end-October figure and a daily mid-November figure are different rows. They should not be subtracted and called a one-month move.

## What the model is doing

A [Liberty Street Economics post](https://libertystreeteconomics.newyorkfed.org/2014/05/treasury-term-premia-1961-present.html) from May 2014, by Tobias Adrian, Richard Crump, Benjamin Mills and Emanuel Moench, is the plain-language companion to the spreadsheet. It calls the term premium “the compensation that investors require” because short-term yields may not follow the path people had expected. The other piece of the yield, in that account, is the expected path itself. The estimates, the post says, come from a five-factor model built so that bond prices line up across maturities. The technical paper is New York Fed [Staff Report 340](https://www.newyorkfed.org/research/staff_reports/sr340.html), “Pricing the Term Structure with Linear Regressions.”

“No-arbitrage” here means the model is built so that a bond’s price lines up with the prices of other maturities, rather than leaving a risk-free gap a trader could lock in. The premium is not a quote you can look up on a broker’s screen. It is what is left after the model takes its estimate of expected short rates out of the fitted long yield. Change the model and the leftover changes. The workbook can be revised when the Bank re-estimates it. The 19 November row is the row in the file downloaded on 21 November, not a promise that a later download will print the same history.

## Beside the Treasury’s own curve

The [Treasury’s daily par yield curve](https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve&field_tdr_date_value_month=202611), read on 21 November 2026, shows a 10-year par yield of 5.04 percent on 19 November and 4.92 percent on 20 November. The 2-year par yield was 4.76 percent on the 19th and 4.63 percent on the 20th. The 30-year was 5.40 percent, then 5.31 percent.

The 19 November par yield, 5.04 percent, sits close to the ACM fitted yield of 5.0162 percent. They are not the same object. One is the Treasury’s par coupon yield. The other is the model’s fitted yield. A gap of about two hundredths of a point is not a mispricing, and this page does not treat it as one.

The ACM file, as downloaded on 21 November, stops at 19 November. It does not contain a row for the 20 November drop in the par curve, from 5.04 percent to 4.92 percent. That 0.12 percentage point decline is the difference between the two Treasury prints. It is not an ACM term-premium move, because the ACM file does not have the second day yet.

## A second official estimate, on FRED

FRED’s series [THREEFYTP10](https://fred.stlouisfed.org/series/THREEFYTP10), “Term Premium on a 10 Year Zero Coupon Bond,” is easy to mistake for the ACM number. It is not. The FRED page, opened on 21 November 2026, says the series was produced by Kim and Wright (2005) from a three-factor model of Treasury yields, and that the Board of Governors is the source. The latest observation on that page was 0.9864 percent on 13 November 2026. The page said it had been updated on 17 November 2026 at 2:03 p.m. Central time. Earlier rows on the same page were 0.9656 on 12 November, 0.9177 on 10 November, 0.8854 on 9 November and 0.8738 on 6 November.

Kim-Wright at 0.9864 percent on 13 November and ACM at 0.6957 percent on 19 November are different models on different days. Subtracting them would invent a move that neither publisher printed. The useful fact is narrower: two estimates that both get called “the term premium” can differ by several tenths of a percentage point. A sentence that quotes one of them should name which one, and the date of the row.

## Where this month’s yield stories sit

FiscalHour’s yield stories this month were about market prints, not about the ACM split.

On 10 November, after the CPI release, [CNBC’s account](/articles/2026-11-11-october-cpi-0-4-percent-core-holds-0-3/) had the 10-year yield trading above 5 percent and then ending the day at 4.992 percent. For the week ended 13 November, [a Dow Jones figure carried by Morningstar](/articles/2026-11-15-fed-collins-gradual-rate-hikes-november-14/) put the 10-year yield at 5.152 percent, up 0.294 percentage point on the week. Those are reported market levels on the days the outlets named. They are not ACMTP10.

The policy side of the same weeks is in the [October FOMC minutes](/articles/2026-11-19-fomc-minutes-october-2026-rate-hike-ai-debt-financial-stability/), the [Collins remarks](/articles/2026-11-15-fed-collins-gradual-rate-hikes-november-14/) and the [Jefferson and Goolsbee remarks](/articles/2026-11-20-fed-jefferson-goolsbee-ai-boom-pushing-inflation-not-on-path-to-2-percent/). The funds rate those stories are about was left at 3.75 percent to 4 percent at the [October meeting](/articles/2026-10-29-fed-holds-funds-rate/). Mortgage averages, which move with long yields but are not the term premium, are in the [Freddie Mac survey](/articles/2026-10-30-freddie-mac-mortgage-rates/). The next CPI, jobs, PCE and FOMC dates are on the [release calendar](/calendar/).

A higher term premium lifts the long yield relative to the model’s expected short-rate path. That is what the decomposition says. It does not say that the premium caused the 10 November jump, the week’s rise to 5.152 percent, or the drop to 4.92 percent on 20 November. The ACM row for 19 November says something more specific: of a fitted yield near 5.02 percent, about 4.32 points were the expected short-rate path and about 0.70 point was the premium. Most of that fitted yield was the path of expected short rates, not the premium.

Nothing here is a forecast of the next yield, and nothing here is a case for owning or avoiding Treasuries. The [Fed and rates](/topics/fed-rates/) hub collects the policy stories. How the Fed’s inflation target is measured, which is a different question from how a long yield is split, is in [CPI versus PCE](/articles/2026-11-11-cpi-vs-pce-inflation/).

<aside class="check-another">
  <h2>Check another figure</h2>
  <ul>
    <li><a href="/articles/2026-11-11-cpi-vs-pce-inflation/">CPI against PCE</a>, the inflation gauges behind the rates debate.</li>
    <li><a href="/articles/2026-10-29-fed-holds-funds-rate/">The October funds-rate decision</a>, which left the target at 3.75 percent to 4 percent.</li>
    <li><a href="/articles/2026-10-30-freddie-mac-mortgage-rates/">The Freddie Mac mortgage average</a>, a household rate that is not the term premium.</li>
    <li><a href="/calendar/">The release calendar</a> for the next CPI, jobs, PCE, GDP and FOMC dates.</li>
  </ul>
</aside>
