const CHECKED = "2026-11-20";

const blsCpi = {
  series: "CPI",
  agency: "U.S. Bureau of Labor Statistics",
  event: "Consumer Price Index",
  release_time: "8:30 a.m.",
  source_title: "Schedule of Releases for the Consumer Price Index",
  source_url: "https://www.bls.gov/schedule/news_release/cpi.htm",
  time_note: "The BLS table prints 08:30 AM and does not label a time zone. Checked 20 Nov 2026.",
  checked: CHECKED,
};

const blsJobs = {
  series: "Jobs report",
  agency: "U.S. Bureau of Labor Statistics",
  event: "Employment Situation",
  release_time: "8:30 a.m.",
  source_title: "Schedule of Releases for the Employment Situation",
  source_url: "https://www.bls.gov/schedule/news_release/empsit.htm",
  time_note: "The BLS table prints 08:30 AM and does not label a time zone. Checked 20 Nov 2026.",
  checked: CHECKED,
};

const bea = {
  agency: "U.S. Bureau of Economic Analysis",
  release_time: "8:30 a.m.",
  source_title: "BEA release schedule",
  source_url: "https://www.bea.gov/news/schedule/full",
  time_note: "The BEA schedule prints 8:30 AM and does not label a time zone. Checked 20 Nov 2026. The schedule page lists releases through 23 Dec 2026 and does not list 2027 dates.",
  checked: CHECKED,
};

const fedCalendar = {
  series: "FOMC",
  agency: "Federal Reserve Board",
  source_title: "FOMC calendars, statements, and minutes",
  source_url: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
  checked: CHECKED,
};

const fedDecember = {
  series: "FOMC",
  agency: "Federal Reserve Board",
  source_title: "Federal Reserve Board calendar, December 2026",
  source_url: "https://www.federalreserve.gov/newsevents/2026-december.htm",
  time_note: "Times are printed on the Board's December 2026 calendar. That page does not label a time zone. The page says it was last updated 24 June 2025. Checked 20 Nov 2026.",
  checked: CHECKED,
};

const pmms = {
  series: "PMMS",
  agency: "Freddie Mac",
  event: "Primary Mortgage Market Survey",
  release_time: "12:00 p.m. ET",
  source_title: "PMMS publication calendar (PDF)",
  source_url: "https://www.freddiemac.com/pmms/docs/PMMS_Publication_Calendar.pdf",
  time_note: "Freddie Mac's PMMS page says results are released at 12 p.m. ET, on Thursday, or on Wednesday when a U.S. holiday falls on a Thursday. Dates are the publication calendar. Checked 20 Nov 2026.",
  checked: CHECKED,
};

function row(base, fields) {
  return { ...base, ...fields };
}

