/**
 * Game Utility Functions
 * Design: Retro Arcade Cyberpunk
 */

import { AFFIX_DB, EFFECTS_DB, ITEMS_DB, RARITY_CONFIG } from "./gameConstants";
import type {
  EffectProcessingResult,
  ItemAffix,
  ItemDefinition,
  ItemInstance,
  LootDrop,
  MapRoom,
  MonsterState,
  PlayerState,
  RoomType,
  StatusEffect,
} from "./gameTypes";

const randomId = (): string => Math.random().toString(36).substring(2, 11);
const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const resetPoints = (player: PlayerState): PlayerState => {
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

export const processEffects = <T extends PlayerState | MonsterState>(
  entity: T,
  maxHp: number,
): EffectProcessingResult<T> => {
  let hp = entity.hp;
  let isStunned = false;
  const nextEffects: StatusEffect[] = [];

  for (const effect of entity.effects) {
    if (effect.dot?.type === "HP_FLAT") {
      hp = clamp(hp + effect.dot.val, 0, maxHp);
    }
    if (effect.dot?.type === "HP_PERCENT") {
      hp = clamp(hp + Math.floor(maxHp * effect.dot.val), 0, maxHp);
    }
    if (effect.isStun) {
      isStunned = true;
    }

    const nextDuration = effect.duration - 1;
    const shieldRemaining = effect.shieldVal
      ? (effect.value ?? effect.shieldVal)
      : effect.value;
    if (nextDuration > 0 || (effect.shieldVal && (shieldRemaining ?? 0) > 0)) {
      nextEffects.push({
        ...effect,
        duration: nextDuration,
        value: shieldRemaining,
      });
    }
  }

  return {
    entity: {
      ...entity,
      hp,
      effects: nextEffects,
    },
    isStunned,
  };
};

export const applyStatusEffect = <T extends PlayerState | MonsterState>(
  entity: T,
  effectId: keyof typeof EFFECTS_DB,
  duration: number,
  overrideValue?: number,
): T => {
  const effectDef = EFFECTS_DB[effectId] as
    | Omit<StatusEffect, "duration" | "uid">
    | undefined;
  if (!effectDef) {
    return entity;
  }

  const existingIndex = entity.effects.findIndex(
    (effect) => effect.id === effectDef.id,
  );
  const value = overrideValue ?? effectDef.shieldVal ?? effectDef.dot?.val;
  const nextEffects = [...entity.effects];

  if (existingIndex >= 0) {
    nextEffects[existingIndex] = {
      ...nextEffects[existingIndex],
      duration,
      value: value ?? nextEffects[existingIndex].value,
    };
  } else {
    nextEffects.push({
      ...effectDef,
      duration,
      uid: randomId(),
      value,
    });
  }

  return {
    ...entity,
    effects: nextEffects,
  };
};

export const calculateCost = (
  item: Pick<ItemInstance, "baseCost" | "rarity" | "level">,
): number => {
  const baseRarity = RARITY_CONFIG[item.rarity as keyof typeof RARITY_CONFIG];
  const levelMult = Math.pow(1.15, item.level);
  const rarityMult = baseRarity ? baseRarity.weight * 0.1 : 1;
  return Math.floor(item.baseCost * levelMult * rarityMult);
};

export const generateItem = (
  dbItem: ItemDefinition,
  floor: number,
  rarity = dbItem.rarity,
): ItemInstance => {
  const newItem: ItemInstance = {
    ...dbItem,
    uid: randomId(),
    rarity,
    level: Math.max(1, floor - 2),
    affixes: [],
    cost: 0,
    sellPrice: 0,
    stats: dbItem.baseStats ? { ...dbItem.baseStats } : undefined,
  };

  if (newItem.baseStats && newItem.stats) {
    const affixCount =
      RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG]?.affixes ?? 0;
    for (let i = 0; i < affixCount; i += 1) {
      const affix = AFFIX_DB[
        Math.floor(Math.random() * AFFIX_DB.length)
      ] as ItemAffix;
      if (!affix.type.includes(newItem.type)) {
        continue;
      }
      newItem.affixes.push(affix);
      const currentValue = newItem.stats[affix.stat] ?? 0;
      newItem.stats[affix.stat] = currentValue + affix.val;
    }
  }

  newItem.cost = calculateCost(newItem);
  newItem.sellPrice = Math.floor(newItem.cost * 0.5);

  return newItem;
};

export const generateLoot = (
  zoneId: string,
  floor: number,
  roomType: RoomType,
): LootDrop => {
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

  const _zoneId = zoneId;
  void _zoneId;

  const item =
    Math.random() < 0.6
      ? generateItem(
          ITEMS_DB[
            Math.floor(Math.random() * (ITEMS_DB.length - 8)) + 8
          ] as ItemDefinition,
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

export const generateMapRooms = (floor: number): MapRoom[] => {
  const roomCount = 5 + Math.floor(floor / 3);
  const rooms: MapRoom[] = [];

  for (let i = 0; i < roomCount; i += 1) {
    let type: RoomType = "COMBAT";
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

export const renderIcon = (
  Icon: unknown,
  size = 16,
  className = "",
): unknown => {
  void size;
  void className;
  if (!Icon) return null;
  if (typeof Icon === "string") return Icon;
  return Icon;
};
