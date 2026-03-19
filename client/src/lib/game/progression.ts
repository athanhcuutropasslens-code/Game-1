import { clamp } from "./effects";

export const computeFullStats = (player: any, options: any = {}) => {
  const { tempAlloc = null, classesDb, getItemStats } = options;
  const {
    baseStats,
    equipment,
    statsAllocated,
    skills,
    effects = [],
    classId,
  } = player;
  const alloc = tempAlloc || statsAllocated;
  const classMod =
    classId && classesDb[classId] ? classesDb[classId].baseMod : {};

  const breakdown: Record<string, any> = {
    atk: {
      base: baseStats.atk + (classMod.atk || 0),
      equip: 0,
      alloc: 0,
      skill: 0,
      buff: 0,
      percent: 0,
      total: 0,
    },
    def: {
      base: baseStats.def + (classMod.def || 0),
      equip: 0,
      alloc: 0,
      skill: 0,
      buff: 0,
      percent: 0,
      total: 0,
    },
    luck: {
      base: baseStats.luck + (classMod.luck || 0),
      equip: 0,
      alloc: 0,
      skill: 0,
      buff: 0,
      percent: 0,
      total: 0,
    },
    maxHp: {
      base: baseStats.maxHp + (classMod.maxHp || 0),
      equip: 0,
      alloc: 0,
      skill: 0,
      buff: 0,
      percent: 0,
      total: 0,
    },
    crit: {
      base: 5 + (classMod.crit || 0),
      equip: 0,
      alloc: 0,
      skill: 0,
      buff: 0,
      percent: 0,
      total: 0,
    },
    diceSides: {
      base: baseStats.diceSides,
      equip: 0,
      alloc: 0,
      skill: 0,
      buff: 0,
      percent: 0,
      total: 0,
    },
    goldMult: {
      base: 100,
      equip: 0,
      alloc: 0,
      skill: 0,
      buff: 0,
      percent: 0,
      total: 0,
    },
  };

  breakdown.atk.alloc = alloc.str * 1;
  breakdown.def.alloc = Math.floor(alloc.agi * 0.5);
  breakdown.maxHp.alloc = alloc.vit * 5;
  breakdown.luck.alloc = alloc.luk * 1;

  Object.values(equipment).forEach((item: any) => {
    if (!item) return;
    const itemStats = getItemStats(item);
    Object.keys(itemStats).forEach((key) => {
      if (breakdown[key]) breakdown[key].equip += itemStats[key];
    });
  });

  if (classId && classesDb[classId]) {
    classesDb[classId].skills.forEach((skill: any) => {
      const level = skills[skill.id] || 0;
      if (level <= 0 || !skill.mod) return;
      Object.keys(skill.mod).forEach((key) => {
        if (breakdown[key]) breakdown[key].skill += skill.mod[key] * level;
      });
    });
  }

  effects.forEach((effect: any) => {
    if (!effect.mods) return;
    Object.entries(effect.mods).forEach(([key, value]) => {
      if (key.endsWith("Percent")) {
        const statKey = key.replace("Percent", "");
        if (breakdown[statKey]) breakdown[statKey].percent += Number(value);
      } else if (breakdown[key]) {
        breakdown[key].buff += Number(value);
      }
    });
  });

  const result: Record<string, number> = {};
  Object.keys(breakdown).forEach((key) => {
    const flat =
      breakdown[key].base +
      breakdown[key].equip +
      breakdown[key].alloc +
      breakdown[key].skill +
      breakdown[key].buff;
    result[key] = Math.floor(flat * (1 + breakdown[key].percent / 100));
    breakdown[key].total = result[key];
  });

  return { final: result, breakdown };
};

export const claimLootRewards = ({
  loot,
  player,
  currentStats,
  computeStats,
}: any) => {
  let level = player.level;
  let exp = player.exp + loot.exp;
  let nextLevelExp = player.nextLevelExp;
  let statPoints = player.statPoints;
  let skillPoints = player.skillPoints;
  let baseStats = { ...player.baseStats };
  let hp = player.hp;
  let levelsGained = 0;
  const finalGold = Math.floor(
    loot.gold * ((currentStats.goldMult || 100) / 100),
  );

  while (exp >= nextLevelExp) {
    exp -= nextLevelExp;
    level += 1;
    levelsGained += 1;
    nextLevelExp = Math.floor(nextLevelExp * 1.2);
    baseStats = {
      ...baseStats,
      atk: baseStats.atk + 1,
      def: baseStats.def + 0.5,
      maxHp: baseStats.maxHp + 5,
    };
    hp += 5;
    statPoints += 3;
    if (level % 3 === 0) skillPoints += 1;
  }

  const maxHp = computeStats({ ...player, baseStats }).final.maxHp;
  return {
    player: {
      ...player,
      gold: player.gold + finalGold,
      exp,
      level,
      nextLevelExp,
      statPoints,
      skillPoints,
      baseStats,
      hp: clamp(hp, 0, maxHp),
      inventory: loot.item
        ? [...player.inventory, loot.item]
        : player.inventory,
    },
    finalGold,
    levelsGained,
    level,
  };
};
