/**
 * Numberblocks Step Squad 3D Visualization
 * Entry point - orchestrates the entire application
 */

import { initScene, animate, adjustCameraForColumns } from './scene.js';
import { Staircase } from './staircase.js';
import { setupControls } from './controls.js';

// Initialize the 3D scene
const { scene, camera, renderer, controls } = initScene();

// Create the staircase with initial N=5
const staircase = new Staircase(scene, 5);

// Setup UI controls with camera adjustment callback
setupControls(staircase, () => {
  // Optional callback for updates
}, adjustCameraForColumns);

// Start the animation loop
animate(scene, camera, renderer, controls);

console.log('Numberblocks Step Squad zainicjalizowana!');
console.log(`Uruchomienie z ${staircase.getCurrentN()} kolumnami i ${staircase.getTotal()} klockami`);
