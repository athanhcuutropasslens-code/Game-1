import { applyStatusEffect } from '@/lib/game/effects';

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

export const generateMonster = (floor: number, roomType: string, zoneData: any) => {
  const prefix = MONSTER_PREFIXES[Math.floor(Math.random() * MONSTER_PREFIXES.length)];
  const type = MONSTER_TYPES[Math.floor(Math.random() * MONSTER_TYPES.length)];
  const normalizedType = MONSTER_TYPE_MAP[type.toLowerCase()] || 'slime';
  const isElite = roomType === 'ELITE';
  const isBoss = roomType === 'BOSS';
  const roomFactor = isBoss ? 2.5 : isElite ? 1.5 : 1;
  const baseHp = Math.floor((24 + floor * 12 + zoneData.difficulty * 6) * roomFactor);
  const baseAtk = Math.floor((5 + floor * 2 + zoneData.difficulty) * roomFactor);
  let monster: any = { uid: randomId(), name: `${prefix} ${type}`, hp: baseHp, maxHp: baseHp, atk: baseAtk, diceSides: 6 + Math.min(4, Math.floor(floor / 4)), seed: Math.random() * 1000, type: normalizedType, tier: isBoss ? 'boss' : (isElite ? 'elite' : 'normal'), entityType: isBoss ? 'boss' : 'monster', roomType, effects: [] };
  if (zoneData.id === 'z_forest' && Math.random() < 0.3) monster = applyStatusEffect(monster, 'POISON', 3);
  if (zoneData.id === 'z_ruins' && Math.random() < 0.3) monster = applyStatusEffect(monster, 'STUN', 1);
  if (zoneData.id === 'z_dungeon' && Math.random() < 0.3) monster = applyStatusEffect(monster, 'VULNERABLE', 3);
  return monster;
};
