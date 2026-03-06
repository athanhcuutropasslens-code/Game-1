import consumableAtlas from '@/assets/pixel/consumable-atlas.svg';
import weaponAtlas from '@/assets/pixel/weapon-atlas.svg';
import armorAtlas from '@/assets/pixel/armor-atlas.svg';
import accessoryAtlas from '@/assets/pixel/accessory-atlas.svg';
import effectAtlas from '@/assets/pixel/effect-atlas.svg';
import { EFFECT_PIXEL_ICON_MAP, ITEM_PIXEL_ICON_MAP } from '@/lib/gameConstants';

export type PixelAtlasName = 'consumable' | 'weapon' | 'armor' | 'accessory' | 'effect';

export type PixelIconEntry = {
  atlas: PixelAtlasName;
  tile: number;
};

const TILE_SIZE = 16;

const PIXEL_ATLASES: Record<PixelAtlasName, string> = {
  consumable: consumableAtlas,
  weapon: weaponAtlas,
  armor: armorAtlas,
  accessory: accessoryAtlas,
  effect: effectAtlas,
};

const ITEM_ICON_MAP: Record<string, PixelIconEntry> = ITEM_PIXEL_ICON_MAP;
const EFFECT_ICON_MAP: Record<string, PixelIconEntry> = EFFECT_PIXEL_ICON_MAP;

export const getPixelIconData = (
  id?: string | null,
  kind: 'item' | 'effect' = 'item',
): (PixelIconEntry & { atlasUrl: string; tileSize: number }) | null => {
  if (!id) return null;

  const sourceMap = kind === 'effect' ? EFFECT_ICON_MAP : ITEM_ICON_MAP;
  const iconEntry = sourceMap[id];
  if (!iconEntry) return null;

  return {
    atlas: iconEntry.atlas,
    tile: iconEntry.tile,
    atlasUrl: PIXEL_ATLASES[iconEntry.atlas],
    tileSize: TILE_SIZE,
  };
};
