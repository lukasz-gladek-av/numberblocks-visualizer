# Numberblocks Step Squad 3D Visualization
[![Build Pages](https://github.com/lukasz-gladek-av/numberblocks-visualizer/actions/workflows/build-pages.yml/badge.svg)](https://github.com/lukasz-gladek-av/numberblocks-visualizer/actions/workflows/build-pages.yml)

[Live demo](https://lukasz-gladek-av.github.io/numberblocks-visualizer/)

An interactive 3D educational visualization of the Numberblocks "step squad". For a number N, the scene renders columns from 1 to N blocks, plus additional modes for different arrangements.

## Features
- 3D staircase visualization with N columns (1..N blocks)
- Modes: Staircase, Column, Squares, Cubes, Pyramid (1..N..1)
- Add/remove columns with +/- controls (min 1)
- Auto-zoom camera to fit the current layout
- Mouse rotation with OrbitControls
- Column labels (1..N)
- Total blocks display (e.g. N × (N+1) / 2)
- Responsive UI for mobile and desktop

## Color and Border Rules
- Official Numberblocks colors for 1-20 and a tens-based scheme for 20-99
- Special case 7: rainbow (7 distinct colors)
- Special case 9: gray gradient (three levels)
- Special case 10: white with red border
- Special case 11-19: 10 + ones (place-value decomposition)
- Special case 20: apricot with orange border
- Borders are rendered as thin rounded frames and do not intersect blocks or cast artifacts

All number definitions live in `js/numberblockConfig.js`.

## Tech Stack
- Three.js
- Vite
- ES modules

## Project Structure
```
numberblock_step_squad/
├── index.html                  # Single-page entry
├── package.json                # Dependencies and scripts
├── styles/
│   └── main.css                # UI styles and responsiveness
├── js/
│   ├── main.js                # App bootstrap
│   ├── scene.js               # Three.js setup (scene, camera, renderer)
│   ├── staircase.js           # Staircase layout management
│   ├── blocks.js              # Block and column creation
│   ├── numberblockConfig.js   # Number definitions and colors
│   ├── colors.js              # Color utilities
│   ├── faces.js               # Placeholder for Phase 2 features
│   └── controls.js            # UI interactions
└── .gitignore
```

## Getting Started
```bash
npm install
npm run dev
```
Open `http://localhost:5173/` in your browser.

## Production Build
```bash
npm run build
npm run preview
```

## GitHub Pages
This repo is configured to serve from `docs/` on the `master` branch. Before deploying, run:
```bash
npm run build
```
Then commit the updated `docs/` directory.

## Configuration Pointers
- Number definitions and color rules: `js/numberblockConfig.js`
- Scene and camera settings: `js/scene.js`
- Staircase layout logic: `js/staircase.js`
- UI controls: `js/controls.js`
- Styling: `styles/main.css`

## Roadmap
- Faces and expressions for each number
- Accessories (glasses, hats)
- Add/remove animations and click sounds
- Export to PNG
- Additional layout shapes
- Optional dark theme
