export const generateMonster = ({
  floor,
  roomType,
  zoneData,
  monsterPrefixes,
  monsterTypes,
  monsterTypeMap,
  applyStatusEffect,
  createId,
  random = Math.random,
}: any) => {
  const prefix = monsterPrefixes[Math.floor(random() * monsterPrefixes.length)];
  const type = monsterTypes[Math.floor(random() * monsterTypes.length)];
  const normalizedType = monsterTypeMap[type.toLowerCase()] || "slime";
  const isElite = roomType === "ELITE";
  const isBoss = roomType === "BOSS";
  const roomFactor = isBoss ? 2.5 : isElite ? 1.5 : 1;
  const baseHp = Math.floor(
    (24 + floor * 12 + zoneData.difficulty * 6) * roomFactor,
  );
  const baseAtk = Math.floor(
    (5 + floor * 2 + zoneData.difficulty) * roomFactor,
  );

  let monster = {
    uid: createId(),
    name: `${prefix} ${type}`,
    hp: baseHp,
    maxHp: baseHp,
    atk: baseAtk,
    diceSides: 6 + Math.min(4, Math.floor(floor / 4)),
    seed: random() * 1000,
    type: normalizedType,
    tier: isBoss ? "boss" : isElite ? "elite" : "normal",
    entityType: isBoss ? "boss" : "monster",
    roomType,
    effects: [],
  };

  if (zoneData.id === "z_forest" && random() < 0.3)
    monster = applyStatusEffect(monster, "POISON", 3);
  if (zoneData.id === "z_ruins" && random() < 0.3)
    monster = applyStatusEffect(monster, "STUN", 1);
  if (zoneData.id === "z_dungeon" && random() < 0.3)
    monster = applyStatusEffect(monster, "VULNERABLE", 3);
  return monster;
};
