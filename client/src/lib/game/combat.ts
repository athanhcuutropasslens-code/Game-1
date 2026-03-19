export const MOVES = {
  ROCK: { id: 'rock', name: 'Búa', icon: '✊', beats: 'scissors', color: 'text-orange-500' },
  PAPER: { id: 'paper', name: 'Bao', icon: '✋', beats: 'rock', color: 'text-green-500' },
  SCISSORS: { id: 'scissors', name: 'Kéo', icon: '✌️', beats: 'paper', color: 'text-blue-500' },
} as const;

const MAGE_EFFECTS = ['POISON', 'STUN', 'VULNERABLE'] as const;

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const randomInt = (sides: number) => Math.floor(Math.random() * sides) + 1;
const randomId = () => Math.random().toString(36).substring(2, 11);
const pickRandomMove = () => Object.values(MOVES)[Math.floor(Math.random() * Object.values(MOVES).length)];

const applyStatusEffect = (entity: any, effectKey: string, duration: number, effectCatalog: Record<string, any>, overrideVal: number | null = null) => {
  const effectDef = effectCatalog[effectKey];
  if (!effectDef) return entity;

  const nextEffects = [...(entity.effects || [])];
  const existingIdx = nextEffects.findIndex((effect) => effect.id === effectDef.id);
  const value = overrideVal ?? effectDef.shieldVal ?? effectDef.dot?.val ?? null;

  if (existingIdx >= 0) {
    nextEffects[existingIdx] = { ...nextEffects[existingIdx], duration, value: value ?? nextEffects[existingIdx].value };
  } else {
    nextEffects.push({ ...effectDef, duration, uid: randomId(), value });
  }

  return { ...entity, effects: nextEffects };
};

export const resolveEffectTick = (entity: any, maxHp: number) => {
  let hp = entity.hp;
  let isStunned = false;
  const nextEffects: any[] = [];

  (entity.effects || []).forEach((effect: any) => {
    if (effect.dot?.type === 'HP_FLAT') hp = clamp(hp + effect.dot.val, 0, maxHp);
    if (effect.dot?.type === 'HP_PERCENT') hp = clamp(hp + Math.floor(maxHp * effect.dot.val), 0, maxHp);
    if (effect.isStun) isStunned = true;

    const nextDuration = (effect.duration ?? 1) - 1;
    const shieldRemaining = effect.shieldVal ? (effect.value ?? effect.shieldVal) : effect.value;
    if (nextDuration > 0 || (effect.shieldVal && shieldRemaining > 0)) {
      nextEffects.push({ ...effect, duration: nextDuration, value: shieldRemaining });
    }
  });

  return {
    entity: { ...entity, hp, effects: nextEffects },
    isStunned,
    delta: hp - entity.hp,
  };
};

export const resolveRpsRound = (
  playerMoveId: string,
  monsterMoveId: string | null,
  stats: any,
  monsterStats: any,
  activeEffects: any,
  options: {
    playerClassId?: string;
    shieldEffectId?: string;
    effectCatalog?: Record<string, any>;
  } = {},
) => {
  const playerMove = Object.values(MOVES).find((move) => move.id === playerMoveId) || MOVES.ROCK;
  const monsterMove = monsterMoveId
    ? Object.values(MOVES).find((move) => move.id === monsterMoveId) || pickRandomMove()
    : pickRandomMove();
  const outcome = playerMove.id === monsterMove.id ? 'draw' : playerMove.beats === monsterMove.id ? 'win' : 'lose';
  const attackMult = outcome === 'win' ? 1.35 : outcome === 'lose' ? 0.8 : 1;
  const defendMult = outcome === 'lose' ? 1.2 : outcome === 'win' ? 0.85 : 1;

  let nextPlayer = { ...activeEffects };
  let nextMonster = { ...monsterStats };
  let playerDamage = 0;
  let monsterDamage = 0;
  const logEvents: Array<{ msg: string; color: string }> = [];
  const effectEvents: Array<{ text: string; type: 'heal' | 'damage'; x: number; y: number }> = [];

  if ((activeEffects.effects || []).some((effect: any) => effect.isStun)) {
    monsterDamage = Math.max(0, randomInt(monsterStats.diceSides) + monsterStats.atk - stats.def);
    nextPlayer = { ...nextPlayer, hp: Math.max(0, nextPlayer.hp - monsterDamage) };
    logEvents.push({ msg: 'Bạn bị choáng và mất lượt!', color: 'text-yellow-400' });
  } else {
    const crit = Math.random() * 100 < stats.crit;
    playerDamage = Math.floor((randomInt(stats.diceSides) + stats.atk) * attackMult * (crit ? 1.5 : 1));
    monsterDamage = Math.max(0, Math.floor((randomInt(monsterStats.diceSides) + monsterStats.atk - stats.def) * defendMult * (1 + ((nextPlayer.effects || []).some((effect: any) => effect.incomingPercent) ? 0.2 : 0))));
    nextMonster = { ...nextMonster, hp: Math.max(0, nextMonster.hp - playerDamage) };

    if (options.playerClassId === 'rogue' && Math.random() < 0.2 && options.effectCatalog) nextMonster = applyStatusEffect(nextMonster, 'POISON', 3, options.effectCatalog);
    if (options.playerClassId === 'mage' && Math.random() < 0.2 && options.effectCatalog) nextMonster = applyStatusEffect(nextMonster, MAGE_EFFECTS[Math.floor(Math.random() * MAGE_EFFECTS.length)], 2, options.effectCatalog);

    if (monsterDamage > 0 && options.shieldEffectId) {
      const shieldIndex = (nextPlayer.effects || []).findIndex((effect: any) => effect.id === options.shieldEffectId);
      if (shieldIndex >= 0) {
        const shield = nextPlayer.effects[shieldIndex];
        const absorb = Math.min(shield.value || 0, monsterDamage);
        monsterDamage -= absorb;
        effectEvents.push({ text: `BLOCK ${absorb}`, type: 'heal', x: 68, y: 70 });
        const updatedEffects = [...nextPlayer.effects];
        updatedEffects[shieldIndex] = { ...shield, value: (shield.value || 0) - absorb };
        nextPlayer = { ...nextPlayer, effects: updatedEffects.filter((effect: any) => !effect.shieldVal || (effect.value || 0) > 0) };
      }
    }

    nextPlayer = { ...nextPlayer, hp: Math.max(0, nextPlayer.hp - monsterDamage) };
    logEvents.push({ msg: `${playerMove.name} vs ${monsterMove.name}: ${outcome === 'win' ? 'thắng thế' : outcome === 'lose' ? 'lép vế' : 'hòa'}.`, color: outcome === 'win' ? 'text-green-400' : outcome === 'lose' ? 'text-red-400' : 'text-slate-300' });
  }

  if (playerDamage > 0) effectEvents.push({ text: `-${playerDamage}`, type: 'damage', x: 32, y: 24 });
  if (monsterDamage > 0) effectEvents.push({ text: `-${monsterDamage}`, type: 'damage', x: 68, y: 78 });

  return {
    outcome,
    damage: { playerToMonster: playerDamage, monsterToPlayer: monsterDamage },
    logEvents,
    effectEvents,
    diceResult: { pMove: playerMove, mMove: monsterMove, outcome },
    player: nextPlayer,
    monster: nextMonster,
  };
};
