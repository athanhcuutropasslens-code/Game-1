import type { GameItem, PlayerEquipment, PlayerStats } from "@/lib/gameTypes";

const SELL_PRICE_MULTIPLIER = 0.45;
const MAX_RARITY = 5;
const ITEM_LEVEL_SCALE = 0.12;

export const calculateItemCost = (item: GameItem): number => {
  const level = item.level || 1;
  return Math.floor(item.baseCost * Math.pow(level, 1.25));
};

export const getMergedItemStats = (item: GameItem): Partial<PlayerStats> => {
  if (item.type === "CONSUMABLE" || !item.baseStats) return {};

  const level = item.level || 1;
  const statScale = 1 + ITEM_LEVEL_SCALE * (level - 1);
  const affixScale = 1 + ITEM_LEVEL_SCALE * (level - 1);
  const stats: Partial<PlayerStats> = {};

  Object.entries(item.baseStats).forEach(([key, value]) => {
    if (typeof value === "number") {
      stats[key as keyof PlayerStats] = Math.floor(value * statScale);
    }
  });

  item.affixes?.forEach((affix) => {
    if (!affix?.stat || typeof affix.val !== "number") return;
    const statKey = affix.stat as keyof PlayerStats;
    const nextValue = Math.floor(affix.val * affixScale);
    stats[statKey] = (stats[statKey] || 0) + nextValue;
  });

  return stats;
};

export const updateItemDerivedData = (item: GameItem): GameItem => {
  const nextItem: GameItem = {
    ...item,
    stats: getMergedItemStats(item),
  };

  nextItem.cost = calculateItemCost(nextItem);
  nextItem.sellPrice = Math.floor(nextItem.cost * SELL_PRICE_MULTIPLIER);

  return nextItem;
};

export const isConsumableMergeCandidate = (
  source: GameItem,
  candidate: GameItem | null | undefined,
) => {
  if (!candidate) return false;
  return (
    source.type === "CONSUMABLE" &&
    candidate.id === source.id &&
    candidate.rarity === source.rarity
  );
};

export const isEquipmentMergeCandidate = (
  source: GameItem,
  candidate: GameItem | null | undefined,
) => {
  if (!candidate) return false;
  if (source.type === "CONSUMABLE" || candidate.type === "CONSUMABLE")
    return false;
  return candidate.id === source.id && candidate.level === source.level;
};

export const isValidMergeCandidate = (
  source: GameItem,
  candidate: GameItem | null | undefined,
) => {
  if (!candidate || candidate.uid === source.uid) return false;
  return source.type === "CONSUMABLE"
    ? isConsumableMergeCandidate(source, candidate)
    : isEquipmentMergeCandidate(source, candidate);
};

export const getMergeableItems = (
  source: GameItem,
  inventory: GameItem[],
  equipment: PlayerEquipment,
) => {
  const equippedItems = Object.values(equipment).filter(Boolean) as GameItem[];
  return [...inventory, ...equippedItems].filter((candidate) =>
    isValidMergeCandidate(source, candidate),
  );
};

export const findMergeTarget = (
  source: GameItem,
  inventory: GameItem[],
  equipment: PlayerEquipment,
) => {
  const inventoryMatch = inventory.find((candidate) =>
    isValidMergeCandidate(source, candidate),
  );
  if (inventoryMatch) return inventoryMatch;

  return (Object.values(equipment).find((candidate) =>
    isValidMergeCandidate(source, candidate || undefined),
  ) || null) as GameItem | null;
};

const mergeUniqueAffixes = (first: GameItem, second: GameItem) => {
  return Array.from(
    new Map(
      [...(first.affixes || []), ...(second.affixes || [])].map((affix) => [
        affix.id,
        affix,
      ]),
    ).values(),
  );
};

export const mergeItems = (
  source: GameItem,
  target: GameItem,
  createUid: () => string,
): GameItem => {
  const merged: GameItem = {
    ...source,
    uid: createUid(),
  };

  if (source.type === "CONSUMABLE") {
    merged.level = Math.max(source.level || 1, target.level || 1) + 1;
    merged.rarity = Math.min(
      MAX_RARITY,
      Math.max(source.rarity || 1, target.rarity || 1) + 1,
    );
    merged.affixes = undefined;
  } else {
    merged.level = Math.max(source.level || 1, target.level || 1) + 1;
    merged.rarity = Math.max(source.rarity || 1, target.rarity || 1);
    merged.affixes = mergeUniqueAffixes(source, target);
  }

  return updateItemDerivedData(merged);
};
