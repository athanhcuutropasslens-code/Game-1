/**
 * Game Type Definitions
 */

import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";

export type GameIcon =
  | LucideIcon
  | ComponentType<{ size?: number; className?: string }>
  | string;
export type EquipmentType = "WEAPON" | "ARMOR" | "ACCESSORY" | "CONSUMABLE";
export type EffectType = "BUFF" | "DEBUFF";
export type RoomKey =
  | "START"
  | "COMBAT"
  | "ELITE"
  | "TREASURE"
  | "SHOP"
  | "BOSS";
export type ConsumableAction =
  | "HEAL"
  | "RESET_POINTS"
  | "APPLY_STRONG_ATK"
  | "APPLY_SHIELD";

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

export interface ItemAffixDefinition {
  id: string;
  name: string;
  stat: keyof PlayerStats;
  val: number;
  type: Array<Exclude<EquipmentType, "CONSUMABLE">>;
}

export interface GameEffect {
  id: string;
  name: string;
  type: EffectType;
  icon?: GameIcon;
  color: string;
  desc: string;
  duration: number;
  uid: string;
  mods?: Partial<PlayerStats>;
  dot?: { type: string; val: number };
  shieldVal?: number;
  value?: number;
  isStun?: boolean;
  incomingPercent?: number;
}

export interface GameEffectDefinition
  extends Omit<GameEffect, "duration" | "uid"> {}

export interface GameItem {
  id: string;
  uid: string;
  name: string;
  type: EquipmentType;
  subType?: string;
  baseCost: number;
  cost: number;
  sellPrice: number;
  rarity: number;
  level: number;
  desc: string;
  icon: GameIcon;
  baseVal?: number;
  baseStats?: Partial<PlayerStats>;
  stats?: Partial<PlayerStats>;
  affixes?: ItemAffixDefinition[];
  useAction?: ConsumableAction;
  descFormat?: (value: number) => string;
}

export interface ItemTemplate
  extends Omit<
    GameItem,
    "uid" | "cost" | "sellPrice" | "level" | "desc" | "stats" | "affixes"
  > {}

export interface PlayerEquipment {
  weapon: GameItem | null;
  armor: GameItem | null;
  accessory: GameItem | null;
}

export interface Player {
  classId: string;
  level: number;
  exp: number;
  nextLevelExp: number;
  hp: number;
  gold: number;
  statPoints: number;
  skillPoints: number;
  baseStats: Partial<PlayerStats>;
  statsAllocated: { str: number; agi: number; vit: number; luk: number };
  skills: Record<string, number>;
  inventory: GameItem[];
  equipment: PlayerEquipment;
  effects: GameEffect[];
}

export interface Monster {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  exp: number;
  gold: number;
  diceSides: number;
  type: "monster" | "boss";
  seed: number;
  effects: GameEffect[];
  roomType?: string;
}

export interface SkillDefinition {
  id: string;
  name: string;
  max: number;
  desc: string;
  type: "PASSIVE";
  mod?: Partial<PlayerStats>;
}

export interface GameClassDefinition {
  id: string;
  name: string;
  icon: GameIcon;
  color: string;
  desc: string;
  baseMod: Partial<PlayerStats>;
  allowed: {
    weapon: string[];
    armor: string[];
  };
  passiveDesc: string;
  skills: SkillDefinition[];
}

export interface MapRoom {
  id: number;
  type: string;
  locked: boolean;
  completed: boolean;
}

export interface Loot {
  exp: number;
  gold: number;
  item?: GameItem;
}

export interface GameZoneDefinition {
  id: string;
  name: string;
  difficulty: number;
  desc: string;
  color: string;
  bg: string;
}

export interface RoomTypeDefinition {
  icon: GameIcon;
  color: string;
  label: string;
}

export interface MoveDefinition {
  id: string;
  name: string;
  icon: string;
  beats: "rock" | "paper" | "scissors";
  color: string;
}

export interface RarityDefinition {
  name: string;
  color: string;
  bg: string;
  affixes: number;
  weight: number;
}

export interface Zone {
  id: string;
  name: string;
  difficulty: number;
  desc: string;
  color: string;
  bg: string;
}

export interface DiceResult {
  p: number;
  m: number;
  outcome: string;
  pMove?: any;
  mMove?: any;
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
