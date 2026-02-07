import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import {
  buildGlobalBorderInstancedMeshes,
  buildGlobalSolidInstancedMeshes,
  createColumnFromBlocks,
  getBlocksForNumber
} from './blocks.js';

const MODE_STAIRS = 'stairs';
const MODE_COLUMN = 'column';
const MODE_SQUARE = 'square';
const MODE_CUBE = 'cube';
const MODE_PYRAMID = 'pyramid';
const MODE_ORDER = [MODE_STAIRS, MODE_COLUMN, MODE_SQUARE, MODE_CUBE, MODE_PYRAMID];

function easeOutBack(t, overshoot = 1.70158) {
  const p = t - 1;
  return 1 + p * p * ((overshoot + 1) * p + overshoot);
}

/**
 * Staircase class - manages the entire step squad structure
 */
export class Staircase {
  constructor(scene, initialN = 5) {
    this.scene = scene;
    this.initialN = initialN;
    this.currentN = initialN;
    this.columns = [];
    this.extraGroups = [];
    this.globalSolidMeshes = [];
    this.globalBorderMeshes = [];
    this.group = new THREE.Group(); // Container for all columns
    this.labelGroup = new THREE.Group(); // Container for column labels
    this.scene.add(this.group);
    this.scene.add(this.labelGroup);
    this.labelGeometryCache = new Map();
    this.labelMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      roughness: 0.3,
      metalness: 0.1,
    });
    this.font = null;
    this.mode = MODE_STAIRS;
    this.squareSneeze = false;
    this.sneezePieces = [];
    this.sneezeAnimation = null;
    this.pendingSneezeRebuild = false;
    this.sneezeTargetOffset = 2.4;
    this.sneezeOutDuration = 520;
    this.sneezeOutOvershoot = 1.65;
    this.sneezeReturnDuration = 460;
    this.sneezeReturnOvershoot = 1.15;

    // Load font for 3D text
    this.loadFont();

    // Build initial staircase
    this.build(initialN);
  }

  /**
   * Reset to the initial N (mode is preserved)
   */
  reset() {
    this.build(this.initialN);
    return true;
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
    this.clearLabels();

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

    if (this.mode === MODE_COLUMN) {
      this.addColumnLabel(this.currentN, startX, this.getMaxColumnHeight(), labelZ);
      return;
    }

    for (let i = 1; i <= columnCount; i++) {
      const positionX = startX + (i - 1) * columnSpacing;
      const blockCount = this.getColumnBlockCount(i);
      const labelValue = this.mode === MODE_PYRAMID ? blockCount : i;
      this.addColumnLabel(labelValue, positionX, blockCount, labelZ);
    }
  }

  /**
   * Build the staircase for a given number N
   * @param {number} n - The number of columns or blocks (mode dependent)
   */
  build(n, options = {}) {
    // Clear existing columns
    this.columns.forEach(column => this.group.remove(column));
    this.columns = [];
    this.extraGroups.forEach(group => this.group.remove(group));
    this.extraGroups = [];
    this.globalSolidMeshes.forEach(mesh => this.group.remove(mesh));
    this.globalSolidMeshes = [];
    this.globalBorderMeshes.forEach(mesh => this.group.remove(mesh));
    this.globalBorderMeshes = [];
    this.sneezePieces = [];
    this.sneezeAnimation = null;
    this.pendingSneezeRebuild = false;

    // Create new columns
    const columnSpacing = 0.9; // No spacing - blocks touch
    const depthSpacing = 0.9;
    const columnCount = this.getColumnCount(n);
    const totalWidth = (columnCount - 1) * columnSpacing;
    const startX = -totalWidth / 2;
    const depthCount = this.getDepthCount(n);
    const totalDepth = (depthCount - 1) * depthSpacing;
    const startZ = -totalDepth / 2;
    const isSquareMode = this.mode === MODE_SQUARE;
    const isCubeMode = this.mode === MODE_CUBE;
    const isPyramidMode = this.mode === MODE_PYRAMID;
    const isColumnMode = this.mode === MODE_COLUMN;
    const columnModeLayout = isColumnMode ? this.getColumnModeLayout(n) : null;
    const shouldFillToSquare = isSquareMode || isCubeMode;
    const shouldSneezeSquare = isSquareMode && this.squareSneeze;
    const sneezeZOffset = this.sneezeTargetOffset;
    const animateSneeze = shouldSneezeSquare && options.animateSneeze;
    const columnBlocksCache = new Map();
    const useGlobalCubeBatching = isCubeMode;
    const globalSolidCollector = useGlobalCubeBatching ? new Map() : null;
    const globalBorderCollector = useGlobalCubeBatching ? new Map() : null;

    for (let i = 1; i <= columnCount; i++) {
      let baseBlocks = [];
      let extraBlocks = [];
      if (isColumnMode) {
        baseBlocks = columnModeLayout?.[i - 1] ?? getBlocksForNumber(n);
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
      const isEdgeColumn = i === 1 || i === columnCount;
      const shellBlocks = isCubeMode && blocks.length > 1 ? [blocks[0], blocks[blocks.length - 1]] : blocks;
      const shellIndices = shellBlocks.length > 1 ? [0, blocks.length - 1] : [0];
      let sneezeConfig = { blocks, indices: null };
      let sneezeInteriorConfig = { blocks: [], indices: [] };
      if (shouldSneezeSquare && !isEdgeColumn && blocks.length > 1) {
        sneezeConfig = { blocks: [blocks[0], blocks[blocks.length - 1]], indices: [0, blocks.length - 1] };
        if (blocks.length > 2) {
          sneezeInteriorConfig = {
            blocks: blocks.slice(1, -1),
            indices: blocks.slice(1, -1).map((_, idx) => idx + 1),
          };
        }
      }
      columnBlocksCache.set(i, {
        full: { blocks, indices: null },
        shell: { blocks: shellBlocks, indices: shellIndices },
        sneeze: sneezeConfig,
        sneezeInterior: sneezeInteriorConfig,
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
        const { full, shell, sneeze, sneezeInterior, count } = columnBlocksCache.get(i);
        // In cube mode, skip interior blocks and render only the outer shell.
        const columnConfig = isCubeMode && !isSurfaceColumn ? shell : (shouldSneezeSquare ? sneeze : full);
        const column = createColumnFromBlocks(
          columnConfig.blocks,
          positionX,
          count,
          columnConfig.indices,
          {
            positionZ,
            globalSolidCollector,
            globalBorderCollector,
            skipEmptyColumn: useGlobalCubeBatching
          }
        );
        if (!column) {
          continue;
        }
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

        if (shouldSneezeSquare && sneezeInterior.blocks.length > 0) {
          const interiorColumn = createColumnFromBlocks(
            sneezeInterior.blocks,
            positionX,
            count,
            sneezeInterior.indices
          );
          interiorColumn.userData.baseZ = positionZ;
          interiorColumn.position.z = positionZ + (animateSneeze ? 0 : sneezeZOffset);
          interiorColumn.castShadow = true;
          interiorColumn.receiveShadow = true;
          interiorColumn.traverse(child => {
            if (child instanceof THREE.Mesh) {
              if (!child.userData.noShadow) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            }
          });
          this.extraGroups.push(interiorColumn);
          this.sneezePieces.push(interiorColumn);
          this.group.add(interiorColumn);
        }
      }
    }

    if (useGlobalCubeBatching) {
      this.globalSolidMeshes = buildGlobalSolidInstancedMeshes(globalSolidCollector);
      this.globalSolidMeshes.forEach((mesh) => {
        this.group.add(mesh);
      });
      this.globalBorderMeshes = buildGlobalBorderInstancedMeshes(globalBorderCollector);
      this.globalBorderMeshes.forEach((mesh) => {
        this.group.add(mesh);
      });
    }

    this.currentN = n;
    if (animateSneeze && this.sneezePieces.length > 0) {
      this.startSneezeAnimation({
        to: sneezeZOffset,
        duration: this.sneezeOutDuration,
        overshoot: this.sneezeOutOvershoot,
      });
    }

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
    const geometry = this.getLabelGeometry(labelValue);
    const labelMesh = new THREE.Mesh(geometry, this.labelMaterial);

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

  clearLabels() {
    while (this.labelGroup.children.length > 0) {
      this.labelGroup.remove(this.labelGroup.children[0]);
    }
  }

  getLabelGeometry(labelValue) {
    const key = String(labelValue);
    if (!this.labelGeometryCache.has(key)) {
      const geometry = new TextGeometry(key, {
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
      this.labelGeometryCache.set(key, geometry);
    }
    return this.labelGeometryCache.get(key);
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

  getSquareSneeze() {
    return this.squareSneeze;
  }

  setSquareSneeze(enabled) {
    const next = Boolean(enabled);
    if (this.squareSneeze === next && !this.pendingSneezeRebuild) {
      return this.squareSneeze;
    }
    if (next) {
      this.squareSneeze = true;
      this.pendingSneezeRebuild = false;
      if (this.mode === MODE_SQUARE) {
        if (this.sneezePieces.length > 0) {
          this.startSneezeAnimation({
            to: this.sneezeTargetOffset,
            duration: this.sneezeOutDuration,
            overshoot: this.sneezeOutOvershoot,
          });
        } else {
          this.build(this.currentN, { animateSneeze: true });
        }
      }
      return this.squareSneeze;
    }

    const wasSneeze = this.squareSneeze;
    this.squareSneeze = false;
    if (this.mode === MODE_SQUARE) {
      if (wasSneeze && this.sneezePieces.length > 0) {
        this.pendingSneezeRebuild = true;
        this.startSneezeAnimation({
          to: 0,
          duration: this.sneezeReturnDuration,
          overshoot: this.sneezeReturnOvershoot,
        });
      } else {
        this.build(this.currentN);
      }
    }
    return this.squareSneeze;
  }

  toggleSquareSneeze() {
    return this.setSquareSneeze(!this.squareSneeze);
  }

  getCubeMode() {
    return this.mode === MODE_CUBE;
  }

  getDepthCount(n = this.currentN) {
    return this.mode === MODE_CUBE ? n : 1;
  }

  getColumnCount(n = this.currentN) {
    if (this.mode === MODE_COLUMN) {
      return this.getColumnModeLayout(n).length;
    }
    return this.mode === MODE_PYRAMID ? n * 2 - 1 : n;
  }

  getMaxColumnHeight(n = this.currentN) {
    if (this.mode === MODE_COLUMN) {
      const columnHeights = this.getColumnModeLayout(n).map((blocks) => blocks.length);
      return columnHeights.length > 0 ? Math.max(...columnHeights) : Math.max(1, n);
    }
    return Math.max(1, n);
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

  getSquareSneezeTotal() {
    const n = Math.max(1, this.currentN);
    if (n === 1) {
      return 1;
    }
    if (n === 2) {
      return 4;
    }
    return 4 * n - 4;
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

  getCurrentSneezeOffset() {
    const piece = this.sneezePieces[0];
    if (!piece) {
      return 0;
    }
    const baseZ = piece.userData.baseZ ?? 0;
    return piece.position.z - baseZ;
  }

  startSneezeAnimation({ to, duration = 420, overshoot = 1.5 }) {
    const from = this.getCurrentSneezeOffset();
    if (Math.abs(to - from) < 0.001) {
      this.sneezePieces.forEach((piece) => {
        const baseZ = piece.userData.baseZ ?? 0;
        piece.position.z = baseZ + to;
      });
      if (this.pendingSneezeRebuild && to === 0) {
        this.pendingSneezeRebuild = false;
        this.build(this.currentN);
      }
      return;
    }
    this.sneezeAnimation = {
      startTime: performance.now(),
      duration,
      from,
      to,
      overshoot,
    };
  }

  update(now = performance.now()) {
    if (!this.sneezeAnimation) {
      return;
    }
    const { startTime, duration, from, to, overshoot } = this.sneezeAnimation;
    const t = Math.min(1, (now - startTime) / duration);
    const eased = easeOutBack(t, overshoot);
    const offset = from + (to - from) * eased;
    this.sneezePieces.forEach((piece) => {
      const baseZ = piece.userData.baseZ ?? 0;
      piece.position.z = baseZ + offset;
    });
    if (t >= 1) {
      this.sneezeAnimation = null;
      if (this.pendingSneezeRebuild) {
        this.pendingSneezeRebuild = false;
        this.build(this.currentN);
      }
    }
  }

  getColumnBlockCount(columnNumber) {
    if (this.mode === MODE_COLUMN) {
      const columnBlocks = this.getColumnModeLayout(this.currentN)[columnNumber - 1];
      return columnBlocks ? columnBlocks.length : this.currentN;
    }
    if (this.mode === MODE_SQUARE || this.mode === MODE_CUBE) {
      return this.currentN;
    }
    if (this.mode === MODE_PYRAMID) {
      return columnNumber <= this.currentN ? columnNumber : (2 * this.currentN - columnNumber);
    }
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

  getColumnModeLayout(n = this.currentN) {
    const safeN = Math.max(1, n);
    if (safeN < 10) {
      return [getBlocksForNumber(safeN)];
    }

    const allBlocks = getBlocksForNumber(safeN);
    const tensCount = Math.floor(safeN / 10);
    const onesCount = safeN % 10;
    const tenColumnTemplate = allBlocks.slice(0, Math.min(10, allBlocks.length));
    const columns = [];

    for (let i = 0; i < tensCount; i++) {
      columns.push(tenColumnTemplate);
    }

    if (onesCount > 0) {
      const onesStart = tensCount * 10;
      columns.push(allBlocks.slice(onesStart));
    }

    return columns.length > 0 ? columns : [getBlocksForNumber(safeN)];
  }
}
