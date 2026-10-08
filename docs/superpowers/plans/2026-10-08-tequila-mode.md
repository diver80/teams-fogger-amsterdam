# Tequila Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Tequila Mode in Amsterdam Fogger featuring horizontal control inversion (Left ↔ Right), drunken wobble animations, a procedural Web Audio mariachi trumpet fanfare, Tequila Shot pickups (`🥃`), a 1.25x score multiplier, and HUD/modal toggles.

**Architecture:** Extend the existing modular HTML5 Canvas/Web Audio engine: `SoundEngine` in `js/audio.js` synthesizes the mariachi fanfare; `SpriteRenderer` in `js/sprites.js` renders the shot glass collectible and applies drunk sway transform; `Game` in `js/game.js` manages inverted input dispatch, rush timers, score calculations, and collectible state; `index.html` and `style.css` provide the HUD controls.

**Tech Stack:** Vanilla JavaScript (ES6+), HTML5 Canvas 2D, Web Audio API, CSS3. Zero external dependencies.

## Global Constraints
- Zero external assets or libraries (all graphics and sounds are 100% procedurally synthesized in Canvas and Web Audio).
- Vertical movement (Up / Down) MUST remain standard; only horizontal (Left ↔ Right) controls are inverted.
- Support Desktop (<kbd>←</kbd> / <kbd>→</kbd> / <kbd>A</kbd> / <kbd>D</kbd>), Mobile D-Pad buttons, and swipe gestures.
- High score and Tequila Mode toggle state persist across browser sessions in `localStorage`.

---

### Task 1: Synthesize Procedural Mariachi Fanfare in Audio Engine

**Files:**
- Modify: `js/audio.js:370-375`
- Test: `tests/test-audio.js` (or node verification script)

**Interfaces:**
- Produces: `SoundEngine.prototype.playTequilaFanfare()`

- [ ] **Step 1: Write verification test for SoundEngine fanfare method**

Create `tests/test-audio.js`:
```javascript
const fs = require('fs');
const code = fs.readFileSync('js/audio.js', 'utf8');
const vm = require('vm');
const ctx = { window: {}, setInterval, clearInterval };
vm.createContext(ctx);
vm.runInContext(code, ctx);

if (typeof ctx.window.soundEngine.playTequilaFanfare !== 'function') {
    console.error('FAIL: playTequilaFanfare is not defined on soundEngine');
    process.exit(1);
}
console.log('PASS: playTequilaFanfare defined');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test-audio.js`
Expected: FAIL with "playTequilaFanfare is not defined on soundEngine"

- [ ] **Step 3: Implement `playTequilaFanfare()` in `js/audio.js`**

Add method to `SoundEngine`:
```javascript
    playTequilaFanfare() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        // Lively Mexican / Mariachi two-part brass trumpet motif
        const now = this.ctx.currentTime;
        const notes = [
            { f: 587.33, t: 0, d: 0.12 },     // D5
            { f: 739.99, t: 0.10, d: 0.12 },  // F#5
            { f: 880.00, t: 0.20, d: 0.14 },  // A5
            { f: 1174.66, t: 0.32, d: 0.28 }  // D6 (high flourish)
        ];

        notes.forEach(n => {
            const osc = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + n.t;

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(n.f, t);

            // Rich brass overtone
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(n.f * 2, t);

            gain.gain.setValueAtTime(this.masterVolume * 0.45, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

            osc.connect(gain);
            osc2.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc2.start(t);
            osc.stop(t + n.d + 0.05);
            osc2.stop(t + n.d + 0.05);
        });
    }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test-audio.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/audio.js tests/test-audio.js
git commit -m "feat(audio): add procedural mariachi trumpet fanfare"
```

---

### Task 2: Procedural Tequila Shot Sprite & Drunk Wobble Animation

**Files:**
- Modify: `js/sprites.js:320-360` (consultant drunk sway)
- Modify: `js/sprites.js:930-995` (tequila collectible rendering)
- Test: `tests/test-sprites.js`

**Interfaces:**
- Consumes: `isTequilaActive` boolean parameter in `drawConsultant`
- Produces: `SpriteRenderer.prototype.drawCollectible` rendering for `item.type === 'tequila'`

- [ ] **Step 1: Write verification test for sprite rendering updates**