const rows = [
  row(blsCpi, { reference_period: "October 2026", release_date: "2026-11-10", status: "released" }),
  row(blsCpi, { reference_period: "November 2026", release_date: "2026-12-10", status: "scheduled", next: true }),
  row(blsCpi, { reference_period: "December 2026", release_date: "2027-01-13", status: "scheduled" }),
  row(blsCpi, { reference_period: "January 2027", release_date: "2027-02-11", status: "scheduled" }),
  row(blsCpi, { reference_period: "February 2027", release_date: "2027-03-10", status: "scheduled" }),
  row(blsCpi, { reference_period: "March 2027", release_date: "2027-04-13", status: "scheduled" }),
  row(blsCpi, { reference_period: "April 2027", release_date: "2027-05-12", status: "scheduled" }),
  row(blsCpi, { reference_period: "May 2027", release_date: "2027-06-10", status: "scheduled" }),
  row(blsCpi, { reference_period: "June 2027", release_date: "2027-07-14", status: "scheduled" }),
  row(blsCpi, { reference_period: "July 2027", release_date: "2027-08-11", status: "scheduled" }),
  row(blsCpi, { reference_period: "August 2027", release_date: "2027-09-14", status: "scheduled" }),
  row(blsCpi, { reference_period: "September 2027", release_date: "2027-10-14", status: "scheduled" }),
  row(blsCpi, { reference_period: "October 2027", release_date: "2027-11-10", status: "scheduled" }),
  row(blsCpi, { reference_period: "November 2027", release_date: "2027-12-10", status: "scheduled" }),

  row(blsJobs, { reference_period: "October 2026", release_date: "2026-11-06", status: "released" }),
  row(blsJobs, { reference_period: "November 2026", release_date: "2026-12-04", status: "scheduled", next: true }),
  row(blsJobs, { reference_period: "December 2026", release_date: "2027-01-08", status: "scheduled" }),
  row(blsJobs, { reference_period: "January 2027", release_date: "2027-02-05", status: "scheduled" }),
  row(blsJobs, { reference_period: "February 2027", release_date: "2027-03-05", status: "scheduled" }),
  row(blsJobs, { reference_period: "March 2027", release_date: "2027-04-02", status: "scheduled" }),
  row(blsJobs, { reference_period: "April 2027", release_date: "2027-05-07", status: "scheduled" }),
  row(blsJobs, { reference_period: "May 2027", release_date: "2027-06-04", status: "scheduled" }),
  row(blsJobs, { reference_period: "June 2027", release_date: "2027-07-02", status: "scheduled" }),
  row(blsJobs, { reference_period: "July 2027", release_date: "2027-08-06", status: "scheduled" }),
  row(blsJobs, { reference_period: "August 2027", release_date: "2027-09-03", status: "scheduled" }),
  row(blsJobs, { reference_period: "September 2027", release_date: "2027-10-08", status: "scheduled" }),
  row(blsJobs, { reference_period: "October 2027", release_date: "2027-11-05", status: "scheduled" }),
  row(blsJobs, { reference_period: "November 2027", release_date: "2027-12-03", status: "scheduled" }),

  row(bea, {
    series: "PCE",
    event: "Personal Income and Outlays",
    reference_period: "September 2026",
    release_date: "2026-10-29",
    status: "released",
  }),
  row(bea, {
    series: "PCE",
    event: "Personal Income and Outlays",
    reference_period: "October 2026",
    release_date: "2026-11-25",
    status: "scheduled",
    next: true,
  }),
  row(bea, {
    series: "PCE",
    event: "Personal Income and Outlays",
    reference_period: "November 2026",
    release_date: "2026-12-23",
    status: "scheduled",
  }),

  row(bea, {
    series: "GDP",
    event: "Gross domestic product, advance estimate",
    reference_period: "3rd quarter 2026",
    release_date: "2026-10-29",
    status: "released",
  }),
  row(bea, {
    series: "GDP",
    event: "Gross domestic product, second estimate, and corporate profits",
    reference_period: "3rd quarter 2026",
    release_date: "2026-11-25",
    status: "scheduled",
    next: true,
  }),
  row(bea, {
    series: "GDP",
    event: "Gross domestic product, third estimate, with industry, corporate profits, state GDP and state personal income",
    reference_period: "3rd quarter 2026",
    release_date: "2026-12-23",
    status: "scheduled",
  }),

  row(fedCalendar, {
    event: "FOMC meeting",
    reference_period: "October 27-28, 2026",
    release_date: "2026-10-28",
    release_time: "",
    status: "released",
    time_note: "The FOMC calendar lists the meeting. It does not print a clock time on the year page. Minutes were released 18 Nov 2026. Page last update 18 Nov 2026. Checked 20 Nov 2026.",
  }),
  row(fedDecember, {
    event: "FOMC meeting",
    reference_period: "December 8-9, 2026",
    release_date: "2026-12-09",
    release_time: "2:00 p.m.",
    status: "scheduled",
    next: true,
  }),
  row(fedDecember, {
    event: "FOMC press conference",
    reference_period: "December 8-9, 2026 meeting",
    release_date: "2026-12-09",
    release_time: "2:30 p.m.",
    status: "scheduled",
  }),
  row(fedDecember, {
    event: "FOMC minutes",
    reference_period: "December 8-9, 2026 meeting",
    release_date: "2026-12-30",
    release_time: "2:00 p.m.",
    status: "scheduled",
  }),
  row(fedCalendar, {
    event: "FOMC meeting (tentative)",
    reference_period: "January 26-27, 2027",
    release_date: "2027-01-27",
    release_time: "",
    status: "tentative",
    time_note: "The 2027 list gives dates only. The Fed says each date is tentative until confirmed at the meeting immediately preceding it. Page last update 18 Nov 2026.",
  }),
  row(fedCalendar, {
    event: "FOMC meeting (tentative)",
    reference_period: "March 16-17, 2027",
    release_date: "2027-03-17",
    release_time: "",
    status: "tentative",
    time_note: "The 2027 list gives dates only. The Fed says each date is tentative until confirmed at the meeting immediately preceding it. Page last update 18 Nov 2026.",
  }),
  row(fedCalendar, {
    event: "FOMC meeting (tentative)",
    reference_period: "April 27-28, 2027",
    release_date: "2027-04-28",
    release_time: "",
    status: "tentative",
    time_note: "The 2027 list gives dates only. The Fed says each date is tentative until confirmed at the meeting immediately preceding it. Page last update 18 Nov 2026.",
  }),
  row(fedCalendar, {
    event: "FOMC meeting (tentative)",
    reference_period: "June 8-9, 2027",
    release_date: "2027-06-09",
    release_time: "",
    status: "tentative",
    time_note: "The 2027 list gives dates only. The Fed says each date is tentative until confirmed at the meeting immediately preceding it. Page last update 18 Nov 2026.",
  }),
  row(fedCalendar, {
    event: "FOMC meeting (tentative)",
    reference_period: "July 27-28, 2027",
    release_date: "2027-07-28",
    release_time: "",
    status: "tentative",
    time_note: "The 2027 list gives dates only. The Fed says each date is tentative until confirmed at the meeting immediately preceding it. Page last update 18 Nov 2026.",
  }),
  row(fedCalendar, {
    event: "FOMC meeting (tentative)",
    reference_period: "September 14-15, 2027",
    release_date: "2027-09-15",
    release_time: "",
    status: "tentative",
    time_note: "The 2027 list gives dates only. The Fed says each date is tentative until confirmed at the meeting immediately preceding it. Page last update 18 Nov 2026.",
  }),
  row(fedCalendar, {
    event: "Calendar text: Monetary Policy Strategy Meeting",
    reference_period: "October 26-27, 2027",
    release_date: "2027-10-27",
    release_time: "",
    status: "tentative",
    time_note: "The 2027 calendar places the words Monetary Policy Strategy Meeting beside October 26-27. It does not describe that entry as a rate decision. Dates are tentative. Page last update 18 Nov 2026.",
  }),
  row(fedCalendar, {
    event: "FOMC meeting (tentative)",
    reference_period: "November 16-17, 2027",
    release_date: "2027-11-17",
    release_time: "",
    status: "tentative",
    time_note: "The 2027 list gives dates only. The Fed says each date is tentative until confirmed at the meeting immediately preceding it. Page last update 18 Nov 2026.",
  }),
  row(fedCalendar, {
    event: "FOMC meeting (tentative)",
    reference_period: "January 25-26, 2028",
    release_date: "2028-01-26",
    release_time: "",
    status: "tentative",
    time_note: "The FOMC calendar notes a two-day meeting for January 25-26, 2028. It gives no clock time. Page last update 18 Nov 2026.",
  }),

  row(pmms, {
    reference_period: "Week ending 18 Nov 2026",
    release_date: "2026-11-19",
    status: "released",
  }),
  row(pmms, {
    reference_period: "Week ending 24 Nov 2026",
    release_date: "2026-11-25",
    status: "scheduled",
    next: true,
  }),
  row(pmms, { reference_period: "Week ending 2 Dec 2026", release_date: "2026-12-03", status: "scheduled" }),
  row(pmms, { reference_period: "Week ending 9 Dec 2026", release_date: "2026-12-10", status: "scheduled" }),
  row(pmms, { reference_period: "Week ending 16 Dec 2026", release_date: "2026-12-17", status: "scheduled" }),
  row(pmms, { reference_period: "Week ending 23 Dec 2026", release_date: "2026-12-24", status: "scheduled" }),
  row(pmms, { reference_period: "Week ending 30 Dec 2026", release_date: "2026-12-31", status: "scheduled" }),
];

