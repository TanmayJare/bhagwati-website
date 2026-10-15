import fs from 'node:fs';
// A vector frame crops the original cover without altering or regenerating its artwork.
const source=fs.readFileSync('public/images/annual-report-cover.png').toString('base64');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><title>श्री भगवती देवी</title><circle cx="200" cy="200" r="198" fill="#fff" stroke="#651e25" stroke-width="3"/><svg x="38" y="8" width="324" height="384" viewBox="45 168 310 380" preserveAspectRatio="xMidYMid meet" overflow="hidden"><image width="396" height="634" href="data:image/png;base64,${source}"/></svg></svg>`;
fs.writeFileSync('public/images/bhagavati-logo.svg',svg);
console.log('Created navbar logo and favicon from the original cover artwork.');
