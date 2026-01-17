/**
 * Numberblocks color scheme
 * Each number 1-10 has a unique color, then pattern repeats
 */

// Base colors for Numberblocks 1-10 (official colors)
const BASE_COLORS = {
  1: 0xde151d,    // Red
  2: 0xe89223,    // Orange
  3: 0xe6c40c,    // Yellow
  4: 0x38b500,    // Green
  5: 0x23b0db,    // Cyan/Blue
  6: 0x4B0082,    // Indigo
  7: 'rainbow',   // Special rainbow handling (7 colors for 7 blocks)
  8: 0xFF1493,    // Magenta
  9: 0x808080,    // Grey
  10: 0xFFFFFF,   // White
};

// Rainbow colors for column 7 - each block gets a different color
const RAINBOW_COLORS = [
  0xFF0000,    // Red
  0xFF6600,    // Orange
  0xFFFF00,    // Yellow
  0x00FF00,    // Green
  0x0066FF,    // Blue
  0x4B0082,    // Indigo
  0x9900FF,    // Violet
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
