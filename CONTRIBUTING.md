# Contributing

Daily story batches have to pass the legal hold gate before they can be published.

```bash
node scripts/legal-gate.js
```

Stdout is JSONL, one object per held story (`site`, `bot`, `title`, `flagged`, `rule`, `sources`, `suggestion`, `draft_path`, `sha256`, `status`). A held story stays in `src/content/posts/` with `status: HOLD_REVIEW`. It is kept out of the pages, feeds, sitemap, homepage, and tags. Do not delete it, and do not rewrite the wording to get past the gate.

Do not add a line to `content-review/approvals.jsonl` or `content-review/moderate-clearances.jsonl`. An approval has to be Joshua’s, for the sha256 of that exact file. A moderate clearance cannot clear a high-tier hold.

The README section “Legal hold gate” lists which checks the code enforces and which ones are still a judgement call.
