Original prompt: Zrób żeby tryb pojedynczy nie rosl bez konca w gore ale kazda kolejna dziesiatke dostawial z boku tzn. 13 to jedna kolumna 10 i 3 z boku, 47 to to 4 kolumny po 10 w kolorze 40 i kolorowe 7 z boku

## 2026-02-07
- Added column-mode decomposition logic in `js/staircase.js`: numbers in single mode are now rendered as side-by-side tens columns + optional ones column.
- Updated camera usage in `js/controls.js` to pass real max column height (`getMaxColumnHeight`) instead of raw `n`.
- User follow-up: keep only one label in column mode. Updated label rebuild in `js/staircase.js` to render a single centered label with total value.
- TODO: run build and browser validation for examples 13 and 47 in column mode.
- Validation complete:
  - `npm run build` passes.
  - Playwright client check for column mode with `n=13`: visual shows one 10-column + one 3-column side-by-side; single top label `13`.
  - Playwright client check for column mode with `n=47`: visual shows four 10-columns in tens color and rainbow 7-column on the side; single top label `47`.
- Notes:
  - Top info bar now reports real rendered column count in column mode (e.g., `5 kolumn: 47 klocków`).
- TODO for next agent:
  - If preferred by product UX, change top info text in column mode to keep historical wording (e.g., `1 kolumna: 47 klocków`) while retaining split visual layout.
