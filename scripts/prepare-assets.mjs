import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {galleryPhotos} from '../src/data/gallery.js';

const args=process.argv.slice(2);
const reduction=Number(args[args.indexOf('--reduction')+1]||80);
if(!Number.isFinite(reduction)||reduction<0||reduction>=100)throw new Error('Reduction must be between 0 and 99 percent');
const hash=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
const root=path.resolve('public'),out=path.resolve('s3-assets/files');
const originals=fs.readdirSync('bhagwati-assets').find(f=>!f.includes('sorted'));
if(!originals)throw new Error('Complete original photo collection not found');
const photoRoot=path.join('bhagwati-assets',originals,'bhagwati website');
// Compare against the complete originals once, never the duplicated sorted selection.
let originalBytes=galleryPhotos.reduce((total,p)=>total+fs.statSync(path.join(photoRoot,p.sourceFile)).size,0);
const files=fs.readdirSync(root,{recursive:true}).filter(f=>fs.statSync(path.join(root,f)).isFile()&&!path.basename(f).startsWith('.'));
const entries=[];
for(const relative of files){
 const source=path.join(root,relative);let buffer=fs.readFileSync(source);
 const ext=path.extname(relative).toLowerCase();const isPhoto=relative.split(path.sep).join('/').startsWith('images/gallery/');
 if(!isPhoto)originalBytes+=buffer.length;
 let extension=ext;
 if(['.jpg','.jpeg','.png'].includes(ext)){
  const image=await loadImage(buffer);const scale=Math.min(1,1920/Math.max(image.width,image.height));
  const canvas=createCanvas(Math.round(image.width*scale),Math.round(image.height*scale));
  canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
  buffer=canvas.toBuffer('image/webp',82);extension='.webp';
 }
 const type={'.webp':'image/webp','.svg':'image/svg+xml','.pdf':'application/pdf'}[extension];
 if(!type)throw new Error('Unsupported asset type: '+relative);
 entries.push({source:'/'+relative.split(path.sep).join('/'),extension,type,buffer});
}
const targetBytes=Math.floor(originalBytes*(1-reduction/100));
const total=()=>entries.reduce((sum,e)=>sum+e.buffer.length,0);
// Existing WebP derivatives usually already exceed the target. Recompress only if necessary.
for(const [limit,quality] of [[1600,72],[1280,62],[1024,52],[800,42]]){
 if(total()<=targetBytes)break;
 for(const entry of entries){
  if(entry.extension!=='.webp')continue;
  const image=await loadImage(entry.buffer);const scale=Math.min(1,limit/Math.max(image.width,image.height));
  const canvas=createCanvas(Math.round(image.width*scale),Math.round(image.height*scale));
  canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
  const compressed=canvas.toBuffer('image/webp',quality);
  if(compressed.length<entry.buffer.length)entry.buffer=compressed;
 }
}
fs.mkdirSync(out,{recursive:true});
const paths={},objects=[];
for(const entry of entries){
 const digest=hash(entry.buffer);
 const name=entry.source.slice(1).replace(/\.[^.]+$/,`.${digest.slice(0,16)}${entry.extension}`);
 const destination=path.join(out,name);fs.mkdirSync(path.dirname(destination),{recursive:true});
 if(!fs.existsSync(destination))fs.writeFileSync(destination,entry.buffer);
 paths[entry.source]=name;
 objects.push({key:name,bytes:entry.buffer.length,sha256:digest,contentType:entry.type,cacheControl:'public, max-age=31536000, immutable'});
}
const outputBytes=total();
const report={requestedReductionPercent:reduction,actualReductionPercent:Number((100*(1-outputBytes/originalBytes)).toFixed(2)),originalBytes,outputBytes,targetBytes,targetMet:outputBytes<=targetBytes,assetCount:objects.length,notes:['Compared with original gallery photographs, counted once, plus other deployed assets.','Gallery includes both viewing images and thumbnails.','PDF preserved byte-for-byte. SVG retained as vector. Unused MP4 videos are excluded.']};
fs.writeFileSync('src/data/assetPaths.json',JSON.stringify(paths,null,2)+'\n');
fs.writeFileSync('s3-assets/manifest.json',JSON.stringify({report,objects},null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(!report.targetMet){console.error('Target cannot be met at the supported quality limits. Upload is disabled; inspect the report.');process.exitCode=1;}
