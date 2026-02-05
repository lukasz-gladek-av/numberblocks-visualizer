import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, controls, ground;
let animationFrameId;
const GROUND_BASE_SIZE = 120;

/**
 * Initialize the Three.js scene, camera, renderer, and lighting
 * @returns {Object} - { scene, camera, renderer, controls }
 */
export function initScene() {
  // Scene setup
  scene = new THREE.Scene();

  // Create sky gradient texture
  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 512;
  skyCanvas.height = 512;
  const skyCtx = skyCanvas.getContext('2d');

  // Create vertical gradient for sky - deep blue at top to lighter blue
  const skyGradient = skyCtx.createLinearGradient(0, 0, 0, 512);
  skyGradient.addColorStop(0, '#1F4D7A');     // Deep blue at top
  skyGradient.addColorStop(0.5, '#3D6FA8');   // Medium blue
  skyGradient.addColorStop(1, '#5B9FD0');     // Lighter blue at horizon
  skyCtx.fillStyle = skyGradient;
  skyCtx.fillRect(0, 0, 512, 512);

  const skyTexture = new THREE.CanvasTexture(skyCanvas);
  skyTexture.magFilter = THREE.LinearFilter;
  skyTexture.minFilter = THREE.LinearMipmapLinearFilter;
  scene.background = skyTexture;

  scene.fog = new THREE.Fog(0x5B9FD0, 50, 100); // Fog for depth effect (match sky gradient)

  // Add simple billboard clouds
  const cloudCanvas = document.createElement('canvas');
  cloudCanvas.width = 256;
  cloudCanvas.height = 128;
  const cloudCtx = cloudCanvas.getContext('2d');
  cloudCtx.clearRect(0, 0, 256, 128);
  const featherGradient = cloudCtx.createRadialGradient(128, 64, 0, 128, 64, 100);
  featherGradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  featherGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
  featherGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  cloudCtx.fillStyle = featherGradient;
  cloudCtx.beginPath();
  for (let i = 0; i < 9; i++) {
    const cx = 40 + Math.random() * 180;
    const cy = 40 + Math.random() * 50;
    const rx = 30 + Math.random() * 60;
    const ry = 14 + Math.random() * 30;
    const rot = (Math.random() - 0.5) * 0.4;
    cloudCtx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
  }
  cloudCtx.fill();

  cloudCtx.globalAlpha = 0.55;
  cloudCtx.beginPath();
  for (let i = 0; i < 4; i++) {
    const cx = 50 + Math.random() * 160;
    const cy = 50 + Math.random() * 40;
    const rx = 20 + Math.random() * 40;
    const ry = 10 + Math.random() * 20;
    const rot = (Math.random() - 0.5) * 0.5;
    cloudCtx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
  }
  cloudCtx.fill();
  cloudCtx.globalAlpha = 1;

  const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
  cloudTexture.magFilter = THREE.LinearFilter;
  cloudTexture.minFilter = THREE.LinearMipmapLinearFilter;
  const cloudMaterial = new THREE.MeshBasicMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });

  const cloudGroup = new THREE.Group();
  for (let i = 0; i < 12; i++) {
    const cloud = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), cloudMaterial);
    cloud.position.set(
      -30 + Math.random() * 60,
      12 + Math.random() * 10,
      -20 - Math.random() * 20
    );
    cloud.rotation.y = (Math.random() - 0.5) * 0.4;
    cloud.scale.set(0.8 + Math.random() * 0.6, 0.8 + Math.random() * 0.4, 1);
    cloudGroup.add(cloud);
  }
  scene.add(cloudGroup);

  // Camera setup
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
  camera.position.set(0, 4.5, 15);
  camera.lookAt(0, 4.5, 0);

  // Renderer setup
  const canvas = document.getElementById('threejs-canvas');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowShadowMap;

  // Lighting setup - vibrant colors
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.1);
  directionalLight.position.set(15, 12, 15);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.left = -40;
  directionalLight.shadow.camera.right = 40;
  directionalLight.shadow.camera.top = 40;
  directionalLight.shadow.camera.bottom = -40;
  directionalLight.shadow.camera.near = 0.1;
  directionalLight.shadow.camera.far = 100;
  directionalLight.shadow.bias = -0.0006;
  directionalLight.shadow.normalBias = 0.02;
  scene.add(directionalLight);

  // Ground plane with gradient texture
  const groundGeometry = new THREE.PlaneGeometry(GROUND_BASE_SIZE, GROUND_BASE_SIZE);

  // Create gradient texture with noise
  const gradientCanvas = document.createElement('canvas');
  gradientCanvas.width = 512;
  gradientCanvas.height = 512;
  const ctx = gradientCanvas.getContext('2d');

  // Create vertical gradient from darker to lighter green
  const gradient = ctx.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, '#2a8a2a');     // Darker green at top
  gradient.addColorStop(0.5, '#3aa83a');   // Medium green in middle
  gradient.addColorStop(1, '#4bc84b');     // Lighter green at bottom
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  // Add noise/texture to the gradient
  const imageData = ctx.getImageData(0, 0, 512, 512);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    // Create Perlin-like noise using simple random variation
    const noise = (Math.random() - 0.5) * 30;
    data[i] += noise;     // R
    data[i + 1] += noise; // G
    data[i + 2] += noise; // B
  }

  ctx.putImageData(imageData, 0, 0);

  // Create normal map from noise
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = 512;
  normalCanvas.height = 512;
  const normalCtx = normalCanvas.getContext('2d');

  // Copy the noise texture to normal canvas
  normalCtx.drawImage(gradientCanvas, 0, 0);
  const normalImageData = normalCtx.getImageData(0, 0, 512, 512);
  const normalData = normalImageData.data;

  // Generate normal map using Sobel filter
  const texWidth = 512;
  const texHeight = 512;

  for (let y = 1; y < texHeight - 1; y++) {
    for (let x = 1; x < texWidth - 1; x++) {
      const idx = (y * texWidth + x) * 4;

      // Get surrounding pixel luminance values
      const tl = data[((y - 1) * texWidth + (x - 1)) * 4]; // top-left
      const t = data[((y - 1) * texWidth + x) * 4];        // top
      const tr = data[((y - 1) * texWidth + (x + 1)) * 4]; // top-right
      const l = data[(y * texWidth + (x - 1)) * 4];        // left
      const r = data[(y * texWidth + (x + 1)) * 4];        // right
      const bl = data[((y + 1) * texWidth + (x - 1)) * 4]; // bottom-left
      const b = data[((y + 1) * texWidth + x) * 4];        // bottom
      const br = data[((y + 1) * texWidth + (x + 1)) * 4]; // bottom-right

      // Sobel filter
      const gx = (-tl - 2 * l - bl + tr + 2 * r + br) / 8;
      const gy = (-tl - 2 * t - tr + bl + 2 * b + br) / 8;

      // Convert to normal map (0-255 range)
      normalData[idx] = Math.max(0, Math.min(255, 128 + gx * 0.5));     // R (X)
      normalData[idx + 1] = Math.max(0, Math.min(255, 128 + gy * 0.5)); // G (Y)
      normalData[idx + 2] = 255;                                         // B (Z) - mostly upward
    }
  }

  normalCtx.putImageData(normalImageData, 0, 0);

  const gradientTexture = new THREE.CanvasTexture(gradientCanvas);
  gradientTexture.magFilter = THREE.LinearFilter;
  gradientTexture.minFilter = THREE.LinearMipmapLinearFilter;

  const normalTexture = new THREE.CanvasTexture(normalCanvas);
  normalTexture.magFilter = THREE.LinearFilter;
  normalTexture.minFilter = THREE.LinearMipmapLinearFilter;

  const groundMaterial = new THREE.MeshStandardMaterial({
    map: gradientTexture,
    normalMap: normalTexture,
    normalScale: new THREE.Vector2(0.8, 0.8),
    roughness: 0.6,
    metalness: 0.05,
    emissive: 0x3aa83a,
    emissiveIntensity: 0.1,
  });
  ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // OrbitControls for rotation and zoom
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 4.5, 0); // Lower anchor point
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = false;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI;
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
export function animate(sceneObj, cameraObj, rendererObj, controlsObj, updateCallback) {
  function loop() {
    animationFrameId = requestAnimationFrame(loop);

    // Update controls
    controlsObj.update();
    if (updateCallback) {
      updateCallback();
    }

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
 * Zoom camera to fit all columns in view without resetting position
 * @param {number} columnCount - Number of columns
 * @param {number} depthCount - Number of layers in depth
 * @param {number} maxHeightBlocks - Tallest column height (in blocks)
 */
export function adjustCameraForColumns(columnCount, depthCount = 1, maxHeightBlocks = columnCount) {
  // Calculate the width needed to display all columns
  const columnSpacing = 0.9; // Match staircase spacing
  const totalWidth = (columnCount - 1) * columnSpacing + 0.9; // Add padding
  const totalDepth = (depthCount - 1) * columnSpacing + 0.9;
  const maxHorizontal = Math.max(totalWidth, totalDepth);

  // Calculate the maximum height (tallest column = columnCount blocks)
  const blockSize = 0.9;
  const gap = 0.05;
  const maxHeight = maxHeightBlocks * (blockSize + gap);

  // Calculate required distance based on FOV and dimensions
  const vFOV = camera.fov * Math.PI / 180; // Vertical field of view in radians
  const distanceForHeight = maxHeight / (2 * Math.tan(vFOV / 2)) + 5;
  const hFOV = 2 * Math.atan(Math.tan(vFOV / 2) * camera.aspect);
  const distanceForWidth = maxHorizontal / (2 * Math.tan(hFOV / 2)) + 5;
  const distanceForDepth = totalDepth / 2 + 6;

  // Use the larger distance needed
  const distance = Math.max(distanceForHeight, distanceForWidth, distanceForDepth, 15) * 1.2;
  const safeDistance = distance * 1.05;

  // Adjust camera height to look at optimal point of the staircase
  // For small counts stay at 4.5, for larger counts move up to center of staircase
  const newTargetHeight = Math.max(4.5, maxHeight * 0.5);
  controls.target.y = newTargetHeight;
  camera.position.y = newTargetHeight; // Keep level viewing (camera at same height as target)

  // Only adjust distance from current viewing direction, don't change angle
  const direction = camera.position.clone().sub(controls.target).normalize();
  camera.position.copy(controls.target).addScaledVector(direction, safeDistance);

  // Ensure the camera and controls can handle very large structures
  controls.maxDistance = Math.max(50, safeDistance * 1.6);
  const farPlane = Math.max(1000, safeDistance * 4);
  const nearPlane = Math.max(0.1, farPlane / 10000);
  if (camera.far !== farPlane || camera.near !== nearPlane) {
    camera.far = farPlane;
    camera.near = nearPlane;
    camera.updateProjectionMatrix();
  }

  if (scene?.fog) {
    scene.fog.near = Math.max(50, safeDistance * 0.9);
    scene.fog.far = Math.max(100, safeDistance * 3);
  }

  if (ground) {
    const margin = Math.max(10, maxHorizontal * 0.25);
    const targetSize = maxHorizontal + margin * 2;
    const scale = Math.max(1, targetSize / GROUND_BASE_SIZE);
    ground.scale.set(scale, scale, 1);
  }

  controls.update();
}
