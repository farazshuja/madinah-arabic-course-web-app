# Madinah Arabic Course

[Open the website](https://farazshuja.github.io/madinah-arabic-course-web-app/)

Learn the Key concepts one card at a time, with simple English explanations, Arabic examples, chapter navigation, bookmarks and topic tags across books.

Includes all 743 concepts: Book 1 (143), Book 2 (264), Book 3A (124), and Book 3B (212). Reading progress and bookmarks are stored in your browser.

## Local development

This is a static website with no build step or package installation. From this folder:

```sh
python -m http.server 8000
```

Open http://localhost:8000/.

```sh
node continuation/index.cjs check
node continuation/index.cjs refresh
```

See the coverage reports and `continuation/HANDOFF.md` for content maintenance. Original source PDFs remain in the parent workspace's `books/` folder and are not deployed.

## Concept paths

Open [Concept paths](concept-paths/) to explore all 743 cards as 733 concepts in 11 topics and 69 branches. Browse the topic tree, follow an easier-to-harder learning path, search/filter, or practise recall with hidden answers. Original examples, explanations, exact takeaways and direct card links remain attached.

The [grouped JSON](concept-paths/concepts.json) includes topics, prerequisites, levels, review prompts, source mappings and aliases for consolidated cards. [Coverage and grouping decisions](concept-paths/coverage.json) records all combinations and totals. Levels are editorial estimates based on topic complexity, original course position and supporting prerequisites.

Regenerate and validate:

```sh
node continuation/build-concept-pilot.cjs
node continuation/export-takeaways.cjs
node continuation/build-concept-library.cjs
node continuation/check-concept-library.cjs
```

The approved [19-concept pilot](pilot/) is preserved for comparison. Its curated definitions seed the full library. Topic classification and reviewed overrides live in `continuation/concept-taxonomy.cjs`; reviewed combinations and supporting prerequisites live in `continuation/build-concept-library.cjs`. See [library notes](concept-paths/README.md).

## Key takeaway export

`key-takeaways.json` contains every card's exact takeaway, ID, book, chapter, title, and direct `cardUrl`. Card links use `?card=CARD_ID` to open the associated card, overriding the browser's remembered position. Regenerate the export after editing cards:

```sh
node continuation/export-takeaways.cjs
```

## Publishing

GitHub Pages publishes the root of the `main` branch. Push completed changes to `main` to update the website. All asset paths are relative, supporting the repository's Pages subdirectory.

Browser data is specific to the website origin. Progress saved on the earlier ChatGPT-hosted website does not transfer automatically to GitHub Pages.
