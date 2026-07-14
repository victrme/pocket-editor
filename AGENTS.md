# AGENTS.md

## Toolchain

- Deno only. Lint, format, install deps via Deno.
- Do NOT add dependencies. No new imports in `deno.json` / `package.json` / `deno.lock`.
- Node is only for Playwright (`npx playwright test`) and the esbuild build (`deno task build`). Keep it that way.

## Tests

- Playwright suite in `tests/`. Requires `deno task example:build` first (preview server on port 4173).
- Do NOT run tests unless you added logic that changes behavior.
- Task is not finished until tests pass. `deno lint` clean + Playwright green.

## Code style

- `deno fmt`: tabs, no semicolons, indent width 4, line width 120.
- `deno lint` with `recommended` tag. Excluded rules: `no-sloppy-imports`, `no-window-prefix`, `no-window` — these patterns are OK.
- JSDoc on business logic (lib/ and utils/, plus public API in `src/index.ts`). Trivial getters/setters and pure-DOM glue don't need it.
- `unstable: ["sloppy-imports"]` — bare `./foo.ts` imports are fine.

## Layout

- `src/` — library source. Entry: `src/index.ts` (exports `PocketEditor`, default export).
- `src/lib/` — core modules: content/paragraph/caret/line control, transforms, clipboard, undo, keybindings.
- `src/utils/` — small helpers (setCaret, removeModifier, lastTextNode, detectLineJump).
- `example/` — Vite app that imports `src/` directly. Drives Playwright tests via its built `dist/`.
- `tests/` — Playwright specs (index, transform, deletion, selection, keybindings).
- `browser/` — standalone bundles (no deps). `dist/` — npm package output.

## Domain model

- Editor is a container of `<div>` lines, each wrapping one `contenteditable` element (`<p>`, `<h1-3>`, or `<p>` + marker span for lists/todos).
- Line "modifier" = markdown prefix: `#`/`##`/`###` (h1/h2/h3), `-` (list), `[ ]` (todo), `[x]` (todo-checked). Stored as `data-*` attributes on the line div.
- `mods` map on the instance defines prefixes; `lineTransform` converts a line between types; `toMarkdown`/`toHTML` round-trip markdown.
- Tests assert on `data-*` attributes, `[contenteditable]` text, and DOM structure — match those contracts when refactoring.

## Build / CI

- `deno lint` then `deno task example:build` then `npx playwright install --with-deps` then `npx playwright test` (see `.github/workflows/test.yaml`).
- `deno task build` produces `dist/index.js` + `dist/style.css` + d.ts (esbuild + tsc).
