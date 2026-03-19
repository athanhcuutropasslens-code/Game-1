export const rollRarity = (floor: number, random = Math.random) => {
  const bonus = Math.floor(floor * 1.5);
  const roll = random() * 100 + bonus;
  if (roll > 110) return 5;
  if (roll > 95) return 4;
  if (roll > 80) return 3;
  if (roll > 50) return 2;
  return 1;
};

export const isItemUsableByClass = (
  item: any,
  classId: string | null,
  classesDb: Record<string, any>,
) => {
  if (
    item.type === "CONSUMABLE" ||
    item.type === "SERVICE" ||
    item.type === "ACCESSORY"
  )
    return true;
  const allowed = classId ? classesDb[classId]?.allowed : null;
  if (!allowed) return true;
  const slot = item.type === "WEAPON" ? "weapon" : "armor";
  return allowed[slot]?.includes(item.subType);
};

export const generateItem = ({
  baseItem,
  level = 1,
  forceRarity = null,
  rarityConfig,
  affixDb,
  calculateCost,
  createId,
  random = Math.random,
}: any) => {
  const item = {
    ...baseItem,
    uid: createId(),
    level,
    rarity: forceRarity || baseItem.rarity || rollRarity(level, random),
  };

  if (item.type !== "CONSUMABLE" && item.type !== "SERVICE") {
    const config = rarityConfig[item.rarity] || rarityConfig[1];
    const availableAffixes = affixDb.filter((affix: any) =>
      affix.type.includes(item.type),
    );
    const used = new Set();
    item.affixes = [];
    for (let index = 0; index < config.affixes; index += 1) {
      const pool = availableAffixes.filter((affix: any) => !used.has(affix.id));
      if (!pool.length) break;
      const picked = { ...pool[Math.floor(random() * pool.length)] };
      used.add(picked.id);
      item.affixes.push(picked);
    }
  }

  item.cost = calculateCost(item);
  item.sellPrice = Math.floor(item.cost * 0.45);
  return item;
};

export const generateLoot = ({
  floor,
  roomType,
  playerClass,
  luck = 0,
  itemsDb,
  classesDb,
  generateItem,
  random = Math.random,
}: any) => {
  let goldBase = 10 * floor;
  let xpBase = 10 * floor;
  let itemChance = 0.3;
  let itemRarity = 1;

  if (roomType === "ELITE") {
    goldBase *= 2;
    xpBase *= 2;
    itemChance = 0.6;
    itemRarity = Math.max(2, rollRarity(floor, random));
  }
  if (roomType === "BOSS") {
    goldBase *= 5;
    xpBase *= 5;
    itemChance = 1;
    itemRarity = Math.max(3, rollRarity(floor + 5, random));
  }
  if (roomType === "TREASURE") {
    goldBase *= 3;
    itemChance = 1;
    itemRarity = Math.max(2, rollRarity(floor, random));
  }

  const luckFactor = 1 + luck * 0.015;
  const gold = Math.floor(goldBase * (0.8 + random() * 0.4) * luckFactor);
  const exp = Math.floor(xpBase * (1 + luck * 0.005));
  let item = null;

  if (random() < Math.min(1, itemChance + luck * 0.01)) {
    const usableItems = itemsDb.filter((candidate: any) =>
      isItemUsableByClass(candidate, playerClass, classesDb),
    );
    if (usableItems.length > 0)
      item = generateItem(
        usableItems[Math.floor(random() * usableItems.length)],
        floor,
        itemRarity,
      );
  }

  return { gold, exp, item };
};
