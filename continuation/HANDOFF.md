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

