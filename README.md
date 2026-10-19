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

## Publishing

GitHub Pages publishes the root of the `main` branch. Push completed changes to `main` to update the website. All asset paths are relative, supporting the repository's Pages subdirectory.

Browser data is specific to the website origin. Progress saved on the earlier ChatGPT-hosted website does not transfer automatically to GitHub Pages.
