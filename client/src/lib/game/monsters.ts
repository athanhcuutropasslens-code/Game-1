import { EFFECTS_DB, MONSTER_PREFIXES, MONSTER_TYPES } from '@/lib/gameConstants';

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

const ROOM_MODIFIERS: Record<string, { hp: number; atk: number; effectChance: number; label: string; note: string }> = {
  COMBAT: { hp: 1, atk: 1, effectChance: 0.22, label: 'Quái thường', note: 'Chạm trán tiêu chuẩn của tầng hiện tại.' },
  ELITE: { hp: 1.65, atk: 1.35, effectChance: 0.45, label: 'Tinh anh', note: 'Bản thể mạnh hơn với chỉ số và hiệu ứng hung hãn hơn.' },
  BOSS: { hp: 2.9, atk: 1.85, effectChance: 0.75, label: 'Trùm', note: 'Kẻ canh giữ tầng với lượng máu lớn và hiệu ứng áp đảo.' },
};

const ZONE_EFFECTS: Record<string, { effect: keyof typeof EFFECTS_DB; chance: number; duration: number; note: string }> = {
  z_forest: { effect: 'POISON', chance: 0.35, duration: 3, note: 'Khu rừng phủ đầy độc tố khiến quái dễ mang hiệu ứng Độc.' },
  z_ruins: { effect: 'STUN', chance: 0.3, duration: 1, note: 'Tàn tích đổ nát khiến quái dễ gây Choáng bất ngờ.' },
  z_dungeon: { effect: 'VULNERABLE', chance: 0.4, duration: 3, note: 'Hầm ngục ma lực làm mục tiêu dễ bị Suy Yếu.' },
  z_hell: { effect: 'POISON', chance: 0.5, duration: 4, note: 'Địa ngục ép quái sở hữu hiệu ứng kéo dài và sát thương bào mòn.' },
};

const randomId = () => Math.random().toString(36).substring(2, 11);

const withEffect = (entity: any, effectKey: keyof typeof EFFECTS_DB, duration: number, overrideVal: number | null = null) => {
  const effectDef = EFFECTS_DB[effectKey];
  if (!effectDef) return entity;

  const value = overrideVal ?? (effectDef as any).shieldVal ?? (effectDef as any).dot?.val ?? null;
  return {
    ...entity,
    effects: [
      ...(entity.effects || []),
      {
        ...(effectDef as any),
        duration,
        uid: randomId(),
        value,
      },
    ],
  };
};

export const generateMonster = (floor: number, roomType: string, zone: any) => {
  const prefix = MONSTER_PREFIXES[Math.floor(Math.random() * MONSTER_PREFIXES.length)];
  const baseType = MONSTER_TYPES[Math.floor(Math.random() * MONSTER_TYPES.length)];
  const normalizedType = MONSTER_TYPE_MAP[baseType.toLowerCase()] || 'slime';
  const roomModifier = ROOM_MODIFIERS[roomType] || ROOM_MODIFIERS.COMBAT;
  const zoneDifficulty = zone?.difficulty || 0;
  const zoneScale = 1 + zoneDifficulty * 0.14;
  const floorHp = 24 + floor * 12;
  const floorAtk = 5 + floor * 2;
  const hp = Math.floor(floorHp * zoneScale * roomModifier.hp);
  const atk = Math.floor(floorAtk * (1 + zoneDifficulty * 0.08) * roomModifier.atk);
  const diceSides = 6 + Math.min(4, Math.floor((floor + zoneDifficulty) / 4));
  const isBoss = roomType === 'BOSS';
  const isElite = roomType === 'ELITE';
  const zoneEffect = ZONE_EFFECTS[zone?.id];

  let monster: any = {
    uid: randomId(),
    name: `${prefix} ${baseType}`,
    hp,
    maxHp: hp,
    atk,
    diceSides,
    seed: Math.random() * 1000,
    type: normalizedType,
    tier: isBoss ? 'boss' : isElite ? 'elite' : 'normal',
    entityType: isBoss ? 'boss' : 'monster',
    roomType,
    zoneId: zone?.id,
    zoneName: zone?.name,
    effects: [],
    metadata: {
      archetype: roomModifier.label,
      roomNote: roomModifier.note,
      zoneEffectHint: zoneEffect?.note || 'Khu vực này không có hiệu ứng đặc thù cố định.',
      difficultyLabel: zoneDifficulty >= 10 ? 'Cực hạn' : zoneDifficulty >= 5 ? 'Nguy hiểm' : zoneDifficulty >= 2 ? 'Khó' : 'Ổn định',
      scaling: {
        floor,
        zoneDifficulty,
        hpMultiplier: Number((zoneScale * roomModifier.hp).toFixed(2)),
        atkMultiplier: Number(((1 + zoneDifficulty * 0.08) * roomModifier.atk).toFixed(2)),
      },
      tags: [roomModifier.label, zone?.name, zoneDifficulty > 0 ? `+${zoneDifficulty} difficulty` : 'difficulty cơ bản'].filter(Boolean),
    },
  };

  if (zoneEffect && Math.random() < zoneEffect.chance * roomModifier.effectChance / ROOM_MODIFIERS.COMBAT.effectChance) {
    monster = withEffect(monster, zoneEffect.effect, zoneEffect.duration);
  }

  monster.metadata.effects = (monster.effects || []).map((effect: any) => ({
    id: effect.id,
    name: effect.name,
    desc: effect.desc,
    color: effect.color,
    duration: effect.duration,
  }));

  return monster;
};
