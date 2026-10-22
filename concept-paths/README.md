# Arabic concept paths

All 743 original cards are represented by 733 grouped concepts, across 11 topics and 69 branches. The original book reader and its saved progress remain available.

## Reading and reviewing

- Topic tree: one primary topic and branch for each concept; related topics connect families.
- Learning path: four levels, ordered by explicit supporting prerequisites, then original course position. Navigation is paged to keep the full library manageable. Topic and level filters also apply to the path.
- Recall practice: titles, explanations, translations and supporting links are hidden until the answer is revealed. Most prompts show the original Arabic example and ask the learner to explain the relevant rule. The pilot concepts retain their specific application questions. “Mix this review” shuffles the current filtered selection.
- Search matches titles, rules, Arabic examples, topic/branch names, original card titles and tags. Changing filters resets a mixed review. Prerequisite links clear filters so the supporting concept can be shown.
- Review does not save scores or schedule repetitions. Return to ideas after a gap and use the example explanation as feedback.

## Levels and dependencies

1. First patterns.
2. Build and distinguish.
3. Apply and connect.
4. Advanced patterns and refinements.

These are editorial estimates, not measured difficulty. Source course position supplies an initial level; topic complexity sets a floor; supporting prerequisites can raise it. Word classes and root-position terminology are deliberately introduced earlier. A few foundational supporting concepts do not capture every possible prerequisite for every card. Topic and branch views retain the same easier-to-harder order as the full path.

## Combining and preserving meaning

Nine groups combine selected repeated rules or complementary steps. The two-source adjective-case pilot was extended with two later restatements. The adjective-definiteness pilot adds a later review. Other combinations cover the illustrated falan adjectives, feminine names, masculine names ending in ta marbutah, hope versus concern, temporal lamma, and before/after vocabulary. `coverage.json` lists the exact IDs and editorial reasons.

Similar meanings alone are insufficient grounds to combine rules. Later ibn spelling conditions, omitted-complement contrasts, innama’s grammatical explanation, and the restoration of kasrah in diptotes remain separate concepts with supporting links.

Mappings are many-to-many: a source can support a comparison and a standalone qualification. Consequently the concept count is not a simple “743 minus merged cards” count. All exact takeaways are preserved in `sourceCards`; examples include the original full explanations. Grouped summaries and application prompts are separate editorial fields.

## Files and regeneration

- `concepts.json`: full grouped library, learning order, aliases, source URLs, examples and review prompts.
- `coverage.json`: totals, topic/branch counts, combination decisions, separate qualifications.
- `../key-takeaways.json`: flat export of every original takeaway.
- `../continuation/build-concept-pilot.cjs`: curated pilot definitions.
- `../continuation/concept-taxonomy.cjs`: priority-based taxonomy and individually reviewed placements for incidental tags.
- `../continuation/build-concept-library.cjs`: full library, combinations and prerequisite anchors.
- `../continuation/check-concept-library.cjs`: independent checks against the original card modules.

Run the four commands documented in the repository README after content changes. The builder rejects missing sources, unclassified cards, invalid overrides, duplicate IDs, lost coverage, changed example text, invalid card URLs and prerequisite cycles.

Old source-card IDs resolve through `aliases`; approved pilot concept IDs remain valid. URLs are relative to the host for the local reader and absolute for published source links. No external service or package is required.
