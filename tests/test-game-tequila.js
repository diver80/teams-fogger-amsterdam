const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');

// Check that tequilaModeEnabled and tequilaRushTimer exist in code
if (!content.includes('tequilaModeEnabled') || !content.includes('tequilaRushTimer')) {
    console.error('FAIL: Tequila state variables missing');
    process.exit(1);
}

// Check that isTequilaActive exists
if (!content.includes('isTequilaActive')) {
    console.error('FAIL: isTequilaActive logic missing');
    process.exit(1);
}

// Check that tequila collectible handling exists
if (!content.includes("'tequila'")) {
    console.error('FAIL: tequila collectible type missing');
    process.exit(1);
}

// Check that playTequilaFanfare is called
if (!content.includes('playTequilaFanfare')) {
    console.error('FAIL: playTequilaFanfare call missing');
    process.exit(1);
}

console.log('PASS: Game engine has tequila logic checks');
