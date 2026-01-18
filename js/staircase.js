import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { createColumn, getBlocksForNumber } from './blocks.js';

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
    this.isSquareMode = false;

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
    const totalWidth = (this.currentN - 1) * columnSpacing;
    const startX = -totalWidth / 2;

    for (let i = 1; i <= this.currentN; i++) {
      const positionX = startX + (i - 1) * columnSpacing;
      const blockCount = this.getColumnBlockCount(i);
      this.addColumnLabel(i, positionX, blockCount);
    }
  }

  /**
   * Build the staircase for a given number N
   * @param {number} n - The number of columns to create
   */
  build(n) {
    // Clear existing columns
    this.columns.forEach(column => this.group.remove(column));
    this.columns = [];

    // Create new columns
    const columnSpacing = 0.9; // No spacing - blocks touch
    const totalWidth = (n - 1) * columnSpacing;
    const startX = -totalWidth / 2;

    for (let i = 1; i <= n; i++) {
      const positionX = startX + (i - 1) * columnSpacing;
      const extraBlocks = this.isSquareMode ? this.getSquareFillBlocks(n, i) : [];
      const column = createColumn(i, positionX, extraBlocks);
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

    this.currentN = n;

    // Rebuild labels if font is loaded
    if (this.font) {
      this.rebuildLabels();
    }
  }

  /**
   * Add a 3D numerical label above each column
   * @param {number} columnNumber - The column number
   * @param {number} positionX - X position of the column
   * @param {number} blockCount - The number of blocks in the column
   */
  addColumnLabel(columnNumber, positionX, blockCount = columnNumber) {
    // Create 3D text geometry
    const geometry = new TextGeometry(columnNumber.toString(), {
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
    const labelOffset = 0.18;
    labelMesh.position.set(positionX, topOfColumn + labelOffset, 0);

    this.labelGroup.add(labelMesh);
  }

  /**
   * Add one more column (increment N)
   */
  addColumn() {
    this.build(this.currentN + 1);
    return true;
  }

  /**
   * Remove the last column (decrement N)
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
    return (this.currentN * (this.currentN + 1)) / 2;
  }

  /**
   * Get current N
   * @returns {number}
   */
  getCurrentN() {
    return this.currentN;
  }

  getSquareMode() {
    return this.isSquareMode;
  }

  toggleSquareMode() {
    this.isSquareMode = !this.isSquareMode;
    this.build(this.currentN);
    return this.isSquareMode;
  }

  getSquareTotal() {
    return this.currentN * this.currentN;
  }

  getSquareFillTotal() {
    return this.getSquareTotal() - this.getTotal();
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
