# Compact project handoff

- App repository: D:/arabic-projects/madinah-arabic-course/madinah-arabic-course-web-app. Buildless assets are at the repository root. No installation or build is required.
- GitHub repository: https://github.com/farazshuja/madinah-arabic-course-web-app . Live site: https://farazshuja.github.io/madinah-arabic-course-web-app/ . GitHub Pages publishes main branch root.
- All supplied Key books are complete: Book 1, chapters 1–23 (including 4a), 143 cards; Book 2, chapters 1–31, 264; Book 3A, chapters 1–15, 124; Book 3B, chapters 16–34, 212. Total 743. Generated state/tags are authoritative after later changes. No next batch remains. Do not invent chapters beyond 34.
- Internal book numbers: 1, 2, 3 (visible Book 3A), 4 (visible Book 3B). Immutable prefixes: b1, b2, b3a, b3b. Existing 531 cards were preserved unchanged during Book 3B work.
- Read source scans visually only for the requested new work. Book3B_Key.pdf has 136 pages: PDF page 3 = printed 81; grammar ends PDF 127/printed 205; vocabulary ends PDF 136/printed 214. Coverage reports in the repository root list point-level coverage. No Content/Solution material or account sync is included.
- Schema: id, book, chapter, source, title, intro, arabic, translation, body, takeaway, tags. Batch modules use a local add helper; script order in index.html populates concepts before app.js. Source examples use literal newline escapes.
- Reader books configuration is near the top of app.js. Labels and edition identifiers distinguish 3A/3B. Progress/positions are per book; topics and bookmarks span books in source order.
- Preserve localStorage key madinah.progress.v1 and existing IDs. Storage includes current, read, saved, positions.
- Run node continuation/index.cjs refresh for compact counts/state/tags. Use tags QUERY or lookup EXACT-TAG to inspect existing tags without rereading the corpus. check validates schema, full navigation/completion, old storage, book totals/lists, cross-book bookmarks and remembered positions/reload/topic order.
- Prepare and validate all local batches before one final commit and push to GitHub main. GitHub Pages deploys from the branch root. Never include credentials or source PDFs in the repository. Runtime approvals still apply.
- Browser QA passed locally for Book 3B selection, chapter navigation, next/progress, bookmark and reload; Arabic layout inspected. No subagents requested; do not spawn any.

## Grouped concept library

- `concept-paths/` covers every original card: 743 source cards, 733 concepts, 11 topics, 69 branches. The original reader links to it; `pilot/` preserves the approved 19-concept sample and links to the full library.
- `concept-paths/concepts.json` stores grouped rules, topic/branch, editorial levels, prerequisites, related topics, review prompts, exact source takeaways, original examples/explanations, URLs and source-ID aliases. `coverage.json` records counts and nine reviewed combinations. `key-takeaways.json` remains the flat original export.
- Generate in order: `node continuation/build-concept-pilot.cjs`, `node continuation/export-takeaways.cjs`, `node continuation/build-concept-library.cjs`. Validate with `node continuation/check-concept-library.cjs` and the existing `node continuation/index.cjs check`.
- `concept-taxonomy.cjs` has priority rules and reviewed overrides for incidental tags. `build-concept-library.cjs` has reviewed combinations and explicit supporting prerequisites. The builder checks total source coverage and dependency order. Do not blindly merge similar English meanings or remove later conditions.
- Concept paths provides a collapsible topic tree, paged learning path, normalized Arabic/English search, topic/level filters, and recall/mixed review. Recall hides titles, translations and explanations until reveal; it stores no mastery scores or review schedule. Levels are editorial estimates, not measured difficulty.
- Reader links use `?card=ID` to override the remembered position. Existing IDs, book navigation and `madinah.progress.v1` storage remain compatible. Concept-path source links use the current host; published source URLs are retained separately.

