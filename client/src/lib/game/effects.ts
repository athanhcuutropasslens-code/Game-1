export const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

export const processEffects = (entity: any, maxHp: number) => {
  let hp = entity.hp;
  let isStunned = false;
  const nextEffects: any[] = [];

  (entity.effects || []).forEach((eff: any) => {
    if (eff.dot?.type === "HP_FLAT") hp = clamp(hp + eff.dot.val, 0, maxHp);
    if (eff.dot?.type === "HP_PERCENT")
      hp = clamp(hp + Math.floor(maxHp * eff.dot.val), 0, maxHp);
    if (eff.isStun) isStunned = true;

    const nextDuration = (eff.duration ?? 1) - 1;
    const shieldRemaining = eff.shieldVal
      ? (eff.value ?? eff.shieldVal)
      : eff.value;
    if (nextDuration > 0 || (eff.shieldVal && shieldRemaining > 0)) {
      nextEffects.push({
        ...eff,
        duration: nextDuration,
        value: shieldRemaining,
      });
    }
  });

  return { entity: { ...entity, hp, effects: nextEffects }, isStunned };
};

export const applyStatusEffect = (
  entity: any,
  effectKey: string,
  duration: number,
  effectsDb: Record<string, any>,
  createId: () => string,
  overrideVal: number | null = null,
) => {
  const effectDef = effectsDb[effectKey];
  if (!effectDef) return entity;

  const existingIdx = (entity.effects || []).findIndex(
    (e: any) => e.id === effectDef.id,
  );
  const nextEffects = [...(entity.effects || [])];
  const value =
    overrideVal ?? effectDef.shieldVal ?? effectDef.dot?.val ?? null;

  if (existingIdx >= 0) {
    nextEffects[existingIdx] = {
      ...nextEffects[existingIdx],
      duration,
      value: value ?? nextEffects[existingIdx].value,
    };
  } else {
    nextEffects.push({ ...effectDef, duration, uid: createId(), value });
  }

  return { ...entity, effects: nextEffects };
};

export const absorbShieldDamage = (
  entity: any,
  damage: number,
  shieldEffectId: string,
) => {
  const shieldIndex = (entity.effects || []).findIndex(
    (e: any) => e.id === shieldEffectId,
  );
  if (shieldIndex < 0 || damage <= 0)
    return { entity, damageBlocked: 0, remainingDamage: damage };

  const shield = entity.effects[shieldIndex];
  const damageBlocked = Math.min(shield.value || 0, damage);
  const updatedEffects = [...entity.effects];
  updatedEffects[shieldIndex] = {
    ...shield,
    value: (shield.value || 0) - damageBlocked,
  };

  return {
    entity: {
      ...entity,
      effects: updatedEffects.filter(
        (e: any) => !e.shieldVal || (e.value || 0) > 0,
      ),
    },
    damageBlocked,
    remainingDamage: damage - damageBlocked,
  };
};
