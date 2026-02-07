/**
 * Numberblocks Configuration System
 * Defines color, borders, and block composition for each number 1-99
 * Based on official Numberblocks character design
 */

// Color definitions
const COLORS = {
  RED: 0xFF2E3B,      // 1
  ORANGE: 0xFF8C00,   // 2
  YELLOW: 0xFFD700,   // 3
  GREEN: 0x32CD32,    // 4
  CYAN: 0x00BFFF,     // 5
  INDIGO: 0x7B68EE,   // 6
  MAGENTA: 0xFF69B4,  // 8
  GREY_LIGHT: 0xD3D3D3,    // For 9 gradient
  GREY_MEDIUM: 0xA9A9A9,   // For 9 gradient
  GREY_DARK: 0x808080,     // For 9 gradient
  WHITE: 0xFFFFFF,    // 10, and tens in 11-19
  APRICOT: 0xFFCC99,  // 20 (light brownish-sandy)
};

const BORDER_COLORS = {
  RED: 0xFF2E3B,      // For 10 and teen tens
  ORANGE: 0xFF8C00,   // For 20
};

const RAINBOW_COLORS = [
  COLORS.RED,
  COLORS.ORANGE,
  COLORS.YELLOW,
  COLORS.GREEN,
  COLORS.CYAN,
  COLORS.INDIGO,
  COLORS.MAGENTA,
];

const TENS_RAINBOW_COLORS = RAINBOW_COLORS.map((color) => lightenColor(color, 0.55));
const TENS_NINE_COLORS = [
  0xD9D9D9,
  0xB8B8B8,
  0x989898,
];
const TENS_NINE_BORDER_COLORS = [
  0xA9A9A9,
  0x888888,
  0x686868,
];
const TENS_NINE_COLUMN_COLORS = [
  TENS_NINE_COLORS[0], TENS_NINE_COLORS[0], TENS_NINE_COLORS[0],
  TENS_NINE_COLORS[1], TENS_NINE_COLORS[1], TENS_NINE_COLORS[1],
  TENS_NINE_COLORS[2], TENS_NINE_COLORS[2], TENS_NINE_COLORS[2], TENS_NINE_COLORS[2],
];

/**
 * Helper: Create single-color blocks
 */
function createSolidBlocks(count, color, borderColor = null) {
  return Array(count).fill(null).map(() => ({
    color,
    borderColor,
    blockType: 'one'
  }));
}

function createPatternBlocks(count, palette, borderColor = null) {
  return Array(count).fill(null).map((_, index) => ({
    color: palette[index % palette.length],
    borderColor,
    blockType: 'one'
  }));
}

function createColumnPatternBlocks(columnCount, columnHeight, palette, borderColors = null) {
  return Array(columnCount * columnHeight).fill(null).map((_, index) => {
    const columnIndex = Math.floor(index / columnHeight);
    const borderColor = Array.isArray(borderColors)
      ? borderColors[columnIndex % borderColors.length]
      : borderColors;
    return {
      color: palette[columnIndex % palette.length],
      borderColor,
      blockType: 'one'
    };
  });
}

/**
 * Get configuration for a specific number
 * @param {number} number - The number (1-99)
 * @returns {Object} Configuration object with blocks array
 */