Create `tests/test-sprites.js`:
```javascript
const fs = require('fs');
const code = fs.readFileSync('js/sprites.js', 'utf8');
const vm = require('vm');
const ctx = { window: {}, Math };
vm.createContext(ctx);
vm.runInContext(code, ctx);

const renderer = new ctx.window.SpriteRenderer();
// Verify drawCollectible handles 'tequila'
let fillRectCalled = false;
const mockCtx = {
    save: () => {}, restore: () => {}, translate: () => {}, scale: () => {},
    rotate: () => {}, beginPath: () => {}, arc: () => {}, fill: () => {},
    stroke: () => {}, fillRect: () => { fillRectCalled = true; }, strokeRect: () => {},
    moveTo: () => {}, lineTo: () => {}, quadraticCurveTo: () => {},
    setLineDash: () => {}
};

renderer.drawCollectible(mockCtx, { type: 'tequila', x: 10, y: 10 });
if (!fillRectCalled) {
    console.error('FAIL: tequila collectible did not draw');
    process.exit(1);
}
console.log('PASS: tequila collectible renders');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test-sprites.js`
Expected: FAIL

- [ ] **Step 3: Implement Tequila sprite and drunk wobble in `js/sprites.js`**

1. Update `drawConsultant` signature to accept `isTequilaActive`:
```javascript
drawConsultant(ctx, x, y, width, height, characterType, facing, isHopping, hopProgress, hasShield, hasCoffeeBoost, isInvulnerable = false, isTequilaActive = false)
```
2. When `isTequilaActive` is true, apply angular drunk sway:
```javascript
        if (isTequilaActive) {
            const drunkSway = Math.sin(this.animTime * 9) * 0.22;
            ctx.rotate(drunkSway);
        }
```
3. In `drawCollectible(ctx, item)`:
```javascript
        } else if (item.type === 'tequila') {
            // Golden Agave Tequila Shot Glass
            // Glass base
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.fillRect(8, 7, 8, 14);
            // Golden Tequila liquid
            ctx.fillStyle = '#eab308';
            ctx.fillRect(9, 10, 6, 10);
            // White salt rim
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(7, 6, 10, 1.5);
            // Lime wedge on rim
            ctx.fillStyle = '#84cc16';
            ctx.beginPath();
            ctx.arc(6, 6, 5, -Math.PI * 0.6, Math.PI * 0.3);
            ctx.fill();
            ctx.strokeStyle = '#4d7c0f';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test-sprites.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/sprites.js tests/test-sprites.js
git commit -m "feat(sprites): add tequila shot collectible and drunk wobble"
```

---

### Task 3: Game Engine Tequila State, Control Inversion & Pickups

**Files:**
- Modify: `js/game.js`
- Test: `tests/test-game-tequila.js`

**Interfaces:**
- Consumes: `SoundEngine.prototype.playTequilaFanfare()`
- Produces: `Game.prototype.toggleTequilaMode()`, inverted `movePlayer()`, tequila rush timer in `update()`, score multiplier logic

- [ ] **Step 1: Write test for control inversion logic and state**

Create `tests/test-game-tequila.js`:
```javascript
const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');

// Check that tequilaModeEnabled and tequilaRushTimer exist in code
if (!content.includes('tequilaModeEnabled') || !content.includes('tequilaRushTimer')) {
    console.error('FAIL: Tequila state variables missing');
    process.exit(1);
}
// Check that movePlayer inverts left and right when tequila active
if (!content.includes('isTequilaActive')) {
    console.error('FAIL: isTequilaActive logic missing');
    process.exit(1);
}
console.log('PASS: Game engine has tequila logic checks');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test-game-tequila.js`
Expected: FAIL

- [ ] **Step 3: Implement Tequila state and mechanics in `js/game.js`**

1. In `Game` constructor:
   - `this.tequilaModeEnabled = localStorage.getItem('ams_fogger_tequila') === 'true';`
   - In `this.player`: add `tequilaRushTimer: 0`.
2. In `movePlayer(dx, dy, dir)`:
   - Check `const isTequilaActive = this.tequilaModeEnabled || (this.player.tequilaRushTimer > 0);`
   - If `isTequilaActive`:
     - If `dx === -1` -> `dx = 1; dir = 'right';`
     - Else if `dx === 1` -> `dx = -1; dir = 'left';`
3. In `spawnCollectible()`:
   - Add `'tequila'` to collectible types: `['stroopwafel', 'coffee', 'swagsocks', 'headphones', 'tequila']`.
