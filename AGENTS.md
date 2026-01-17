# Repository Guidelines

## Project Structure & Module Organization
- `index.html` is the single page entry that hosts the Three.js canvas and UI controls.
- `js/` holds ES module source files. Key modules: `js/main.js` (bootstraps), `js/scene.js` (Three.js setup), `js/staircase.js` (column model), `js/blocks.js` (block creation), `js/numberblockConfig.js` (number definitions).
- `styles/` contains `styles/main.css` for layout and visual styling.
- `node_modules/` is managed by npm and should not be edited directly.

## Build, Test, and Development Commands
- `npm install` installs dependencies.
- `npm run dev` starts the Vite dev server at `http://localhost:5173/`.
- `npm run build` creates a production build in `dist/`.
- `npm run preview` serves the production build locally for a final check.

## Coding Style & Naming Conventions
- Use ES modules (`import`/`export`) and semicolon-terminated statements.
- Indentation is 2 spaces; keep lines readable and prefer small, focused functions.
- Naming: `camelCase` for functions/variables, `PascalCase` for classes, and files in `lowerCamel.js` (examples: `js/numberblockConfig.js`, `js/staircase.js`).
- No formal formatter or linter is configured; keep changes consistent with existing style.

## Testing Guidelines
- There is no automated test suite yet.
- Validate changes manually via `npm run dev`:
  - Add/remove columns with the +/- buttons.
  - Confirm color rules for special numbers (7, 9, 10, 11–19, 20).
  - Check border walls (thickness, rounding, no shadow artifacts).
  - Check camera auto-zoom and label updates.

## Commit & Pull Request Guidelines
- Commit messages follow a concise, imperative style (e.g., “Refactor columns to object-based config system…”).
- PRs should include:
  - A short summary of behavior changes.
  - Steps to verify (commands + manual checks).
  - Screenshots or a short recording for UI/visual changes.
  - Linked issues if applicable.

## Configuration Tips
- Number definitions live in `js/numberblockConfig.js`; update this file for color or border rules.
- Keep `CLAUDE.md` and `README.md` in sync if you change structure or behaviors.
