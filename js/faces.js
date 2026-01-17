/**
 * Faces System for Numberblocks
 * Phase 2 Implementation - Placeholder for future face features
 *
 * This module will handle the creation and management of face features for numberblocks:
 * - Eyes (oval or square depending on number)
 * - Mouths (various expressions)
 * - Accessories (glasses, hats, etc.)
 */

import * as THREE from 'three';

/**
 * Create eyes for a numberblock
 * Phase 2: Will create eye geometry/sprites based on faceConfig
 *
 * @param {Object} faceConfig - Face configuration from numberblockConfig
 * @param {number} faceConfig.eyeCount - Number of eyes (1 or 2)
 * @param {string} faceConfig.eyeShape - 'oval' or 'square'
 * @param {number} faceConfig.eyeColor - Hex color for eyes
 * @returns {THREE.Group} - Group containing eye geometry (or null in Phase 1)
 */
export function createEyes(faceConfig) {
  // TODO: Phase 2 Implementation
  // - Create eye geometry (circular or square based on eyeShape)
  // - Use 2D sprites or 3D geometry
  // - Position eyes on the front face of the top block
  // - Handle single vs double eyes for different numbers

  console.log('[Phase 2 TODO] createEyes: Not yet implemented', faceConfig);
  return null;
}

/**
 * Create mouth for a numberblock
 * Phase 2: Will create mouth geometry based on mouthType
 *
 * @param {Object} faceConfig - Face configuration from numberblockConfig
 * @param {string} faceConfig.mouthType - Type of mouth ('smile', 'neutral', etc.)
 * @returns {THREE.Group|THREE.Line} - Mouth geometry (or null in Phase 1)
 */
export function createMouth(faceConfig) {
  // TODO: Phase 2 Implementation
  // - Create mouth curves using THREE.Line or sprites
  // - Different mouth types for different characters
  // - Position mouth on front face, below eyes

  console.log('[Phase 2 TODO] createMouth: Not yet implemented', faceConfig);
  return null;
}

/**
 * Add face features to a column
 * Phase 2: Will attach eyes, mouth, and accessories to the column
 *
 * @param {THREE.Group} column - The column group to add face to
 * @param {Object} faceConfig - Face configuration from numberblockConfig
 * @returns {void}
 */
export function addFaceToColumn(column, faceConfig) {
  // TODO: Phase 2 Implementation
  // - Find the top block in the column
  // - Create eyes and mouth from faceConfig
  // - Attach to front face of top block
  // - Position and orient correctly toward camera
  // - Handle accessories if present

  console.log('[Phase 2 TODO] addFaceToColumn: Not yet implemented', {
    columnBlocks: column.children.length,
    faceConfig
  });
}

/**
 * Create face configuration for debugging/reference
 * Returns the face config that would be used for a given number
 *
 * @param {number} number - The number (1-20)
 * @returns {Object} - Face configuration object
 */
export function getFaceConfigForNumber(number) {
  const configs = {
    1: { eyeCount: 1, eyeShape: 'square', eyeColor: 0x000000, mouthType: 'smile', accessories: [] },
    2: { eyeCount: 2, eyeShape: 'oval', eyeColor: 0x000000, mouthType: 'smile', accessories: [] },
    3: { eyeCount: 2, eyeShape: 'oval', eyeColor: 0x000000, mouthType: 'smile', accessories: [] },
    4: { eyeCount: 2, eyeShape: 'square', eyeColor: 0x000000, mouthType: 'smile', accessories: [] },
    5: { eyeCount: 2, eyeShape: 'oval', eyeColor: 0x000000, mouthType: 'smile', accessories: [] },
    6: { eyeCount: 2, eyeShape: 'oval', eyeColor: 0x000000, mouthType: 'smile', accessories: [] },
    7: { eyeCount: 2, eyeShape: 'oval', eyeColor: 0x000000, mouthType: 'smile', accessories: [] },
    8: { eyeCount: 2, eyeShape: 'oval', eyeColor: 0x000000, mouthType: 'smile', accessories: [] },
    9: { eyeCount: 2, eyeShape: 'square', eyeColor: 0x000000, mouthType: 'smile', accessories: [] },
    10: { eyeCount: 2, eyeShape: 'oval', eyeColor: 0x000000, mouthType: 'smile', accessories: [] },
    11: { eyeCount: 1, eyeShape: 'oval', eyeColor: 0x000000, mouthType: 'smile', accessories: [] },
    12: { eyeCount: 2, eyeShape: 'oval', eyeColor: 0x000000, mouthType: 'smile', accessories: [] },
    13: { eyeCount: 2, eyeShape: 'oval', eyeColor: 0x000000, mouthType: 'smile', accessories: [] },
    14: { eyeCount: 2, eyeShape: 'oval', eyeColor: 0x000000, mouthType: 'smile', accessories: [] },
    15: { eyeCount: 2, eyeShape: 'oval', eyeColor: 0x000000, mouthType: 'smile', accessories: [] },
    16: { eyeCount: 2, eyeShape: 'square', eyeColor: 0x000000, mouthType: 'smile', accessories: [] },
    17: { eyeCount: 2, eyeShape: 'oval', eyeColor: 0x000000, mouthType: 'smile', accessories: [] },
    18: { eyeCount: 2, eyeShape: 'oval', eyeColor: 0x000000, mouthType: 'smile', accessories: [] },
    19: { eyeCount: 2, eyeShape: 'oval', eyeColor: 0x000000, mouthType: 'smile', accessories: [] },
    20: { eyeCount: 2, eyeShape: 'oval', eyeColor: 0x000000, mouthType: 'smile', accessories: [] },
  };

  return configs[number] || null;
}

/**
 * Phase 2 Planning Notes:
 *
 * Eye Implementation:
 * - Oval eyes: Use THREE.CircleGeometry or 2D sprites (recommended for performance)
 * - Square eyes: Use THREE.PlaneGeometry or 2D sprites
 * - Single eye (for 1, 11): Position centered on front face
 * - Double eyes: Position symmetrically around center
 * - Eye colors: Usually black (0x000000) with white highlights
 *
 * Mouth Implementation:
 * - Smile: Curved line or bezier curve below eyes
 * - Neutral: Straight line or small circle
 * - Different expressions for different characters
 * - Use THREE.Line with custom material or sprite textures
 *
 * Positioning:
 * - Find the top block of the column (highest block)
 * - Project face onto the front face (Z-facing side) of the top block
 * - Position eyes roughly 1/3 from top of block
 * - Position mouth below eyes
 * - Use group to manage all face features together
 * - Ensure faces are visible and don't intersect with block geometry
 *
 * Alternative Approach (Recommended):
 * - Use 2D sprites/textures instead of 3D geometry
 * - Create canvas textures with eyes and mouths pre-rendered
 * - Apply as billboard sprites that always face camera
 * - Much simpler and better performance
 */
