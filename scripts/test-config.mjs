import { getConsecutiveBlockGroups } from '../js/blocks.js';
import { getNumberblockConfig } from '../js/numberblockConfig.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

for (let n = 1; n <= 999; n++) {
  const blocks = getNumberblockConfig(n).blocks;
  assert(blocks.length === n, `Expected ${n} blocks for ${n}, got ${blocks.length}`);

  const groups = getConsecutiveBlockGroups(blocks);
  groups.forEach(({ start, end }) => {
    const first = blocks[start];
    if (first.borderGroup == null) {
      return;
    }
    for (let i = start; i <= end; i++) {
      assert(
        blocks[i].borderGroup === first.borderGroup,
        `Mixed borderGroup in grouped segment for ${n}: ${first.borderGroup} vs ${blocks[i].borderGroup}`
      );
    }
  });

  const hundredsDigit = Math.floor(n / 100);
  if (hundredsDigit > 0) {
    const hundredGroups = groups.filter(({ start }) => blocks[start].blockType === 'hundred');
    assert(
      hundredGroups.length === hundredsDigit,
      `Expected ${hundredsDigit} hundred groups for ${n}, got ${hundredGroups.length}`
    );
    hundredGroups.forEach(({ start, end }) => {
      const size = end - start + 1;
      assert(size === 100, `Expected hundred group size 100 for ${n}, got ${size}`);
    });
  }
}

console.log('Config checks passed for numbers 1-999.');
