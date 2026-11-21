// game.js — the state of Night Harbour: which scene is up, what is found,
// the score, the timer, the hints and the magnifier. One scene at a time,
// seven differences each; clear all three scenes to finish the hunt.

import { SCENES, SCENE_W, SCENE_H } from './scenes.js';
import { paintPanel, drawWrongMark, drawCursor, paintMagnifier } from './render.js';
import { bindPanel, bindKeyboard } from './input.js';
import { playFound, playWrong, playSceneClear, playClick, setMuted, isMuted } from './audio.js';

export const DIFFS_PER_SCENE = 7;
const HINTS_PER_SCENE = 3;
const HINT_COST = 25;
const WRONG_COST = 10;
const FIND_POINTS = 100;
const HINT_MS = 2600;
const WRONG_MS = 600;
const LENS_SIZE = 168;

export function createGame(doc) {
  const $ = (id) => doc.getElementById(id);
  const els = {
    left: $('panel-left'),
    right: $('panel-right'),
    lens: $('lens'),
    sceneName: $('scene-name'),
    sceneSub: $('scene-sub'),
    sceneDiff: $('scene-diff'),
    counter: $('counter'),
    foundList: $('found-list'),
    score: $('score'),
    timer: $('timer'),
    mistakes: $('mistakes'),
    hints: $('hints'),
    hintBtn: $('btn-hint'),
    magBtn: $('btn-magnifier'),
    soundBtn: $('btn-sound'),
    nextBtn: $('btn-next'),
    dots: [$('dot-0'), $('dot-1'), $('dot-2')],
    overlay: $('overlay'),
    overlayTitle: $('overlay-title'),
    overlayText: $('overlay-text'),
    overlayBtn: $('overlay-btn'),
  };
  const leftCtx = els.left.getContext('2d');
  const rightCtx = els.right.getContext('2d');
  const lensCtx = els.lens.getContext('2d');

  const state = {
    sceneIndex: 0,
    found: new Set(),
    foundOrder: [],
    score: 0,
    mistakes: 0,
    hintsLeft: HINTS_PER_SCENE,
    startedAt: performance.now(),
    sceneStartedAt: performance.now(),
    phase: 'playing', // 'playing' | 'sceneClear' | 'gameClear'
    cursor: { x: SCENE_W / 2, y: SCENE_H / 2, visible: false, panel: 'left' },
    hover: null, // { x, y, canvas }
    magnifierOn: false,
    hint: null, // { diffId, until }
    wrong: null, // { x, y, panel, until }
    cleared: [false, false, false],
    sceneTimes: [0, 0, 0],
  };

  const scene = () => SCENES[state.sceneIndex];
  const remaining = () => scene().diffs.filter((d) => !state.found.has(d.id));
  const elapsed = () => Math.floor((performance.now() - state.startedAt) / 1000);
  const sceneElapsed = () => Math.floor((performance.now() - state.sceneStartedAt) / 1000);

  function fmtTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function refreshHud() {
    const sc = scene();
    els.sceneName.textContent = `Scene ${state.sceneIndex + 1} of 3 — ${sc.name}`;
    els.sceneSub.textContent = sc.subtitle;
    els.sceneDiff.textContent = sc.difficulty;
    const left = remaining().length;
    els.counter.textContent = `${left} left`;
    els.counter.classList.toggle('done', left === 0);
    els.score.textContent = String(state.score);
    els.timer.textContent = fmtTime(elapsed());
    els.mistakes.textContent = String(state.mistakes);
    els.hints.textContent = String(state.hintsLeft);
    els.hintBtn.disabled = state.hintsLeft === 0 || left === 0 || state.phase !== 'playing';
    els.magBtn.textContent = state.magnifierOn ? 'Magnifier: On (M)' : 'Magnifier: Off (M)';
    els.magBtn.classList.toggle('on', state.magnifierOn);
    els.soundBtn.textContent = isMuted() ? 'Sound: Off (S)' : 'Sound: On (S)';
    els.nextBtn.disabled = state.phase !== 'sceneClear';
    els.dots.forEach((dot, i) => {
      dot.classList.toggle('done', state.cleared[i]);
      dot.classList.toggle('current', i === state.sceneIndex);
      dot.textContent = state.cleared[i] ? '✓' : String(i + 1);
    });
    // The found tray: every found difference named, so the hunt reads at a glance.
    els.foundList.innerHTML = '';
    for (const name of state.foundOrder) {
      const chip = doc.createElement('span');
      chip.className = 'found-chip';
      chip.textContent = `✓ ${name}`;
      els.foundList.appendChild(chip);
    }
    if (state.foundOrder.length === 0) {
      const none = doc.createElement('span');
      none.className = 'found-none';
      none.textContent = 'No differences found yet — look closely…';
      els.foundList.appendChild(none);
    }
  }

  function showOverlay(title, text, btnLabel, onBtn) {
    els.overlayTitle.textContent = title;
    els.overlayText.textContent = text;
    els.overlayBtn.textContent = btnLabel;
    els.overlay.classList.remove('hidden');
    els.overlayBtn.onclick = () => {
      playClick();
      els.overlay.classList.add('hidden');
      onBtn();
    };
  }

  function hideOverlay() {
    els.overlay.classList.add('hidden');
  }

  function loadScene(index) {
    state.sceneIndex = index;
    state.found = new Set();
    state.foundOrder = [];
    state.hintsLeft = HINTS_PER_SCENE;
    state.sceneStartedAt = performance.now();
    state.phase = 'playing';
    state.hint = null;
    state.wrong = null;
    state.cursor.visible = false;
    hideOverlay();
    refreshHud();
  }

  function sceneClear() {
    state.phase = 'sceneClear';
    state.cleared[state.sceneIndex] = true;
    const secs = sceneElapsed();
    state.sceneTimes[state.sceneIndex] = secs;
    const bonus = Math.max(0, 300 - secs * 5);
    state.score += bonus;
    playSceneClear();
    refreshHud();
    const last = state.sceneIndex === SCENES.length - 1;
    if (last) {
      state.phase = 'gameClear';
      const total = state.sceneTimes.reduce((a, b) => a + b, 0);
      showOverlay(
        'You found them all!',
        `Every difference in all three scenes — ${DIFFS_PER_SCENE * SCENES.length} in all — ` +
          `in ${fmtTime(total)} with ${state.mistakes} wrong clicks. Final score: ${state.score}.`,
        'Play again',
        () => {
          state.score = 0;
          state.mistakes = 0;
          state.cleared = [false, false, false];
          state.sceneTimes = [0, 0, 0];
          state.startedAt = performance.now();
          loadScene(0);
        },
      );
    } else {
      showOverlay(
        `${scene().name} — cleared!`,
        `All ${DIFFS_PER_SCENE} differences found in ${fmtTime(secs)}. Time bonus +${bonus}. ` +
          `Score: ${state.score}. Next up: ${SCENES[state.sceneIndex + 1].name}.`,
        `Next scene: ${SCENES[state.sceneIndex + 1].name} (N)`,
        () => loadScene(state.sceneIndex + 1),
      );
    }
  }

  function mark(x, y, panel) {
    if (state.phase !== 'playing') return;
    const now = performance.now() / 1000;
    const hit = remaining().find((d) => Math.hypot(d.x - x, d.y - y) <= d.r + 6);
    if (hit) {
      state.found.add(hit.id);
      state.foundOrder.push(hit.name);
      state.score += FIND_POINTS;
      playFound();
      refreshHud();
      if (remaining().length === 0) sceneClear();
    } else {
      state.mistakes += 1;
      state.score = Math.max(0, state.score - WRONG_COST);
      state.wrong = { x, y, panel: panel === els.right ? 'right' : 'left', until: now + WRONG_MS / 1000 };
      playWrong();
      refreshHud();
    }
  }

  function useHint() {
    if (state.phase !== 'playing' || state.hintsLeft === 0 || remaining().length === 0) return;
    const pool = remaining();
    const pick = pool[Math.floor(Math.random() * pool.length)];
    state.hintsLeft -= 1;
    state.score = Math.max(0, state.score - HINT_COST);
    state.hint = { diffId: pick.id, until: performance.now() / 1000 + HINT_MS / 1000 };
    playClick();
    refreshHud();
  }

  function toggleMagnifier() {
    state.magnifierOn = !state.magnifierOn;
    if (!state.magnifierOn) els.lens.classList.add('hidden');
    playClick();
    refreshHud();
  }

  function toggleSound() {
    setMuted(!isMuted());
    playClick();
    refreshHud();
  }

  function nextScene() {
    if (state.phase === 'sceneClear' && state.sceneIndex < SCENES.length - 1) {
      loadScene(state.sceneIndex + 1);
    }
  }

  // ---- wiring -------------------------------------------------------------
  const panelHandlers = {
    onMark: (x, y, canvas) => mark(x, y, canvas),
    onHover: (pos, canvas) => {
      state.hover = pos ? { ...pos, canvas } : null;
      if (pos) {
        state.cursor.panel = canvas === els.right ? 'right' : 'left';
        state.cursor.x = pos.x;
        state.cursor.y = pos.y;
      }
    },
  };
  bindPanel(els.left, panelHandlers);
  bindPanel(els.right, panelHandlers);
  bindKeyboard({
    onCursorMove: (dx, dy) => {
      state.cursor.visible = true;
      state.cursor.x = Math.max(0, Math.min(SCENE_W, state.cursor.x + dx));
      state.cursor.y = Math.max(0, Math.min(SCENE_H, state.cursor.y + dy));
    },
    onCursorMark: () => {
      state.cursor.visible = true;
      mark(state.cursor.x, state.cursor.y);
    },
    onHint: useHint,
    onMagnifier: toggleMagnifier,
    onNext: nextScene,
    onSound: toggleSound,
    onScene: (i) => {
      if (state.phase === 'playing' || state.cleared[i]) loadScene(i);
    },
  });
  els.hintBtn.addEventListener('click', useHint);
  els.magBtn.addEventListener('click', toggleMagnifier);
  els.soundBtn.addEventListener('click', toggleSound);
  els.nextBtn.addEventListener('click', nextScene);
  els.dots.forEach((dot, i) => dot.addEventListener('click', () => {
    if (state.phase === 'playing' || state.cleared[i]) loadScene(i);
  }));

  // ---- frame loop -----------------------------------------------------------
  function frame() {
    const now = performance.now() / 1000;
    const sc = scene();
    const allDiffs = new Set(sc.diffs.map((d) => d.id));
    paintPanel(leftCtx, sc, new Set(), state.found, now, state.hint);
    paintPanel(rightCtx, sc, allDiffs, state.found, now, state.hint);
    // Wrong-click X on the panel it landed on.
    if (state.wrong) {
      const wctx = state.wrong.panel === 'right' ? rightCtx : leftCtx;
      drawWrongMark(wctx, state.wrong.x, state.wrong.y, state.wrong.until, now);
    }
    // Keyboard cursor on its panel.
    const cctx = state.cursor.panel === 'right' ? rightCtx : leftCtx;
    drawCursor(cctx, state.cursor.x, state.cursor.y, state.cursor.visible && state.phase === 'playing');
    // Magnifier lens follows the pointer over a panel.
    if (state.magnifierOn && state.hover) {
      const lens = els.lens;
      lens.classList.remove('hidden');
      const src = state.hover.canvas;
      paintMagnifier(lensCtx, src, state.hover.x, state.hover.y, LENS_SIZE);
      const rect = src.getBoundingClientRect();
      const scaleX = rect.width / SCENE_W;
      const scaleY = rect.height / SCENE_H;
      lens.style.left = `${rect.left + state.hover.x * scaleX - LENS_SIZE / 2}px`;
      lens.style.top = `${rect.top + state.hover.y * scaleY - LENS_SIZE / 2}px`;
    } else {
      els.lens.classList.add('hidden');
    }
    // Timer text ticks once a second.
    els.timer.textContent = fmtTime(elapsed());
    requestAnimationFrame(frame);
  }

  loadScene(0);
  requestAnimationFrame(frame);

  // Debug/testing hook: the play-test and the screenshot script drive the
  // game through this, clicking real differences at real coordinates.
  return {
    state,
    scene,
    mark,
    loadScene,
    useHint,
    toggleMagnifier,
    remaining,
  };
}