export function getNumberblockConfig(number) {
  if (number < 1 || number > 99) {
    throw new Error(`Number must be between 1 and 99, got ${number}`);
  }

  // Handle teens (11-19) by decomposing into tens + ones
  if (number >= 11 && number <= 19) {
    const ones = number - 10;
    const tenBlocks = createSolidBlocks(10, COLORS.WHITE, BORDER_COLORS.RED);
    const oneBlocks = getOneBlocksForNumber(ones);
    return {
      number,
      displayName: getNumberName(number),
      blocks: [...tenBlocks, ...oneBlocks],
      face: getDefaultFaceConfig(number)
    };
  }

  // Handle numbers 20-99 by decomposing into tens + ones
  if (number >= 20) {
    const tens = Math.floor(number / 10);
    const ones = number % 10;
    const tensColorConfig = getTensColorsForDigit(tens);
    const tensBlocks = tens === 7
      ? createColumnPatternBlocks(tens, 10, TENS_RAINBOW_COLORS, RAINBOW_COLORS)
      : tens === 9
        ? createColumnPatternBlocks(tens, 10, TENS_NINE_COLUMN_COLORS, TENS_NINE_BORDER_COLORS)
        : createSolidBlocks(tens * 10, tensColorConfig.baseColor, tensColorConfig.borderColor);
    const oneBlocks = ones > 0 ? getOneBlocksForNumber(ones) : [];
    return {
      number,
      displayName: getNumberName(number),
      blocks: [...tensBlocks, ...oneBlocks],
      face: getDefaultFaceConfig(number)
    };
  }

  // Handle special and single-digit numbers
  switch (number) {
    case 1:
      return {
        number,
        displayName: 'One',
        blocks: createSolidBlocks(1, COLORS.RED),
        face: getDefaultFaceConfig(1)
      };
    case 2:
      return {
        number,
        displayName: 'Two',
        blocks: createSolidBlocks(2, COLORS.ORANGE),
        face: getDefaultFaceConfig(2)
      };
    case 3:
      return {
        number,
        displayName: 'Three',
        blocks: createSolidBlocks(3, COLORS.YELLOW),
        face: getDefaultFaceConfig(3)
      };
    case 4:
      return {
        number,
        displayName: 'Four',
        blocks: createSolidBlocks(4, COLORS.GREEN),
        face: getDefaultFaceConfig(4)
      };
    case 5:
      return {
        number,
        displayName: 'Five',
        blocks: createSolidBlocks(5, COLORS.CYAN),
        face: getDefaultFaceConfig(5)
      };
    case 6:
      return {
        number,
        displayName: 'Six',
        blocks: createSolidBlocks(6, COLORS.INDIGO),
        face: getDefaultFaceConfig(6)
      };
    case 7:
      // Rainbow: 7 blocks with different colors
      return {
        number,
        displayName: 'Seven',
        blocks: [
          { color: COLORS.RED, borderColor: null, blockType: 'one' },
          { color: COLORS.ORANGE, borderColor: null, blockType: 'one' },
          { color: COLORS.YELLOW, borderColor: null, blockType: 'one' },
          { color: COLORS.GREEN, borderColor: null, blockType: 'one' },
          { color: COLORS.CYAN, borderColor: null, blockType: 'one' },
          { color: COLORS.INDIGO, borderColor: null, blockType: 'one' },
          { color: COLORS.MAGENTA, borderColor: null, blockType: 'one' },
        ],
        face: getDefaultFaceConfig(7)
      };
    case 8:
      return {
        number,
        displayName: 'Eight',
        blocks: createSolidBlocks(8, COLORS.MAGENTA),
        face: getDefaultFaceConfig(8)
      };
    case 9:
      // Grey gradient: 9 blocks grouped by shade (3 light, 3 medium, 3 dark)
      return {
        number,
        displayName: 'Nine',
        blocks: [
          { color: COLORS.GREY_LIGHT, borderColor: null, blockType: 'one' },
          { color: COLORS.GREY_LIGHT, borderColor: null, blockType: 'one' },
          { color: COLORS.GREY_LIGHT, borderColor: null, blockType: 'one' },
          { color: COLORS.GREY_MEDIUM, borderColor: null, blockType: 'one' },
          { color: COLORS.GREY_MEDIUM, borderColor: null, blockType: 'one' },
          { color: COLORS.GREY_MEDIUM, borderColor: null, blockType: 'one' },
          { color: COLORS.GREY_DARK, borderColor: null, blockType: 'one' },
          { color: COLORS.GREY_DARK, borderColor: null, blockType: 'one' },
          { color: COLORS.GREY_DARK, borderColor: null, blockType: 'one' },
        ],
        face: getDefaultFaceConfig(9)
      };
    case 10:
      // White with red borders
      return {
        number,
        displayName: 'Ten',
        blocks: createSolidBlocks(10, COLORS.WHITE, BORDER_COLORS.RED),
        face: getDefaultFaceConfig(10)
      };
    default:
      throw new Error(`Unknown number: ${number}`);
  }
}

/**
 * Helper: Get blocks for a single digit (used in teens)
 * Returns the appropriate colored blocks for the ones place
 */
