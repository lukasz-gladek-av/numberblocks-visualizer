import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { getColumnColor, isRainbowColumn } from './colors.js';
import { getNumberblockConfig } from './numberblockConfig.js';

const BLOCK_GEOMETRY = new RoundedBoxGeometry(0.9, 0.9, 0.9, 3, 0.08);
const blockMaterialCache = new Map();
const borderMaterialCache = new Map();
const sideGeometryCache = new Map();

const BLOCK_SIZE = 0.9;
const GAP = 0.01;
const BORDER_FRAME_THICKNESS = 0.06;
const BORDER_CORNER_RADIUS = 0.03;
const BORDER_CORNER_SEGMENTS = 4;
const BORDER_TOP_BOTTOM_GEOMETRY = new RoundedBoxGeometry(
  BLOCK_SIZE,
  BORDER_FRAME_THICKNESS,
  BLOCK_SIZE,
  BORDER_CORNER_SEGMENTS,
  BORDER_CORNER_RADIUS
);

function getBlockMaterial(color) {
  const key = String(color);
  if (!blockMaterialCache.has(key)) {
    blockMaterialCache.set(key, new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.18,
      metalness: 0.03,
      emissive: color,
      emissiveIntensity: 0.08,
    }));
  }
  return blockMaterialCache.get(key);
}

function getBorderMaterial(color) {
  const key = String(color);
  if (!borderMaterialCache.has(key)) {
    borderMaterialCache.set(key, new THREE.MeshStandardMaterial({
      color: color,
      transparent: false,
      side: THREE.DoubleSide,
      roughness: 0.3,
      metalness: 0.0,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }));
  }
  return borderMaterialCache.get(key);
}

function getSideGeometry(groupSize) {
  if (!sideGeometryCache.has(groupSize)) {
    const groupHeight = groupSize * (BLOCK_SIZE + GAP) - GAP;
    sideGeometryCache.set(groupSize, new RoundedBoxGeometry(
      BORDER_FRAME_THICKNESS,
      groupHeight,
      BLOCK_SIZE,
      BORDER_CORNER_SEGMENTS,
      BORDER_CORNER_RADIUS
    ));
  }
  return sideGeometryCache.get(groupSize);
}

/**
 * Create a single block for the staircase with rounded corners
 * Note: Borders are handled at the group level in createColumn()
 * @param {number} color - Hex color value
 * @returns {THREE.Mesh} - The block mesh with rounded corners
 */
export function createBlock(color) {
  const block = new THREE.Mesh(BLOCK_GEOMETRY, getBlockMaterial(color));
  return block;
}

/**
 * Get block configs for a number with fallback colors
 * @param {number} number - The number to create blocks for
 * @returns {Array} Block configuration objects
 */
export function getBlocksForNumber(number) {
  let blocks = [];
  try {
    const config = getNumberblockConfig(number);
    blocks = config.blocks;
  } catch (error) {
    // Fallback to old behavior for numbers outside 1-20
    console.warn(`Number ${number} out of range, using legacy color system`);
    for (let i = 0; i < number; i++) {
      const color = isRainbowColumn(number)
        ? getColumnColor(number, i)
        : getColumnColor(number);
      blocks.push({ color, borderColor: null, blockType: 'one' });
    }
  }
  return blocks;
}

/**
 * Create a column of blocks using the new config system
 * @param {number} columnNumber - The column number (1-based, determines blocks)
 * @param {number} positionX - X position for the column
 * @param {Array} extraBlocks - Additional block configs to stack on top
 * @returns {THREE.Group} - Group containing all blocks in the column
 */
export function createColumn(columnNumber, positionX = 0, extraBlocks = []) {
  const baseBlocks = getBlocksForNumber(columnNumber);
  const blocks = extraBlocks.length > 0 ? [...baseBlocks, ...extraBlocks] : baseBlocks;
  return createColumnFromBlocks(blocks, positionX, blocks.length);
}

function addToGlobalSolidCollector(globalSolidCollector, color, x, y, z) {
  const key = String(color);
  if (!globalSolidCollector.has(key)) {
    globalSolidCollector.set(key, { color, positions: [] });
  }
  globalSolidCollector.get(key).positions.push({ x, y, z });
}

function addToGlobalBorderCollector(globalBorderCollector, key, geometry, material, x, y, z) {
  if (!globalBorderCollector.has(key)) {
    globalBorderCollector.set(key, { geometry, material, positions: [] });
  }
  globalBorderCollector.get(key).positions.push({ x, y, z });
}

