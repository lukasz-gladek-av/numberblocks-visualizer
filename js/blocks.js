import * as THREE from 'three';
import { getColumnColor, isRainbowColumn } from './colors.js';

/**
 * Create a single block for the staircase
 * @param {number} color - Hex color value
 * @returns {THREE.Mesh} - The block mesh
 */
export function createBlock(color) {
  const geometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);

  const material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.5,
    metalness: 0.1,
    emissive: 0x000000,
  });

  const block = new THREE.Mesh(geometry, material);
  return block;
}

/**
 * Create a column of blocks
 * @param {number} columnNumber - The column number (1-based, determines count and color)
 * @param {number} positionX - X position for the column
 * @returns {THREE.Group} - Group containing all blocks in the column
 */
export function createColumn(columnNumber, positionX = 0) {
  const column = new THREE.Group();
  const isRainbow = isRainbowColumn(columnNumber);

  // Create blocks for this column
  // Column N contains N blocks
  for (let i = 0; i < columnNumber; i++) {
    const color = isRainbow
      ? getColumnColor(columnNumber, i)  // Rainbow: each block different color
      : getColumnColor(columnNumber);    // Regular: all blocks same color

    const block = createBlock(color);

    // Stack blocks vertically with small gap between them
    // Position so blocks sit on ground (y=0) and stack upward
    const blockSize = 0.9;
    const gap = 0.05;
    const yPosition = i * (blockSize + gap) + blockSize / 2;

    block.position.y = yPosition;
    column.add(block);
  }

  // Position the column horizontally
  column.position.x = positionX;

  // Center the column vertically (so it grows upward from ground)
  const totalHeight = columnNumber * (0.9 + 0.05) - 0.05;
  column.position.y = 0; // Bottom aligned at ground level

  return column;
}