function getOneBlocksForNumber(digit) {
  switch (digit) {
    case 1: return createSolidBlocks(1, COLORS.RED);
    case 2: return createSolidBlocks(2, COLORS.ORANGE);
    case 3: return createSolidBlocks(3, COLORS.YELLOW);
    case 4: return createSolidBlocks(4, COLORS.GREEN);
    case 5: return createSolidBlocks(5, COLORS.CYAN);
    case 6: return createSolidBlocks(6, COLORS.INDIGO);
    case 7:
      // Rainbow for teens with 7 (e.g., 17)
      return [
        { color: COLORS.RED, borderColor: null, blockType: 'one' },
        { color: COLORS.ORANGE, borderColor: null, blockType: 'one' },
        { color: COLORS.YELLOW, borderColor: null, blockType: 'one' },
        { color: COLORS.GREEN, borderColor: null, blockType: 'one' },
        { color: COLORS.CYAN, borderColor: null, blockType: 'one' },
        { color: COLORS.INDIGO, borderColor: null, blockType: 'one' },
        { color: COLORS.MAGENTA, borderColor: null, blockType: 'one' },
      ];
    case 8: return createSolidBlocks(8, COLORS.MAGENTA);
    case 9:
      // Grey gradient for teens with 9 (e.g., 19) - grouped by shade (3 light, 3 medium, 3 dark)
      return [
        { color: COLORS.GREY_LIGHT, borderColor: null, blockType: 'one' },
        { color: COLORS.GREY_LIGHT, borderColor: null, blockType: 'one' },
        { color: COLORS.GREY_LIGHT, borderColor: null, blockType: 'one' },
        { color: COLORS.GREY_MEDIUM, borderColor: null, blockType: 'one' },
        { color: COLORS.GREY_MEDIUM, borderColor: null, blockType: 'one' },
        { color: COLORS.GREY_MEDIUM, borderColor: null, blockType: 'one' },
        { color: COLORS.GREY_DARK, borderColor: null, blockType: 'one' },
        { color: COLORS.GREY_DARK, borderColor: null, blockType: 'one' },
        { color: COLORS.GREY_DARK, borderColor: null, blockType: 'one' },
      ];
    default:
      throw new Error(`Invalid digit: ${digit}`);
  }
}

function getTensColorsForDigit(digit) {
  switch (digit) {
    case 2:
      return { baseColor: COLORS.APRICOT, borderColor: COLORS.ORANGE };
    case 3:
      return { baseColor: lightenColor(COLORS.YELLOW, 0.55), borderColor: COLORS.YELLOW };
    case 4:
      return { baseColor: lightenColor(COLORS.GREEN, 0.55), borderColor: COLORS.GREEN };
    case 5:
      return { baseColor: lightenColor(COLORS.CYAN, 0.55), borderColor: COLORS.CYAN };
    case 6:
      return { baseColor: lightenColor(COLORS.INDIGO, 0.55), borderColor: COLORS.INDIGO };
    case 7:
      return { baseColor: lightenColor(COLORS.MAGENTA, 0.55), borderColor: COLORS.MAGENTA };
    case 8:
      return { baseColor: lightenColor(COLORS.MAGENTA, 0.45), borderColor: COLORS.MAGENTA };
    case 9:
      return { baseColor: COLORS.GREY_LIGHT, borderColor: COLORS.GREY_DARK };
    default:
      throw new Error(`Invalid tens digit: ${digit}`);
  }
}

function lightenColor(color, amount) {
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  const nr = Math.min(255, Math.round(r + (255 - r) * amount));
  const ng = Math.min(255, Math.round(g + (255 - g) * amount));
  const nb = Math.min(255, Math.round(b + (255 - b) * amount));
  return (nr << 16) | (ng << 8) | nb;
}

/**
 * Helper: Get English name for a number
 */
function getNumberName(number) {
  const names = [
    'Zero', 'One', 'Two', 'Three', 'Four', 'Five',
    'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
    'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'
  ];
  return names[number] || `Number ${number}`;
}

/**
 * Helper: Get default face configuration
 * Used as placeholder for future Phase 2 implementation
 */
function getDefaultFaceConfig(number) {
  return {
    eyeCount: number === 1 ? 1 : 2,
    eyeShape: [1, 4, 9, 16].includes(number) ? 'square' : 'oval',
    eyeColor: 0x000000,
    mouthType: 'smile',
    accessories: []
  };
}

/**
 * Helper: Decompose number into tens and ones
 * e.g., 14 -> { tens: 10, ones: 4 }
 */
export function decomposeNumber(number) {
  if (number < 10) {
    return { tens: 0, ones: number };
  }
  const tens = Math.floor(number / 10) * 10;
  const ones = number % 10;
  return { tens, ones };
}

/**
 * Export color constants for reference
 */
export const NUMBERBLOCK_COLORS = COLORS;
export const NUMBERBLOCK_BORDER_COLORS = BORDER_COLORS;