export function buildGlobalSolidInstancedMeshes(globalSolidCollector) {
  if (!globalSolidCollector || globalSolidCollector.size === 0) {
    return [];
  }
  const meshes = [];
  const tempMatrix = new THREE.Matrix4();
  const tempPosition = new THREE.Vector3();
  const tempQuaternion = new THREE.Quaternion();
  const tempScale = new THREE.Vector3(1, 1, 1);

  globalSolidCollector.forEach(({ color, positions }) => {
    const instancedBlocks = new THREE.InstancedMesh(BLOCK_GEOMETRY, getBlockMaterial(color), positions.length);
    instancedBlocks.castShadow = true;
    instancedBlocks.receiveShadow = true;
    positions.forEach((position, instanceIndex) => {
      tempPosition.set(position.x, position.y, position.z);
      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
      instancedBlocks.setMatrixAt(instanceIndex, tempMatrix);
    });
    instancedBlocks.instanceMatrix.needsUpdate = true;
    meshes.push(instancedBlocks);
  });
  return meshes;
}

export function buildGlobalBorderInstancedMeshes(globalBorderCollector) {
  if (!globalBorderCollector || globalBorderCollector.size === 0) {
    return [];
  }
  const meshes = [];
  const tempMatrix = new THREE.Matrix4();
  const tempPosition = new THREE.Vector3();
  const tempQuaternion = new THREE.Quaternion();
  const tempScale = new THREE.Vector3(1, 1, 1);

  globalBorderCollector.forEach(({ geometry, material, positions }) => {
    const instancedBorder = new THREE.InstancedMesh(geometry, material, positions.length);
    instancedBorder.castShadow = false;
    instancedBorder.receiveShadow = false;
    instancedBorder.userData.noShadow = true;
    positions.forEach((position, instanceIndex) => {
      tempPosition.set(position.x, position.y, position.z);
      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
      instancedBorder.setMatrixAt(instanceIndex, tempMatrix);
    });
    instancedBorder.instanceMatrix.needsUpdate = true;
    meshes.push(instancedBorder);
  });
  return meshes;
}

