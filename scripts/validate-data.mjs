import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadEnv} from 'vite';
import {galleryPhotos} from '../src/data/gallery.js';
import {selectedHomepagePhotoIds,homepagePhotoConfig} from '../src/data/selectedPhotos.js';
import {publications} from '../src/data/publications.js';
import {committee} from '../src/data/committee.js';
const remoteBase=loadEnv('production',process.cwd()).VITE_ASSET_BASE_URL;
const remotePaths=JSON.parse(fs.readFileSync('src/data/assetPaths.json','utf8'));
const available=src=>fs.existsSync('public'+src)||(remoteBase?.startsWith('https://')&&Boolean(remotePaths[src]));
const ids=new Set();
for(const p of galleryPhotos){assert(!ids.has(p.id),'Duplicate photo ID: '+p.id);ids.add(p.id);assert(Number.isInteger(p.year)&&p.year>=2007);assert(p.src.startsWith(`/images/gallery/${p.year}/`),'Photo must live in its year folder');assert(available(p.src),'Missing local image or remote mapping: '+p.src);assert(p.title?.en&&p.title?.mr,'Bilingual photo title required');}
for(const p of galleryPhotos)if(p.thumbnailSrc)assert(available(p.thumbnailSrc),'Missing local thumbnail or remote mapping: '+p.thumbnailSrc);
for(const id of selectedHomepagePhotoIds)assert(ids.has(id),'Homepage selection missing from master gallery: '+id);
assert.equal(new Set(selectedHomepagePhotoIds).size,selectedHomepagePhotoIds.length,'Duplicate selection');
assert(['carousel','grid','collage'].includes(homepagePhotoConfig.mode));assert(homepagePhotoConfig.interval>=1000);
for(const p of publications){assert(fs.existsSync('public'+p.cover));assert(fs.existsSync('public'+p.pdf));}
const en=JSON.parse(fs.readFileSync('src/locales/en.json'));const mr=JSON.parse(fs.readFileSync('src/locales/mr.json'));assert.deepEqual(Object.keys(en).sort(),Object.keys(mr).sort(),'Locale keys must match');assert.equal(committee.length,15);
console.log(`Validated ${galleryPhotos.length} supplied photos, ${selectedHomepagePhotoIds.length} selections, ${publications.length} publication, ${committee.length} committee members and both locales.`);
