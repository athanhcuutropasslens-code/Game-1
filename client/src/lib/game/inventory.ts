export const resetPoints = (player: any) => {
  const totalStats = Object.values(player.statsAllocated).reduce(
    (a: number, b: any) => a + Number(b),
    0,
  );
  const totalSkills = Object.values(player.skills).reduce(
    (a: number, b: any) => a + Number(b),
    0,
  );
  return {
    ...player,
    statPoints: player.statPoints + totalStats,
    skillPoints: player.skillPoints + totalSkills,
    statsAllocated: { str: 0, agi: 0, vit: 0, luk: 0 },
    skills: {},
  };
};

export const getConsumableValue = (item: any, playerClass: string | null) => {
  const levelFactor = 1 + 0.1 * ((item.level || 1) - 1);
  const baseVal = item.baseVal || 0;
  const healBoost =
    playerClass === "cleric" && item.id.startsWith("pot_") ? 1.5 : 1;
  return Math.floor(baseVal * levelFactor * healBoost);
};

export const calculateCost = (item: any) => {
  const lvl = item.level || 1;
  return Math.floor(item.baseCost * Math.pow(lvl, 1.25));
};

export const getItemStats = (item: any) => {
  if (item.type === "CONSUMABLE" || !item.baseStats) return {};
  const lvl = item.level || 1;
  const statScale = 1 + 0.12 * (lvl - 1);
  const affixScale = 1 + 0.12 * (lvl - 1);
  const stats: Record<string, number> = {};

  Object.keys(item.baseStats).forEach((key) => {
    stats[key] = Math.floor(item.baseStats[key] * statScale);
  });

  if (item.affixes) {
    item.affixes.forEach((affix: any) => {
      const val = Math.floor(affix.val * affixScale);
      stats[affix.stat] = (stats[affix.stat] || 0) + val;
    });
  }

  return stats;
};

export const mergeItems = ({
  item,
  inventory,
  equipment,
  itemsDb,
  generateItem,
  calculateItemCost,
}: any) => {
  const sameTypeMatcher = (candidate: any) =>
    item.type === "CONSUMABLE"
      ? candidate.id === item.id && candidate.rarity === item.rarity
      : candidate.id === item.id && candidate.level === item.level;

  const inventoryMatch = inventory.find(
    (candidate: any) =>
      sameTypeMatcher(candidate) && candidate.uid !== item.uid,
  );
  const slot =
    item.type === "WEAPON"
      ? "weapon"
      : item.type === "ARMOR"
        ? "armor"
        : item.type === "ACCESSORY"
          ? "accessory"
          : null;
  const equippedItem = slot ? equipment[slot] : null;
  const equipMatch =
    equippedItem &&
    sameTypeMatcher(equippedItem) &&
    equippedItem.uid !== item.uid
      ? equippedItem
      : null;
  const matchItem = inventoryMatch || equipMatch;

  if (!matchItem) return { ok: false, reason: "NO_MATCH" };

  const baseItem = itemsDb.find((base: any) => base.id === item.id) || item;
  const merged = generateItem(
    baseItem,
    (item.level || 1) + 1,
    item.type === "CONSUMABLE"
      ? Math.min(5, (item.rarity || 1) + 1)
      : Math.max(item.rarity || 1, matchItem.rarity || 1),
  );

  merged.affixes = Array.from(
    new Map(
      [...(item.affixes || []), ...(matchItem.affixes || [])].map(
        (affix: any) => [affix.id, affix],
      ),
    ).values(),
  );
  merged.cost = calculateItemCost(merged);
  merged.sellPrice = Math.floor(merged.cost * 0.45);

  const nextInventory = inventory.filter(
    (candidate: any) =>
      candidate.uid !== item.uid && candidate.uid !== matchItem.uid,
  );
  const nextEquipment = { ...equipment };
  const shouldEquip = slot && (item.isEquipped || false || !!equipMatch);

  if (slot && shouldEquip) nextEquipment[slot] = merged;
  else nextInventory.push(merged);

  return {
    ok: true,
    merged,
    inventory: nextInventory,
    equipment: nextEquipment,
  };
};
