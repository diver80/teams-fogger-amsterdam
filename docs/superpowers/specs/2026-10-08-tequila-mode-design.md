# Tequila Mode Design Specification

## Overview
A hilarious, arcade-style "Tequila Mode" for **Amsterdam Fogger: Team '26 Edition**. When Tequila Mode is active, horizontal controls (Left ↔ Right) are reversed, the consultant sways with a drunken wobble animation, dizzy citrus/bubble particles trail overhead, and an optional 1.25x score multiplier is awarded. Additionally, Tequila Shot pickups (`🥃`) spawn on the road for temporary 7-second chaotic bursts with a synthesized Web Audio mariachi trumpet fanfare.

---

## 1. Core Mechanics & State Machine

### 1.1 State Variables
- `tequilaModeEnabled: boolean` (persisted in `localStorage` under `'ams_fogger_tequila'`):
  - Global toggle available in HUD top bar and Start Modal.
  - When enabled, player has persistent inverted horizontal controls throughout every run and stage.
  - Grants a persistent `1.25x` score multiplier (`scoreMultiplier = baseMultiplier * 1.25`).
- `player.tequilaRushTimer: number`:
  - Countdown timer (seconds) activated when collecting a Tequila Shot pickup (`🥃`).
  - Set to `7.0` seconds upon pickup. If another shot is collected while active, timer resets to `7.0` seconds.
- `isTequilaActive: boolean`:
  - Computed property: `this.tequilaModeEnabled || (this.player.tequilaRushTimer > 0)`.

### 1.2 Input Inversion (`movePlayer`)
When `isTequilaActive` is true:
- An input intended to move Left (`dx = -1`, `dir = 'left'`, triggered by <kbd>←</kbd>, <kbd>A</kbd>, on-screen Left D-Pad, or Swipe Left) is inverted to:
  - `dx = 1`, `dir = 'right'`.
- An input intended to move Right (`dx = 1`, `dir = 'right'`, triggered by <kbd>→</kbd>, <kbd>D</kbd>, on-screen Right D-Pad, or Swipe Right) is inverted to:
  - `dx = -1`, `dir = 'left'`.
- Vertical inputs (`dy = -1` for Up, `dy = 1` for Down) remain unchanged so forward progress and gate aiming remain natural and playable.

### 1.3 Collectible Integration
- Added `'tequila'` to the collectible pool in `spawnCollectible()`:
  - Value: `+300` bonus points.
  - Activates `player.tequilaRushTimer = 7.0`.
  - Floating text: `+300 🥃 TEQUILA SHOT! (INVERTED CONTROLS!)` with amber color (`#f59e0b`).
  - Triggers procedural `playTequilaFanfare()` sound.

---

## 2. Visuals & Procedural Audio

### 2.1 Character Drunk Wobble
- In `drawConsultant`:
  - When `isTequilaActive` is true, an oscillating angular tilt is applied:
    `const drunkSway = Math.sin(this.animTime * 9) * 0.22;` (approx `±12.6°` sway).
  - Applied to the player canvas transform context, making hops stumble humorously.
- Dizzy particle emission:
  - While `isTequilaActive` is true, small golden/lime star and bubble particles (`🍋 / ⭐ / 🫧`) spawn occasionally above the consultant's head.

### 2.2 Shot Glass Collectible Rendering
- In `drawCollectible` when `item.type === 'tequila'`:
  - Heavy flared shot glass rendered procedurally with glass base and amber agave tequila liquid (`#eab308`).
  - Fresh green lime wedge (`#84cc16`) clipped onto the glass rim.
  - Subtle white salt rim line along the glass top.
  - Pulsing golden ambient glow ring.

### 2.3 Procedural Mariachi Fanfare Synthesis
- In `SoundEngine` (`js/audio.js`):
  - `playTequilaFanfare()`: A lively, brassy Mexican/mariachi trumpet motif synthesized via Web Audio API.
  - Uses dual square/sawtooth oscillators with bandpass filtering and quick vibrato to emulate trumpet brass timbre.
  - 100% procedural with zero external audio assets.

---

## 3. UI & Controls Integration

### 3.1 HUD Toggle Button
- Add `#tequilaBtn` in the HUD control group next to `#muteBtn`:
  - Displays `🌵 Tequila: OFF` / `🌵 Tequila: ON (1.25x)`.
  - Visual styling with amber border (`#f59e0b`) when enabled.
- Add toggle option in `#startModal`:
  - Checkbox: `🌵 Tequila Mode (Reversed Left/Right + 1.25x Score)`.

### 3.2 Canvas HUD Overlay
- If `player.tequilaRushTimer > 0`:
  - Draw an amber countdown bar and badge `🥃 TEQUILA RUSH: Xs` in canvas HUD.
- If `tequilaModeEnabled`:
  - Draw `🌵 TEQUILA MODE (1.25x)` badge in the top bar.

### 3.3 Legend & Documentation
- Update game guide legend in `index.html` and `README.md` to document the new `🥃` Tequila Shot and optional Tequila Mode.
