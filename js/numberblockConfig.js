/**
 * Numberblocks Configuration System
 * Defines color, borders, and block composition for each number 1-999
 * Based on official Numberblocks character design
 *
 * Color system scales by place value:
 *   Ones (1-9):     solid blocks in digit's primary color
 *   Tens (10-90):   lightened blocks + primary-color border
 *   Hundreds (100-900): checkerboard of two lightened shades + primary-color border
 *
 * Digits 7 and 9 are multi-color at every scale:
 *   7: rainbow (each unit uses a different RAINBOW_COLORS entry)
 *   9: grey gradient (3+3+3 grouping of light/medium/dark)
 */

// ─── Color Definitions ─────────────────────────

const COLORS = {
  RED: 0xFF2E3B,
  ORANGE: 0xFF8C00,
  YELLOW: 0xFFD700,
  GREEN: 0x32CD32,
  CYAN: 0x00BFFF,
  INDIGO: 0x7B68EE,
  MAGENTA: 0xFF69B4,
  GREY_LIGHT: 0xD3D3D3,
  GREY_MEDIUM: 0xA9A9A9,
  GREY_DARK: 0x808080,
  WHITE: 0xFFFFFF,
  APRICOT: 0xFFCC99,
};

/** Canonical digit → primary color. Digits 7 and 9 are null (multi-color). */
const DIGIT_COLORS = [
  null,           // 0 (unused)
  COLORS.RED,     // 1
  COLORS.ORANGE,  // 2
  COLORS.YELLOW,  // 3
  COLORS.GREEN,   // 4
  COLORS.CYAN,    // 5
  COLORS.INDIGO,  // 6
  null,           // 7 (rainbow)
  COLORS.MAGENTA, // 8
  null,           // 9 (grey gradient)
];

const RAINBOW_COLORS = [
  COLORS.RED, COLORS.ORANGE, COLORS.YELLOW,
  COLORS.GREEN, COLORS.CYAN, COLORS.INDIGO, COLORS.MAGENTA,
];

/** Grey shades for digit 9 — fill + border per shade tier. */
const NINE_GREY_SHADES = [
  { fill: 0xD9D9D9, border: 0xA9A9A9 },
  { fill: 0xB8B8B8, border: 0x888888 },
  { fill: 0x989898, border: 0x686868 },
];

// Derived arrays for 90's column-pattern layout (3+3+4 distribution)
const TENS_NINE_COLUMN_COLORS = [
  ...Array(3).fill(NINE_GREY_SHADES[0].fill),
  ...Array(3).fill(NINE_GREY_SHADES[1].fill),
  ...Array(4).fill(NINE_GREY_SHADES[2].fill),
];
const TENS_NINE_BORDER_COLORS = NINE_GREY_SHADES.map(s => s.border);

// ─── Utility ───────────────────────────────────

function lightenColor(color, amount) {
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  return (
    (Math.min(255, Math.round(r + (255 - r) * amount)) << 16) |
    (Math.min(255, Math.round(g + (255 - g) * amount)) << 8) |
    Math.min(255, Math.round(b + (255 - b) * amount))
  );
}

