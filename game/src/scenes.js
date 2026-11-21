// scenes.js — the art of Night Harbour: three hand-drawn procedural scenes.
// Every scene is drawn twice: the left panel with no differences applied, the
// right panel with all seven applied. A difference is a named spot (x, y, r)
// plus a branch inside the drawing code, so the two panels differ exactly
// where the differences say they do. Nothing here loads a file: all art is
// canvas shapes, gradients and text drawn at run time.

export const SCENE_W = 640;
export const SCENE_H = 400;

// ---------------------------------------------------------------- helpers

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function poly(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function gull(ctx, x, y, s) {
  ctx.strokeStyle = '#1c2436';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - s, y);
  ctx.quadraticCurveTo(x - s / 2, y - s * 0.9, x, y);
  ctx.quadraticCurveTo(x + s / 2, y - s * 0.9, x + s, y);
  ctx.stroke();
}

function fourStar(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

function crate(ctx, x, y, s) {
  ctx.fillStyle = '#9a6b3f';
  ctx.fillRect(x, y, s, s);
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, s - 2, s - 2);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + s, y + s);
  ctx.moveTo(x + s, y);
  ctx.lineTo(x, y + s);
  ctx.stroke();
}

function sailboat(ctx, x, y, scale, sail, stripe) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  // Hull.
  ctx.fillStyle = '#5b3a29';
  poly(ctx, [[-46, 0], [46, 0], [34, 16], [-34, 16]]);
  ctx.fillStyle = '#7c4a2d';
  ctx.fillRect(-46, 0, 92, 5);
  // Mast + sail.
  ctx.fillStyle = '#3d2b1f';
  ctx.fillRect(-2, -58, 4, 58);
  ctx.fillStyle = sail;
  poly(ctx, [[2, -56], [2, -6], [40, -6]]);
  if (stripe) {
    ctx.fillStyle = stripe;
    poly(ctx, [[2, -40], [2, -28], [24, -28]]);
  }
  // Little flag on the mast.
  ctx.fillStyle = '#e5484d';
  poly(ctx, [[2, -58], [16, -53], [2, -48]]);
  ctx.restore();
}

function stripedAwning(ctx, x, y, w, colors) {
  const n = 8;
  const sw = w / n;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = colors[i % 2];
    ctx.fillRect(x + i * sw, y, sw, 26);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(x, y + 22, w, 4);
  // Scalloped edge.
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = colors[i % 2];
    ctx.beginPath();
    ctx.arc(x + i * sw + sw / 2, y + 26, sw / 2, 0, Math.PI);
    ctx.fill();
  }
}

// ---------------------------------------------------------------- scene 1: Sunset Pier