export function createColumnFromBlocks(blocks, positionX = 0, blockCountOverride = null, blockIndices = null, options = {}) {
  const {
    positionZ = 0,
    globalSolidCollector = null,
    globalBorderCollector = null,
    skipEmptyColumn = false
  } = options;
  const column = new THREE.Group();
  const solidBlocksByColor = globalSolidCollector ? null : new Map();
  const tempMatrix = new THREE.Matrix4();
  const tempPosition = new THREE.Vector3();
  const tempQuaternion = new THREE.Quaternion();
  const tempScale = new THREE.Vector3(1, 1, 1);

  // Batch solid blocks (no border) into InstancedMesh per color.
  // Keep bordered blocks as regular meshes to preserve border behavior.
  blocks.forEach((blockConfig, i) => {
    const blockIndex = blockIndices ? blockIndices[i] : i;
    const yPosition = blockIndex * (BLOCK_SIZE + GAP) + BLOCK_SIZE / 2;

    if (blockConfig.borderColor !== null && blockConfig.borderColor !== undefined) {
      const block = createBlock(blockConfig.color);
      block.scale.set(0.99, 0.99, 0.99);
      block.position.y = yPosition;
      column.add(block);
      return;
    }

    if (globalSolidCollector) {
      addToGlobalSolidCollector(globalSolidCollector, blockConfig.color, positionX, yPosition, positionZ);
      return;
    }

    const colorKey = String(blockConfig.color);
    if (!solidBlocksByColor.has(colorKey)) {
      solidBlocksByColor.set(colorKey, {
        color: blockConfig.color,
        yPositions: []
      });
    }
    solidBlocksByColor.get(colorKey).yPositions.push(yPosition);
  });

  if (!globalSolidCollector) {
    solidBlocksByColor.forEach(({ color, yPositions }) => {
      const instancedBlocks = new THREE.InstancedMesh(BLOCK_GEOMETRY, getBlockMaterial(color), yPositions.length);
      instancedBlocks.castShadow = true;
      instancedBlocks.receiveShadow = true;
      yPositions.forEach((yPosition, instanceIndex) => {
        tempPosition.set(0, yPosition, 0);
        tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
        instancedBlocks.setMatrixAt(instanceIndex, tempMatrix);
      });
      instancedBlocks.instanceMatrix.needsUpdate = true;
      column.add(instancedBlocks);
    });
  }

  // Now identify groups of consecutive blocks with same color and borderColor
  // and add borders around entire groups
  let i = 0;
  while (i < blocks.length) {
    const currentBlock = blocks[i];
    let groupEnd = i;

    // Find consecutive blocks with same color and borderColor
    while (groupEnd + 1 < blocks.length &&
           blocks[groupEnd + 1].color === currentBlock.color &&
           blocks[groupEnd + 1].borderColor === currentBlock.borderColor &&
           (!blockIndices || blockIndices[groupEnd + 1] === blockIndices[groupEnd] + 1)) {
      groupEnd++;
    }

    // If this group has a borderColor, add a border around the entire group
    if (currentBlock.borderColor !== null && currentBlock.borderColor !== undefined) {
      const groupSize = blockIndices
        ? blockIndices[groupEnd] - blockIndices[i] + 1
        : groupEnd - i + 1;
      const groupHeight = groupSize * (BLOCK_SIZE + GAP) - GAP;

      // Position at the center of the group
      const groupStartY = (blockIndices ? blockIndices[i] : i) * (BLOCK_SIZE + GAP);
      const groupCenterY = groupStartY + groupHeight / 2;

      const boxSize = BLOCK_SIZE;
      const halfWidth = BLOCK_SIZE / 2;
      const halfHeight = groupHeight / 2;
      const frameThickness = BORDER_FRAME_THICKNESS;

      const borderMaterial = getBorderMaterial(currentBlock.borderColor);
      const sideGeometry = getSideGeometry(groupSize);
      if (globalBorderCollector) {
        const sideKey = `side:${currentBlock.borderColor}:${groupSize}`;
        const topBottomKey = `topBottom:${currentBlock.borderColor}`;
        addToGlobalBorderCollector(
          globalBorderCollector,
          sideKey,
          sideGeometry,
          borderMaterial,
          positionX - (halfWidth - frameThickness / 2),
          groupCenterY,
          positionZ
        );
        addToGlobalBorderCollector(
          globalBorderCollector,
          sideKey,
          sideGeometry,
          borderMaterial,
          positionX + (halfWidth - frameThickness / 2),
          groupCenterY,
          positionZ
        );
        addToGlobalBorderCollector(
          globalBorderCollector,
          topBottomKey,
          BORDER_TOP_BOTTOM_GEOMETRY,
          borderMaterial,
          positionX,
          groupCenterY + halfHeight - frameThickness / 2,
          positionZ
        );
        addToGlobalBorderCollector(
          globalBorderCollector,
          topBottomKey,
          BORDER_TOP_BOTTOM_GEOMETRY,
          borderMaterial,
          positionX,
          groupCenterY - halfHeight + frameThickness / 2,
          positionZ
        );
      } else {
        const leftSide = new THREE.Mesh(sideGeometry, borderMaterial);
        leftSide.position.set(-(halfWidth - frameThickness / 2), groupCenterY, 0);
        leftSide.castShadow = false;
        leftSide.receiveShadow = false;
        leftSide.userData.noShadow = true;

        const rightSide = new THREE.Mesh(sideGeometry, borderMaterial);
        rightSide.position.set(halfWidth - frameThickness / 2, groupCenterY, 0);
        rightSide.castShadow = false;
        rightSide.receiveShadow = false;
        rightSide.userData.noShadow = true;

        const topSide = new THREE.Mesh(BORDER_TOP_BOTTOM_GEOMETRY, borderMaterial);
        topSide.position.set(0, groupCenterY + halfHeight - frameThickness / 2, 0);
        topSide.castShadow = false;
        topSide.receiveShadow = false;
        topSide.userData.noShadow = true;

        const bottomSide = new THREE.Mesh(BORDER_TOP_BOTTOM_GEOMETRY, borderMaterial);
        bottomSide.position.set(0, groupCenterY - halfHeight + frameThickness / 2, 0);
        bottomSide.castShadow = false;
        bottomSide.receiveShadow = false;
        bottomSide.userData.noShadow = true;

        column.add(leftSide, rightSide, topSide, bottomSide);
      }
    }

    i = groupEnd + 1;
  }

  // Position the column horizontally
  column.position.x = positionX;
  column.position.z = positionZ;

  column.userData.blockCount = blockCountOverride ?? blocks.length;
  column.position.y = 0; // Bottom aligned at ground level

  if (skipEmptyColumn && column.children.length === 0) {
    return null;
  }

  return column;
}
