// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Heart, Shield, Sword, Coins, Skull, 
  ArrowRight, Backpack, Activity, User, X, 
  Store, Hammer, Zap, Shirt, Sparkles, Gift, Lock, Minus, Plus, ChevronRight, ChevronLeft, Droplets, Star, Scroll, Cross, Book, Wand, Package, Syringe, Search, Map as MapIcon, Footprints, Info
} from 'lucide-react';
import PixelItemIcon from '@/components/PixelItemIcon';
import { getConsumableDescription, getConsumableValue } from '@/lib/gameUtils';

// --- CONFIGURATION ---
const ITEMS_PER_PAGE = 20;

const GAME_STATE = {
  MENU: 'MENU',
  CLASS_SELECT: 'CLASS_SELECT',
  ZONE_SELECT: 'ZONE_SELECT',
  MAP: 'MAP',
  COMBAT: 'COMBAT',
  VICTORY: 'VICTORY', 
  GAME_OVER: 'GAME_OVER',
};

const MODAL_STATE = { 
  NONE: 'NONE', 
  INVENTORY: 'INVENTORY', 
  SHOP: 'SHOP', 
  STATS: 'STATS', 
  MONSTER_INFO: 'MONSTER_INFO',
  TRAVEL: 'TRAVEL' 
};

