import type { LucideIcon } from "lucide-react";

export type GameEntityId = string;
export type IconLike = LucideIcon | string;

export type EffectKind = "BUFF" | "DEBUFF";
export type DamageOverTimeType = "HP_FLAT" | "HP_PERCENT";
export type ItemType =
  | "WEAPON"
  | "ARMOR"
  | "ACCESSORY"
  | "CONSUMABLE"
  | "SERVICE";
export type EquipmentSlot = "weapon" | "armor" | "accessory";
export type RoomType =
  | "START"
  | "COMBAT"
  | "ELITE"
  | "TREASURE"
  | "SHOP"
  | "BOSS";
export type MonsterKind = "monster" | "boss";
export type CombatOutcome = "player_win" | "monster_win" | "draw";

export interface PlayerStats {
  atk: number;
  def: number;
  maxHp: number;
  crit: number;
  luck: number;
  diceSides: number;
  goldMult: number;
  hpRegen: number;
}

export interface PlayerAttributes {
  str: number;
  agi: number;
  vit: number;
  luk: number;
}

export interface ItemAffix {
  id: string;
  name: string;
  stat: keyof PlayerStats;
  val: number;
  type: ItemType[];
}

export interface EffectTick {
  type: DamageOverTimeType;
  val: number;
}

export interface StatusEffect {
  id: string;
  name: string;
  type: EffectKind;
  icon?: IconLike;
  color: string;
  desc?: string;
  duration: number;
  uid: string;
  mods?: Partial<PlayerStats>;
  dot?: EffectTick;
  shieldVal?: number;
  value?: number;
  isStun?: boolean;
  incomingPercent?: number;
}

export interface ItemUseContext {
  stats: PlayerStats;
  value: number;
}

export interface ItemDefinition {
  id: string;
  name: string;
  type: ItemType;
  subType?: string;
  baseCost: number;
  rarity: number;
  desc?: string;
  icon: IconLike;
  baseStats?: Partial<PlayerStats>;
  baseVal?: number;
  descFormat?: (value: number) => string;
  effect?: (player: PlayerState, ctx: ItemUseContext) => PlayerState;
}

export interface ItemInstance extends ItemDefinition {
  uid: string;
  cost: number;
  sellPrice: number;
  level: number;
  stats?: Partial<PlayerStats>;
  affixes: ItemAffix[];
}

export interface PlayerEquipment {
  weapon: ItemInstance | null;
  armor: ItemInstance | null;
  accessory: ItemInstance | null;
}

export interface PlayerState {
  classId: string;
  level: number;
  exp: number;
  nextLevelExp: number;
  hp: number;
  gold: number;
  statPoints: number;
  skillPoints: number;
  baseStats: Partial<PlayerStats>;
  statsAllocated: PlayerAttributes;
  skills: Record<string, number>;
  inventory: ItemInstance[];
  equipment: PlayerEquipment;
  effects: StatusEffect[];
  maxFloor?: number;
}

export interface MonsterState {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  exp: number;
  gold: number;
  diceSides: number;
  type: MonsterKind;
  seed: number;
  effects: StatusEffect[];
  roomType?: RoomType;
}

export interface LootDrop {
  exp: number;
  gold: number;
  item?: ItemInstance;
}

export interface MapRoom {
  id: number;
  type: RoomType;
  locked: boolean;
  completed: boolean;
}

export interface ZoneDefinition {
  id: string;
  name: string;
  difficulty: number;
  desc: string;
  color: string;
  bg: string;
}

export interface CombatResult {
  playerRoll: number;
  monsterRoll: number;
  outcome: CombatOutcome;
  playerMove?: string;
  monsterMove?: string;
  playerDamage?: number;
  monsterDamage?: number;
}

export interface EffectProcessingResult<T> {
  entity: T;
  isStunned: boolean;
}

export interface FloatingEffect {
  id: string;
  text: string;
  type: "heal" | "damage";
  x: number;
  y: number;
}

export interface AnimState {
  p: string;
  m: string;
}

// Backward-compatible aliases during migration.
export type GameEffect = StatusEffect;
export type GameItem = ItemInstance;
export type Player = PlayerState;
export type Monster = MonsterState;
export type Loot = LootDrop;
export type Zone = ZoneDefinition;
export interface DiceResult extends CombatResult {}
