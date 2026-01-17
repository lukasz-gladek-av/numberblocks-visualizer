import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let animationFrameId;

/**
 * Initialize the Three.js scene, camera, renderer, and lighting
 * @returns {Object} - { scene, camera, renderer, controls }
 */
export function initScene() {
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB); // Sky blue
  scene.fog = new THREE.Fog(0x87CEEB, 50, 100); // Fog for depth effect

  // Camera setup
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
  camera.position.set(8, 8, 8);
  camera.lookAt(0, 0, 0);

  // Renderer setup
  const canvas = document.getElementById('threejs-canvas');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowShadowMap;

  // Lighting setup
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(15, 20, 15);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.left = -30;
  directionalLight.shadow.camera.right = 30;
  directionalLight.shadow.camera.top = 30;
  directionalLight.shadow.camera.bottom = -30;
  directionalLight.shadow.camera.near = 0.1;
  directionalLight.shadow.camera.far = 100;
  scene.add(directionalLight);

  // Ground plane
  const groundGeometry = new THREE.PlaneGeometry(30, 30);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d8a2d, // Green
    roughness: 0.8,
    metalness: 0,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // OrbitControls for rotation and zoom
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = false;
  controls.minPolarAngle = Math.PI / 4;
  controls.maxPolarAngle = Math.PI / 2;
  controls.minDistance = 5;
  controls.maxDistance = 50;

  // Window resize handler
  window.addEventListener('resize', onWindowResize);

  return { scene, camera, renderer, controls };
}

/**
 * Handle window resize
 */
function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

/**
 * Animation loop using requestAnimationFrame
 * @param {THREE.Scene} sceneObj - The scene to render
 * @param {THREE.Camera} cameraObj - The camera
 * @param {THREE.WebGLRenderer} rendererObj - The renderer
 * @param {OrbitControls} controlsObj - The controls
 */
export function animate(sceneObj, cameraObj, rendererObj, controlsObj) {
  function loop() {
    animationFrameId = requestAnimationFrame(loop);

    // Update controls
    controlsObj.update();

    // Render the scene
    rendererObj.render(sceneObj, cameraObj);
  }

  loop();
}

/**
 * Stop the animation loop
 */
export function stopAnimation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
}

/**
 * Get the current scene (for external use)
 */
export function getScene() {
  return scene;
}

/**
 * Get the current renderer (for external use)
 */
export function getRenderer() {
  return renderer;
}

/**
 * Get the current camera (for external use)
 */
export function getCamera() {
  return camera;
}

/**
 * Adjust camera to fit all columns in view
 * @param {number} columnCount - Number of columns
 */
export function adjustCameraForColumns(columnCount) {
  // Calculate the width needed to display all columns
  const columnSpacing = 1.2;
  const totalWidth = (columnCount - 1) * columnSpacing + 2; // Add padding

  // Calculate the maximum height (tallest column = columnCount blocks)
  const blockSize = 0.9;
  const gap = 0.05;
  const maxHeight = columnCount * (blockSize + gap);

  // Calculate required distance based on FOV and dimensions
  const vFOV = camera.fov * Math.PI / 180; // Vertical field of view in radians
  const distanceForHeight = maxHeight / (2 * Math.tan(vFOV / 2)) + 3;
  const distanceForWidth = totalWidth / (2 * Math.tan((camera.fov / camera.aspect) * Math.PI / 360)) + 3;

  // Use the larger distance needed
  const distance = Math.max(distanceForHeight, distanceForWidth, 8);

  // Position camera at isometric angle
  const angle = Math.PI / 4; // 45 degrees
  const height = distance * 0.7;

  camera.position.set(
    Math.cos(angle) * distance,
    height,
    Math.sin(angle) * distance
  );

  camera.lookAt(0, maxHeight / 3, 0);

  // Update controls target
  controls.target.set(0, maxHeight / 4, 0);
  controls.update();
}
