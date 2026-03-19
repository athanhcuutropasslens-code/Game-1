export const MOVES = {
  ROCK: {
    id: "rock",
    name: "Búa",
    icon: "✊",
    beats: "scissors",
    color: "text-orange-500",
  },
  PAPER: {
    id: "paper",
    name: "Bao",
    icon: "✋",
    beats: "rock",
    color: "text-green-500",
  },
  SCISSORS: {
    id: "scissors",
    name: "Kéo",
    icon: "✌️",
    beats: "paper",
    color: "text-blue-500",
  },
} as const;

const MAGE_EFFECTS = ["POISON", "STUN", "VULNERABLE"] as const;

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));
const randomInt = (sides: number) => Math.floor(Math.random() * sides) + 1;
const randomId = () => Math.random().toString(36).substring(2, 11);

export function createCombatEffect(
  text: string,
  type: "heal" | "damage",
  x = 50,
  y = 50,
) {
  return { text, type, x, y };
}

export function resolveEffectTick(entity: any, maxHp: number) {
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

  return {
    entity: { ...entity, hp, effects: nextEffects },
    isStunned,
    delta: hp - entity.hp,
  };
}

function applyStatusEffect(
  entity: any,
  effectKey: string,
  duration: number,
  effectCatalog: Record<string, any>,
  overrideVal: number | null = null,
) {
  const effectDef = effectCatalog[effectKey];
  if (!effectDef) return entity;

  const nextEffects = [...(entity.effects || [])];
  const existingIdx = nextEffects.findIndex(
    (effect) => effect.id === effectDef.id,
  );
  const value =
    overrideVal ?? effectDef.shieldVal ?? effectDef.dot?.val ?? null;

  if (existingIdx >= 0) {
    nextEffects[existingIdx] = {
      ...nextEffects[existingIdx],
      duration,
      value: value ?? nextEffects[existingIdx].value,
    };
  } else {
    nextEffects.push({ ...effectDef, duration, uid: randomId(), value });
  }

  return { ...entity, effects: nextEffects };
}

export function resolveRpsRound(
  playerMoveId: string,
  stats: any,
  monsterStats: any,
  activeEffects: any,
  options: {
    playerClassId?: string;
    shieldEffectId?: string;
    effectCatalog?: Record<string, any>;
  } = {},
) {
  const move = Object.values(MOVES).find((entry) => entry.id === playerMoveId);
  const monsterMove =
    Object.values(MOVES)[
      Math.floor(Math.random() * Object.values(MOVES).length)
    ];
  const outcome = !move
    ? "draw"
    : move.id === monsterMove.id
      ? "draw"
      : move.beats === monsterMove.id
        ? "win"
        : "lose";
  const attackMult = outcome === "win" ? 1.35 : outcome === "lose" ? 0.8 : 1;
  const defendMult = outcome === "lose" ? 1.2 : outcome === "win" ? 0.85 : 1;

  let nextPlayer = { ...activeEffects };
  let nextMonster = { ...monsterStats };
  let playerDamage = 0;
  let monsterDamage = 0;
  const logEvents: Array<{ msg: string; color: string }> = [];
  const effectEvents: Array<{
    text: string;
    type: "heal" | "damage";
    x: number;
    y: number;
  }> = [];

  if ((activeEffects.effects || []).some((effect: any) => effect.isStun)) {
    monsterDamage = Math.max(
      0,
      randomInt(monsterStats.diceSides) + monsterStats.atk - stats.def,
    );
    nextPlayer = {
      ...nextPlayer,
      hp: Math.max(0, nextPlayer.hp - monsterDamage),
    };
    logEvents.push({
      msg: "Bạn bị choáng và mất lượt!",
      color: "text-yellow-400",
    });
  } else if (move) {
    const crit = Math.random() * 100 < stats.crit;
    playerDamage = Math.floor(
      (randomInt(stats.diceSides) + stats.atk) * attackMult * (crit ? 1.5 : 1),
    );
    monsterDamage = Math.max(
      0,
      Math.floor(
        (randomInt(monsterStats.diceSides) + monsterStats.atk - stats.def) *
          defendMult *
          (1 +
            ((nextPlayer.effects || []).some(
              (effect: any) => effect.incomingPercent,
            )
              ? 0.2
              : 0)),
      ),
    );
    nextMonster = {
      ...nextMonster,
      hp: Math.max(0, nextMonster.hp - playerDamage),
    };

    if (
      options.playerClassId === "rogue" &&
      Math.random() < 0.2 &&
      options.effectCatalog
    ) {
      nextMonster = applyStatusEffect(
        nextMonster,
        "POISON",
        3,
        options.effectCatalog,
      );
    }

    if (
      options.playerClassId === "mage" &&
      Math.random() < 0.2 &&
      options.effectCatalog
    ) {
      const mageEffect =
        MAGE_EFFECTS[Math.floor(Math.random() * MAGE_EFFECTS.length)];
      nextMonster = applyStatusEffect(
        nextMonster,
        mageEffect,
        2,
        options.effectCatalog,
      );
    }

    if (monsterDamage > 0 && options.shieldEffectId) {
      const shieldIndex = (nextPlayer.effects || []).findIndex(
        (effect: any) => effect.id === options.shieldEffectId,
      );
      if (shieldIndex >= 0) {
        const shield = nextPlayer.effects[shieldIndex];
        const absorb = Math.min(shield.value || 0, monsterDamage);
        monsterDamage -= absorb;
        effectEvents.push(
          createCombatEffect(`BLOCK ${absorb}`, "heal", 68, 70),
        );
        const updatedEffects = [...nextPlayer.effects];
        updatedEffects[shieldIndex] = {
          ...shield,
          value: (shield.value || 0) - absorb,
        };
        nextPlayer = {
          ...nextPlayer,
          effects: updatedEffects.filter(
            (effect: any) => !effect.shieldVal || (effect.value || 0) > 0,
          ),
        };
      }
    }

    nextPlayer = {
      ...nextPlayer,
      hp: Math.max(0, nextPlayer.hp - monsterDamage),
    };
    logEvents.push({
      msg: `${move.name} vs ${monsterMove.name}: ${outcome === "win" ? "thắng thế" : outcome === "lose" ? "lép vế" : "hòa"}.`,
      color:
        outcome === "win"
          ? "text-green-400"
          : outcome === "lose"
            ? "text-red-400"
            : "text-slate-300",
    });
  }

  if (playerDamage > 0)
    effectEvents.push(createCombatEffect(`-${playerDamage}`, "damage", 32, 24));
  if (monsterDamage > 0)
    effectEvents.push(
      createCombatEffect(`-${monsterDamage}`, "damage", 68, 78),
    );

  return {
    outcome,
    damage: { playerToMonster: playerDamage, monsterToPlayer: monsterDamage },
    logEvents,
    effectEvents,
    diceResult: { pMove: move ?? null, mMove: monsterMove, outcome },
    player: nextPlayer,
    monster: nextMonster,
  };
}
