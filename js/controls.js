/**
 * Setup user controls and UI interactions
 * @param {Staircase} staircase - The staircase instance
 * @param {Function} updateCallback - Callback to update UI (e.g., total display)
 */
export function setupControls(staircase, updateCallback, adjustCameraCallback) {
  // Button elements
  const btnPlus = document.getElementById('btn-plus');
  const btnMinus = document.getElementById('btn-minus');
  const btnModeStairs = document.getElementById('btn-mode-stairs');
  const btnModeSquare = document.getElementById('btn-mode-square');
  const btnModeCube = document.getElementById('btn-mode-cube');
  const totalDisplay = document.getElementById('total-display');

  // Initialize total display
  updateTotalDisplay(staircase, totalDisplay);
  updateModeButtons(staircase, { btnModeStairs, btnModeSquare, btnModeCube });

  // Plus button - add column
  btnPlus.addEventListener('click', () => {
    const success = staircase.addColumn();
    if (success) {
      updateTotalDisplay(staircase, totalDisplay);
      if (adjustCameraCallback) {
        adjustCameraCallback(staircase.getCurrentN(), staircase.getDepthCount());
      }
      updateCallback?.();
    }
  });

  // Minus button - remove column
  btnMinus.addEventListener('click', () => {
    const success = staircase.removeColumn();
    if (success) {
      updateTotalDisplay(staircase, totalDisplay);
      if (adjustCameraCallback) {
        adjustCameraCallback(staircase.getCurrentN(), staircase.getDepthCount());
      }
      updateCallback?.();
    }
  });

  btnModeStairs.addEventListener('click', () => {
    staircase.setMode('stairs');
    updateModeButtons(staircase, { btnModeStairs, btnModeSquare, btnModeCube });
    updateTotalDisplay(staircase, totalDisplay);
    if (adjustCameraCallback) {
      adjustCameraCallback(staircase.getCurrentN(), staircase.getDepthCount());
    }
    updateCallback?.();
  });

  btnModeSquare.addEventListener('click', () => {
    staircase.setMode('square');
    updateModeButtons(staircase, { btnModeStairs, btnModeSquare, btnModeCube });
    updateTotalDisplay(staircase, totalDisplay);
    if (adjustCameraCallback) {
      adjustCameraCallback(staircase.getCurrentN(), staircase.getDepthCount());
    }
    updateCallback?.();
  });

  btnModeCube.addEventListener('click', () => {
    staircase.setMode('cube');
    updateModeButtons(staircase, { btnModeStairs, btnModeSquare, btnModeCube });
    updateTotalDisplay(staircase, totalDisplay);
    if (adjustCameraCallback) {
      adjustCameraCallback(staircase.getCurrentN(), staircase.getDepthCount());
    }
    updateCallback?.();
  });

  // Touch-friendly additions
  addTouchFeedback(btnPlus);
  addTouchFeedback(btnMinus);
  addTouchFeedback(btnModeStairs);
  addTouchFeedback(btnModeSquare);
  addTouchFeedback(btnModeCube);

  return { btnPlus, btnMinus, btnModeStairs, btnModeSquare, btnModeCube, totalDisplay };
}

/**
 * Update the total blocks display
 * @param {Staircase} staircase - The staircase instance
 * @param {HTMLElement} totalDisplay - The display element
 */
function updateTotalDisplay(staircase, totalDisplay) {
  const n = staircase.getCurrentN();
  const total = staircase.getTotal();
  const mode = staircase.getMode();
  if (mode === 'square') {
    const squareFill = staircase.getSquareFillTotal();
    const squareTotal = staircase.getSquareTotal();
    totalDisplay.textContent = `${total} + ${squareFill} = ${squareTotal}`;
    return;
  }
  if (mode === 'cube') {
    const squareTotal = staircase.getSquareTotal();
    const cubeTotal = staircase.getCubeTotal();
    totalDisplay.textContent = `${squareTotal} × ${n} = ${cubeTotal}`;
    return;
  }
  totalDisplay.textContent = `${n} kolumn: ${total} klocków`;
}

function updateModeButtons(staircase, buttons) {
  const mode = staircase.getMode();
  const modeButtons = [
    { key: 'stairs', button: buttons.btnModeStairs },
    { key: 'square', button: buttons.btnModeSquare },
    { key: 'cube', button: buttons.btnModeCube },
  ];

  modeButtons.forEach(({ key, button }) => {
    const isActive = mode === key;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

/**
 * Add visual feedback for touch/click on buttons
 * @param {HTMLElement} button - The button element
 */
function addTouchFeedback(button) {
  // Mouse/touch down
  button.addEventListener('mousedown', () => {
    button.style.transform = 'scale(0.95)';
  });

  button.addEventListener('touchstart', (e) => {
    e.preventDefault();
    button.style.transform = 'scale(0.95)';
  });

  // Mouse/touch up
  const resetScale = () => {
    button.style.transform = '';
  };

  button.addEventListener('mouseup', resetScale);
  button.addEventListener('mouseleave', resetScale);
  button.addEventListener('touchend', resetScale);
  button.addEventListener('touchcancel', resetScale);
}
