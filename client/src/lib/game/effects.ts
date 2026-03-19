import { EFFECTS_DB } from "@/lib/game/constants/effects";

type DotDef = { type: "HP_FLAT" | "HP_PERCENT"; val: number };
type EffectInstance = {
  id: string;
  uid?: string;
  duration?: number;
  value?: number | null;
  dot?: DotDef;
  shieldVal?: number;
  isStun?: boolean;
  incomingPercent?: number;
  mods?: Record<string, number>;
};

type Entity = {
  hp: number;
  maxHp?: number;
  effects?: EffectInstance[];
  [key: string]: any;
};

const randomId = () => Math.random().toString(36).substring(2, 11);
const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

const getEffectValue = (effect: EffectInstance) =>
  effect.value ?? effect.shieldVal ?? effect.dot?.val ?? null;
const sumIncomingPercent = (entity: Entity) =>
  (entity.effects || []).reduce(
    (total, effect) => total + (effect.incomingPercent || 0),
    0,
  );

export const processEffects = (entity: Entity, maxHp: number) => {
  let hp = entity.hp;
  let isStunned = false;
  const nextEffects: EffectInstance[] = [];
  const deltas: Array<{ effectId: string; amount: number }> = [];

  for (const effect of entity.effects || []) {
    let delta = 0;
    if (effect.dot?.type === "HP_FLAT") delta = effect.dot.val;
    if (effect.dot?.type === "HP_PERCENT")
      delta = Math.floor(maxHp * effect.dot.val);
    if (delta !== 0) {
      const nextHp = clamp(hp + delta, 0, maxHp);
      deltas.push({ effectId: effect.id, amount: nextHp - hp });
      hp = nextHp;
    }
    if (effect.isStun) isStunned = true;

    const nextDuration = (effect.duration ?? 1) - 1;
    const nextValue = getEffectValue(effect);
    if (nextDuration > 0 || (effect.shieldVal && (nextValue || 0) > 0)) {
      nextEffects.push({ ...effect, duration: nextDuration, value: nextValue });
    }
  }

  return { entity: { ...entity, hp, effects: nextEffects }, isStunned, deltas };
};

export const applyStatusEffect = (
  entity: Entity,
  effectId: string,
  duration: number,
  overrideVal: number | null = null,
) => {
  const effectDef = EFFECTS_DB[effectId];
  if (!effectDef) return entity;

  const nextEffects = [...(entity.effects || [])];
  const existingIdx = nextEffects.findIndex(
    (effect) => effect.id === effectDef.id,
  );
  const value =
    overrideVal ?? effectDef.shieldVal ?? effectDef.dot?.val ?? null;
  const nextEffect = { ...effectDef, duration, value };

  if (existingIdx >= 0) {
    nextEffects[existingIdx] = {
      ...nextEffects[existingIdx],
      ...nextEffect,
      value: value ?? nextEffects[existingIdx].value,
    };
  } else {
    nextEffects.push({ ...nextEffect, uid: randomId() });
  }

  return { ...entity, effects: nextEffects };
};

export const mitigateIncomingDamage = (
  entity: Entity,
  incomingDamage: number,
) => {
  let remainingDamage = Math.max(0, incomingDamage);
  let absorbed = 0;
  const nextEffects = (entity.effects || [])
    .map((effect) => {
      if (!effect.shieldVal || remainingDamage <= 0) return effect;
      const currentShield = Math.max(0, Number(getEffectValue(effect) || 0));
      const blocked = Math.min(currentShield, remainingDamage);
      absorbed += blocked;
      remainingDamage -= blocked;
      return { ...effect, value: currentShield - blocked };
    })
    .filter(
      (effect) => !effect.shieldVal || Number(getEffectValue(effect) || 0) > 0,
    );

  return {
    entity: { ...entity, effects: nextEffects },
    damageTaken: remainingDamage,
    absorbed,
  };
};

export const calculateIncomingDamage = (entity: Entity, baseDamage: number) => {
  const incomingPercent = sumIncomingPercent(entity);
  return Math.max(0, Math.floor(baseDamage * (1 + incomingPercent / 100)));
};

export const runTickEffects = ({
  entity,
  maxHp,
}: {
  entity: Entity;
  maxHp: number;
}) => processEffects(entity, maxHp);
