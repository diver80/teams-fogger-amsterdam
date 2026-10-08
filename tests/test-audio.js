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