// --- ICONS & UTILS ---
const StarsIcon = ({size, className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M9 3v4"/><path d="M3 5h4"/><path d="M3 9h4"/>
  </svg>
);

const BrokenShieldIcon = ({size, className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="m4.05 11 15.9 0"/>
  </svg>
);

const renderIcon = (Icon, size = 16, className = "") => {
  if (!Icon) return null;
  if (typeof Icon === 'string') return <span style={{fontSize: size}} className={className}>{Icon}</span>;
  const I = Icon;
  return <I size={size} className={className} />;
};

// --- DATA DATABASES ---
const CLASSES_DB = {
  warrior: {
    id: 'warrior', name: 'Chiến Binh', icon: Sword, color: 'text-red-500',
    desc: 'Bậc thầy cận chiến. Sức chống chịu cao.',
    baseMod: { atk: 2, def: 2, maxHp: 30, luck: 0 },
    allowed: { weapon: ['SWORD', 'AXE'], armor: ['HEAVY', 'PLATE'] },
    passiveDesc: 'Khởi đầu trận đấu với lớp Giáp ảo (10).',
    skills: [
      { id: 'bash', name: 'Khiên Thịt', max: 5, desc: '+2 DEF vĩnh viễn', type: 'PASSIVE', mod: { def: 2 } },
      { id: 'frenzy', name: 'Điên Cuồng', max: 3, desc: '+10% Crit Chance', type: 'PASSIVE', mod: { crit: 10 } }
    ]
  },
  rogue: {
    id: 'rogue', name: 'Sát Thủ', icon: Skull, color: 'text-green-400',
    desc: 'Nhanh nhẹn và may mắn. Gây sát thương chí mạng.',
    baseMod: { atk: 4, def: 0, maxHp: -10, luck: 5, crit: 10 },
    allowed: { weapon: ['DAGGER', 'BOW'], armor: ['LIGHT', 'LEATHER'] },
    passiveDesc: 'Đòn đánh có 20% tỉ lệ gây Độc.',
    skills: [
      { id: 'lucky', name: 'Bàn Tay Vàng', max: 5, desc: '+2 LUCK vĩnh viễn', type: 'PASSIVE', mod: { luck: 2 } },
      { id: 'lethal', name: 'Tử Huyệt', max: 3, desc: '+20% Crit Damage (giả lập qua ATK)', type: 'PASSIVE', mod: { atk: 5 } }
    ]
  },
  mage: {
    id: 'mage', name: 'Pháp Sư', icon: Wand, color: 'text-purple-400',
    desc: 'Sức mạnh phép thuật hủy diệt nhưng máu thấp.',
    baseMod: { atk: 8, def: -1, maxHp: -20, luck: 2 },
    allowed: { weapon: ['STAFF', 'WAND'], armor: ['ROBE', 'CLOTH'] },
    passiveDesc: 'Đòn đánh có tỉ lệ gây hiệu ứng ngẫu nhiên.',
    skills: [
      { id: 'glass', name: 'Thủy Tinh', max: 3, desc: '+5 ATK, -10 HP', type: 'PASSIVE', mod: { atk: 5, maxHp: -10 } },
      { id: 'wisdom', name: 'Thông Thái', max: 5, desc: 'Tăng hiệu quả hồi năng lượng (HP Regen)', type: 'PASSIVE', mod: { hpRegen: 2 } }
    ]
  },
  cleric: {
    id: 'cleric', name: 'Mục Sư', icon: Cross, color: 'text-yellow-400',
    desc: 'Khả năng hồi phục và sinh tồn tuyệt vời.',
    baseMod: { atk: 0, def: 3, maxHp: 40, luck: 0 },
    allowed: { weapon: ['MACE', 'STAFF'], armor: ['ROBE', 'PLATE'] },
    passiveDesc: 'Hiệu quả sử dụng thuốc tăng 50%.',
    skills: [
      { id: 'faith', name: 'Đức Tin', max: 5, desc: '+10 Max HP', type: 'PASSIVE', mod: { maxHp: 10 } },
      { id: 'guardian', name: 'Hộ Vệ', max: 3, desc: '+3 DEF', type: 'PASSIVE', mod: { def: 3 } }
    ]
  }
};

const ZONES_DB = [
  { id: 'z_forest', name: 'Rừng Độc', difficulty: 0, desc: 'Quái vật gây Độc.', color: 'text-green-400', bg: 'from-green-900 to-slate-900' },
  { id: 'z_ruins', name: 'Tàn Tích', difficulty: 2, desc: 'Quái vật gây Choáng.', color: 'text-yellow-400', bg: 'from-yellow-900 to-slate-900' },
  { id: 'z_dungeon', name: 'Hầm Ngục', difficulty: 5, desc: 'Quái vật gây Suy Yếu.', color: 'text-purple-400', bg: 'from-purple-900 to-slate-900' },
  { id: 'z_hell', name: 'Địa Ngục', difficulty: 10, desc: 'Thử thách cực đại.', color: 'text-red-500', bg: 'from-red-900 to-orange-900' },
];

const EFFECTS_DB = {
  STRONG_ATK: { id: 'eff_strong', name: 'Tăng Lực', type: 'BUFF', icon: Sword, color: 'text-red-400', desc: '+5 ATK', mods: { atk: 5 } },
  REGEN: { id: 'eff_regen', name: 'Hồi Phục', type: 'BUFF', icon: Heart, color: 'text-pink-400', desc: '+3 HP/lượt', dot: { type: 'HP_FLAT', val: 3 } },
  POISON: { id: 'eff_poison', name: 'Trúng Độc', type: 'DEBUFF', icon: Droplets, color: 'text-green-400', desc: '-4 HP/lượt', dot: { type: 'HP_FLAT', val: -4 } },
  SHIELD: { id: 'eff_shield', name: 'Lá Chắn', type: 'BUFF', icon: Shield, color: 'text-blue-300', desc: 'Hấp thụ 20 ST', shieldVal: 20 },
  STUN: { id: 'eff_stun', name: 'Choáng', type: 'DEBUFF', icon: StarsIcon, color: 'text-yellow-400', desc: 'Mất lượt', isStun: true },
  VULNERABLE: { id: 'eff_vuln', name: 'Suy Yếu', type: 'DEBUFF', icon: BrokenShieldIcon, color: 'text-purple-400', desc: '+20% ST nhận vào', incomingPercent: 20 },
};

const ROOM_TYPES = {
  START: { icon: ArrowRight, color: 'text-white', label: 'Lối Vào' },
  COMBAT: { icon: Sword, color: 'text-slate-300', label: 'Quái Vật' },
  ELITE: { icon: Skull, color: 'text-red-400', label: 'Tinh Anh' },
  TREASURE: { icon: Gift, color: 'text-yellow-400', label: 'Kho Báu' },
  SHOP: { icon: Store, color: 'text-blue-400', label: 'Cửa Hàng' },
  BOSS: { icon: Zap, color: 'text-purple-500', label: 'TRÙM' },
};

const MOVES = {
  ROCK: { id: 'rock', name: 'Búa', icon: '✊', beats: 'scissors', color: 'text-orange-500' },
  PAPER: { id: 'paper', name: 'Bao', icon: '✋', beats: 'rock', color: 'text-green-500' },
  SCISSORS: { id: 'scissors', name: 'Kéo', icon: '✌️', beats: 'paper', color: 'text-blue-500' }
};

const RARITY_CONFIG = {
  1: { name: 'Thường', color: 'border-slate-500 text-slate-300', bg: 'bg-slate-800', affixes: 0, weight: 60 },
  2: { name: 'Hiếm', color: 'border-green-500 text-green-400', bg: 'bg-slate-800', affixes: 1, weight: 30 },
  3: { name: 'Cao Cấp', color: 'border-blue-500 text-blue-400', bg: 'bg-slate-900', affixes: 2, weight: 15 },
  4: { name: 'Sử Thi', color: 'border-purple-500 text-purple-400', bg: 'bg-slate-900', affixes: 3, weight: 5 },
  5: { name: 'Huyền Thoại', color: 'border-orange-500 text-orange-400', bg: 'bg-slate-950', affixes: 4, weight: 1 },
};

const AFFIX_DB = [
  { id: 'sharp', name: 'Sắc Bén', stat: 'atk', val: 1, type: ['WEAPON'] },
  { id: 'heavy', name: 'Nặng Ký', stat: 'atk', val: 2, type: ['WEAPON'] },
  { id: 'lethal', name: 'Chí Mạng', stat: 'crit', val: 3, type: ['WEAPON', 'ACCESSORY'] },
  { id: 'hard', name: 'Cứng Cáp', stat: 'def', val: 1, type: ['ARMOR'] },
  { id: 'vital', name: 'Sinh Lực', stat: 'maxHp', val: 10, type: ['ARMOR', 'ACCESSORY'] },
  { id: 'lucky', name: 'May Mắn', stat: 'luck', val: 1, type: ['ACCESSORY', 'WEAPON'] },
];

const ITEMS_DB = [
  // Healing & Utility
  { id: 'pot_small', name: 'Bình Máu Nhỏ', type: 'CONSUMABLE', baseCost: 20, rarity: 1, baseVal: 30, descFormat: (val) => `Hồi ${val} HP`, effect: (p, ctx) => ({ ...p, hp: Math.min(ctx.stats.maxHp, p.hp + ctx.value) }), icon: Heart },
  { id: 'pot_large', name: 'Bình Máu Lớn', type: 'CONSUMABLE', baseCost: 50, rarity: 2, baseVal: 80, descFormat: (val) => `Hồi ${val} HP`, effect: (p, ctx) => ({ ...p, hp: Math.min(ctx.stats.maxHp, p.hp + ctx.value) }), icon: Heart },
  { id: 'respec', name: 'Sách Lãng Quên', type: 'CONSUMABLE', baseCost: 500, rarity: 4, baseVal: 0, descFormat: () => 'Hoàn trả toàn bộ điểm chỉ số và kỹ năng', effect: (p) => resetPoints(p), icon: Book },
  
  // Buffs
  { id: 'pot_str', name: 'Thuốc Sức Mạnh', type: 'CONSUMABLE', baseCost: 40, rarity: 2, baseVal: 5, descFormat: (val) => `+${val} ATK trong 3 lượt`, effect: (p, ctx) => applyStatusEffect(p, 'STRONG_ATK', 3, ctx.value), icon: Sword },
  { id: 'scroll_shield', name: 'Cuộn Bảo Vệ', type: 'CONSUMABLE', baseCost: 60, rarity: 3, baseVal: 20, descFormat: (val) => `Tạo lá chắn ${val} sát thương`, effect: (p, ctx) => applyStatusEffect(p, 'SHIELD', 99, ctx.value), icon: Scroll },

  // Equipment
  { id: 'w_sword', name: 'Kiếm Sắt', type: 'WEAPON', subType: 'SWORD', baseCost: 50, rarity: 1, baseStats: { atk: 4 }, icon: Sword },
  { id: 'w_axe', name: 'Rìu Chiến', type: 'WEAPON', subType: 'AXE', baseCost: 60, rarity: 2, baseStats: { atk: 6 }, icon: Hammer },
  { id: 'w_dagger', name: 'Dao Găm', type: 'WEAPON', subType: 'DAGGER', baseCost: 40, rarity: 1, baseStats: { atk: 3, crit: 5 }, icon: Sword },
  { id: 'w_staff', name: 'Gậy Phép', type: 'WEAPON', subType: 'STAFF', baseCost: 55, rarity: 2, baseStats: { atk: 5 }, icon: Wand },
  
  { id: 'a_plate', name: 'Giáp Tấm', type: 'ARMOR', subType: 'PLATE', baseCost: 80, rarity: 2, baseStats: { def: 4, maxHp: 20 }, icon: Shield },
  { id: 'a_robe', name: 'Áo Vải', type: 'ARMOR', subType: 'ROBE', baseCost: 30, rarity: 1, baseStats: { def: 1, maxHp: 10 }, icon: Shirt },
  { id: 'a_leather', name: 'Giáp Da', type: 'ARMOR', subType: 'LEATHER', baseCost: 40, rarity: 1, baseStats: { def: 2, maxHp: 15 }, icon: Shirt },
  
  { id: 'ac_ring', name: 'Nhẫn Lực', type: 'ACCESSORY', baseCost: 100, rarity: 2, baseStats: { atk: 2, luck: 1 }, icon: Star },
];

const MONSTER_PREFIXES = ["Hư Không", "Bóng Tối", "Rực Lửa", "Băng Giá", "Độc Dược", "Cuồng Nộ", "Cổ Đại"];
const MONSTER_TYPES = ["Slime", "Goblin", "Bộ Xương", "Dơi", "Sói", "Orc", "Phù Thủy", "Golem", "Rồng"];
const MONSTER_TYPE_MAP = {
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

const SPRITE_MODE = 'sheet';
const CLASS_SPRITE_IDS = ['warrior', 'rogue', 'mage', 'cleric'];

// --- LOGIC FUNCTIONS ---
const randomId = () => Math.random().toString(36).substring(2, 11);
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const findZone = (zoneId) => ZONES_DB.find((z) => z.id === zoneId) || ZONES_DB[0];

const processEffects = (entity, maxHp) => {
  let hp = entity.hp;
  let isStunned = false;
  const nextEffects = [];

  (entity.effects || []).forEach((eff) => {
    if (eff.dot?.type === 'HP_FLAT') hp = clamp(hp + eff.dot.val, 0, maxHp);
    if (eff.dot?.type === 'HP_PERCENT') hp = clamp(hp + Math.floor(maxHp * eff.dot.val), 0, maxHp);
    if (eff.isStun) isStunned = true;

    const nextDuration = (eff.duration ?? 1) - 1;
    const shieldRemaining = eff.shieldVal ? (eff.value ?? eff.shieldVal) : eff.value;
    if (nextDuration > 0 || (eff.shieldVal && shieldRemaining > 0)) {
      nextEffects.push({ ...eff, duration: nextDuration, value: shieldRemaining });
    }
  });

  return { entity: { ...entity, hp, effects: nextEffects }, isStunned };
};

const resetPoints = (player) => {
  const totalStats = Object.values(player.statsAllocated).reduce((a, b) => a + b, 0);
  const totalSkills = Object.values(player.skills).reduce((a, b) => a + b, 0);
  return {
    ...player,
    statPoints: player.statPoints + totalStats,
    skillPoints: player.skillPoints + totalSkills,
    statsAllocated: { str: 0, agi: 0, vit: 0, luk: 0 },
    skills: {},
  };
};

const applyStatusEffect = (entity, effectKey, duration, overrideVal = null) => {
  const effectDef = EFFECTS_DB[effectKey];
  if (!effectDef) return entity;
  const existingIdx = (entity.effects || []).findIndex((e) => e.id === effectDef.id);
  const nextEffects = [...(entity.effects || [])];
  const value = overrideVal ?? effectDef.shieldVal ?? effectDef.dot?.val ?? null;

  if (existingIdx >= 0) {
    nextEffects[existingIdx] = { ...nextEffects[existingIdx], duration, value: value ?? nextEffects[existingIdx].value };
  } else {
    nextEffects.push({ ...effectDef, duration, uid: randomId(), value });
  }

  return { ...entity, effects: nextEffects };
};

const calculateCost = (item) => {
  const lvl = item.level || 1;
  return Math.floor(item.baseCost * Math.pow(lvl, 1.25));
};

const getItemStats = (item) => {
  if (item.type === 'CONSUMABLE' || !item.baseStats) return {};
  const lvl = item.level || 1;
  const statScale = 1 + 0.12 * (lvl - 1);
  const affixScale = 1 + 0.12 * (lvl - 1);
  let stats = {};
  Object.keys(item.baseStats).forEach(key => { 
    stats[key] = Math.floor(item.baseStats[key] * statScale); 
  });
  if (item.affixes) { 
    item.affixes.forEach(affix => { 
      const val = Math.floor(affix.val * affixScale); 
      stats[affix.stat] = (stats[affix.stat] || 0) + val; 
    }); 
  }
  return stats;
};

const computeFullStats = (player, tempAlloc = null) => {
  const { baseStats, equipment, statsAllocated, skills, effects = [], classId } = player;
  const alloc = tempAlloc || statsAllocated;
  const classMod = (classId && CLASSES_DB[classId]) ? CLASSES_DB[classId].baseMod : {};
  
  const breakdown = {
    atk: { base: baseStats.atk + (classMod.atk||0), equip: 0, alloc: 0, skill: 0, buff: 0, percent: 0, total: 0 },
    def: { base: baseStats.def + (classMod.def||0), equip: 0, alloc: 0, skill: 0, buff: 0, percent: 0, total: 0 },
    luck: { base: baseStats.luck + (classMod.luck||0), equip: 0, alloc: 0, skill: 0, buff: 0, percent: 0, total: 0 },
    maxHp: { base: baseStats.maxHp + (classMod.maxHp||0), equip: 0, alloc: 0, skill: 0, buff: 0, percent: 0, total: 0 },
    crit: { base: 5 + (classMod.crit||0), equip: 0, alloc: 0, skill: 0, buff: 0, percent: 0, total: 0 },
    diceSides: { base: baseStats.diceSides, equip: 0, alloc: 0, skill: 0, buff: 0, percent: 0, total: 0 },
    goldMult: { base: 100, equip: 0, alloc: 0, skill: 0, buff: 0, percent: 0, total: 0 }
  };

  breakdown.atk.alloc = alloc.str * 1;
  breakdown.def.alloc = Math.floor(alloc.agi * 0.5);
  breakdown.maxHp.alloc = alloc.vit * 5;
  breakdown.luck.alloc = alloc.luk * 1;

  Object.values(equipment).forEach(item => { 
    if (item) { 
      const iStats = getItemStats(item); 
      Object.keys(iStats).forEach(k => { 
        if (breakdown[k]) breakdown[k].equip += iStats[k]; 
      }); 
    } 
  });

  if (classId && CLASSES_DB[classId]) { 
    CLASSES_DB[classId].skills.forEach(sk => { 
      const lvl = skills[sk.id] || 0; 
      if (lvl > 0 && sk.mod) { 
        Object.keys(sk.mod).forEach(k => { 
          if (breakdown[k]) breakdown[k].skill += sk.mod[k] * lvl; 
        }); 
      } 
    }); 
  }

  effects.forEach(eff => { 
    if (eff.mods) { 
      Object.entries(eff.mods).forEach(([key, val]) => { 
        if (key.endsWith('Percent')) { 
          const statKey = key.replace('Percent', ''); 
          if (breakdown[statKey]) breakdown[statKey].percent += val; 
        } else { 
          if (breakdown[key]) breakdown[key].buff += val; 
        } 
      }); 
    } 
  });

  const result = {};
  Object.keys(breakdown).forEach(key => { 
    let flat = breakdown[key].base + breakdown[key].equip + breakdown[key].alloc + breakdown[key].skill + breakdown[key].buff; 
    const multiplier = 1 + (breakdown[key].percent / 100); 
    result[key] = Math.floor(flat * multiplier); 
    breakdown[key].total = result[key]; 
  });
  return { final: result, breakdown };
};

const rollRarity = (floor) => { 
  const bonus = Math.floor(floor * 1.5); 
  const roll = Math.random() * 100 + bonus; 
  if (roll > 110) return 5; 
  if (roll > 95) return 4; 
  if (roll > 80) return 3; 
  if (roll > 50) return 2; 
  return 1; 
};

const generateItem = (baseItem, level = 1, forceRarity = null) => {
  const item = { ...baseItem, uid: randomId(), level, rarity: forceRarity || baseItem.rarity || rollRarity(level) };

  if (item.type !== 'CONSUMABLE' && item.type !== 'SERVICE') {
    const config = RARITY_CONFIG[item.rarity] || RARITY_CONFIG[1];
    const availableAffixes = AFFIX_DB.filter((a) => a.type.includes(item.type));
    const used = new Set();
    item.affixes = [];
    for (let i = 0; i < config.affixes; i++) {
      const pool = availableAffixes.filter((a) => !used.has(a.id));
      if (!pool.length) break;
      const picked = { ...pool[Math.floor(Math.random() * pool.length)] };
      used.add(picked.id);
      item.affixes.push(picked);
    }
  }

  item.cost = calculateCost(item);
  item.sellPrice = Math.floor(item.cost * 0.45);
  return item;
};

const isItemUsableByClass = (item, classId) => {
  if (item.type === 'CONSUMABLE' || item.type === 'SERVICE' || item.type === 'ACCESSORY') return true;
  const allowed = CLASSES_DB[classId]?.allowed; 
  if (!allowed) return true;
  const slot = item.type === 'WEAPON' ? 'weapon' : 'armor'; 
  return allowed[slot]?.includes(item.subType);
};

const generateLoot = (zoneId, floor, roomType, playerClass, luck = 0) => {
  let goldBase = 10 * floor;
  let xpBase = 10 * floor;
  let itemChance = 0.3;
  let itemRarity = 1;

  if (roomType === 'ELITE') { goldBase *= 2; xpBase *= 2; itemChance = 0.6; itemRarity = Math.max(2, rollRarity(floor)); }
  if (roomType === 'BOSS') { goldBase *= 5; xpBase *= 5; itemChance = 1; itemRarity = Math.max(3, rollRarity(floor + 5)); }
  if (roomType === 'TREASURE') { goldBase *= 3; itemChance = 1; itemRarity = Math.max(2, rollRarity(floor)); }

  const luckFactor = 1 + luck * 0.015;
  const gold = Math.floor(goldBase * (0.8 + Math.random() * 0.4) * luckFactor);
  const exp = Math.floor(xpBase * (1 + luck * 0.005));
  let item = null;

  if (Math.random() < Math.min(1, itemChance + luck * 0.01)) {
    const usableItems = ITEMS_DB.filter((i) => isItemUsableByClass(i, playerClass));
    if (usableItems.length > 0) item = generateItem(usableItems[Math.floor(Math.random() * usableItems.length)], floor, itemRarity);
  }

  return { gold, exp, item };
};

const generateShop = (floor, playerClass) => {
  const items = [generateItem(ITEMS_DB[0], 1, 1), generateItem(ITEMS_DB[1], 1, 2)];
  const usableEquip = ITEMS_DB.filter((i) => !['CONSUMABLE', 'SERVICE'].includes(i.type) && isItemUsableByClass(i, playerClass));
  const weapons = usableEquip.filter((i) => i.type === 'WEAPON');
  const armors = usableEquip.filter((i) => i.type === 'ARMOR');
  const accessories = usableEquip.filter((i) => i.type === 'ACCESSORY');
  if (weapons.length) items.push(generateItem(weapons[Math.floor(Math.random() * weapons.length)], floor));
  if (armors.length) items.push(generateItem(armors[Math.floor(Math.random() * armors.length)], floor));
  const misc = [...accessories, ...usableEquip];
  for (let i = 0; i < 2 + Math.floor(floor / 4); i++) {
    const base = misc[Math.floor(Math.random() * misc.length)];
    items.push(generateItem(base, Math.max(1, floor + Math.floor(Math.random() * 2)), Math.min(4, rollRarity(floor))));
  }
  items.push({ id: 'srv_heal', name: 'Hồi Phục', type: 'SERVICE', cost: 10 + floor * 5, icon: Syringe, desc: 'Hồi đầy HP', rarity: 2, uid: `service_heal_${Date.now()}`, baseCost: 10 + floor * 5 });
  items.push({ id: 'srv_box', name: 'Hộp Bí Ẩn', type: 'SERVICE', cost: 50 + floor * 10, icon: Package, desc: 'Nhận vật phẩm ngẫu nhiên hiếm', rarity: 3, uid: `service_box_${Date.now()}`, baseCost: 50 + floor * 10 });
  return items;
};

const generateMonster = (floor, roomType, zoneData) => {
  const prefix = MONSTER_PREFIXES[Math.floor(Math.random() * MONSTER_PREFIXES.length)];
  const type = MONSTER_TYPES[Math.floor(Math.random() * MONSTER_TYPES.length)];
  const normalizedType = MONSTER_TYPE_MAP[type.toLowerCase()] || 'slime';
  const isElite = roomType === 'ELITE';
  const isBoss = roomType === 'BOSS';
  const roomFactor = isBoss ? 2.5 : isElite ? 1.5 : 1;
  const baseHp = Math.floor((24 + floor * 12 + zoneData.difficulty * 6) * roomFactor);
  const baseAtk = Math.floor((5 + floor * 2 + zoneData.difficulty) * roomFactor);
  let monster = { uid: randomId(), name: `${prefix} ${type}`, hp: baseHp, maxHp: baseHp, atk: baseAtk, diceSides: 6 + Math.min(4, Math.floor(floor / 4)), seed: Math.random() * 1000, type: normalizedType, tier: isBoss ? 'boss' : (isElite ? 'elite' : 'normal'), entityType: isBoss ? 'boss' : 'monster', roomType, effects: [] };
  if (zoneData.id === 'z_forest' && Math.random() < 0.3) monster = applyStatusEffect(monster, 'POISON', 3);
  if (zoneData.id === 'z_ruins' && Math.random() < 0.3) monster = applyStatusEffect(monster, 'STUN', 1);
  if (zoneData.id === 'z_dungeon' && Math.random() < 0.3) monster = applyStatusEffect(monster, 'VULNERABLE', 3);
  return monster;
};

const generateMap = (floor, zoneId, isCleared = false) => {
  const numRooms = 6 + Math.floor(Math.random() * 4);
  const shopIndex = Math.max(2, Math.floor(numRooms / 2));
  const rooms = [{ id: 0, type: 'START', completed: true, locked: false }];
  for (let i = 1; i < numRooms - 1; i++) {
    let type = 'COMBAT';
    const rand = Math.random();
    if (i === shopIndex) type = 'SHOP';
    else if (rand < 0.15) type = 'TREASURE';
    else if (rand < 0.45) type = 'ELITE';
    const completed = isCleared && ['COMBAT','ELITE','BOSS'].includes(type);
    rooms.push({ id: i, type, completed, locked: isCleared ? false : i !== 1 });
  }
  rooms.push({ id: numRooms - 1, type: 'BOSS', completed: isCleared, locked: !isCleared });
  return rooms;
};

// --- COMPONENTS ---
const PixelAvatar = ({ seed, size = 100, type = 'hero', isDead = false }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current; 
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d'); 
    const gridSize = 12; 
    const pixelSize = canvas.width / gridSize;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let colors = [];
    if (type === 'hero') colors = ['#3b82f6', '#1d4ed8', '#93c5fd', '#fcd34d'];
    else if (type === 'monster') colors = ['#ef4444', '#7f1d1d', '#10b981', '#7c3aed', '#f59e0b'];
    else if (type === 'boss') colors = ['#7c3aed', '#4c1d95', '#c4b5fd', '#ffffff'];
    
    const random = (s) => { 
      const x = Math.sin(s) * 10000; 
      return x - Math.floor(x); 
    };
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize / 2; x++) {
        if (random(seed + x * y * 13) > 0.5) {
          const color = colors[Math.floor(random(seed + x + y) * colors.length)];
          ctx.fillStyle = isDead ? '#4b5563' : color;
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize); 
          ctx.fillRect((gridSize - 1 - x) * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }, [seed, type, isDead]);
  
  return <canvas ref={canvasRef} width={120} height={120} style={{ width: size, height: size, imageRendering: 'pixelated' }} className="drop-shadow-lg" />;
};



const SpriteSheetAvatar = ({
  size = 100,
  variant,
  id,
  tier = 'normal',
  isDead = false,
  isHit = false,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frameSize = 16;
    const frameCount = 3;
    const activeFrame = isDead ? 2 : (Math.floor(Date.now() / 150) % frameCount);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    const drawPx = (x, y, color) => {
      ctx.fillStyle = color;
      const offset = activeFrame * 0.25;
      ctx.fillRect((x + offset) * (canvas.width / frameSize), y * (canvas.height / frameSize), canvas.width / frameSize, canvas.height / frameSize);
    };

    const heroPalette = {
      warrior: { body: '#94a3b8', accent: '#f59e0b', weapon: '#dc2626', shadow: '#1f2937' },
      rogue: { body: '#16a34a', accent: '#84cc16', weapon: '#f1f5f9', shadow: '#14532d' },
      mage: { body: '#9333ea', accent: '#38bdf8', weapon: '#f8fafc', shadow: '#312e81' },
      cleric: { body: '#e2e8f0', accent: '#facc15', weapon: '#60a5fa', shadow: '#334155' },
    };

    const monsterPalette = {
      slime: ['#34d399', '#059669', '#a7f3d0'],
      goblin: ['#84cc16', '#3f6212', '#facc15'],
      skeleton: ['#f8fafc', '#9ca3af', '#1f2937'],
      bat: ['#a78bfa', '#6d28d9', '#f472b6'],
      wolf: ['#9ca3af', '#374151', '#ef4444'],
      orc: ['#65a30d', '#365314', '#b45309'],
      witch: ['#7c3aed', '#1d4ed8', '#ec4899'],
      golem: ['#6b7280', '#374151', '#f97316'],
      dragon: ['#ef4444', '#7f1d1d', '#f59e0b'],
    };

    const tierGlow = {
      normal: '#ffffff',
      elite: '#fde047',
      boss: '#c084fc',
    };

    if (variant === 'hero') {
      const pal = heroPalette[id] || heroPalette.warrior;
      const weaponPose = {
        warrior: [[11, 6], [12, 5], [13, 4]],
        rogue: [[11, 8], [12, 9]],
        mage: [[11, 3], [12, 2], [12, 1]],
        cleric: [[11, 6], [12, 6], [12, 7], [12, 8]],
      };

      for (let y = 4; y <= 9; y++) {
        for (let x = 6; x <= 9; x++) drawPx(x, y, pal.body);
      }
      drawPx(7, 3, pal.accent);
      drawPx(8, 3, pal.accent);
      drawPx(6, 6, pal.accent);
      drawPx(9, 6, pal.accent);
      drawPx(6, 10 + (activeFrame === 1 ? 1 : 0), pal.shadow);
      drawPx(9, 10 + (activeFrame === 2 ? 1 : 0), pal.shadow);
      (weaponPose[id] || weaponPose.warrior).forEach(([x, y]) => drawPx(x, y, pal.weapon));
    } else {
      const pal = monsterPalette[id] || monsterPalette.slime;
      const shape = {
        slime: [[6, 11], [7, 11], [8, 11], [5, 10], [9, 10], [5, 9], [6, 9], [7, 9], [8, 9], [9, 9], [6, 8], [8, 8]],
        goblin: [[6, 3], [7, 3], [8, 3], [5, 4], [9, 4], [6, 5], [8, 5], [6, 7], [8, 7], [5, 9], [9, 9]],
        skeleton: [[6, 3], [8, 3], [6, 4], [7, 4], [8, 4], [6, 6], [8, 6], [5, 8], [9, 8], [5, 10], [9, 10]],
        bat: [[5, 6], [6, 5], [7, 6], [8, 5], [9, 6], [6, 7], [8, 7], [7, 8]],
        wolf: [[5, 6], [6, 5], [7, 5], [8, 5], [9, 6], [6, 7], [8, 7], [5, 9], [9, 9]],
        orc: [[6, 3], [7, 3], [8, 3], [5, 5], [9, 5], [5, 7], [9, 7], [6, 9], [8, 9], [5, 11], [9, 11]],
        witch: [[6, 2], [7, 2], [8, 2], [6, 4], [8, 4], [6, 6], [8, 6], [5, 8], [9, 8], [7, 10], [11, 4]],
        golem: [[5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [5, 5], [9, 5], [5, 7], [9, 7], [5, 9], [9, 9]],
        dragon: [[5, 3], [6, 2], [7, 3], [8, 2], [9, 3], [6, 5], [8, 5], [5, 7], [9, 7], [6, 9], [8, 9], [10, 4]],
      };

      (shape[id] || shape.slime).forEach(([x, y], idx) => drawPx(x, y + (activeFrame === 1 ? -1 : 0), pal[idx % pal.length]));
      drawPx(6, 6, '#111827');
      drawPx(8, 6, '#111827');
      if (tier !== 'normal') {
        drawPx(7, 1, tierGlow[tier] || tierGlow.normal);
        drawPx(6, 2, tierGlow[tier] || tierGlow.normal);
        drawPx(8, 2, tierGlow[tier] || tierGlow.normal);
      }
    }
  }, [variant, id, tier, isDead]);

  return (
    <canvas
      ref={canvasRef}
      width={128}
      height={128}
      style={{ width: size, height: size, imageRendering: 'pixelated' }}
      className={`drop-shadow-lg transition-all duration-200 ${isHit ? 'animate-pulse brightness-150 saturate-150' : ''} ${isDead ? 'grayscale opacity-60' : ''}`}
    />
  );
};

const CombatAvatar = ({ size, seed, role, classId, monsterType, roomType, isDead, isHit }) => {
  const tier = roomType === 'BOSS' ? 'boss' : roomType === 'ELITE' ? 'elite' : 'normal';
  const useSheet = SPRITE_MODE === 'sheet' && (
    (role === 'hero' && CLASS_SPRITE_IDS.includes(classId)) ||
    (role === 'monster' && !!monsterType)
  );

  if (!useSheet) {
    return <PixelAvatar seed={seed} size={size} type={role === 'hero' ? 'hero' : roomType === 'BOSS' ? 'boss' : 'monster'} isDead={isDead} />;
  }

  if (role === 'hero') {
    return <SpriteSheetAvatar size={size} variant="hero" id={classId} isDead={isDead} isHit={isHit} />;
  }

  return <SpriteSheetAvatar size={size} variant="monster" id={monsterType} tier={tier} isDead={isDead} isHit={isHit} />;
};

const StatAllocationRowDetailed = ({ label, code, val, tempVal, breakdownKey, icon, player, statBreakdown, expandedStat, setExpandedStat }) => {
  const bd = statBreakdown[breakdownKey];
  const diff = (tempVal !== undefined && player) ? tempVal - player.statsAllocated[code] : 0;
  const finalVal = val + (code === 'def' ? Math.floor(diff * 0.5) : code === 'maxHp' ? diff * 5 : diff);
  const isExpanded = expandedStat === breakdownKey;

  return (
    <div className="bg-slate-800 rounded border border-slate-700 overflow-hidden mb-2 transition-all">
      <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-slate-700" onClick={() => setExpandedStat(isExpanded ? null : breakdownKey)}>
        <div className="flex items-center gap-2 text-slate-300 font-bold text-xs">
          {icon} {label}
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-bold ${diff > 0 ? 'text-green-400' : 'text-white'}`}>
            {finalVal}
          </span>
          {diff > 0 && (
            <span className="text-[10px] text-green-400">
              (+{diff * (code === 'maxHp' ? 5 : code === 'def' ? 0.5 : 1)})
            </span>
          )}
          <ChevronRight size={14} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}/>
        </div>
      </div>
      {isExpanded && bd && (
        <div className="bg-slate-900/50 p-2 text-[10px] space-y-1 border-t border-slate-700 animate-in slide-in-from-top-2">
          <div className="flex justify-between">
            <span>Cơ bản:</span>
            <span className="text-white">{bd.base}</span>
          </div>
          <div className="flex justify-between">
            <span>Điểm cộng:</span>
            <span className="text-yellow-400">+{bd.alloc}</span>
          </div>
          <div className="flex justify-between">
            <span>Trang bị:</span>
            <span className="text-blue-400">+{bd.equip}</span>
          </div>
          <div className="flex justify-between">
            <span>Kỹ năng & Buff:</span>
            <span className="text-green-400">+{bd.skill + bd.buff}</span>
          </div>
          {bd.percent !== 0 && (
            <div className="flex justify-between border-t border-slate-700 pt-1 mt-1">
              <span>Bonus %:</span>
              <span className="text-purple-400">+{bd.percent}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- MAIN APP ---
function Game() {
  const [gameState, setGameState] = useState(GAME_STATE.MENU);
  const [activeModal, setActiveModal] = useState(MODAL_STATE.NONE);
  const [logs, setLogs] = useState([]);
  const [effects, setEffects] = useState([]); 
  const [shopItems, setShopItems] = useState([]);
  const [loot, setLoot] = useState(null);
  const [expandedStat, setExpandedStat] = useState(null);
  const [tempStats, setTempStats] = useState(null);
  const [tempStatPoints, setTempStatPoints] = useState(0);
  const [statsTab, setStatsTab] = useState('STATS');
  const [zone, setZone] = useState(ZONES_DB[0]);
  const [floor, setFloor] = useState(1);
  const [mapRooms, setMapRooms] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(0);
  const [inventoryPage, setInventoryPage] = useState(0);
  const [selectionUID, setSelectionUID] = useState(null);

  const [player, setPlayer] = useState({ 
    classId: null, 
    level: 1, 
    exp: 0, 
    nextLevelExp: 100, 
    statPoints: 0, 
    skillPoints: 0, 
    hp: 100, 
    gold: 100, 
    baseStats: { maxHp: 100, atk: 2, def: 0, luck: 0, diceSides: 6 }, 
    statsAllocated: { str: 0, agi: 0, vit: 0, luk: 0 }, 
    skills: {}, 
    effects: [], 
    inventory: [], 
    equipment: { weapon: null, armor: null, accessory: null }, 
    seed: Math.floor(Math.random() * 10000),
    maxFloor: 1
  });
  
  const [monster, setMonster] = useState(null);
  const [animState, setAnimState] = useState({ p: '', m: '' });
  const [hitState, setHitState] = useState({ p: false, m: false });
  const [diceResult, setDiceResult] = useState(null);

  const { final: stats, breakdown: statBreakdown } = useMemo(() => computeFullStats(player, tempStats), [player, tempStats]);
  const { final: currentRealStats } = useMemo(() => computeFullStats(player), [player]);
  const allSelectableItems = useMemo(() => [...player.inventory, ...Object.entries(player.equipment).filter(([,item]) => item).map(([slot, item]) => ({ ...item, isEquipped: true, slot }))], [player.inventory, player.equipment]);
  const selectedItem = useMemo(() => allSelectableItems.find((item) => item.uid === selectionUID) || null, [allSelectableItems, selectionUID]);

  useEffect(() => {
    if (selectionUID && !selectedItem) setSelectionUID(null);
  }, [selectionUID, selectedItem]);

  const addLog = useCallback((msg, color = 'text-slate-300') => {
    const id = Date.now() + Math.random();
    setLogs(prev => [{ id, msg, color }, ...prev].slice(0, 5));
    setTimeout(() => {
      setLogs(prev => prev.filter(log => log.id !== id));
    }, 3000);
  }, []);

  const addEffect = useCallback((text, type = 'damage', x = 50, y = 50) => {
    const id = Date.now() + Math.random();
    setEffects(prev => [...prev, { id, text, type, x, y }]);
    setTimeout(() => setEffects(prev => prev.filter(e => e.id !== id)), 1000);
  }, []);

  // --- GAME ACTIONS ---
  const runTickEffects = useCallback((entity, isPlayer = false, maxHpOverride = null) => {
    const maxHp = maxHpOverride ?? (isPlayer ? currentRealStats.maxHp : entity.maxHp);
    const beforeHp = entity.hp;
    const { entity: processed, isStunned } = processEffects(entity, maxHp);
    const delta = processed.hp - beforeHp;
    if (delta !== 0) addEffect(`${delta > 0 ? '+' : ''}${delta}`, delta > 0 ? 'heal' : 'damage', isPlayer ? 68 : 32, isPlayer ? 78 : 24);
    return { entity: processed, isStunned };
  }, [addEffect, currentRealStats.maxHp]);


  const initGame = useCallback(() => {
    setPlayer({ classId: null, level: 1, exp: 0, nextLevelExp: 100, statPoints: 0, skillPoints: 0, hp: 100, gold: 100, baseStats: { maxHp: 100, atk: 2, def: 0, luck: 0, diceSides: 6 }, statsAllocated: { str: 0, agi: 0, vit: 0, luk: 0 }, skills: {}, effects: [], inventory: [], equipment: { weapon: null, armor: null, accessory: null }, seed: Math.floor(Math.random() * 10000), maxFloor: 1 });
    setSelectionUID(null);
    setLoot(null);
    setMonster(null);
    setFloor(1);
    setGameState(GAME_STATE.CLASS_SELECT);
    addLog('Bắt đầu game mới!');
  }, [addLog]);

  const selectClass = useCallback((cId) => {
    const starterWepId = cId === 'rogue' ? 'w_dagger' : cId === 'mage' || cId === 'cleric' ? 'w_staff' : cId === 'warrior' ? 'w_axe' : 'w_sword';
    const starterArmId = cId === 'warrior' ? 'a_plate' : (cId === 'mage' || cId === 'cleric' ? 'a_robe' : 'a_leather');
    const weaponBase = ITEMS_DB.find((i) => i.id === starterWepId) || ITEMS_DB[5];
    const armorBase = ITEMS_DB.find((i) => i.id === starterArmId) || ITEMS_DB[9];
    let nextPlayer = { ...player, classId: cId, statPoints: 5, skillPoints: 1, inventory: [generateItem(weaponBase, 1), generateItem(armorBase, 1), generateItem(ITEMS_DB[0], 1), generateItem(ITEMS_DB[0], 1)], effects: [], maxFloor: 1 };
    if (cId === 'warrior') nextPlayer = applyStatusEffect(nextPlayer, 'SHIELD', 99, 10);
    setPlayer(nextPlayer);
    setGameState(GAME_STATE.ZONE_SELECT);
    addLog(`Đã chọn lớp: ${CLASSES_DB[cId].name}`);
  }, [player, addLog]);

  const startFloor = useCallback((f, zId) => {
    const isCleared = f < (player.maxFloor || 1);
    const rooms = generateMap(f, zId, isCleared);
    setMapRooms(rooms);
    setCurrentRoomId(0);
    setMonster(null);
    setLoot(null);
    setActiveModal(MODAL_STATE.NONE);
    setGameState(GAME_STATE.MAP);
    addLog(`Tầng ${f} - ${findZone(zId).name}${isCleared ? ' (đã dọn)' : ''}`);
  }, [player.maxFloor, addLog]);

  const enterZone = useCallback((z) => { setZone(z); setFloor(1); startFloor(1, z.id); }, [startFloor]);
  const openTravelModal = useCallback(() => setActiveModal(MODAL_STATE.TRAVEL), []);
  const travelToFloor = useCallback((targetFloor) => {
    if (targetFloor > (player.maxFloor || 1)) return;
    setFloor(targetFloor);
    startFloor(targetFloor, zone.id);
    setActiveModal(MODAL_STATE.NONE);
  }, [player.maxFloor, startFloor, zone.id]);

  const completeRoom = useCallback((roomId = currentRoomId, roomType = mapRooms.find((r) => r.id === roomId)?.type) => {
    const isBoss = roomType === 'BOSS';
    setMapRooms((prev) => prev.map((room) => {
      if (room.id === roomId) return { ...room, completed: true, locked: false };
      if (!isBoss && room.id === roomId + 1) return { ...room, locked: false };
      return room;
    }));
    setActiveModal(MODAL_STATE.NONE);
    if (isBoss) {
      const nextFloor = floor + 1;
      setPlayer((p) => ({ ...p, maxFloor: Math.max(p.maxFloor || 1, nextFloor) }));
      setFloor(nextFloor);
      setTimeout(() => startFloor(nextFloor, zone.id), 250);
      addLog(`Đã chinh phục tầng ${floor}. Mở khóa tầng ${nextFloor}!`, 'text-yellow-400');
    }
  }, [currentRoomId, mapRooms, floor, zone.id, startFloor, addLog]);

  const closeShop = useCallback(() => { completeRoom(currentRoomId, 'SHOP'); addLog('Đã rời cửa hàng.'); }, [completeRoom, currentRoomId, addLog]);

  const enterRoom = useCallback((r) => {
    if (r.locked) return addLog('Phòng này vẫn đang bị khóa.', 'text-red-400');
    setCurrentRoomId(r.id);
    if (['COMBAT', 'ELITE', 'BOSS'].includes(r.type) && r.completed) { addLog('Tầng cũ đã được dọn sạch.', 'text-slate-400'); return completeRoom(r.id, r.type); }
    if (r.type === 'SHOP') { setShopItems(generateShop(floor, player.classId)); return setActiveModal(MODAL_STATE.SHOP); }
    if (r.type === 'TREASURE') { setLoot(generateLoot(zone.id, floor, 'TREASURE', player.classId, currentRealStats.luck)); setGameState(GAME_STATE.VICTORY); return; }
    if (['COMBAT', 'ELITE', 'BOSS'].includes(r.type)) { setMonster(generateMonster(floor, r.type, zone)); setDiceResult(null); setGameState(GAME_STATE.COMBAT); }
  }, [floor, player.classId, zone, currentRealStats.luck, addLog, completeRoom]);

  const handleCombat = useCallback((moveId) => {
    if (!monster || gameState !== GAME_STATE.COMBAT) return;
    const move = Object.values(MOVES).find((m) => m.id === moveId);
    const monsterMove = Object.values(MOVES)[Math.floor(Math.random() * 3)];
    const outcome = move.id === monsterMove.id ? 'draw' : move.beats === monsterMove.id ? 'win' : 'lose';
    setDiceResult({ pMove: move, mMove: monsterMove, outcome });

    const playerTick = runTickEffects(player, true, currentRealStats.maxHp);
    let nextPlayer = playerTick.entity;
    if (nextPlayer.hp <= 0) { setPlayer(nextPlayer); setGameState(GAME_STATE.GAME_OVER); return; }

    let nextMonster = monster;
    let playerDamage = 0;
    let monsterDamage = 0;

    if (!playerTick.isStunned) {
      const attackMult = outcome === 'win' ? 1.35 : outcome === 'lose' ? 0.8 : 1;
      const defendMult = outcome === 'lose' ? 1.2 : outcome === 'win' ? 0.85 : 1;
      const crit = Math.random() * 100 < currentRealStats.crit;
      playerDamage = Math.floor((Math.floor(Math.random() * currentRealStats.diceSides) + 1 + currentRealStats.atk) * attackMult * (crit ? 1.5 : 1));
      monsterDamage = Math.max(0, Math.floor((Math.floor(Math.random() * monster.diceSides) + 1 + monster.atk - currentRealStats.def) * defendMult * (1 + ((nextPlayer.effects || []).some((e) => e.incomingPercent) ? 0.2 : 0))));
      nextMonster = { ...monster, hp: Math.max(0, monster.hp - playerDamage) };
      if (player.classId === 'rogue' && Math.random() < 0.2) nextMonster = applyStatusEffect(nextMonster, 'POISON', 3);
      if (player.classId === 'mage' && Math.random() < 0.2) nextMonster = applyStatusEffect(nextMonster, ['POISON', 'STUN', 'VULNERABLE'][Math.floor(Math.random() * 3)], 2);
      if (monsterDamage > 0) {
        const shieldIndex = (nextPlayer.effects || []).findIndex((e) => e.id === EFFECTS_DB.SHIELD.id);
        if (shieldIndex >= 0) {
          const shield = nextPlayer.effects[shieldIndex];
          const absorb = Math.min(shield.value || 0, monsterDamage);
          monsterDamage -= absorb;
          addEffect(`BLOCK ${absorb}`, 'heal', 68, 70);
          const updatedEffects = [...nextPlayer.effects];
          updatedEffects[shieldIndex] = { ...shield, value: (shield.value || 0) - absorb };
          nextPlayer = { ...nextPlayer, effects: updatedEffects.filter((e) => !e.shieldVal || (e.value || 0) > 0) };
        }
      }
      nextPlayer = { ...nextPlayer, hp: Math.max(0, nextPlayer.hp - monsterDamage) };
      addLog(`${move.name} vs ${monsterMove.name}: ${outcome === 'win' ? 'thắng thế' : outcome === 'lose' ? 'lép vế' : 'hòa'}.`, outcome === 'win' ? 'text-green-400' : outcome === 'lose' ? 'text-red-400' : 'text-slate-300');
    } else {
      addLog('Bạn bị choáng và mất lượt!', 'text-yellow-400');
      monsterDamage = Math.max(0, Math.floor(Math.random() * monster.diceSides) + 1 + monster.atk - currentRealStats.def);
      nextPlayer = { ...nextPlayer, hp: Math.max(0, nextPlayer.hp - monsterDamage) };
    }

    if (playerDamage > 0) addEffect(`-${playerDamage}`, 'damage', 32, 24);
    if (monsterDamage > 0) addEffect(`-${monsterDamage}`, 'damage', 68, 78);
    setHitState({ p: monsterDamage > 0, m: playerDamage > 0 });
    setTimeout(() => setHitState({ p: false, m: false }), 200);

    setPlayer(nextPlayer);
    setMonster(nextMonster);

    setTimeout(() => {
      if (nextMonster.hp <= 0) { setLoot(generateLoot(zone.id, floor, monster.roomType || 'COMBAT', player.classId, currentRealStats.luck)); setGameState(GAME_STATE.VICTORY); addLog(`Đã đánh bại ${monster.name}!`, 'text-green-400'); return; }
      if (nextPlayer.hp <= 0) { setGameState(GAME_STATE.GAME_OVER); addLog('Bạn đã thua trận!', 'text-red-500'); return; }
      const monsterTick = runTickEffects(nextMonster, false, nextMonster.maxHp);
      setMonster(monsterTick.entity);
      if (monsterTick.entity.hp <= 0) { setLoot(generateLoot(zone.id, floor, monster.roomType || 'COMBAT', player.classId, currentRealStats.luck)); setGameState(GAME_STATE.VICTORY); }
    }, 350);
  }, [monster, gameState, runTickEffects, player, currentRealStats, addLog, addEffect, zone.id, floor, currentRoomId]);

  const claimLoot = useCallback(() => {
    if (!loot) return;
    let level = player.level; let exp = player.exp + loot.exp; let nextLevelExp = player.nextLevelExp; let statPoints = player.statPoints; let skillPoints = player.skillPoints; let baseStats = { ...player.baseStats }; let hp = player.hp;
    const finalGold = Math.floor(loot.gold * ((stats.goldMult || 100) / 100));
    while (exp >= nextLevelExp) { exp -= nextLevelExp; level += 1; nextLevelExp = Math.floor(nextLevelExp * 1.2); baseStats = { ...baseStats, atk: baseStats.atk + 1, def: baseStats.def + 0.5, maxHp: baseStats.maxHp + 5 }; hp += 5; statPoints += 3; if (level % 3 === 0) skillPoints += 1; addEffect('LEVEL UP!', 'heal', 50, 45); }
    setPlayer((p) => ({ ...p, gold: p.gold + finalGold, exp, level, nextLevelExp, statPoints, skillPoints, baseStats, hp: clamp(hp, 0, computeFullStats({ ...p, baseStats }).final.maxHp), inventory: loot.item ? [...p.inventory, loot.item] : p.inventory }));
    if (loot.item) addLog(`Nhận được: ${loot.item.name}`, 'text-green-400');
    if (level > player.level) addLog(`Lên cấp ${level}!`, 'text-yellow-400 font-bold');
    setLoot(null);
    setGameState(GAME_STATE.MAP);
    completeRoom(currentRoomId, mapRooms.find((r) => r.id === currentRoomId)?.type);
  }, [loot, player, stats.goldMult, addEffect, addLog, completeRoom, currentRoomId, mapRooms]);

  const openStatsModal = useCallback(() => { setTempStats({ ...player.statsAllocated }); setTempStatPoints(player.statPoints); setActiveModal(MODAL_STATE.STATS); }, [player]);
  const adjustStat = useCallback((key, delta) => { if (delta > 0 && tempStatPoints > 0) { setTempStats((p) => ({ ...p, [key]: p[key] + 1 })); setTempStatPoints((p) => p - 1); } else if (delta < 0 && tempStats[key] > (player.statsAllocated[key] || 0)) { setTempStats((p) => ({ ...p, [key]: p[key] - 1 })); setTempStatPoints((p) => p + 1); } }, [tempStatPoints, tempStats, player.statsAllocated]);
  const commitStats = useCallback(() => { setPlayer((p) => ({ ...p, statsAllocated: tempStats, statPoints: tempStatPoints, hp: Math.min(p.hp, computeFullStats({ ...p, statsAllocated: tempStats }).final.maxHp) })); setActiveModal(MODAL_STATE.NONE); addLog('Đã lưu chỉ số!', 'text-green-400'); }, [tempStats, tempStatPoints, addLog]);

  const upgradeSkill = useCallback((skillId) => { const currentLevel = player.skills[skillId] || 0; const skill = CLASSES_DB[player.classId]?.skills.find((s) => s.id === skillId); if (!skill || currentLevel >= skill.max || player.skillPoints <= 0) return; setPlayer((p) => ({ ...p, skillPoints: p.skillPoints - 1, skills: { ...p.skills, [skillId]: currentLevel + 1 } })); addLog(`Đã học: ${skill.name} cấp ${currentLevel + 1}`, 'text-blue-400'); }, [player, addLog]);

  const useConsumable = useCallback((item) => { if (!item.effect) return; const value = getConsumableValue(item, player.classId); const context = { stats: currentRealStats, value }; setPlayer((prev) => ({ ...item.effect(prev, context), inventory: prev.inventory.filter((i) => i.uid !== item.uid) })); setSelectionUID(null); addLog(`Đã dùng ${item.name}`, 'text-green-400'); addEffect(item.id.startsWith('pot_') ? `+${value}` : 'BUFF', 'heal', 68, 74); }, [player.classId, currentRealStats, addLog, addEffect]);

  const equipItem = useCallback((item) => { if (!player.classId) return; if (!isItemUsableByClass(item, player.classId)) return addLog('Lớp này không thể trang bị vật phẩm này!', 'text-red-500'); const slot = item.type === 'WEAPON' ? 'weapon' : item.type === 'ARMOR' ? 'armor' : 'accessory'; const current = player.equipment[slot]; const newInv = player.inventory.filter((i) => i.uid !== item.uid); if (current) newInv.push(current); setPlayer((p) => ({ ...p, inventory: newInv, equipment: { ...p.equipment, [slot]: item } })); setSelectionUID(item.uid); addLog(`Đã trang bị ${item.name}`, 'text-blue-400'); }, [player, addLog]);

  const unequipItem = useCallback((slot) => { const item = player.equipment[slot]; if (!item) return; setPlayer((p) => ({ ...p, equipment: { ...p.equipment, [slot]: null }, inventory: [...p.inventory, item] })); setSelectionUID(null); addLog(`Đã tháo ${item.name}`, 'text-yellow-400'); }, [player.equipment, addLog]);

  const handleMerge = useCallback((item1) => {
    const sameTypeMatcher = (i) => item1.type === 'CONSUMABLE' ? i.id === item1.id && i.rarity === item1.rarity : i.id === item1.id && i.level === item1.level;
    const invMatch = player.inventory.find((i) => sameTypeMatcher(i) && i.uid !== item1.uid);
    const slot = item1.type === 'WEAPON' ? 'weapon' : item1.type === 'ARMOR' ? 'armor' : item1.type === 'ACCESSORY' ? 'accessory' : null;
    const equipMatch = slot && player.equipment[slot] && sameTypeMatcher(player.equipment[slot]) && player.equipment[slot].uid !== item1.uid ? player.equipment[slot] : null;
    const matchItem = invMatch || equipMatch;
    if (!matchItem) return addLog('Không có vật phẩm phù hợp để hợp nhất!', 'text-red-500');
    const merged = generateItem(ITEMS_DB.find((base) => base.id === item1.id) || item1, (item1.level || 1) + 1, item1.type === 'CONSUMABLE' ? Math.min(5, (item1.rarity || 1) + 1) : Math.max(item1.rarity || 1, matchItem.rarity || 1));
    merged.affixes = [...new Map([...(item1.affixes || []), ...(matchItem.affixes || [])].map((a) => [a.id, a])).values()];
    merged.cost = calculateCost(merged); merged.sellPrice = Math.floor(merged.cost * 0.45);
    const newInv = player.inventory.filter((i) => i.uid !== item1.uid && i.uid !== matchItem.uid);
    const newEquip = { ...player.equipment };
    const shouldEquip = slot && ((item1.isEquipped || false) || !!equipMatch);
    if (slot && shouldEquip) newEquip[slot] = merged; else newInv.push(merged);
    setPlayer((p) => ({ ...p, inventory: newInv, equipment: newEquip })); setSelectionUID(merged.uid); addLog(`Hợp nhất thành công: ${merged.name} +${merged.level}`, 'text-purple-400'); addEffect('MERGE!', 'heal', 50, 50);
  }, [player, addLog, addEffect]);

  const buyService = useCallback((service) => { if (player.gold < service.cost) return addLog('Không đủ vàng!', 'text-red-500'); if (service.id === 'srv_heal') { setPlayer((p) => ({ ...p, gold: p.gold - service.cost, hp: currentRealStats.maxHp })); return addLog('Đã hồi phục toàn bộ HP!', 'text-green-400'); } if (service.id === 'srv_box') { const rarity = 2 + Math.floor(Math.random() * 3); const usable = ITEMS_DB.filter((i) => isItemUsableByClass(i, player.classId)); const dbItem = usable[Math.floor(Math.random() * usable.length)]; const newItem = generateItem(dbItem, floor, rarity); setPlayer((p) => ({ ...p, gold: p.gold - service.cost, inventory: [...p.inventory, newItem] })); addLog(`Nhận được ${newItem.name} (${RARITY_CONFIG[rarity].name})`, 'text-yellow-400'); } }, [player.gold, player.classId, currentRealStats.maxHp, floor, addLog]);

  // --- RENDER HELPERS ---
  const renderItemCard = (item, onClick, isSelected, badge = '') => {
    if (!item) return (
      <div onClick={onClick} className="aspect-square bg-slate-900 border border-slate-800 rounded opacity-50 flex items-center justify-center text-slate-700">
        <Shirt size={16}/>
      </div>
    );
    
    const rarity = RARITY_CONFIG[item.rarity || 1];
    return (
      <div 
        onClick={onClick} 
        className={`relative aspect-square ${rarity.bg} border-2 rounded p-1 cursor-pointer group hover:brightness-125 ${rarity.color} ${isSelected ? 'ring-2 ring-white scale-95' : ''}`}
      >
        {item.type !== 'CONSUMABLE' && (
          <div className="absolute top-0 right-0 bg-black/60 text-white text-[8px] px-1 rounded-bl z-10">
            +{item.level}
          </div>
        )}
        {badge && (
          <div className="absolute bottom-0 left-0 bg-blue-600 text-white text-[8px] px-1 rounded-tr z-10">
            {badge}
          </div>
        )}
        <div className="flex items-center justify-center h-full text-2xl drop-shadow-md">
          <PixelItemIcon id={item.id} fallbackIcon={item.icon} size={24} />
        </div>
        {item.affixes?.length > 0 && (
          <div className="absolute top-0 left-0 text-yellow-400 text-[8px] p-0.5">
            <Sparkles size={8}/>
          </div>
        )}
      </div>
    );
  };

  // --- PAGINATION LOGIC ---
  const currentInventoryPage = player.inventory.slice(
    inventoryPage * ITEMS_PER_PAGE, 
    (inventoryPage + 1) * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(player.inventory.length / ITEMS_PER_PAGE) || 1;

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-slate-950 text-white font-mono select-none flex items-center justify-center p-2">
      <div className={`w-full max-w-[400px] h-[800px] bg-gradient-to-b ${zone.bg} border-4 border-slate-700 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col`}>
        {/* HEADER */}
        <div className="h-14 bg-slate-900/90 backdrop-blur border-b-4 border-slate-700 flex items-center justify-between px-3 z-20 shrink-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="bg-yellow-600 px-1.5 rounded text-black">LV.{player.level}</span>
              <div className="w-20 h-2 bg-slate-900 rounded-full border border-slate-600 overflow-hidden">
                <div 
                  className="h-full bg-blue-400" 
                  style={{width: `${Math.min(100, (player.exp/player.nextLevelExp)*100)}%`}}
                ></div>
              </div>
            </div>
            <div className="text-yellow-400 text-sm font-bold flex items-center gap-1 mt-0.5">
              <Coins size={12}/> {player.gold}
            </div>
          </div>
          <div className="flex gap-2">
            {gameState === GAME_STATE.MAP && (player.maxFloor || 1) > 1 && (
              <button onClick={openTravelModal} className="p-2 rounded hover:bg-slate-700">
                <MapIcon size={18}/>
              </button>
            )}
            <button 
              onClick={() => { 
                setActiveModal(activeModal === MODAL_STATE.INVENTORY ? MODAL_STATE.NONE : MODAL_STATE.INVENTORY); 
                setSelectionUID(null); 
                setInventoryPage(0);
              }} 
              className="p-2 rounded hover:bg-slate-700"
            >
              <Backpack size={18}/>
            </button>
            {player.classId && (
              <button 
                onClick={openStatsModal} 
                className="p-2 rounded hover:bg-slate-700"
              >
                <User size={18}/>
              </button>
            )}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          {/* EFFECTS OVERLAY */}
          {effects.map(e => (
            <div 
              key={e.id} 
              className="absolute z-50 font-bold text-2xl animate-bounce" 
              style={{ 
                left: `${e.x}%`, 
                top: `${e.y}%`, 
                color: e.type === 'damage' ? '#ef4444' : '#10b981',
                transform: 'translate(-50%, -50%)'
              }}
            >
              {e.text}
            </div>
          ))}

          {/* GAME STATES */}
          {gameState === GAME_STATE.MENU && (
            <div className="h-full flex flex-col items-center justify-center gap-6 bg-black/80 z-10 p-4">
              <h1 className="text-4xl font-black text-blue-500 text-center">PIXEL ROGUE</h1>
              <div className="text-slate-400 text-sm text-center max-w-xs">
                Game nhập vai chiến đấu theo lượt với hệ thống vật phẩm và nâng cấp phong phú
              </div>
              <button 
                onClick={initGame} 
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded font-bold transition-colors"
              >
                BẮT ĐẦU
              </button>
            </div>
          )}

          {gameState === GAME_STATE.CLASS_SELECT && (
            <div className="h-full p-4 overflow-y-auto bg-black/80 z-10">
              <h2 className="text-xl font-bold mb-4 text-center">CHỌN NGHỀ NGHIỆP</h2>
              <div className="space-y-3">
                {Object.values(CLASSES_DB).map(c => (
                  <button 
                    key={c.id} 
                    onClick={() => selectClass(c.id)}
                    className="w-full text-left p-4 rounded border-2 bg-slate-800 border-slate-600 hover:border-white transition-colors"
                  >
                    <div className={`font-bold ${c.color} flex items-center gap-2`}>
                      {renderIcon(c.icon, 20)} {c.name}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{c.desc}</div>
                    <div className="text-xs text-slate-500 mt-2">{c.passiveDesc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameState === GAME_STATE.ZONE_SELECT && (
            <div className="h-full p-4 overflow-y-auto bg-black/80 z-10">
              <h2 className="text-xl font-bold mb-4 text-center">CHỌN KHU VỰC</h2>
              <div className="space-y-3">
                {ZONES_DB.map(z => (
                  <button 
                    key={z.id} 
                    onClick={() => enterZone(z)}
                    className="w-full text-left p-4 rounded border-2 bg-slate-800 border-slate-600 hover:border-white transition-colors"
                  >
                    <div className={`font-bold ${z.color}`}>{z.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{z.desc}</div>
                    <div className="text-xs text-slate-500 mt-2">
                      Độ khó: {z.difficulty}/10
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameState === GAME_STATE.MAP && (
            <div className="h-full flex flex-col items-center justify-center p-4 bg-black/60 z-10">
              <h2 className={`text-2xl font-black ${zone.color} mb-2`}>
                {zone.name} - Tầng {floor}
              </h2>
              <div className="mb-4 text-center text-xs text-slate-400 max-w-xs">{zone.desc}</div>
              <div className="mb-4 grid grid-cols-2 gap-2 w-full max-w-xs text-[10px]">
                <div className="rounded border border-slate-700 bg-black/30 p-2 text-slate-300">May mắn: <span className="text-yellow-400 font-bold">{currentRealStats.luck}</span></div>
                <div className="rounded border border-slate-700 bg-black/30 p-2 text-slate-300">Tầng tối đa: <span className="text-cyan-400 font-bold">{player.maxFloor || 1}</span></div>
              </div>
              <div className="flex flex-col gap-3 w-full max-w-xs">
                {mapRooms.map((r) => (
                  <button 
                    key={r.id}
                    disabled={r.locked || (r.id !== 0 && !mapRooms[r.id-1]?.completed)}
                    onClick={() => enterRoom(r)}
                    className={`p-3 rounded border-2 text-sm font-bold transition-all ${
                      r.id === currentRoomId 
                        ? 'bg-slate-700 border-yellow-500' 
                        : r.completed
                        ? 'bg-slate-900/50 border-green-700'
                        : !r.locked && mapRooms[r.id-1]?.completed
                        ? 'bg-slate-800 border-slate-600 hover:border-white'
                        : 'bg-slate-900 border-slate-800 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">{renderIcon(ROOM_TYPES[r.type].icon, 14, ROOM_TYPES[r.type].color)}{ROOM_TYPES[r.type].label}</span>
                      {r.completed && <span className="text-green-400">✓</span>}
                      {r.locked && <Lock size={12} />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {(gameState === GAME_STATE.COMBAT || gameState === GAME_STATE.GAME_OVER) && monster && (
            <div className="h-full flex flex-col p-4">
              {/* Monster */}
              <div className="mt-4 flex flex-col items-center">
                <div 
                  onClick={() => setActiveModal(MODAL_STATE.MONSTER_INFO)} 
                  className="relative cursor-pointer group"
                >
                  <CombatAvatar 
                    seed={monster.seed} 
                    size={120} 
                    role="monster"
                    classId={player.classId}
                    monsterType={monster.type}
                    roomType={monster.roomType}
                    isHit={hitState.m}
                    isDead={monster.hp <= 0} 
                  />
                  <div className="absolute top-0 right-0 bg-slate-900 rounded-full p-1 border border-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Search size={12}/>
                  </div>
                </div>
                <div className="w-48 mt-2 bg-slate-900 h-3 rounded-full border border-slate-600 overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all duration-300" 
                    style={{width: `${Math.max(0, (monster.hp/monster.maxHp)*100)}%`}}
                  ></div>
                </div>
                <div className="font-bold text-red-400 mt-1">{monster.name}</div>
                <div className="text-xs text-slate-400">HP: {Math.max(0, monster.hp)}/{monster.maxHp}</div>
                <div className="mt-2 flex flex-wrap justify-center gap-1">{(monster.effects || []).map((eff) => <span key={eff.uid} className={`rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] ${eff.color}`}>{eff.name} {eff.value ? `(${eff.value})` : ''}</span>)}</div>
              </div>

              {/* VS Separator */}
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm gap-3">
                <div>VS</div>
                {diceResult && (
                  <div className="rounded border border-slate-700 bg-black/50 px-3 py-2 text-center text-xs">
                    <div className="text-slate-300">{diceResult.pMove.icon} {diceResult.pMove.name} vs {diceResult.mMove.icon} {diceResult.mMove.name}</div>
                    <div className={`font-bold ${diceResult.outcome === 'win' ? 'text-green-400' : diceResult.outcome === 'lose' ? 'text-red-400' : 'text-yellow-400'}`}>
                      {diceResult.outcome === 'win' ? 'Bạn chiếm ưu thế' : diceResult.outcome === 'lose' ? 'Quái phản công mạnh hơn' : 'Hòa thế'}
                    </div>
                  </div>
                )}
              </div>

              {/* Player */}
              <div className="mb-4 flex flex-col items-center">
                <div className="w-48 bg-slate-900 h-4 rounded-full border border-slate-600 overflow-hidden mb-2 relative">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300" 
                    style={{width: `${Math.max(0, (player.hp/stats.maxHp)*100)}%`}}
                  ></div>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                    HP: {Math.max(0, player.hp)} / {stats.maxHp}
                  </span>
                </div>
                <CombatAvatar 
                  seed={player.seed} 
                  size={80} 
                  role="hero"
                  classId={player.classId}
                  monsterType={monster?.type}
                  roomType={monster?.roomType}
                  isHit={hitState.p}
                  isDead={player.hp <= 0}
                />
                <div className="text-xs text-slate-400 mt-1">{CLASSES_DB[player.classId]?.name || 'Chưa chọn lớp'}</div>
                <div className="mt-2 flex flex-wrap justify-center gap-1">{(player.effects || []).map((eff) => <span key={eff.uid} className={`rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] ${eff.color}`}>{eff.name} {eff.value ? `(${eff.value})` : ''}</span>)}</div>
              </div>
            </div>
          )}

          {/* LOGS */}
          <div className="absolute bottom-20 left-0 right-0 p-2 z-10">
            <div className="space-y-1">
              {logs.map(log => (
                <div 
                  key={log.id} 
                  className={`text-xs p-2 rounded bg-black/70 backdrop-blur-sm animate-in slide-in-from-bottom ${log.color}`}
                >
                  {log.msg}
                </div>
              ))}
            </div>
          </div>

          {/* MODALS */}
          {activeModal === MODAL_STATE.STATS && tempStats && player.classId && (
            <div className="absolute inset-0 bg-slate-900/95 z-50 flex flex-col animate-in slide-in-from-bottom">
              <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-800">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setStatsTab('STATS')} 
                    className={`px-3 py-1 rounded text-xs font-bold ${statsTab === 'STATS' ? 'bg-blue-600' : 'bg-slate-700'}`}
                  >
                    CHỈ SỐ
                  </button>
                  <button 
                    onClick={() => setStatsTab('SKILLS')} 
                    className={`px-3 py-1 rounded text-xs font-bold ${statsTab === 'SKILLS' ? 'bg-blue-600' : 'bg-slate-700'}`}
                  >
                    KỸ NĂNG
                  </button>
                </div>
                <button onClick={() => setActiveModal(MODAL_STATE.NONE)}>
                  <X/>
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto">
                {statsTab === 'STATS' ? (
                  <>
                    <div className="bg-slate-800 p-3 rounded mb-4 flex justify-between items-center border border-slate-700">
                      <span className="text-slate-400 font-bold text-sm">ĐIỂM TIỀM NĂNG</span>
                      <span className="text-yellow-400 font-bold text-xl">{tempStatPoints}</span>
                    </div>
                    
                    <div className="mb-4 space-y-2">
                      {[
                        {l: 'STR', c: 'str', desc: 'Tăng sát thương' },
                        {l: 'VIT', c: 'vit', desc: 'Tăng máu' },
                        {l: 'AGI', c: 'agi', desc: 'Tăng phòng thủ' },
                        {l: 'LUK', c: 'luk', desc: 'Tăng may mắn' }
                      ].map(s => (
                        <div key={s.c} className="flex justify-between items-center bg-slate-800 p-2 rounded">
                          <div>
                            <span className="font-bold w-10">{s.l}</span>
                            <div className="text-[10px] text-slate-500">{s.desc}</div>
                          </div>
                          <div className="flex gap-3 items-center">
                            <button 
                              onClick={() => adjustStat(s.c, -1)}
                              className="bg-slate-700 w-6 h-6 rounded flex items-center justify-center disabled:opacity-30"
                              disabled={tempStats[s.c] <= (player.statsAllocated[s.c] || 0)}
                            >
                              <Minus size={12}/>
                            </button>
                            <span className={`w-6 text-center font-bold ${tempStats[s.c] > (player.statsAllocated[s.c] || 0) ? 'text-green-400' : 'text-white'}`}>
                              {tempStats[s.c]}
                            </span>
                            <button 
                              onClick={() => adjustStat(s.c, 1)}
                              className="bg-blue-600 w-6 h-6 rounded flex items-center justify-center disabled:opacity-30"
                              disabled={tempStatPoints <= 0}
                            >
                              <Plus size={12}/>
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {tempStatPoints !== player.statPoints && (
                        <button 
                          onClick={commitStats}
                          className="w-full bg-green-600 hover:bg-green-700 py-2 rounded font-bold mt-4 transition-colors"
                        >
                          LƯU THAY ĐỔI
                        </button>
                      )}
                    </div>
                    
                    <h3 className="text-xs text-slate-500 uppercase font-bold mb-2">
                      Thông Số Chi Tiết
                    </h3>
                    
                    <StatAllocationRowDetailed 
                      label="Tấn Công" 
                      code="str" 
                      val={currentRealStats.atk} 
                      tempVal={tempStats.str} 
                      breakdownKey="atk" 
                      icon={<Sword size={14} className="text-red-400"/>} 
                      player={player} 
                      statBreakdown={statBreakdown} 
                      expandedStat={expandedStat} 
                      setExpandedStat={setExpandedStat} 
                    />
                    
                    <StatAllocationRowDetailed 
                      label="Phòng Thủ" 
                      code="agi" 
                      val={currentRealStats.def} 
                      tempVal={tempStats.agi} 
                      breakdownKey="def" 
                      icon={<Shield size={14} className="text-blue-400"/>} 
                      player={player} 
                      statBreakdown={statBreakdown} 
                      expandedStat={expandedStat} 
                      setExpandedStat={setExpandedStat} 
                    />
                    
                    <StatAllocationRowDetailed 
                      label="Sinh Lực" 
                      code="vit" 
                      val={currentRealStats.maxHp} 
                      tempVal={tempStats.vit} 
                      breakdownKey="maxHp" 
                      icon={<Heart size={14} className="text-green-400"/>} 
                      player={player} 
                      statBreakdown={statBreakdown} 
                      expandedStat={expandedStat} 
                      setExpandedStat={setExpandedStat} 
                    />
                    
                    <StatAllocationRowDetailed 
                      label="May Mắn" 
                      code="luk" 
                      val={currentRealStats.luck} 
                      tempVal={tempStats.luk} 
                      breakdownKey="luck" 
                      icon={<Star size={14} className="text-yellow-400"/>} 
                      player={player} 
                      statBreakdown={statBreakdown} 
                      expandedStat={expandedStat} 
                      setExpandedStat={setExpandedStat} 
                    />
                    
                    <StatAllocationRowDetailed 
                      label="Bạo Kích" 
                      code="luk" 
                      val={currentRealStats.crit + '%'} 
                      tempVal={tempStats.luk} 
                      breakdownKey="crit" 
                      icon={<Zap size={14} className="text-purple-400"/>} 
                      player={player} 
                      statBreakdown={statBreakdown} 
                      expandedStat={expandedStat} 
                      setExpandedStat={setExpandedStat} 
                    />
                  </>
                ) : (
                  <div className="space-y-3">
                    {CLASSES_DB[player.classId]?.skills.map(sk => {
                      const lvl = player.skills[sk.id] || 0;
                      const isMax = lvl >= sk.max;
                      return (
                        <div key={sk.id} className="bg-slate-800 p-3 rounded border border-slate-700">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <div className="font-bold text-white">{sk.name}</div>
                              <div className="text-xs text-yellow-500">Lv.{lvl}/{sk.max}</div>
                            </div>
                            {!isMax && (
                              <button 
                                onClick={() => upgradeSkill(sk.id)}
                                disabled={player.skillPoints <= 0}
                                className="bg-blue-600 hover:bg-blue-700 px-2 py-0.5 rounded text-xs disabled:opacity-30 active:scale-95 transition-colors"
                              >
                                Nâng Cấp
                              </button>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">{sk.desc}</div>
                          {sk.mod && (
                            <div className="text-[10px] text-green-400 mt-1">
                              {Object.entries(sk.mod).map(([key, val]) => (
                                <div key={key}>
                                  {key}: {val > 0 ? '+' : ''}{val}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeModal === MODAL_STATE.MONSTER_INFO && monster && (
            <div 
              className="absolute inset-0 bg-slate-900/95 z-50 flex flex-col items-center justify-center p-6 animate-in zoom-in"
              onClick={() => setActiveModal(MODAL_STATE.NONE)}
            >
              <div 
                className="bg-slate-800 p-6 rounded-xl border-2 border-red-900 w-full max-w-xs text-center"
                onClick={e => e.stopPropagation()}
              >
                <h2 className="text-2xl font-black text-red-500 mb-2">{monster.name}</h2>
                <div className="flex justify-center mb-4">
                  <CombatAvatar seed={monster.seed} size={100} role="monster" classId={player.classId} monsterType={monster.type} roomType={monster.roomType} isDead={monster.hp <= 0} isHit={false} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-left mb-4">
                  <div className="bg-slate-900 p-2 rounded border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase">Sức tấn công</div>
                    <div className="text-xl font-bold text-white flex items-center gap-2">
                      <Sword size={16} className="text-red-400"/> {monster.atk}
                    </div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase">Máu tối đa</div>
                    <div className="text-xl font-bold text-white flex items-center gap-2">
                      <Heart size={16} className="text-green-400"/> {monster.maxHp}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-slate-300 mb-4">
                  Loại phòng: {ROOM_TYPES[monster.roomType]?.label || 'COMBAT'}
                </div>
                <button 
                  onClick={() => setActiveModal(MODAL_STATE.NONE)}
                  className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded text-white transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}


          {activeModal === MODAL_STATE.TRAVEL && (
            <div className="absolute inset-0 bg-slate-900/95 z-50 flex flex-col">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="font-bold flex items-center gap-2"><Footprints size={16}/> Di Chuyển Tầng</div>
                <button onClick={() => setActiveModal(MODAL_STATE.NONE)}><X/></button>
              </div>
              <div className="p-4 grid grid-cols-2 gap-2">
                {Array.from({ length: player.maxFloor || 1 }, (_, idx) => idx + 1).map((f) => (
                  <button key={f} onClick={() => travelToFloor(f)} className={`rounded border p-3 text-sm font-bold ${f === floor ? 'border-yellow-500 bg-slate-700' : 'border-slate-700 bg-slate-800 hover:border-cyan-400'}`}>
                    Tầng {f} {f === floor ? '• Hiện tại' : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeModal === MODAL_STATE.INVENTORY && (
            <div className="absolute inset-0 bg-slate-900 z-50 flex flex-col">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <span className="font-bold">Hành Trang</span>
                <button onClick={() => setActiveModal(MODAL_STATE.NONE)}>
                  <X/>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-400 mb-2">Trang Bị Đang Mặc</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {['weapon', 'armor', 'accessory'].map(slot => (
                      <div key={slot} className="flex flex-col items-center">
                        <div className="text-[10px] text-slate-500 uppercase mb-1">
                          {slot === 'weapon' ? 'Vũ Khí' : slot === 'armor' ? 'Giáp' : 'Phụ Kiện'}
                        </div>
                        {player.equipment[slot] ? (
                          <div 
                            onClick={() => setSelectionUID(player.equipment[slot].uid)}
                            className={`aspect-square border-2 rounded p-1 cursor-pointer bg-slate-800 ${RARITY_CONFIG[player.equipment[slot].rarity].color}`}
                          >
                            <PixelItemIcon id={player.equipment[slot].id} fallbackIcon={player.equipment[slot].icon} size={24} />
                          </div>
                        ) : (
                          <div className="aspect-square bg-slate-900 border border-slate-800 rounded opacity-50 flex items-center justify-center">
                            <Shirt size={16}/>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination Controls */}
                {player.inventory.length > 0 && (
                  <div className="flex justify-between items-center mb-4 px-1">
                    <button 
                      disabled={inventoryPage === 0}
                      onClick={() => setInventoryPage(p => p - 1)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft size={16}/>
                    </button>
                    <span className="text-xs text-slate-400">
                      Trang {inventoryPage + 1}/{totalPages} ({player.inventory.length} vật phẩm)
                    </span>
                    <button 
                      disabled={inventoryPage >= totalPages - 1}
                      onClick={() => setInventoryPage(p => p + 1)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors"
                    >
                      <ChevronRight size={16}/>
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2 min-h-[200px] content-start">
                  {currentInventoryPage.map(i => (
                    <div key={i.uid}>
                      {renderItemCard(i, () => setSelectionUID(i.uid), selectionUID === i.uid)}
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, ITEMS_PER_PAGE - currentInventoryPage.length) }).map((_, i) => (
                    <div 
                      key={`empty-${i}`} 
                      className="aspect-square bg-slate-900/50 rounded border border-slate-800"
                    ></div>
                  ))}
                </div>
              </div>

              {selectedItem && selectedItem.uid && (
                <div className="bg-slate-800 p-4 border-t border-slate-700">
                  <div className={`font-bold text-lg mb-1 ${RARITY_CONFIG[selectedItem.rarity].color.replace('border-', 'text-')}`}>
                    {selectedItem.name} {selectedItem.level ? `+${selectedItem.level}` : ''}
                  </div>
                  <div className="text-xs text-slate-500 mb-2 uppercase font-bold">
                    {selectedItem.type} • {RARITY_CONFIG[selectedItem.rarity].name}
                  </div>
                  
                  {selectedItem.type !== 'CONSUMABLE' && (
                    <div className="bg-slate-900 p-2 rounded mb-3 text-xs space-y-1">
                      {Object.entries(getItemStats(selectedItem)).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-slate-300">
                          <span className="uppercase">{k}</span>
                          <span className="text-white font-bold">
                            {v} 
                            <span className="text-slate-500 font-normal ml-1">
                              ({selectedItem.baseStats?.[k] || 0} gốc + {v - (selectedItem.baseStats?.[k] || 0)} cấp)
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-xs text-yellow-500 mb-3">
                    {selectedItem.type === 'CONSUMABLE'
                      ? getConsumableDescription(selectedItem, player.classId)
                      : (selectedItem.desc || 'Trang bị hiếm dùng để gia tăng sức mạnh.')}
                  </div>
                  {selectedItem.affixes?.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {selectedItem.affixes.map((affix) => <span key={affix.id} className="rounded bg-slate-900 px-2 py-1 text-[10px] text-cyan-300">{affix.name} +{affix.val}</span>)}
                    </div>
                  )}
                  
                  <div className="text-xs text-yellow-500 mb-4">
                    Giá bán: {selectedItem.sellPrice} G
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {selectedItem.isEquipped ? 
                      <button 
                        onClick={() => unequipItem(selectedItem.slot)}
                        className="bg-orange-600 hover:bg-orange-700 py-2 rounded font-bold transition-colors"
                      >
                        Tháo
                      </button>
                      : 
                      <button 
                        onClick={() => selectedItem.type === 'CONSUMABLE' ? useConsumable(selectedItem) : equipItem(selectedItem)}
                        className="bg-green-600 hover:bg-green-700 py-2 rounded font-bold transition-colors"
                      >
                        {selectedItem.type === 'CONSUMABLE' ? 'Dùng' : 'Trang Bị'}
                      </button>
                    }
                    
                    {(selectedItem.type !== 'SERVICE') && (
                      <button 
                        onClick={() => handleMerge(selectedItem)}
                        className={`py-2 rounded font-bold transition-colors ${
                          (player.inventory.some(i => i.id === selectedItem.id && i.level === selectedItem.level && i.uid !== selectedItem.uid) ||
                           Object.values(player.equipment).some(i => i && i.id === selectedItem.id && i.level === selectedItem.level && i.uid !== selectedItem.uid))
                            ? 'bg-purple-600 hover:bg-purple-700'
                            : 'bg-slate-700 opacity-50'
                        }`}
                      >
                        Hợp Nhất
                      </button>
                    )}
                    
                    {!selectedItem.isEquipped && (
                      <button 
                        onClick={() => {
                          setPlayer(p => ({ 
                            ...p, 
                            gold: p.gold + selectedItem.sellPrice, 
                            inventory: p.inventory.filter(i => i.uid !== selectedItem.uid) 
                          }));
                          setSelectionUID(null);
                          addLog(`Đã bán +${selectedItem.sellPrice}G`);
                        }}
                        className="bg-red-900 hover:bg-red-800 text-red-200 py-2 rounded font-bold transition-colors"
                      >
                        Bán
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeModal === MODAL_STATE.SHOP && (
            <div className="absolute inset-0 bg-slate-900 z-50 flex flex-col">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <div className="font-bold text-yellow-500 flex items-center gap-2">
                  <Store size={18}/> Cửa Hàng
                </div>
                <button onClick={closeShop}>
                  <X/>
                </button>
              </div>
              
              <div className="p-4 space-y-3 overflow-y-auto flex-1">
                {shopItems.map(item => (
                  <div 
                    key={item.uid}
                    className={`bg-slate-800 p-3 rounded border flex gap-3 items-center ${
                      item.type === 'SERVICE' ? 'border-blue-500' : RARITY_CONFIG[item.rarity || 1].color.replace('text-', 'border-')
                    }`}
                  >
                    <div className="text-2xl">
                      <PixelItemIcon id={item.id} fallbackIcon={item.icon} size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm">
                        {item.name} {item.level ? `+${item.level}` : ''}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.type === 'CONSUMABLE'
                          ? getConsumableDescription(item, player.classId)
                          : (item.desc || (item.baseCost + ' G'))}
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        if (item.type === 'SERVICE') {
                          buyService(item);
                        } else {
                          if (player.gold >= item.cost) {
                            setPlayer(p => ({
                              ...p,
                              gold: p.gold - item.cost,
                              inventory: [...p.inventory, { ...item, uid: randomId() }]
                            }));
                            addLog(`Đã mua ${item.name}!`, 'text-green-400');
                          } else {
                            addLog("Không đủ vàng!", "text-red-500");
                          }
                        }
                      }}
                      className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                        player.gold >= item.cost 
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-black' 
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {item.cost} G
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-slate-800">
                <div className="text-sm text-yellow-400 font-bold flex items-center justify-between">
                  <span>Số vàng hiện có:</span>
                  <span>{player.gold} G</span>
                </div>
              </div>
            </div>
          )}

          {gameState === GAME_STATE.VICTORY && loot && (
            <div className="absolute inset-0 bg-slate-900/95 z-40 flex flex-col items-center justify-center p-6">
              <h2 className="text-3xl font-bold text-yellow-400 mb-6 animate-pulse">
                CHIẾN THẮNG!
              </h2>
              <div className="bg-slate-800 p-6 rounded-lg w-full max-w-xs space-y-4">
                <div className="flex justify-between font-bold text-white">
                  <span className="flex items-center gap-2">
                    <Coins size={16} className="text-yellow-400"/> Vàng
                  </span>
                  <span className="text-yellow-400">
                    +{Math.floor((loot.gold || 0) * (stats.goldMult||100)/100)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-white">
                  <span className="flex items-center gap-2">
                    <Activity size={16} className="text-blue-400"/> EXP
                  </span>
                  <span className="text-blue-400">+{loot.exp || 0}</span>
                </div>
                {loot.item && (
                  <div className="mt-4 pt-4 border-t border-slate-600 text-center">
                    <div className="text-sm text-green-400 mb-2">Vật phẩm mới:</div>
                    <div className={`font-bold ${RARITY_CONFIG[loot.item.rarity].color}`}>
                      {loot.item.name} {loot.item.level ? `+${loot.item.level}` : ''}
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={claimLoot}
                className="mt-8 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold transition-colors"
              >
                TIẾP TỤC
              </button>
            </div>
          )}

          {gameState === GAME_STATE.GAME_OVER && (
            <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-6 text-center">
              <Skull size={64} className="text-red-500 mb-4 animate-pulse"/>
              <h2 className="text-4xl font-black text-red-600 mb-2 tracking-tighter">
                BẠN ĐÃ CHẾT
              </h2>
              <p className="text-slate-400 mb-2">
                Hành trình kết thúc tại Tầng {floor}
              </p>
              <p className="text-slate-500 text-sm mb-8">
                Điểm cao nhất: {player.level} cấp
              </p>
              <button 
                onClick={() => {
                  setGameState(GAME_STATE.MENU);
                  setActiveModal(MODAL_STATE.NONE);
                }}
                className="bg-white hover:bg-slate-200 text-black px-8 py-3 rounded-full font-bold transition-colors"
              >
                QUAY LẠI MENU
              </button>
            </div>
          )}
        </div>

        {/* CONTROLS FOOTER */}
        <div className="h-20 bg-slate-900 border-t-4 border-slate-800 grid grid-cols-3 gap-2 p-2 shrink-0">
          {Object.values(MOVES).map(move => (
            <button 
              key={move.id}
              onClick={() => handleCombat(move.id)}
              disabled={gameState !== GAME_STATE.COMBAT || !monster}
              className={`rounded flex flex-col items-center justify-center border-b-4 active:border-b-0 active:translate-y-1 transition-all ${
                gameState === GAME_STATE.COMBAT 
                  ? 'bg-slate-800 hover:bg-slate-700 border-black' 
                  : 'bg-slate-950 opacity-30 border-slate-900'
              }`}
            >
              <span className="text-2xl">{move.icon}</span>
              <span className={`text-[8px] font-bold uppercase ${move.color}`}>
                {move.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
export default Game;
