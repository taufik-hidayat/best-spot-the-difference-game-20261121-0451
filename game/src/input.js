// input.js — mouse and keyboard for Night Harbour. Clicking either panel
// marks the spot under the pointer; the arrow keys move a crosshair and
// Enter/Space marks where it stands. H asks for a hint, M toggles the
// magnifier, N moves on when a scene is cleared, 1-3 jump between scenes.

import { SCENE_W, SCENE_H } from './scenes.js';

/** Convert a pointer event on a panel canvas to scene coordinates. */
export function eventToSceneCoords(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * SCENE_W;
  const y = ((event.clientY - rect.top) / rect.height) * SCENE_H;
  return { x, y, inside: x >= 0 && x <= SCENE_W && y >= 0 && y <= SCENE_H };
}

/** Wire a panel canvas: pointer clicks, pointer moves (for the magnifier)
 * and leaving the panel. Handlers are plain callbacks the game supplies. */
export function bindPanel(canvas, handlers) {
  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    const pos = eventToSceneCoords(event, canvas);
    if (pos.inside) handlers.onMark(pos.x, pos.y, canvas);
  });
  canvas.addEventListener('pointermove', (event) => {
    const pos = eventToSceneCoords(event, canvas);
    handlers.onHover(pos.inside ? pos : null, canvas, event);
  });
  canvas.addEventListener('pointerleave', () => handlers.onHover(null, canvas, null));
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());
}

const CURSOR_STEP = 14;

/** Wire the keyboard. Returns nothing; every key calls into the game. */
export function bindKeyboard(handlers) {
  window.addEventListener('keydown', (event) => {
    if (event.target && (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA')) return;
    const k = event.key;
    if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowDown') {
      event.preventDefault();
      const dx = k === 'ArrowLeft' ? -CURSOR_STEP : k === 'ArrowRight' ? CURSOR_STEP : 0;
      const dy = k === 'ArrowUp' ? -CURSOR_STEP : k === 'ArrowDown' ? CURSOR_STEP : 0;
      handlers.onCursorMove(dx, dy);
      return;
    }
    if (k === 'Enter' || k === ' ') {
      event.preventDefault();
      handlers.onCursorMark();
      return;
    }
    const lower = k.toLowerCase();
    if (lower === 'h') handlers.onHint();
    else if (lower === 'm') handlers.onMagnifier();
    else if (lower === 'n') handlers.onNext();
    else if (lower === 's') handlers.onSound();
    else if (k === '1' || k === '2' || k === '3') handlers.onScene(Number(k) - 1);
  });
}
