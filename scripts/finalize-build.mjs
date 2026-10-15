import fs from 'node:fs';
import path from 'node:path';
import {loadEnv} from 'vite';
import {galleryPhotos} from '../src/data/gallery.js';
const base=loadEnv('production',process.cwd()).VITE_ASSET_BASE_URL||'';
if(base){
 const url=new URL(base);if(url.protocol!=='https:')throw new Error('Remote asset delivery must use HTTPS');
 const mapping=JSON.parse(fs.readFileSync('src/data/assetPaths.json','utf8'));
 for(const photo of galleryPhotos)for(const key of [photo.src,photo.thumbnailSrc])if(!mapping[key])throw new Error('Missing remote asset mapping: '+key);
 // Only delete the generated copy of the gallery, never public/ or the originals.
 const output=path.resolve('dist');const target=path.resolve(output,'images','gallery');
 if(output!==path.resolve(process.cwd(),'dist')||!target.startsWith(output+path.sep)||target!==path.join(output,'images','gallery'))throw new Error('Unexpected generated gallery path');
 fs.rmSync(target,{recursive:true,force:true});
 console.log('Production gallery uses CloudFront; duplicate gallery files excluded from dist.');
}
let bytes=0,count=0;
for(const file of fs.readdirSync('dist',{recursive:true})){const s=fs.statSync(path.join('dist',file));if(s.isFile()){bytes+=s.size;count++;}}
console.log(`Static deployment: ${count} files, ${(bytes/1e6).toFixed(2)} MB.`);