function drawSunsetPier(ctx, d, t) {
  // Sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 250);
  sky.addColorStop(0, '#2b1055');
  sky.addColorStop(0.55, '#c65d7b');
  sky.addColorStop(1, '#ff9a5a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, SCENE_W, 250);
  // Sun with a soft glow.
  const glow = ctx.createRadialGradient(500, 110, 8, 500, 110, 90);
  glow.addColorStop(0, 'rgba(255, 209, 102, 0.9)');
  glow.addColorStop(1, 'rgba(255, 209, 102, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(400, 10, 200, 200);
  ctx.fillStyle = '#ffd166';
  circle(ctx, 500, 110, 42);
  ctx.fillStyle = '#ffe9a8';
  circle(ctx, 500, 110, 30);
  // Clouds.
  ctx.fillStyle = 'rgba(255, 235, 220, 0.85)';
  ellipse(ctx, 120, 70, 52, 14);
  ellipse(ctx, 150, 60, 38, 12);
  ellipse(ctx, 300, 48, 44, 11);
  ellipse(ctx, 430, 158, 40, 10);
  // Gulls (one of them is a difference).
  gull(ctx, 140, 92, 12);
  gull(ctx, 222, 62, 11);
  if (!d.has('gull')) gull(ctx, 330, 112, 12);
  // Sea.
  const sea = ctx.createLinearGradient(0, 240, 0, SCENE_H);
  sea.addColorStop(0, '#274b73');
  sea.addColorStop(1, '#0e2242');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 240, SCENE_W, 160);
  // Sun reflection shimmer.
  ctx.fillStyle = 'rgba(255, 190, 110, 0.5)';
  const wob = Math.sin(t * 0.8) * 4;
  for (let i = 0; i < 6; i++) {
    const w = 60 - i * 7;
    ctx.fillRect(500 - w / 2 + wob * (i % 2 ? 1 : -1), 252 + i * 11, w, 4);
  }
  // Distant headland.
  ctx.fillStyle = '#1c2f52';
  poly(ctx, [[0, 240], [0, 210], [70, 196], [150, 224], [190, 240]]);
  // Boats.
  sailboat(ctx, 150, 268, 0.9, d.has('sail') ? '#e07a5f' : '#f4f1de', d.has('sail') ? null : '#e07a5f');
  sailboat(ctx, 392, 296, 1.1, '#f4f1de', '#457b9d');
  // A jumping fish (a difference).
  if (!d.has('fish')) {
    ctx.strokeStyle = '#8fb8d8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(450, 252, 12, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    ctx.fillStyle = '#8fb8d8';
    poly(ctx, [[438, 246], [430, 240], [440, 238]]);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ellipse(ctx, 462, 266, 12, 3);
  }
  // Pier deck.
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(0, 318, SCENE_W, 82);
  ctx.fillStyle = '#8a5a32';
  ctx.fillRect(0, 318, SCENE_W, 10);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 2;
  for (let x = 24; x < SCENE_W; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 328);
    ctx.lineTo(x, 400);
    ctx.stroke();
  }
  // Pier posts (one of them is a difference).
  ctx.fillStyle = '#4a2e18';
  for (const px of [60, 220, 540]) ctx.fillRect(px - 7, 318, 14, 82);
  if (!d.has('post')) ctx.fillRect(380 - 7, 318, 14, 82);
  // Crates (the top one is a difference).
  crate(ctx, 78, 288, 30);
  crate(ctx, 112, 288, 30);
  crate(ctx, 95, 258, 30);
  if (!d.has('crate')) crate(ctx, 95, 228, 30);
  crate(ctx, 168, 296, 22);
  // Rope coil.
  ctx.strokeStyle = '#d9b380';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(300, 352, 18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(300, 352, 10, 0, Math.PI * 2);
  ctx.stroke();
  // Flag on the pier-end pole (its colour is a difference).
  ctx.fillStyle = '#3d2b1f';
  ctx.fillRect(600, 238, 5, 84);
  ctx.fillStyle = d.has('flag') ? '#2a9d8f' : '#e5484d';
  poly(ctx, [[605, 240], [636, 250], [605, 262]]);
  // Hanging lantern (lit or dark is a difference).
  ctx.strokeStyle = '#3d2b1f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(540, 318);
  ctx.lineTo(540, 288);
  ctx.stroke();
  const lit = !d.has('lantern');
  if (lit) {
    const lg = ctx.createRadialGradient(540, 292, 2, 540, 292, 26);
    lg.addColorStop(0, 'rgba(255, 200, 90, 0.85)');
    lg.addColorStop(1, 'rgba(255, 200, 90, 0)');
    ctx.fillStyle = lg;
    ctx.fillRect(510, 262, 60, 60);
  }
  ctx.fillStyle = lit ? '#ffcf5c' : '#3a3f4a';
  roundRect(ctx, 531, 280, 18, 24, 4);
  ctx.fillStyle = '#22242e';
  ctx.fillRect(537, 276, 6, 5);
}

// ---------------------------------------------------------------- scene 2: Night Market

function drawNightMarket(ctx, d, t) {
  // Night sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#0b1026');
  sky.addColorStop(1, '#1d2c50');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, SCENE_W, 300);
  // Stars.
  ctx.fillStyle = '#e8ecff';
  for (const [sx, sy, sr] of [[60, 40, 1.6], [110, 90, 1.2], [180, 30, 1.8], [250, 70, 1.2], [330, 36, 1.5], [420, 90, 1.2], [480, 30, 1.7], [610, 100, 1.3], [40, 140, 1.2], [210, 130, 1.4]]) {
    circle(ctx, sx, sy, sr);
  }
  // Moon: full, or a crescent when the difference applies.
  ctx.fillStyle = '#f5f3ce';
  circle(ctx, 560, 70, 30);
  ctx.fillStyle = '#e3dd9e';
  circle(ctx, 552, 64, 6);
  circle(ctx, 568, 78, 4);
  if (d.has('moon')) {
    ctx.fillStyle = '#141c38';
    circle(ctx, 572, 62, 26);
  }
  // String lights across the top.
  ctx.strokeStyle = '#20242e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 44);
  ctx.quadraticCurveTo(320, 96, SCENE_W, 44);
  ctx.stroke();
  const bulbColors = ['#ffd166', '#ef476f', '#06d6a0', '#4cc9f0'];
  for (let i = 0; i < 13; i++) {
    const bx = 24 + i * 50;
    const by = 44 + Math.sin((bx / SCENE_W) * Math.PI) * 44;
    const dark = d.has('bulb') && i === 5;
    ctx.fillStyle = dark ? '#2a2f3a' : bulbColors[i % 4];
    circle(ctx, bx, by + 8, 6);
    if (!dark) {
      ctx.fillStyle = 'rgba(255, 220, 120, 0.25)';
      circle(ctx, bx, by + 8, 11);
    }
  }
  // Ground.
  ctx.fillStyle = '#2a2118';
  ctx.fillRect(0, 300, SCENE_W, 100);
  ctx.fillStyle = '#3a2d1f';
  for (let x = 0; x < SCENE_W; x += 46) {
    ellipse(ctx, x + 20, 330, 20, 5);
    ellipse(ctx, x + 42, 372, 20, 5);
  }
  // Vendor behind the middle stall.
  ctx.fillStyle = '#f2c89b';
  circle(ctx, 325, 196, 15);
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.arc(325, 192, 16, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(307, 190, 36, 4);
  ctx.fillStyle = d.has('shirt') ? '#4361ee' : '#3e6b4f';
  roundRect(ctx, 302, 212, 46, 52, 10);
  // Stall 1: fruit.
  ctx.fillStyle = '#7b4b2a';
  ctx.fillRect(40, 250, 170, 14);
  ctx.fillStyle = '#5d3a20';
  ctx.fillRect(48, 264, 12, 40);
  ctx.fillRect(190, 264, 12, 40);
  stripedAwning(ctx, 40, 148, 170, ['#e5484d', '#f8f0e3']);
  ctx.fillStyle = '#e5484d';
  const apples = d.has('apples') ? 4 : 5;
  for (let i = 0; i < apples; i++) {
    const ax = 66 + (i % 3) * 34;
    const ay = i < 3 ? 236 : 214;
    circle(ctx, ax, ay, 12);
    ctx.strokeStyle = '#2f7d32';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ax, ay - 12);
    ctx.lineTo(ax + 4, ay - 18);
    ctx.stroke();
  }
  // Stall 2: fish.
  ctx.fillStyle = '#7b4b2a';
  ctx.fillRect(240, 250, 170, 14);
  ctx.fillStyle = '#5d3a20';
  ctx.fillRect(248, 264, 12, 40);
  ctx.fillRect(390, 264, 12, 40);
  stripedAwning(ctx, 240, 148, 170, d.has('awning') ? ['#f4d35e', '#f8f0e3'] : ['#2a9d8f', '#f8f0e3']);
  ctx.fillStyle = '#bfe3ea';
  ellipse(ctx, 285, 240, 34, 9);
  ctx.fillStyle = '#8fb8d8';
  for (const fx of [288, 330, 372]) {
    ellipse(ctx, fx, 234, 16, 6);
    poly(ctx, [[fx + 14, 234], [fx + 22, 228], [fx + 22, 240]]);
    circle(ctx, fx - 9, 232, 1.6);
  }
  // Stall 3: lanterns.
  ctx.fillStyle = '#7b4b2a';
  ctx.fillRect(440, 250, 170, 14);
  ctx.fillStyle = '#5d3a20';
  ctx.fillRect(448, 264, 12, 40);
  ctx.fillRect(592, 264, 12, 40);
  stripedAwning(ctx, 440, 148, 170, ['#4361ee', '#f8f0e3']);
  const lanternCount = d.has('lanterns') ? 2 : 3;
  for (let i = 0; i < lanternCount; i++) {
    const lx = 478 + i * 44;
    const flick = 0.85 + Math.sin(t * 3 + i * 2) * 0.15;
    ctx.fillStyle = `rgba(255, 90, 80, ${flick})`;
    ellipse(ctx, lx, 210, 13, 17);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(lx - 4, 192, 8, 4);
    ctx.fillRect(lx - 4, 226, 8, 4);
  }
  // Signs.
  ctx.fillStyle = '#f8f0e3';
  roundRect(ctx, 78, 268, 94, 26, 5);
  roundRect(ctx, 278, 268, 94, 26, 5);
  roundRect(ctx, 478, 268, 94, 26, 5);
  ctx.fillStyle = '#20242e';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('BUAH', 125, 282);
  ctx.fillText('IKAN', 325, 282);
  ctx.fillText('LAMPION', 525, 282);
  // A cat on a crate by stall 3 (a difference).
  crate(ctx, 592, 316, 34);
  if (!d.has('cat')) {
    ctx.fillStyle = '#2b2b33';
    ellipse(ctx, 609, 306, 14, 11);
    circle(ctx, 600, 292, 8);
    poly(ctx, [[594, 286], [596, 276], [601, 285]]);
    poly(ctx, [[604, 285], [608, 276], [610, 286]]);
    ctx.strokeStyle = '#2b2b33';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(621, 310);
    ctx.quadraticCurveTo(632, 300, 628, 288);
    ctx.stroke();
  }
  // Bunting flags between the stalls.
  ctx.strokeStyle = '#20242e';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(210, 150);
  ctx.quadraticCurveTo(225, 168, 240, 150);
  ctx.stroke();
  ctx.fillStyle = '#ffd166';
  poly(ctx, [[218, 156], [228, 156], [223, 168]]);
  ctx.fillStyle = '#06d6a0';
  poly(ctx, [[228, 156], [238, 156], [233, 168]]);
}

