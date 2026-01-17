/**
 * Numberblocks color scheme
 * Maintains backwards compatibility while providing access to new config system
 */

import { getNumberblockConfig, NUMBERBLOCK_BORDER_COLORS } from './numberblockConfig.js';

// Base colors for Numberblocks 1-10 (vibrant, cartoon-style colors)
// Kept for reference and backwards compatibility
const BASE_COLORS = {
  1: 0xFF2E3B,    // Vibrant Red
  2: 0xFF8C00,    // Vibrant Orange
  3: 0xFFD700,    // Vibrant Yellow
  4: 0x32CD32,    // Vibrant Green
  5: 0x00BFFF,    // Vibrant Cyan
  6: 0x7B68EE,    // Vibrant Indigo
  7: 'rainbow',   // Special rainbow handling (7 colors for 7 blocks)
  8: 0xFF69B4,    // Vibrant Magenta
  9: 0xA9A9A9,    // Lighter Grey
  10: 0xFFFFFF,   // White
};

// Rainbow colors for column 7 - each block gets a different color (vibrant)
const RAINBOW_COLORS = [
  0xFF2E3B,    // Vibrant Red
  0xFF8C00,    // Vibrant Orange
  0xFFD700,    // Vibrant Yellow
  0x32CD32,    // Vibrant Green
  0x00BFFF,    // Vibrant Cyan
  0x7B68EE,    // Vibrant Indigo
  0xFF69B4,    // Vibrant Violet/Magenta
];

/**
 * Get color for a column number
 * For column 7, cycle through rainbow colors for each block index
 * @param {number} columnNumber - The column number (1-based)
 * @param {number} blockIndex - The block index within the column (0-based, optional)
 * @returns {number} - Hex color value
 */
export function getColumnColor(columnNumber, blockIndex = 0) {
  // Normalize column number to 1-10 range
  const normalizedColumn = ((columnNumber - 1) % 10) + 1;

  if (normalizedColumn === 7) {
    // Rainbow column - cycle through colors
    return RAINBOW_COLORS[blockIndex % RAINBOW_COLORS.length];
  }

  return BASE_COLORS[normalizedColumn];
}

/**
 * Get base color for a column (used for non-rainbow columns)
 * @param {number} columnNumber - The column number (1-based)
 * @returns {number|string} - Hex color value or 'rainbow'
 */
export function getBaseColor(columnNumber) {
  const normalizedColumn = ((columnNumber - 1) % 10) + 1;
  return BASE_COLORS[normalizedColumn];
}

/**
 * Check if a column should use rainbow colors
 * @param {number} columnNumber - The column number (1-based)
 * @returns {boolean}
 */
export function isRainbowColumn(columnNumber) {
  const normalizedColumn = ((columnNumber - 1) % 10) + 1;
  return normalizedColumn === 7;
}

export const NUMBERBLOCK_COLORS = BASE_COLORS;
export const RAINBOW = RAINBOW_COLORS;

/**
 * Re-export new config system for centralized access
 */
export { getNumberblockConfig, NUMBERBLOCK_BORDER_COLORS };
