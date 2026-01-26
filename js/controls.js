/**
 * Setup user controls and UI interactions
 * @param {Staircase} staircase - The staircase instance
 * @param {Function} updateCallback - Callback to update UI (e.g., total display)
 */
export function setupControls(staircase, updateCallback, adjustCameraCallback) {
  // Button elements
  const btnPlus = document.getElementById('btn-plus');
  const btnMinus = document.getElementById('btn-minus');
  const btnSquare = document.getElementById('btn-square');
  const totalDisplay = document.getElementById('total-display');

  // Initialize total display
  updateTotalDisplay(staircase, totalDisplay);
  updateModeButton(staircase, btnSquare);

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

  btnSquare.addEventListener('click', () => {
    staircase.cycleMode();
    updateModeButton(staircase, btnSquare);
    updateTotalDisplay(staircase, totalDisplay);
    if (adjustCameraCallback) {
      adjustCameraCallback(staircase.getCurrentN(), staircase.getDepthCount());
    }
    updateCallback?.();
  });

  // Touch-friendly additions
  addTouchFeedback(btnPlus);
  addTouchFeedback(btnMinus);
  addTouchFeedback(btnSquare);

  return { btnPlus, btnMinus, btnSquare, totalDisplay };
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

function updateModeButton(staircase, button) {
  const mode = staircase.getMode();
  if (mode === 'stairs') {
    button.textContent = 'Schody';
    button.setAttribute('aria-label', 'Zmień tryb (Schody)');
    return;
  }
  if (mode === 'square') {
    button.textContent = 'Kwadraty';
    button.setAttribute('aria-label', 'Zmień tryb (Kwadraty)');
    return;
  }
  button.textContent = 'Sześciany';
  button.setAttribute('aria-label', 'Zmień tryb (Sześciany)');
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
    button.style.transform = 'scale(1)';
  };

  button.addEventListener('mouseup', resetScale);
  button.addEventListener('mouseleave', resetScale);
  button.addEventListener('touchend', resetScale);
  button.addEventListener('touchcancel', resetScale);
}
