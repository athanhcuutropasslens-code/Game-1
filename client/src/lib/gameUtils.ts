/**
 * Game Utility Functions
 * Design: Retro Arcade Cyberpunk
 */

import { EFFECTS_DB, AFFIX_DB, ITEMS_DB, RARITY_CONFIG } from "./gameConstants";
import { Player, GameItem, Monster } from "./gameTypes";

export const resetPoints = (player: Player): Player => {
  const totalStats = Object.values(player.statsAllocated).reduce(
    (a, b) => a + b,
    0,
  );
  const totalSkills = Object.values(player.skills).reduce((a, b) => a + b, 0);
  return {
    ...player,
    statPoints: player.statPoints + totalStats,
    skillPoints: player.skillPoints + totalSkills,
    statsAllocated: { str: 0, agi: 0, vit: 0, luk: 0 },
    skills: {},
  };
};

export const applyStatusEffect = (
  entity: Player | Monster,
  effectId: string,
  duration: number,
): Player | Monster => {
  const effectDef = EFFECTS_DB[effectId as keyof typeof EFFECTS_DB];
  if (!effectDef) return entity;

  const existingIdx = entity.effects.findIndex((e) => e.id === effectId);
  let newEffects = [...entity.effects];

  if (existingIdx >= 0) {
    if ((effectDef as any).shieldVal) {
      newEffects[existingIdx] = {
        ...newEffects[existingIdx],
        duration,
        value: (effectDef as any).shieldVal,
      };
    } else {
      newEffects[existingIdx] = { ...newEffects[existingIdx], duration };
    }
  } else {
    newEffects.push({
      ...(effectDef as any),
      duration,
      uid: Math.random().toString(36).substring(2, 11),
    });
  }

  return { ...entity, effects: newEffects };
};

export const calculateCost = (item: GameItem): number => {
  const baseRarity = RARITY_CONFIG[item.rarity as keyof typeof RARITY_CONFIG];
  const levelMult = Math.pow(1.15, item.level);
  const rarityMult = baseRarity ? baseRarity.weight * 0.1 : 1;
  return Math.floor(item.baseCost * levelMult * rarityMult);
};

export const generateItem = (
  dbItem: any,
  floor: number,
  rarity: number,
): any => {
  const newItem: GameItem = {
    ...dbItem,
    uid: Math.random().toString(36).substring(2, 11),
    rarity,
    level: Math.max(1, floor - 2),
  };

  if (newItem.baseStats) {
    newItem.stats = { ...newItem.baseStats };
    const affixCount =
      RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG]?.affixes || 0;
    const affixes = [];
    for (let i = 0; i < affixCount; i++) {
      const affix = AFFIX_DB[Math.floor(Math.random() * AFFIX_DB.length)];
      if (affix.type.includes(newItem.type as any)) {
        affixes.push(affix);
        if (newItem.stats) {
          (newItem.stats as any)[affix.stat] =
            ((newItem.stats as any)[affix.stat] || 0) + affix.val;
        }
      }
    }
    newItem.affixes = affixes;
  }

  newItem.cost = calculateCost(newItem);
  newItem.sellPrice = Math.floor(newItem.cost * 0.5);

  return newItem;
};

export const generateLoot = (
  _zoneId: string,
  floor: number,
  roomType: string,
): any => {
  const baseExp = 50 + floor * 20;
  const baseGold = 30 + floor * 15;

  let expMult = 1;
  let goldMult = 1;
  let itemRarity = 1;

  if (roomType === "ELITE") {
    expMult = 1.5;
    goldMult = 1.5;
    itemRarity = 2;
  } else if (roomType === "BOSS") {
    expMult = 3;
    goldMult = 3;
    itemRarity = 4;
  } else if (roomType === "TREASURE") {
    expMult = 0.5;
    goldMult = 2;
    itemRarity = 3;
  }

  const item =
    Math.random() < 0.6
      ? generateItem(
          ITEMS_DB[Math.floor(Math.random() * (ITEMS_DB.length - 8)) + 8],
          floor,
          itemRarity,
        )
      : undefined;

  return {
    exp: Math.floor(baseExp * expMult),
    gold: Math.floor(baseGold * goldMult),
    item,
  };
};

export const generateMapRooms = (floor: number): any[] => {
  const roomCount = 5 + Math.floor(floor / 3);
  const rooms = [];

  for (let i = 0; i < roomCount; i++) {
    let type = "COMBAT";
    const rand = Math.random();

    if (i === 0) type = "START";
    else if (i === roomCount - 1) type = "BOSS";
    else if (rand < 0.15) type = "TREASURE";
    else if (rand < 0.25) type = "SHOP";
    else if (rand < 0.35) type = "ELITE";

    rooms.push({
      id: i,
      type,
      locked: i > 0,
      completed: false,
    });
  }

  return rooms;
};

export const renderIcon = (Icon: any, _size = 16, _className = ""): any => {
  if (!Icon) return null;
  if (typeof Icon === "string") return Icon;
  return Icon;
};
