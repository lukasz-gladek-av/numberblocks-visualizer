import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { createColumnFromBlocks, getBlocksForNumber } from './blocks.js';

const MODE_STAIRS = 'stairs';
const MODE_COLUMN = 'column';
const MODE_SQUARE = 'square';
const MODE_CUBE = 'cube';
const MODE_PYRAMID = 'pyramid';
const MODE_ORDER = [MODE_STAIRS, MODE_COLUMN, MODE_SQUARE, MODE_CUBE, MODE_PYRAMID];

/**
 * Staircase class - manages the entire step squad structure
 */
export class Staircase {
  constructor(scene, initialN = 5) {
    this.scene = scene;
    this.currentN = initialN;
    this.columns = [];
    this.group = new THREE.Group(); // Container for all columns
    this.labelGroup = new THREE.Group(); // Container for column labels
    this.scene.add(this.group);
    this.scene.add(this.labelGroup);
    this.font = null;
    this.mode = MODE_STAIRS;

    // Load font for 3D text
    this.loadFont();

    // Build initial staircase
    this.build(initialN);
  }

  /**
   * Load font for 3D text labels
   */
  loadFont() {
    const fontLoader = new FontLoader();
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
      this.font = font;
      // Rebuild labels after font is loaded
      this.rebuildLabels();
    });
  }

  /**
   * Rebuild all labels (used after font loads)
   */
  rebuildLabels() {
    // Clear existing labels
    while (this.labelGroup.children.length > 0) {
      this.labelGroup.remove(this.labelGroup.children[0]);
    }

    // Recreate labels
    const columnSpacing = 0.9;
    const columnCount = this.getColumnCount();
    const totalWidth = (columnCount - 1) * columnSpacing;
    const startX = -totalWidth / 2;
    const depthCount = this.getDepthCount();
    const depthSpacing = 0.9;
    const totalDepth = (depthCount - 1) * depthSpacing;
    const startZ = -totalDepth / 2;
    const labelZ = startZ + totalDepth;

    for (let i = 1; i <= columnCount; i++) {
      const positionX = startX + (i - 1) * columnSpacing;
      const blockCount = this.getColumnBlockCount(i);
      const labelValue = (this.mode === MODE_PYRAMID || this.mode === MODE_COLUMN) ? blockCount : i;
      this.addColumnLabel(labelValue, positionX, blockCount, labelZ);
    }
  }

  /**
   * Build the staircase for a given number N
   * @param {number} n - The number of columns or blocks (mode dependent)
   */
  build(n) {
    // Clear existing columns
    this.columns.forEach(column => this.group.remove(column));
    this.columns = [];

    // Create new columns
    const columnSpacing = 0.9; // No spacing - blocks touch
    const depthSpacing = 0.9;
    const columnCount = this.getColumnCount(n);
    const totalWidth = (columnCount - 1) * columnSpacing;
    const startX = -totalWidth / 2;
    const depthCount = this.getDepthCount(n);
    const totalDepth = (depthCount - 1) * depthSpacing;
    const startZ = -totalDepth / 2;
    const isCubeMode = this.mode === MODE_CUBE;
    const isPyramidMode = this.mode === MODE_PYRAMID;
    const isColumnMode = this.mode === MODE_COLUMN;
    const shouldFillToSquare = this.mode === MODE_SQUARE || isCubeMode;
    const columnBlocksCache = new Map();

    for (let i = 1; i <= columnCount; i++) {
      let baseBlocks = [];
      let extraBlocks = [];
      if (isColumnMode) {
        baseBlocks = getBlocksForNumber(n);
      } else if (isPyramidMode) {
        const columnHeight = i <= n ? i : (2 * n - i);
        baseBlocks = getBlocksForNumber(columnHeight);
      } else {
        baseBlocks = getBlocksForNumber(i);
        extraBlocks = shouldFillToSquare ? this.getSquareFillBlocks(n, i) : [];
      }
      const blocks = extraBlocks.length > 0
        ? [...baseBlocks, ...extraBlocks.slice().reverse()]
        : baseBlocks;
      const shellBlocks = isCubeMode && blocks.length > 1 ? [blocks[0], blocks[blocks.length - 1]] : blocks;
      const shellIndices = shellBlocks.length > 1 ? [0, blocks.length - 1] : [0];
      columnBlocksCache.set(i, {
        full: { blocks, indices: null },
        shell: { blocks: shellBlocks, indices: shellIndices },
        count: blocks.length,
      });
    }

    for (let zIndex = 0; zIndex < depthCount; zIndex++) {
      const positionZ = startZ + zIndex * depthSpacing;
      const isEdgeZ = zIndex === 0 || zIndex === depthCount - 1;
      for (let i = 1; i <= columnCount; i++) {
        const positionX = startX + (i - 1) * columnSpacing;
        const isEdgeX = i === 1 || i === columnCount;
        const isSurfaceColumn = isEdgeX || isEdgeZ;
        const { full, shell, count } = columnBlocksCache.get(i);
        // In cube mode, skip interior blocks and render only the outer shell.
        const columnConfig = isCubeMode && !isSurfaceColumn ? shell : full;
        const column = createColumnFromBlocks(
          columnConfig.blocks,
          positionX,
          count,
          columnConfig.indices
        );
        column.position.z = positionZ;
        column.castShadow = true;
        column.receiveShadow = true;

        // Recursively set castShadow for all children
        column.traverse(child => {
          if (child instanceof THREE.Mesh) {
            if (!child.userData.noShadow) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          }
        });

        this.columns.push(column);
        this.group.add(column);
      }
    }

    this.currentN = n;

    // Rebuild labels if font is loaded
    if (this.font) {
      this.rebuildLabels();
    }
  }

  /**
   * Add a 3D numerical label above each column
   * @param {number} labelValue - The label number to display
   * @param {number} positionX - X position of the column
   * @param {number} blockCount - The number of blocks in the column
   */
  addColumnLabel(labelValue, positionX, blockCount = labelValue, positionZ = 0) {
    // Create 3D text geometry
    const geometry = new TextGeometry(labelValue.toString(), {
      font: this.font,
      size: 0.45,
      height: 0.08,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3,
    });

    geometry.center();

    const material = new THREE.MeshStandardMaterial({
      color: 0x000000,
      roughness: 0.3,
      metalness: 0.1,
    });

    const labelMesh = new THREE.Mesh(geometry, material);

    // Enable shadow casting for labels
    labelMesh.castShadow = true;
    labelMesh.receiveShadow = true;

    // Position above the column at fixed distance from top
    const blockSize = 0.9;
    const gap = 0.01;
    const safeBlockCount = Math.max(blockCount, 1);
    const topOfColumn = (safeBlockCount - 1) * (blockSize + gap) + blockSize;
    const labelOffset = 0.3;
    labelMesh.position.set(positionX, topOfColumn + labelOffset, positionZ);

    this.labelGroup.add(labelMesh);
  }

  /**
   * Increment N by 1 (column count or block count depending on mode)
   */
  addColumn() {
    this.build(this.currentN + 1);
    return true;
  }

  /**
   * Decrement N by 1 (column count or block count depending on mode)
   */
  removeColumn() {
    if (this.currentN > 1) {
      this.build(this.currentN - 1);
      return true;
    }
    return false;
  }

  /**
   * Get the total number of blocks
   * Formula: N * (N + 1) / 2
   * @returns {number}
   */
  getTotal() {
    if (this.mode === MODE_COLUMN) {
      return this.currentN;
    }
    return (this.currentN * (this.currentN + 1)) / 2;
  }

  /**
   * Get current N
   * @returns {number}
   */
  getCurrentN() {
    return this.currentN;
  }

  getMode() {
    return this.mode;
  }

  getSquareMode() {
    return this.mode === MODE_SQUARE;
  }

  getCubeMode() {
    return this.mode === MODE_CUBE;
  }

  getDepthCount(n = this.currentN) {
    return this.mode === MODE_CUBE ? n : 1;
  }

  getColumnCount(n = this.currentN) {
    if (this.mode === MODE_COLUMN) {
      return 1;
    }
    return this.mode === MODE_PYRAMID ? n * 2 - 1 : n;
  }

  cycleMode() {
    const currentIndex = MODE_ORDER.indexOf(this.mode);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % MODE_ORDER.length;
    this.mode = MODE_ORDER[nextIndex];
    this.build(this.currentN);
    return this.mode;
  }

  setMode(mode) {
    if (!MODE_ORDER.includes(mode)) {
      return this.mode;
    }
    if (this.mode === mode) {
      return this.mode;
    }
    this.mode = mode;
    this.build(this.currentN);
    return this.mode;
  }

  getSquareTotal() {
    return this.currentN * this.currentN;
  }

  getSquareFillTotal() {
    return this.getSquareTotal() - this.getTotal();
  }

  getCubeTotal() {
    return this.currentN * this.currentN * this.currentN;
  }

  getCubeFillTotal() {
    return this.getCubeTotal() - this.getSquareTotal();
  }

  getPyramidTotal() {
    return this.currentN * this.currentN;
  }

  getColumnBlockCount(columnNumber) {
    const column = this.columns[columnNumber - 1];
    if (!column) {
      return columnNumber;
    }
    return column.userData.blockCount || columnNumber;
  }

  getSquareFillBlocks(totalColumns, columnNumber) {
    const extraCount = totalColumns - columnNumber;
    if (extraCount <= 0) {
      return [];
    }
    return getBlocksForNumber(extraCount);
  }
}
