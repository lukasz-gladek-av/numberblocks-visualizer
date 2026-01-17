import * as THREE from 'three';
import { createColumn } from './blocks.js';

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

    // Build initial staircase
    this.build(initialN);
  }

  /**
   * Build the staircase for a given number N
   * @param {number} n - The number of columns to create
   */
  build(n) {
    // Clear existing columns
    this.columns.forEach(column => this.group.remove(column));
    this.columns = [];

    // Clear existing labels completely
    while (this.labelGroup.children.length > 0) {
      this.labelGroup.remove(this.labelGroup.children[0]);
    }

    // Create new columns
    const columnSpacing = 1.2;
    const totalWidth = (n - 1) * columnSpacing;
    const startX = -totalWidth / 2;

    for (let i = 1; i <= n; i++) {
      const positionX = startX + (i - 1) * columnSpacing;
      const column = createColumn(i, positionX);
      column.castShadow = true;
      column.receiveShadow = true;

      // Recursively set castShadow for all children
      column.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      this.columns.push(column);
      this.group.add(column);

      // Add column label
      this.addColumnLabel(i, positionX);
    }

    this.currentN = n;
  }

  /**
   * Add a numerical label above each column
   * @param {number} columnNumber - The column number
   * @param {number} positionX - X position of the column
   */
  addColumnLabel(columnNumber, positionX) {
    // Create a canvas for the text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;

    // Draw text on canvas
    context.fillStyle = '#000000';
    context.font = 'bold 120px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(columnNumber, 128, 128);

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    // Create plane for the label
    const labelGeometry = new THREE.PlaneGeometry(1.5, 1.5);
    const labelMesh = new THREE.Mesh(labelGeometry, material);

    // Position above the column
    const maxHeight = columnNumber * 0.95; // Approximate height
    labelMesh.position.set(positionX, maxHeight + 1, 0);

    // Face camera by keeping the label plane parallel to xy-plane
    labelMesh.rotation.order = 'YXZ';

    this.labelGroup.add(labelMesh);
  }

  /**
   * Add one more column (increment N)
   */
  addColumn() {
    if (this.currentN < 20) {
      this.build(this.currentN + 1);
      return true;
    }
    return false;
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
}