const faq = [
  {
    question: "When is the next CPI report?",
    answer:
      "The BLS schedule lists the November 2026 Consumer Price Index for 10 December 2026 at 8:30 a.m. The October 2026 CPI was released on 10 November 2026. The schedule table prints the clock time and does not label a time zone.",
  },
  {
    question: "When is the next jobs report?",
    answer:
      "The BLS Employment Situation schedule lists the November 2026 report for 4 December 2026 at 8:30 a.m. The October 2026 report was released on 6 November 2026.",
  },
  {
    question: "What time does Freddie Mac publish the mortgage survey?",
    answer:
      "Freddie Mac says the Primary Mortgage Market Survey is released at 12 p.m. ET, on Thursday, or on Wednesday when a U.S. holiday falls on Thursday. Its publication calendar lists 25 November 2026 as the next date after 19 November 2026.",
  },
  {
    question: "Does this calendar say what the Fed will decide?",
    answer:
      "No. It copies meeting dates from the Federal Reserve's own calendar. It does not say whether the committee will raise, hold or cut the funds rate.",
  },
];

const midReads = [
  {
    url: "/articles/2026-11-11-october-cpi-0-4-percent-core-holds-0-3/",
    title: "October CPI rises 0.4% as core inflation holds at 0.3% for a third month",
    src: "october-cpi-0-4-percent-core-holds-0-3-hero",
    alt: "October CPI story",
  },
  {
    url: "/articles/2026-11-11-cpi-vs-pce-inflation/",
    title: "CPI vs PCE: The Two Inflation Measures and Why the Fed Prefers PCE",
    src: "cpi-vs-pce-inflation-hero",
    alt: "CPI and PCE explainer",
  },
  {
    url: "/articles/2026-10-30-gdp-advance-third-quarter/",
    title: "BEA said real GDP rose at a 3.4% annual rate in the third quarter",
    src: "gdp-advance-hero",
    alt: "Third-quarter GDP story",
  },
  {
    url: "/articles/2026-10-30-personal-income-pce-september/",
    title: "BEA said September personal income rose 0.2% and the PCE price index 0.5%",
    src: "pce-sept-hero",
    alt: "September PCE story",
  },
];

