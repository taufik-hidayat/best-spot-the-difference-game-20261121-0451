// render.js — painting the two panels: the scene itself, the found markers,
// the keyboard cursor, the pulsing hint ring and the magnifier lens.
// The scene art lives in scenes.js; this file only frames it and marks it.

import { SCENE_W, SCENE_H } from './scenes.js';

export const PANEL_W = SCENE_W;
export const PANEL_H = SCENE_H;

/** Paint one panel: the scene with `applied` differences, then its markers. */
export function paintPanel(ctx, scene, applied, found, now, hint) {
  ctx.save();
  ctx.clearRect(0, 0, PANEL_W, PANEL_H);
  scene.draw(ctx, applied, now);
  // Found markers: a green ring with a check on both panels.
  for (const diff of scene.diffs) {
    if (!found.has(diff.id)) continue;
    drawFoundMarker(ctx, diff.x, diff.y, diff.r);
  }
  // Hint pulse: a golden ring breathing over one still-hidden difference.
  if (hint && now < hint.until) {
    const diff = scene.diffs.find((d) => d.id === hint.diffId);
    if (diff && !found.has(diff.id)) {
      const pulse = 0.5 + 0.5 * Math.sin(now * 9);
      ctx.save();
      ctx.strokeStyle = `rgba(255, 209, 102, ${0.55 + 0.45 * pulse})`;
      ctx.lineWidth = 3 + pulse * 2;
      ctx.beginPath();
      ctx.arc(diff.x, diff.y, diff.r + 6 + pulse * 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
}

/** A satisfying green ring + check mark over a found difference. */
export function drawFoundMarker(ctx, x, y, r) {
  ctx.save();
  ctx.strokeStyle = '#2fd67a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(47, 214, 122, 0.35)';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(x, y, r + 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#2fd67a';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.45, y);
  ctx.lineTo(x - r * 0.12, y + r * 0.38);
  ctx.lineTo(x + r * 0.5, y - r * 0.38);
  ctx.stroke();
  ctx.restore();
}

/** A brief red X where a wrong click landed. */
export function drawWrongMark(ctx, x, y, until, now) {
  if (now > until) return;
  const alpha = Math.max(0, (until - now) / 0.6);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#ef476f';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  const s = 12;
  ctx.beginPath();
  ctx.moveTo(x - s, y - s);
  ctx.lineTo(x + s, y + s);
  ctx.moveTo(x + s, y - s);
  ctx.lineTo(x - s, y + s);
  ctx.stroke();
  ctx.restore();
}

/** The keyboard crosshair: a small reticle the arrow keys move. */
export function drawCursor(ctx, x, y, visible) {
  if (!visible) return;
  ctx.save();
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 18, y);
  ctx.lineTo(x - 7, y);
  ctx.moveTo(x + 7, y);
  ctx.lineTo(x + 18, y);
  ctx.moveTo(x, y - 18);
  ctx.lineTo(x, y - 7);
  ctx.moveTo(x, y + 7);
  ctx.lineTo(x, y + 18);
  ctx.stroke();
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(x, y, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** The magnifier lens: a 2x zoom of the panel under the pointer, drawn on a
 * small off-screen canvas the game positions near the pointer. */
export function paintMagnifier(lensCtx, sourceCanvas, sx, sy, size) {
  const half = size / 2;
  lensCtx.save();
  lensCtx.clearRect(0, 0, size, size);
  lensCtx.beginPath();
  lensCtx.arc(half, half, half - 2, 0, Math.PI * 2);
  lensCtx.clip();
  // Source pixels are the panel's own pixels: a 2x zoom of a square half
  // the lens wide, centred on the pointer.
  const src = size / 4;
  lensCtx.imageSmoothingEnabled = true;
  lensCtx.drawImage(sourceCanvas, sx - src, sy - src, src * 2, src * 2, 0, 0, size, size);
  lensCtx.restore();
  lensCtx.strokeStyle = '#ffd166';
  lensCtx.lineWidth = 3;
  lensCtx.beginPath();
  lensCtx.arc(half, half, half - 2, 0, Math.PI * 2);
  lensCtx.stroke();
  // Crosshair in the lens.
  lensCtx.strokeStyle = 'rgba(255, 209, 102, 0.8)';
  lensCtx.lineWidth = 1.5;
  lensCtx.beginPath();
  lensCtx.moveTo(half - 10, half);
  lensCtx.lineTo(half + 10, half);
  lensCtx.moveTo(half, half - 10);
  lensCtx.lineTo(half, half + 10);
  lensCtx.stroke();
}
