import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const gameFile = path.join(repoRoot, 'client/src/components/Game.tsx');
const iconMapFile = path.join(repoRoot, 'client/src/game/itemIconMap.ts');
const publicRoot = path.join(repoRoot, 'client/public');

const idPattern = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

const gameSource = fs.readFileSync(gameFile, 'utf8');
const itemsBlock = gameSource.match(/const ITEMS_DB = \[(.*?)\n\];/s);
if (!itemsBlock) {
  throw new Error('Could not find ITEMS_DB block in client/src/components/Game.tsx');
}

const itemIds = [...itemsBlock[1].matchAll(/\bid:\s*'([a-z0-9_]+)'/g)].map((m) => m[1]);
const uniqueItemIds = [...new Set(itemIds)];

const mapSource = fs.readFileSync(iconMapFile, 'utf8');
const mapEntries = [...mapSource.matchAll(/^\s*([a-z0-9_]+):\s*\{\s*src:\s*"([^"]+)"\s*,\s*baseSize:\s*(16|32)\s*\}/gm)]
  .map((m) => ({ id: m[1], src: m[2], baseSize: Number(m[3]) }));

const mapIds = mapEntries.map((entry) => entry.id);
const errors = [];

for (const itemId of uniqueItemIds) {
  if (!mapIds.includes(itemId)) {
    errors.push(`Missing icon map key for item id: ${itemId}`);
  }
}

for (const mapId of mapIds) {
  if (!uniqueItemIds.includes(mapId)) {
    errors.push(`Icon map has unknown key not in ITEMS_DB: ${mapId}`);
  }
}

for (const entry of mapEntries) {
  if (!idPattern.test(entry.id)) {
    errors.push(`Invalid item icon key format (snake_case required): ${entry.id}`);
  }

  const fileName = path.basename(entry.src, path.extname(entry.src));
  if (fileName !== entry.id) {
    errors.push(`File name must match item id. id=${entry.id}, file=${path.basename(entry.src)}`);
  }

  const absoluteAssetPath = path.join(publicRoot, entry.src.replace(/^\//, ''));
  if (!fs.existsSync(absoluteAssetPath)) {
    errors.push(`Missing sprite file: ${entry.src}`);
  }
}

if (errors.length > 0) {
  console.error('Asset metadata validation failed:\n');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Asset metadata validation passed. Checked ${uniqueItemIds.length} ITEMS_DB ids.`);
