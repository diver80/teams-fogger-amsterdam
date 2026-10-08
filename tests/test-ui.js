const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');
const readme = fs.readFileSync('README.md', 'utf8');

if (!html.includes('id="tequilaBtn"')) {
    console.error('FAIL: tequilaBtn missing from HTML');
    process.exit(1);
}

if (!html.includes('id="tequilaModalToggle"')) {
    console.error('FAIL: tequilaModalToggle missing from HTML');
    process.exit(1);
}

if (!html.includes('Tequila Shot')) {
    console.error('FAIL: Tequila Shot missing from legend');
    process.exit(1);
}

if (!css.includes('.tequila-btn')) {
    console.error('FAIL: .tequila-btn missing from CSS');
    process.exit(1);
}

if (!readme.includes('Tequila Mode')) {
    console.error('FAIL: Tequila Mode missing from README.md');
    process.exit(1);
}

console.log('PASS: UI elements and docs verified');