function createSolidBlocks(count, color, borderColor = null) {
  return Array(count).fill(null).map(() => ({
    color, borderColor, blockType: 'one'
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

// ─── Ones (digits 1-9) ────────────────────────

/** Get blocks for a single digit 1-9. */
function getDigitBlocks(digit) {
  if (digit === 7) {
    return RAINBOW_COLORS.map(color => ({ color, borderColor: null, blockType: 'one' }));
  }
  if (digit === 9) {
    return [
      ...createSolidBlocks(3, COLORS.GREY_LIGHT),
      ...createSolidBlocks(3, COLORS.GREY_MEDIUM),
      ...createSolidBlocks(3, COLORS.GREY_DARK),
    ];
  }
  return createSolidBlocks(digit, DIGIT_COLORS[digit]);
}

// ─── Tens (10-90) ──────────────────────────────

/** Get fill + border colors for a tens digit. */
function getTensColors(digit) {
  if (digit === 1) return { baseColor: COLORS.WHITE, borderColor: COLORS.RED };
  if (digit === 2) return { baseColor: COLORS.APRICOT, borderColor: COLORS.ORANGE };
  if (digit === 9) return { baseColor: COLORS.GREY_LIGHT, borderColor: COLORS.GREY_DARK };
  const primary = DIGIT_COLORS[digit];
  return {
    baseColor: lightenColor(primary, digit === 8 ? 0.45 : 0.55),
    borderColor: primary,
  };
}

const TENS_RAINBOW_COLORS = RAINBOW_COLORS.map(c => lightenColor(c, 0.55));

/** Create D×10 blocks for a tens digit. */
function createTensBlocks(tensDigit) {
  if (tensDigit === 7) {
    return createColumnPatternBlocks(7, 10, TENS_RAINBOW_COLORS, RAINBOW_COLORS);
  }
  if (tensDigit === 9) {
    return createColumnPatternBlocks(9, 10, TENS_NINE_COLUMN_COLORS, TENS_NINE_BORDER_COLORS);
  }
  const { baseColor, borderColor } = getTensColors(tensDigit);
  return createSolidBlocks(tensDigit * 10, baseColor, borderColor);
}

// ─── Hundreds (100-900) ────────────────────────

/**
 * Get per-group color specs for a hundreds digit.
 * Returns an array of { lightColor, darkColor, borderColor } — one per hundred-group.
 * Regular digits: all groups identical. Digit 7: rainbow. Digit 9: grey gradient.
 */
function getHundredGroupColors(hundredsDigit) {
  if (hundredsDigit === 7) {
    return RAINBOW_COLORS.map(c => ({
      lightColor: lightenColor(c, 0.65),
      darkColor: lightenColor(c, 0.45),
      borderColor: c,
    }));
  }
  if (hundredsDigit === 9) {
    return Array.from({ length: 9 }, (_, h) => {
      const { border } = NINE_GREY_SHADES[Math.floor(h / 3)];
      return {
        lightColor: lightenColor(border, 0.55),
        darkColor: lightenColor(border, 0.35),
        borderColor: border,
      };
    });
  }
  // Regular: derive from digit's primary color
  const primary = DIGIT_COLORS[hundredsDigit] ?? COLORS.RED;
  let lightColor, darkColor;
  if (hundredsDigit === 1) {
    // Hand-tuned salmon for 100
    lightColor = 0xF4A0A0;
    darkColor = 0xD87878;
  } else {
    const lightAmt = hundredsDigit === 8 ? 0.60 : 0.65;
    const darkAmt = hundredsDigit === 8 ? 0.40 : 0.45;
    lightColor = lightenColor(primary, lightAmt);
    darkColor = lightenColor(primary, darkAmt);
  }
  const spec = { lightColor, darkColor, borderColor: primary };
  return Array(hundredsDigit).fill(spec);
}

/** Create D×100 checkerboard blocks for a hundreds digit. */
function createHundredBlocks(hundredsDigit) {
  const groups = getHundredGroupColors(hundredsDigit);
  const blocks = [];
  groups.forEach(({ lightColor, darkColor, borderColor }, h) => {
    for (let i = 0; i < 100; i++) {
      const col = Math.floor(i / 10);
      const row = i % 10;
      const isLight = (col + row) % 2 === 0;
      blocks.push({
        color: isLight ? lightColor : darkColor,
        borderColor,
        borderGroup: `hundred_${h}`,
        blockType: 'hundred'
      });
    }
  });
  return blocks;
}

// ─── Main Config Function ──────────────────────

/**
 * Get configuration for a specific number
 * @param {number} number - The number (1-999)
 * @returns {Object} Configuration object with blocks array
 */
export function getNumberblockConfig(number) {
  if (number < 1 || number > 999) {
    throw new Error(`Number must be between 1 and 999, got ${number}`);
  }

  // Hundreds: D×100 checkerboard + remainder (0-99)
  if (number >= 100) {
    const hundredsDigit = Math.floor(number / 100);
    const remainder = number % 100;
    const hundredBlocks = createHundredBlocks(hundredsDigit);
    const remainderBlocks = remainder > 0 ? getNumberblockConfig(remainder).blocks : [];
    return {
      number,
      displayName: getNumberName(number),
      blocks: [...hundredBlocks, ...remainderBlocks],
      face: getDefaultFaceConfig(number)
    };
  }

  // Tens + ones (10-99)
  if (number >= 10) {
    const tensDigit = Math.floor(number / 10);
    const ones = number % 10;
    const tensBlocks = createTensBlocks(tensDigit);
    const oneBlocks = ones > 0 ? getDigitBlocks(ones) : [];
    return {
      number,
      displayName: getNumberName(number),
      blocks: [...tensBlocks, ...oneBlocks],
      face: getDefaultFaceConfig(number)
    };
  }

  // Single digits (1-9)
  return {
    number,
    displayName: getNumberName(number),
    blocks: getDigitBlocks(number),
    face: getDefaultFaceConfig(number)
  };
}

// ─── Supporting Functions ──────────────────────

function getNumberName(number) {
  const names = [
    'Zero', 'One', 'Two', 'Three', 'Four', 'Five',
    'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
    'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'
  ];
  return names[number] || `Number ${number}`;
}

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
export const NUMBERBLOCK_BORDER_COLORS = { RED: COLORS.RED, ORANGE: COLORS.ORANGE };
