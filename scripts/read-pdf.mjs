import fs from 'node:fs';
import { createCanvas, DOMMatrix, ImageData, Path2D } from '@napi-rs/canvas';
Object.assign(globalThis, { DOMMatrix, ImageData, Path2D });
const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
const doc = await getDocument({data: new Uint8Array(fs.readFileSync('public/documents/annual-report-2025-26.pdf')),useSystemFonts:true}).promise;
let text = '';
for(let i=1;i<=doc.numPages;i++) {
 const page=await doc.getPage(i); const content=await page.getTextContent();
 text += `\nPAGE ${i}\n` + content.items.map(x=>x.str).join(' ');
 const viewport=page.getViewport({scale:1.8});const canvas=createCanvas(viewport.width,viewport.height);
 await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
 fs.writeFileSync(`verification/booklet-page-${i}.png`,canvas.toBuffer('image/png'));
}
fs.writeFileSync('verification/booklet-text.txt',text);console.log(`${doc.numPages} pages rendered`);
