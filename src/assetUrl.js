import paths from './data/assetPaths.json';
const base=(import.meta.env.VITE_ASSET_BASE_URL||'').replace(/\/$/,'');
export function assetUrl(path){
 if(!path||!base||!paths[path])return path;
 return `${base}/${paths[path]}`;
}
// Shared display source for preloading and rendering: never fetch full-size images for small tiles.
export function displayPhotoUrl(photo){return assetUrl(photo.thumbnailSrc||photo.src)}