// ---------------------------------------------------------------- scene 3: The Lighthouse

function drawLighthouse(ctx, d, t) {
  // Night sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#070d24');
  sky.addColorStop(1, '#16224d');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, SCENE_W, 300);
  // Stars (one of them is a difference).
  ctx.fillStyle = '#dfe6ff';
  for (const [sx, sy] of [[50, 40], [110, 90], [170, 36], [230, 70], [420, 44], [470, 96], [540, 40], [600, 80], [80, 140], [500, 150], [380, 120]]) {
    circle(ctx, sx, sy, 1.5);
  }
  if (!d.has('star')) fourStar(ctx, 90, 52, 9, '#fff6c9');
  fourStar(ctx, 590, 130, 7, '#fff6c9');
  // A gull.
  gull(ctx, 150, 88, 12);
  // Sea.
  const sea = ctx.createLinearGradient(0, 280, 0, SCENE_H);
  sea.addColorStop(0, '#12324f');
  sea.addColorStop(1, '#081a30');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 280, SCENE_W, 120);
  ctx.strokeStyle = 'rgba(160, 200, 235, 0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const wy = 300 + i * 24;
    ctx.beginPath();
    for (let x = 0; x <= SCENE_W; x += 16) {
      const yy = wy + Math.sin(x / 46 + t * 1.2 + i) * 3;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  // Rocks (one of them is a difference).
  ctx.fillStyle = '#232a3a';
  poly(ctx, [[40, 400], [60, 352], [110, 344], [150, 400]]);
  if (!d.has('rock')) poly(ctx, [[168, 400], [190, 366], [232, 360], [258, 400]]);
  poly(ctx, [[500, 400], [520, 362], [566, 356], [600, 400]]);
  // A little boat (a difference).
  if (!d.has('boat')) sailboat(ctx, 480, 306, 0.75, '#f4f1de', '#e07a5f');
  // Lighthouse tower.
  ctx.fillStyle = '#e8e2d4';
  poly(ctx, [[288, 330], [296, 78], [344, 78], [352, 330]]);
  // Stripes (the top band fades to white in the difference).
  ctx.fillStyle = d.has('stripe') ? '#e8e2d4' : '#c0392b';
  poly(ctx, [[292, 128], [295, 104], [345, 104], [348, 128]]);
  ctx.fillStyle = '#c0392b';
  poly(ctx, [[289, 208], [292, 184], [348, 184], [351, 208]]);
  ctx.fillStyle = '#c0392b';
  poly(ctx, [[287, 288], [289, 264], [351, 264], [353, 288]]);
  // Tower windows (the middle one goes dark in the difference).
  const winLit = (wy, lit) => {
    ctx.fillStyle = lit ? '#ffd166' : '#26314a';
    roundRect(ctx, 312, wy, 16, 22, 4);
    ctx.strokeStyle = '#3d2b1f';
    ctx.lineWidth = 2;
    ctx.strokeRect(312, wy, 16, 22);
  };
  winLit(120, true);
  winLit(180, !d.has('window'));
  winLit(240, true);
  // Door (its colour is a difference).
  ctx.fillStyle = d.has('door') ? '#2a9d8f' : '#7c2d12';
  ctx.beginPath();
  ctx.moveTo(306, 330);
  ctx.lineTo(306, 306);
  ctx.arc(320, 306, 14, Math.PI, 0);
  ctx.lineTo(334, 330);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd166';
  circle(ctx, 330, 318, 2.4);
  // Lamp room + gallery.
  ctx.fillStyle = '#2b2b33';
  ctx.fillRect(286, 66, 68, 12);
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(296, 34, 48, 32);
  ctx.fillStyle = '#2b2b33';
  poly(ctx, [[290, 34], [350, 34], [320, 14]]);
  // Rotating beam: it sweeps, and the difference swings it to the other
  // side — down-right on the left panel, up-left on the right one.
  const sweep = Math.sin(t * 0.45) * 0.12;
  const ang = d.has('beam') ? Math.PI - 0.55 - sweep : 0.55 + sweep;
  ctx.save();
  ctx.translate(320, 50);
  ctx.rotate(ang);
  const beam = ctx.createLinearGradient(0, 0, 260, 0);
  beam.addColorStop(0, 'rgba(255, 230, 150, 0.55)');
  beam.addColorStop(1, 'rgba(255, 230, 150, 0)');
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(260, -42);
  ctx.lineTo(260, 42);
  ctx.lineTo(0, 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // Fence along the rocks.
  ctx.strokeStyle = '#3d2b1f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(560, 360);
  ctx.lineTo(620, 352);
  ctx.stroke();
  for (const fx of [566, 590, 612]) {
    ctx.beginPath();
    ctx.moveTo(fx, 362);
    ctx.lineTo(fx, 340);
    ctx.stroke();
  }
}

// ---------------------------------------------------------------- catalogue

export const SCENES = [
  {
    id: 'sunset-pier',
    name: 'Sunset Pier',
    subtitle: 'Dermaga Senja — the harbour at golden hour',
    difficulty: 'Easy',
    draw: drawSunsetPier,
    diffs: [
      { id: 'gull', name: 'A gull vanishes', x: 330, y: 112, r: 26 },
      { id: 'flag', name: 'The pier flag changes colour', x: 620, y: 250, r: 26 },
      { id: 'sail', name: 'A sail loses its stripe', x: 152, y: 240, r: 30 },
      { id: 'lantern', name: 'The pier lantern goes dark', x: 540, y: 292, r: 26 },
      { id: 'crate', name: 'A crate disappears', x: 95, y: 228, r: 26 },
      { id: 'post', name: 'A pier post is missing', x: 380, y: 360, r: 28 },
      { id: 'fish', name: 'The jumping fish is gone', x: 450, y: 256, r: 26 },
    ],
  },
  {
    id: 'night-market',
    name: 'Night Market',
    subtitle: 'Pasar Malam — lanterns, fish and fruit after dark',
    difficulty: 'Medium',
    draw: drawNightMarket,
    diffs: [
      { id: 'moon', name: 'The moon turns crescent', x: 560, y: 70, r: 32 },
      { id: 'awning', name: 'A stall awning changes colour', x: 325, y: 160, r: 30 },
      { id: 'bulb', name: 'A string-light bulb goes out', x: 274, y: 88, r: 24 },
      { id: 'cat', name: 'The market cat slips away', x: 609, y: 300, r: 26 },
      { id: 'apples', name: 'An apple is missing', x: 125, y: 232, r: 28 },
      { id: 'lanterns', name: 'A hanging lantern is gone', x: 566, y: 210, r: 26 },
      { id: 'shirt', name: 'The vendor changes shirts', x: 325, y: 238, r: 26 },
    ],
  },
  {
    id: 'lighthouse',
    name: 'The Lighthouse',
    subtitle: 'Mercusuar — the light that guards the rocks',
    difficulty: 'Hard',
    draw: drawLighthouse,
    diffs: [
      { id: 'beam', name: 'The beam swings the other way', x: 110, y: 175, r: 40 },
      { id: 'stripe', name: 'A tower stripe fades', x: 320, y: 116, r: 28 },
      { id: 'window', name: 'A tower window goes dark', x: 320, y: 191, r: 24 },
      { id: 'star', name: 'A bright star blinks out', x: 90, y: 52, r: 24 },
      { id: 'boat', name: 'The little boat sails off', x: 480, y: 300, r: 30 },
      { id: 'rock', name: 'A rock sinks away', x: 214, y: 378, r: 28 },
      { id: 'door', name: 'The lighthouse door changes colour', x: 320, y: 312, r: 26 },
    ],
  },
];
