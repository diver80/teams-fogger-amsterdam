const fs = require('fs');
const code = fs.readFileSync('js/sprites.js', 'utf8');
const vm = require('vm');
const ctx = { window: {}, Math };
vm.createContext(ctx);
vm.runInContext(code, ctx);

const renderer = new ctx.window.SpriteRenderer();

// 1. Verify drawCollectible handles 'tequila'
let fillRectCalled = false;
const mockCtx = {
    save: () => {}, restore: () => {}, translate: () => {}, scale: () => {},
    rotate: () => {}, beginPath: () => {}, arc: () => {}, fill: () => {},
    stroke: () => {}, fillRect: () => { fillRectCalled = true; }, strokeRect: () => {},
    moveTo: () => {}, lineTo: () => {}, quadraticCurveTo: () => {},
    setLineDash: () => {}, closePath: () => {}, ellipse: () => {}
};

renderer.drawCollectible(mockCtx, { type: 'tequila', x: 10, y: 10 });
if (!fillRectCalled) {
    console.error('FAIL: tequila collectible did not draw');
    process.exit(1);
}

// 2. Verify drawConsultant executes and applies drunk sway when isTequilaActive is true
let rotatedAngle = 0;
mockCtx.rotate = (rad) => { rotatedAngle = rad; };
renderer.animTime = 0.5;
renderer.drawConsultant(mockCtx, 0, 0, 38, 38, 'agile_coach', 'up', false, 0, false, false, false, true);

if (rotatedAngle === 0) {
    console.error('FAIL: drawConsultant did not apply drunk sway rotation when isTequilaActive is true');
    process.exit(1);
}

console.log('PASS: tequila sprite and consultant methods verified');
