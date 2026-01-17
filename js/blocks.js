import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { getColumnColor, isRainbowColumn } from './colors.js';
import { getNumberblockConfig } from './numberblockConfig.js';

/**
 * Create a single block for the staircase with rounded corners
 * Note: Borders are handled at the group level in createColumn()
 * @param {number} color - Hex color value
 * @returns {THREE.Mesh} - The block mesh with rounded corners
 */
export function createBlock(color) {
  // Create a perfectly rounded box geometry
  const geometry = new RoundedBoxGeometry(0.9, 0.9, 0.9, 3, 0.08);

  const material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.18,
    metalness: 0.03,
    emissive: color,
    emissiveIntensity: 0.08,
  });

  const block = new THREE.Mesh(geometry, material);
  return block;
}

/**
 * Create a column of blocks using the new config system
 * @param {number} columnNumber - The column number (1-based, determines blocks)
 * @param {number} positionX - X position for the column
 * @returns {THREE.Group} - Group containing all blocks in the column
 */
export function createColumn(columnNumber, positionX = 0) {
  const column = new THREE.Group();

  // For backwards compatibility, try new system first, fall back to old
  let blocks = [];
  try {
    const config = getNumberblockConfig(columnNumber);
    blocks = config.blocks;
  } catch (error) {
    // Fallback to old behavior for numbers outside 1-20
    console.warn(`Number ${columnNumber} out of range, using legacy color system`);
    for (let i = 0; i < columnNumber; i++) {
      const color = isRainbowColumn(columnNumber)
        ? getColumnColor(columnNumber, i)
        : getColumnColor(columnNumber);
      blocks.push({ color, borderColor: null, blockType: 'one' });
    }
  }

  const blockSize = 0.9;
  const gap = 0.01; // Minimal gap, blocks can nearly touch

  // Create blocks from config
  blocks.forEach((blockConfig, i) => {
    const block = createBlock(blockConfig.color);

    // Stack blocks vertically - can touch now due to rounded edges
    // Position so blocks sit on ground (y=0) and stack upward
    const yPosition = i * (blockSize + gap) + blockSize / 2;

    block.position.y = yPosition;
    column.add(block);
  });

  // Now identify groups of consecutive blocks with same color and borderColor
  // and add borders around entire groups
  let i = 0;
  while (i < blocks.length) {
    const currentBlock = blocks[i];
    let groupEnd = i;

    // Find consecutive blocks with same color and borderColor
    while (groupEnd + 1 < blocks.length &&
           blocks[groupEnd + 1].color === currentBlock.color &&
           blocks[groupEnd + 1].borderColor === currentBlock.borderColor) {
      groupEnd++;
    }

    // If this group has a borderColor, add a border around the entire group
    if (currentBlock.borderColor !== null && currentBlock.borderColor !== undefined) {
      const groupSize = groupEnd - i + 1;
      const groupHeight = groupSize * (blockSize + gap) - gap;

      // Position at the center of the group
      const groupStartY = i * (blockSize + gap);
      const groupCenterY = groupStartY + groupHeight / 2;

      const lineWidth = 3; // Line width in pixels
      const boxSize = 0.9;
      const halfWidth = boxSize / 2;
      const halfHeight = groupHeight / 2;
      const halfDepth = boxSize / 2;

      // Create line-based border using 12 edges of a box
      const borderPoints = [
        // Bottom face (4 edges)
        new THREE.Vector3(-halfWidth, groupCenterY - halfHeight, -halfDepth),
        new THREE.Vector3(halfWidth, groupCenterY - halfHeight, -halfDepth),
        new THREE.Vector3(halfWidth, groupCenterY - halfHeight, -halfDepth),
        new THREE.Vector3(halfWidth, groupCenterY - halfHeight, halfDepth),
        new THREE.Vector3(halfWidth, groupCenterY - halfHeight, halfDepth),
        new THREE.Vector3(-halfWidth, groupCenterY - halfHeight, halfDepth),
        new THREE.Vector3(-halfWidth, groupCenterY - halfHeight, halfDepth),
        new THREE.Vector3(-halfWidth, groupCenterY - halfHeight, -halfDepth),

        // Top face (4 edges)
        new THREE.Vector3(-halfWidth, groupCenterY + halfHeight, -halfDepth),
        new THREE.Vector3(halfWidth, groupCenterY + halfHeight, -halfDepth),
        new THREE.Vector3(halfWidth, groupCenterY + halfHeight, -halfDepth),
        new THREE.Vector3(halfWidth, groupCenterY + halfHeight, halfDepth),
        new THREE.Vector3(halfWidth, groupCenterY + halfHeight, halfDepth),
        new THREE.Vector3(-halfWidth, groupCenterY + halfHeight, halfDepth),
        new THREE.Vector3(-halfWidth, groupCenterY + halfHeight, halfDepth),
        new THREE.Vector3(-halfWidth, groupCenterY + halfHeight, -halfDepth),

        // Vertical edges (4 edges)
        new THREE.Vector3(-halfWidth, groupCenterY - halfHeight, -halfDepth),
        new THREE.Vector3(-halfWidth, groupCenterY + halfHeight, -halfDepth),
        new THREE.Vector3(halfWidth, groupCenterY - halfHeight, -halfDepth),
        new THREE.Vector3(halfWidth, groupCenterY + halfHeight, -halfDepth),
        new THREE.Vector3(halfWidth, groupCenterY - halfHeight, halfDepth),
        new THREE.Vector3(halfWidth, groupCenterY + halfHeight, halfDepth),
        new THREE.Vector3(-halfWidth, groupCenterY - halfHeight, halfDepth),
        new THREE.Vector3(-halfWidth, groupCenterY + halfHeight, halfDepth),
      ];

      const borderGeometry = new THREE.BufferGeometry();
      borderGeometry.setAttribute('position', new THREE.BufferAttribute(
        new Float32Array(borderPoints.flatMap(p => [p.x, p.y, p.z])),
        3
      ));

      const lineMaterial = new THREE.LineBasicMaterial({
        color: currentBlock.borderColor,
        linewidth: lineWidth,
      });

      const borderLines = new THREE.LineSegments(borderGeometry, lineMaterial);
      column.add(borderLines);
    }

    i = groupEnd + 1;
  }

  // Position the column horizontally
  column.position.x = positionX;

  // Center the column vertically (so it grows upward from ground)
  const totalHeight = columnNumber * (blockSize + gap) - gap;
  column.position.y = 0; // Bottom aligned at ground level

  return column;
}
