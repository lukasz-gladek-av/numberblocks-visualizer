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

## 2026-02-11
- User follow-up: "Przyciski nie działają na telefonie".
- Fixed mobile button interactions in `js/controls.js`:
  - Removed `touchstart` handler that called `preventDefault()`.
  - Switched touch feedback to Pointer Events (`pointerdown/up/cancel/leave`) with fallback for older browsers.
  - Kept visual press/release feedback without blocking native click activation.
- Added `touch-action: manipulation;` to `.btn` in `styles/main.css` to improve tap handling on phones.
- TODO: verify on mobile-emulated browser that +/-/reset/mode buttons respond to tap and still animate press state.
- Additional mobile issue found and fixed: on narrow screens controls overflowed outside viewport, making +/- appear non-functional.
- Responsive control bar updated (`styles/main.css`) to wrap on mobile and reduce control sizes so all buttons stay inside viewport.
- New UX behavior for sneeze button:
  - `KICHANIE` now appears above the main controls row (`position: absolute` anchored to `.controls`).
  - It is visible only in square mode (`hidden` toggled in `updateSquareSneezeButton`).
  - Added `aria-hidden` synchronization for accessibility.
- Mobile verification (Playwright iPhone 13 emulation):
  - All control buttons are inside viewport.
  - Taps work for `+`, `-`, `-10`.
  - Sneeze button hidden in non-square mode and visible above controls in square mode.
