// main.js — bootstrap for Night Harbour. Finds the two panel canvases and
// the HUD, starts the game, and exposes a small debug hook the maker's
// play-test uses to click real differences at real coordinates.

import { createGame } from './game.js';

const game = createGame(document);

// window.__spotGame: the play-test and screenshot script drive the game
// through this (real clicks on real differences, never a staged state).
window.__spotGame = game;