const endReads = [
  {
    url: "/articles/2026-11-19-fomc-minutes-october-2026-rate-hike-ai-debt-financial-stability/",
    title: "Fed minutes: almost all officials expect more rate hikes, and most flag fast-growing, opaque AI debt",
    src: "fomc-minutes-october-2026-rate-hike-ai-debt-financial-stability-hero",
    alt: "October FOMC minutes story",
  },
  {
    url: "/articles/2026-10-29-fed-holds-funds-rate/",
    title: "Federal Reserve holds the funds rate at 3.75% to 4%",
    src: "fed-hold-hero",
    alt: "October Fed decision story",
  },
  {
    url: "/articles/2026-10-30-freddie-mac-mortgage-rates/",
    title: "Freddie Mac said the 30-year mortgage rate averaged 7.28% on Nov. 19",
    src: "pmms-rate-hero",
    alt: "Freddie Mac mortgage survey story",
  },
  {
    url: "/articles/2026-11-18-nahb-builder-confidence-november-2026-lowest-since-2012/",
    title: "US homebuilder confidence fell to 25 in November, its lowest reading since April 2012",
    src: "nahb-builder-confidence-november-2026-lowest-since-2012-hero",
    alt: "NAHB builder confidence story",
  },
];

export default {
  checked: CHECKED,
  rows,
  faq,
  midReads,
  endReads,
  seriesOrder: ["CPI", "Jobs report", "PCE", "GDP", "FOMC", "PMMS"],
};
