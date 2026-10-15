import fs from 'node:fs';
import {loadEnv} from 'vite';
const map=JSON.parse(fs.readFileSync('src/data/assetPaths.json','utf8'));
const base=(loadEnv('development',process.cwd()).VITE_ASSET_BASE_URL||'').replace(/\/$/,'');
export const delivered=source=>base&&map[source]?`${base}/${map[source]}`:source;
