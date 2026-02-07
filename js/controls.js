/**
 * Setup user controls and UI interactions
 * @param {Staircase} staircase - The staircase instance
 * @param {Function} updateCallback - Callback to update UI (e.g., total display)
 */
export function setupControls(staircase, updateCallback, adjustCameraCallback) {
  // Button elements
  const btnPlus = document.getElementById('btn-plus');
  const btnMinus = document.getElementById('btn-minus');
  const btnReset = document.getElementById('btn-reset');
  const btnModeStairs = document.getElementById('btn-mode-stairs');
  const btnModeColumn = document.getElementById('btn-mode-column');
  const btnModeSquare = document.getElementById('btn-mode-square');
  const btnModeCube = document.getElementById('btn-mode-cube');
  const btnModePyramid = document.getElementById('btn-mode-pyramid');
  const btnSquareSneeze = document.getElementById('btn-square-sneeze');
  const totalDisplay = document.getElementById('total-display');
  let pendingDelta = 0;
  let applyRaf = null;
  const adjustCamera = () => {
    if (!adjustCameraCallback) {
      return;
    }
    adjustCameraCallback(
      staircase.getColumnCount(),
      staircase.getDepthCount(),
      staircase.getMaxColumnHeight()
    );
  };

  const applyPendingDelta = () => {
    applyRaf = null;
    if (pendingDelta === 0) {
      return;
    }
    const currentN = staircase.getCurrentN();
    const targetN = Math.max(1, currentN + pendingDelta);
    pendingDelta = 0;
    if (targetN === currentN) {
      return;
    }
    staircase.build(targetN);
    updateTotalDisplay(staircase, totalDisplay);
    adjustCamera();
    updateCallback?.();
  };

  const scheduleDelta = (delta) => {
    pendingDelta += delta;
    if (applyRaf === null) {
      applyRaf = requestAnimationFrame(applyPendingDelta);
    }
  };

  // Initialize total display
  updateTotalDisplay(staircase, totalDisplay);
  updateModeButtons(staircase, { btnModeStairs, btnModeColumn, btnModeSquare, btnModeCube, btnModePyramid });
  updateSquareSneezeButton();

  // Plus button - increment N
  btnPlus.addEventListener('click', () => {
    scheduleDelta(1);
  });

  // Minus button - decrement N
  btnMinus.addEventListener('click', () => {
    scheduleDelta(-1);
  });

  btnReset.addEventListener('click', () => {
    pendingDelta = 0;
    if (applyRaf !== null) {
      cancelAnimationFrame(applyRaf);
      applyRaf = null;
    }
    staircase.reset();
    updateTotalDisplay(staircase, totalDisplay);
    adjustCamera();
    updateCallback?.();
  });

  btnModeStairs.addEventListener('click', () => {
    staircase.setMode('stairs');
    updateModeButtons(staircase, { btnModeStairs, btnModeColumn, btnModeSquare, btnModeCube, btnModePyramid });
    updateSquareSneezeButton();
    updateTotalDisplay(staircase, totalDisplay);
    adjustCamera();
    updateCallback?.();
  });

  btnModeColumn.addEventListener('click', () => {
    staircase.setMode('column');
    updateModeButtons(staircase, { btnModeStairs, btnModeColumn, btnModeSquare, btnModeCube, btnModePyramid });
    updateSquareSneezeButton();
    updateTotalDisplay(staircase, totalDisplay);
    adjustCamera();
    updateCallback?.();
  });

  btnModeSquare.addEventListener('click', () => {
    staircase.setMode('square');
    updateModeButtons(staircase, { btnModeStairs, btnModeColumn, btnModeSquare, btnModeCube, btnModePyramid });
    updateSquareSneezeButton();
    updateTotalDisplay(staircase, totalDisplay);
    adjustCamera();
    updateCallback?.();
  });

  btnModeCube.addEventListener('click', () => {
    staircase.setMode('cube');
    updateModeButtons(staircase, { btnModeStairs, btnModeColumn, btnModeSquare, btnModeCube, btnModePyramid });
    updateSquareSneezeButton();
    updateTotalDisplay(staircase, totalDisplay);
    adjustCamera();
    updateCallback?.();
  });

  btnModePyramid.addEventListener('click', () => {
    staircase.setMode('pyramid');
    updateModeButtons(staircase, { btnModeStairs, btnModeColumn, btnModeSquare, btnModeCube, btnModePyramid });
    updateSquareSneezeButton();
    updateTotalDisplay(staircase, totalDisplay);
    adjustCamera();
    updateCallback?.();
  });

  btnSquareSneeze.addEventListener('click', () => {
    if (!staircase.getSquareMode()) {
      return;
    }
    staircase.toggleSquareSneeze();
    updateSquareSneezeButton();
    updateTotalDisplay(staircase, totalDisplay);
    adjustCamera();
    updateCallback?.();
  });

  // Touch-friendly additions
  addTouchFeedback(btnPlus);
  addTouchFeedback(btnMinus);
  addTouchFeedback(btnReset);
  addTouchFeedback(btnModeStairs);
  addTouchFeedback(btnModeColumn);
  addTouchFeedback(btnModeSquare);
  addTouchFeedback(btnModeCube);
  addTouchFeedback(btnModePyramid);
  addTouchFeedback(btnSquareSneeze);

  function updateSquareSneezeButton() {
    const isSquareMode = staircase.getSquareMode();
    const isActive = staircase.getSquareSneeze();
    btnSquareSneeze.disabled = !isSquareMode;
    btnSquareSneeze.classList.toggle('active', isActive);
    btnSquareSneeze.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  }

  return { btnPlus, btnMinus, btnModeStairs, btnModeColumn, btnModeSquare, btnModeCube, btnModePyramid, btnSquareSneeze, totalDisplay };
}

/**
 * Update the total blocks display
 * @param {Staircase} staircase - The staircase instance
 * @param {HTMLElement} totalDisplay - The display element
 */
function updateTotalDisplay(staircase, totalDisplay) {
  const n = staircase.getCurrentN();
  const columnCount = staircase.getColumnCount();
  const total = staircase.getTotal();
  const mode = staircase.getMode();
  if (mode === 'square') {
    const squareTotal = staircase.getSquareTotal();
    if (staircase.getSquareSneeze()) {
      const sneezeTotal = staircase.getSquareSneezeTotal();
      totalDisplay.textContent = `Obramowanie: ${sneezeTotal} z ${squareTotal}`;
      return;
    }
    const squareFill = staircase.getSquareFillTotal();
    totalDisplay.textContent = `${total} + ${squareFill} = ${squareTotal}`;
    return;
  }
  if (mode === 'cube') {
    const squareTotal = staircase.getSquareTotal();
    const cubeTotal = staircase.getCubeTotal();
    totalDisplay.textContent = `${squareTotal} × ${n} = ${cubeTotal}`;
    return;
  }
  if (mode === 'pyramid') {
    const pyramidTotal = staircase.getPyramidTotal();
    totalDisplay.textContent = `${columnCount} kolumn: ${pyramidTotal} klocków`;
    return;
  }
  totalDisplay.textContent = `${columnCount} kolumn: ${total} klocków`;
}

function updateModeButtons(staircase, buttons) {
  const mode = staircase.getMode();
  const modeButtons = [
    { key: 'stairs', button: buttons.btnModeStairs },
    { key: 'column', button: buttons.btnModeColumn },
    { key: 'square', button: buttons.btnModeSquare },
    { key: 'cube', button: buttons.btnModeCube },
    { key: 'pyramid', button: buttons.btnModePyramid },
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
