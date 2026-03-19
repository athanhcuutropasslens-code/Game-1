const MONSTER_PREFIXES = ['Hư Không', 'Bóng Tối', 'Rực Lửa', 'Băng Giá', 'Độc Dược', 'Cuồng Nộ', 'Cổ Đại'];
const MONSTER_TYPES = ['Slime', 'Goblin', 'Bộ Xương', 'Dơi', 'Sói', 'Orc', 'Phù Thủy', 'Golem', 'Rồng'];
const MONSTER_TYPE_MAP: Record<string, string> = {
  slime: 'slime',
  goblin: 'goblin',
  'bộ xương': 'skeleton',
  dơi: 'bat',
  sói: 'wolf',
  orc: 'orc',
  'phù thủy': 'witch',
  golem: 'golem',
  rồng: 'dragon',
};

const randomId = () => Math.random().toString(36).substring(2, 11);

const applyMonsterEffect = (entity: any, effectKey: string, duration: number, effectCatalog: Record<string, any>) => {
  const effectDef = effectCatalog[effectKey];
  if (!effectDef) return entity;

  const nextEffects = [...(entity.effects || [])];
  const existingIdx = nextEffects.findIndex((effect) => effect.id === effectDef.id);
  const value = effectDef.shieldVal ?? effectDef.dot?.val ?? null;

  if (existingIdx >= 0) nextEffects[existingIdx] = { ...nextEffects[existingIdx], duration, value: value ?? nextEffects[existingIdx].value };
  else nextEffects.push({ ...effectDef, duration, uid: randomId(), value });

  return { ...entity, effects: nextEffects };
};

export const generateMonster = (floor: number, roomType: string, zoneData: any, effectCatalog: Record<string, any>) => {
  const prefix = MONSTER_PREFIXES[Math.floor(Math.random() * MONSTER_PREFIXES.length)];
  const type = MONSTER_TYPES[Math.floor(Math.random() * MONSTER_TYPES.length)];
  const normalizedType = MONSTER_TYPE_MAP[type.toLowerCase()] || 'slime';
  const isElite = roomType === 'ELITE';
  const isBoss = roomType === 'BOSS';
  const roomFactor = isBoss ? 2.5 : isElite ? 1.5 : 1;
  const baseHp = Math.floor((24 + floor * 12 + zoneData.difficulty * 6) * roomFactor);
  const baseAtk = Math.floor((5 + floor * 2 + zoneData.difficulty) * roomFactor);

  let monster = {
    uid: randomId(),
    name: `${prefix} ${type}`,
    hp: baseHp,
    maxHp: baseHp,
    atk: baseAtk,
    diceSides: 6 + Math.min(4, Math.floor(floor / 4)),
    seed: Math.random() * 1000,
    type: normalizedType,
    tier: isBoss ? 'boss' : (isElite ? 'elite' : 'normal'),
    entityType: isBoss ? 'boss' : 'monster',
    roomType,
    effects: [],
  };

  if (zoneData.id === 'z_forest' && Math.random() < 0.3) monster = applyMonsterEffect(monster, 'POISON', 3, effectCatalog);
  if (zoneData.id === 'z_ruins' && Math.random() < 0.3) monster = applyMonsterEffect(monster, 'STUN', 1, effectCatalog);
  if (zoneData.id === 'z_dungeon' && Math.random() < 0.3) monster = applyMonsterEffect(monster, 'VULNERABLE', 3, effectCatalog);

  return monster;
};
