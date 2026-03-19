/**
 * Game Type Definitions
 */

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

export interface PlayerEquipment {
  weapon: GameItem | null;
  armor: GameItem | null;
  accessory: GameItem | null;
}

export interface GameEffect {
  id: string;
  name: string;
  type: 'BUFF' | 'DEBUFF';
  icon?: any;
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

export interface GameItem {
  id: string;
  uid: string;
  name: string;
  type: 'WEAPON' | 'ARMOR' | 'ACCESSORY' | 'CONSUMABLE';
  subType?: string;
  baseCost: number;
  cost: number;
  sellPrice: number;
  rarity: number;
  level: number;
  desc: string;
  icon: string;
  baseVal?: number;
  descFormat?: (value: number) => string;
  baseStats?: Partial<PlayerStats>;
  stats?: Partial<PlayerStats>;
  affixes?: any[];
  effect?: (player: Player, context: { stats: PlayerStats; value: number }) => Player;
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
  type: 'monster' | 'boss';
  seed: number;
  effects: GameEffect[];
  roomType?: string;
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
  type: 'heal' | 'damage';
  x: number;
  y: number;
}

export interface AnimState {
  p: string;
  m: string;
}