4. In collectible collision check:
   - When `item.type === 'tequila'`:
     - `this.player.tequilaRushTimer = 7.0;`
     - `this.addScore(300);`
     - `sounds.playTequilaFanfare();`
     - `this.addFloatingText('+300 🥃 TEQUILA RUSH! (CONTROLS REVERSED!)', item.x - 50, item.y - 12, '#f59e0b');`
5. In `addScore(points)`:
   - When `this.tequilaModeEnabled || this.player.tequilaRushTimer > 0`:
     - Apply additional `1.25` multiplier.
6. In `update(dt)`:
   - Decrement `this.player.tequilaRushTimer -= dt;`
   - If `isTequilaActive && Math.random() < 0.25`: spawn dizzy particle (`🍋` or yellow bubble).
7. In `render()`:
   - Pass `isTequilaActive` to `sprites.drawConsultant`.
   - In `renderCanvasHUD()`: if `this.player.tequilaRushTimer > 0`, render `🥃 TEQUILA RUSH: Xs` banner. If `this.tequilaModeEnabled`, render `🌵 TEQUILA MODE (1.25x)`.
8. Add `toggleTequilaMode()` method to toggle `this.tequilaModeEnabled`, update `localStorage`, and refresh UI button.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test-game-tequila.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/game.js tests/test-game-tequila.js
git commit -m "feat(game): implement tequila mode inverted controls and pickups"
```

---

### Task 4: UI Controls, HUD Button & Guide Documentation

**Files:**
- Modify: `index.html`
- Modify: `style.css`
- Modify: `README.md`
- Test: Syntax and DOM verification

- [ ] **Step 1: Write DOM structure verification test**

Create `tests/test-ui.js`:
```javascript
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

if (!html.includes('id="tequilaBtn"')) {
    console.error('FAIL: tequilaBtn missing from HTML');
    process.exit(1);
}
if (!html.includes('Tequila Shot')) {
    console.error('FAIL: Tequila Shot missing from legend');
    process.exit(1);
}
console.log('PASS: UI elements present in index.html');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test-ui.js`
Expected: FAIL

- [ ] **Step 3: Update `index.html`, `style.css`, and `README.md`**

1. In `index.html`:
   - Add `<button id="tequilaBtn" class="btn-small tequila-btn" aria-label="Toggle Tequila Mode">🌵 Tequila: OFF</button>` in `.hud-controls`.
   - Add Start Modal checkbox: `<label class="tequila-modal-toggle"><input type="checkbox" id="tequilaModalToggle"> 🌵 Tequila Mode (Reversed Left/Right + 1.25x Score)</label>`.
   - Add `🥃 Tequila Shot` to `.lane-legend`.
2. In `style.css`:
   - Add styles for `.tequila-btn.active` (amber border, gold text `#f59e0b`, fiesta glow).
   - Add styles for `.tequila-modal-toggle`.
3. In `js/game.js`:
   - Bind click on `#tequilaBtn` and change event on `#tequilaModalToggle` to call `this.toggleTequilaMode()`.
4. In `README.md`:
   - Document Tequila Mode controls and the `🥃` Tequila Shot pickup.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test-ui.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add index.html style.css js/game.js README.md tests/test-ui.js
git commit -m "feat(ui): add tequila mode toggle button, styling and documentation"
```

---

### Task 5: End-to-End Verification, Deployment & GitHub Pages Verification

**Files:**
- Repository: all files
- Git & GitHub Pages

- [ ] **Step 1: Run all test verification scripts**

```bash
node tests/test-audio.js
node tests/test-sprites.js
node tests/test-game-tequila.js
node tests/test-ui.js
```
Expected: All PASS.

- [ ] **Step 2: Verify git working directory is clean**

```bash
git status
```
Expected: Clean working tree.

- [ ] **Step 3: Push to GitHub origin main**

```bash
git push origin main
```
Expected: Commits pushed successfully.

- [ ] **Step 4: Monitor GitHub Actions deployment run**

```bash
gh run list --limit 1
```
Expected: Deployment workflow triggers and finishes with status `✓`.

- [ ] **Step 5: Verify live GitHub Pages URL with curl**

```bash
curl -s -I https://diver80.github.io/teams-fogger-amsterdam/
```
Expected: `HTTP/2 200 OK`.
