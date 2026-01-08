import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Heart, Shield, Sword, Coins, Skull, 
  ShoppingBag, ArrowRight, Backpack, Activity, User, X, 
  Store, Hammer, Zap, Shirt, Sparkles, Gift, Lock, Minus, Plus, ChevronRight, Flame, Droplets, Snowflake, Hourglass, Star, Scroll, Cross, Book, Crown, Wand, Package, Syringe
} from 'lucide-react';

// --- UTILS & ICONS ---

const StarsIcon = ({size, className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M3 5h4"/><path d="M3 9h4"/></svg>
);

const BrokenShieldIcon = ({size, className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m4.05 11 15.9 0"/></svg>
);

const renderIcon = (Icon, size = 16, className = "") => {
  if (!Icon) return null;
  if (typeof Icon === 'string') return <span style={{fontSize: size}} className={className}>{Icon}</span>;
  return <Icon size={size} className={className} />;
};

// --- CONFIGURATION ---

const GAME_STATE = {
  MENU: 'MENU',
  CLASS_SELECT: 'CLASS_SELECT',
  ZONE_SELECT: 'ZONE_SELECT',
  MAP: 'MAP',
  COMBAT: 'COMBAT',
  VICTORY: 'VICTORY', 
  GAME_OVER: 'GAME_OVER',
};

const MODAL_STATE = { NONE: 'NONE', INVENTORY: 'INVENTORY', SHOP: 'SHOP', STATS: 'STATS' };

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
  BURN: { id: 'eff_burn', name: 'Cháy', type: 'DEBUFF', icon: Flame, color: 'text-orange-500', desc: '-3 HP/lượt', dot: { type: 'HP_FLAT', val: -3 } }
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
  { id: 'pot_small', name: 'Bình Máu Nhỏ', type: 'CONSUMABLE', baseCost: 20, rarity: 1, desc: 'Hồi 30 HP', effect: (p, ctx) => ({ ...p, hp: Math.min(ctx.stats.maxHp, p.hp + (p.classId === 'cleric' ? 45 : 30)) }), icon: '❤️' },
  { id: 'pot_large', name: 'Bình Máu Lớn', type: 'CONSUMABLE', baseCost: 50, rarity: 2, desc: 'Hồi 80 HP', effect: (p, ctx) => ({ ...p, hp: Math.min(ctx.stats.maxHp, p.hp + (p.classId === 'cleric' ? 120 : 80)) }), icon: '🍷' },
  { id: 'respec', name: 'Sách Lãng Quên', type: 'CONSUMABLE', baseCost: 500, rarity: 4, desc: 'Reset điểm', effect: (p) => resetPoints(p), icon: '📖' },
  
  // Buffs
  { id: 'pot_str', name: 'Thuốc Sức Mạnh', type: 'CONSUMABLE', baseCost: 40, rarity: 2, desc: '+5 ATK (3 lượt)', effect: (p) => applyStatusEffect(p, 'STRONG_ATK', 3), icon: '⚔️' },
  { id: 'scroll_shield', name: 'Cuộn Bảo Vệ', type: 'CONSUMABLE', baseCost: 60, rarity: 3, desc: 'Tạo giáp ảo 20', effect: (p) => applyStatusEffect(p, 'SHIELD', 99), icon: '📜' },

  // Equipment (Typed)
  { id: 'w_sword', name: 'Kiếm Sắt', type: 'WEAPON', subType: 'SWORD', baseCost: 50, rarity: 1, baseStats: { atk: 4 }, icon: '🗡️' },
  { id: 'w_axe', name: 'Rìu Chiến', type: 'WEAPON', subType: 'AXE', baseCost: 60, rarity: 2, baseStats: { atk: 6 }, icon: '🪓' },
  { id: 'w_dagger', name: 'Dao Găm', type: 'WEAPON', subType: 'DAGGER', baseCost: 40, rarity: 1, baseStats: { atk: 3, crit: 5 }, icon: '🔪' },
  { id: 'w_staff', name: 'Gậy Phép', type: 'WEAPON', subType: 'STAFF', baseCost: 55, rarity: 2, baseStats: { atk: 5 }, icon: '🦯' },
  
  { id: 'a_plate', name: 'Giáp Tấm', type: 'ARMOR', subType: 'PLATE', baseCost: 80, rarity: 2, baseStats: { def: 4, maxHp: 20 }, icon: '🛡️' },
  { id: 'a_robe', name: 'Áo Vải', type: 'ARMOR', subType: 'ROBE', baseCost: 30, rarity: 1, baseStats: { def: 1, maxHp: 10 }, icon: '👘' },
  { id: 'a_leather', name: 'Giáp Da', type: 'ARMOR', subType: 'LEATHER', baseCost: 40, rarity: 1, baseStats: { def: 2, maxHp: 15 }, icon: '🧥' },
  
  { id: 'ac_ring', name: 'Nhẫn Lực', type: 'ACCESSORY', baseCost: 100, rarity: 2, baseStats: { atk: 2, luck: 1 }, icon: '💍' },
];

const MONSTER_PREFIXES = ["Hư Không", "Bóng Tối", "Rực Lửa", "Băng Giá", "Độc Dược", "Cuồng Nộ", "Cổ Đại"];
const MONSTER_TYPES = ["Slime", "Goblin", "Bộ Xương", "Dơi", "Sói", "Orc", "Phù Thủy", "Golem", "Rồng"];

// --- UTILS ---

const resetPoints = (player) => {
  const totalStats = Object.values(player.statsAllocated).reduce((a,b)=>a+b, 0);
  const totalSkills = Object.values(player.skills).reduce((a,b)=>a+b, 0);
  return {
    ...player,
    statPoints: player.statPoints + totalStats,
    skillPoints: player.skillPoints + totalSkills,
    statsAllocated: { str: 0, agi: 0, vit: 0, luk: 0 },
    skills: {}
  };
};

const applyStatusEffect = (entity, effectId, duration) => {
  const effectDef = EFFECTS_DB[effectId];
  if (!effectDef) return entity;
  const existingIdx = entity.effects.findIndex(e => e.id === effectId);
  let newEffects = [...entity.effects];
  if (existingIdx >= 0) {
    if (effectDef.shieldVal) newEffects[existingIdx] = { ...newEffects[existingIdx], duration, value: effectDef.shieldVal }; 
    else newEffects[existingIdx] = { ...newEffects[existingIdx], duration };
  } else {
    const newEff = { ...effectDef, duration, uid: Math.random() };
    if (effectDef.shieldVal) newEff.value = effectDef.shieldVal;
    newEffects.push(newEff);
  }
  return { ...entity, effects: newEffects };
};

const calculateCost = (item) => {
  if (item.type === 'CONSUMABLE') return item.baseCost;
  const lvl = item.level || 1;
  return Math.floor(item.baseCost * Math.pow(lvl, 1.25));
};

const getItemStats = (item) => {
  if (item.type === 'CONSUMABLE' || !item.baseStats) return {};
  const lvl = item.level || 1;
  const statScale = 1 + 0.12 * (lvl - 1);
  const affixScale = 1 + 0.12 * (lvl - 1);
  let stats = {};
  Object.keys(item.baseStats).forEach(key => { stats[key] = Math.floor(item.baseStats[key] * statScale); });
  if (item.affixes) {
    item.affixes.forEach(affix => {
      const val = Math.floor(affix.val * affixScale);
      stats[affix.stat] = (stats[affix.stat] || 0) + val;
    });
  }
  return stats;
};

const computeFullStats = (player) => {
  const { baseStats, equipment, statsAllocated, skills, effects = [], classId } = player;
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

  breakdown.atk.alloc = statsAllocated.str * 1;
  breakdown.def.alloc = Math.floor(statsAllocated.agi * 0.5);
  breakdown.maxHp.alloc = statsAllocated.vit * 5;
  breakdown.luck.alloc = statsAllocated.luk * 1;

  Object.values(equipment).forEach(item => {
    if (item) {
      const iStats = getItemStats(item);
      Object.keys(iStats).forEach(k => { if (breakdown[k]) breakdown[k].equip += iStats[k]; });
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
  // Rarity weights based on floor
  const bonus = Math.floor(floor * 1.5);
  const roll = Math.random() * 100 + bonus;
  
  if (roll > 110) return 5; // Legendary
  if (roll > 95) return 4;  // Epic
  if (roll > 80) return 3;  // Rare
  if (roll > 50) return 2;  // Uncommon
  return 1; // Common
};

const generateItem = (baseItem, level = 1, forceRarity = null) => {
  const item = { ...baseItem, uid: Math.random().toString(36).substring(2, 11), level };
  
  if (forceRarity) item.rarity = forceRarity; 
  else if (!item.rarity) item.rarity = 1;

  if (item.type !== 'CONSUMABLE') {
    const config = RARITY_CONFIG[item.rarity];
    const availableAffixes = AFFIX_DB.filter(a => a.type.includes(item.type));
    item.affixes = [];
    for (let i = 0; i < config.affixes; i++) {
      if (availableAffixes.length > 0) item.affixes.push(availableAffixes[Math.floor(Math.random() * availableAffixes.length)]);
    }
  }
  
  item.cost = calculateCost(item);
  item.sellPrice = Math.floor(item.cost * 0.45);
  return item;
};

// NEW: LOOT GENERATION
const generateLoot = (zoneId, floor, roomType) => {
  let goldBase = 10 * floor; 
  let xpBase = 10 * floor;
  let itemChance = 0.3;
  let itemRarity = 1;

  if (roomType === 'ELITE') { goldBase *= 2; xpBase *= 2; itemChance = 0.6; itemRarity = Math.max(2, rollRarity(floor)); }
  if (roomType === 'BOSS') { goldBase *= 5; xpBase *= 5; itemChance = 1.0; itemRarity = Math.max(3, rollRarity(floor+5)); }
  if (roomType === 'TREASURE') { goldBase *= 3; itemChance = 1.0; itemRarity = rollRarity(floor); }

  const gold = Math.floor(goldBase * (0.8 + Math.random() * 0.4));
  const exp = Math.floor(xpBase);
  let item = null;

  if (Math.random() < itemChance) {
    // Filter items? For now random from DB
    const dbItem = ITEMS_DB[Math.floor(Math.random() * ITEMS_DB.length)];
    item = generateItem(dbItem, floor, itemRarity);
  }

  return { gold, exp, item };
};

// NEW: SHOP GENERATION with Services
const generateShop = (floor) => {
  const items = [];
  
  // 1. Essentials
  items.push(generateItem(ITEMS_DB[0], 1)); // Small Pot
  items.push(generateItem(ITEMS_DB[1], 1)); // Large Pot

  // 2. Equipment (Scaled)
  const numEquip = 3 + Math.floor(floor / 3);
  for(let i=0; i<numEquip; i++) {
    // Only pick equipment from DB (indices 5+)
    const dbItem = ITEMS_DB[Math.floor(Math.random() * (ITEMS_DB.length - 5)) + 5]; 
    items.push(generateItem(dbItem, Math.max(1, floor + Math.floor(Math.random()*2 - 1))));
  }

  // 3. Services (Fake Items)
  items.push({ 
    id: 'srv_heal', name: 'Hồi Phục Đầy Đủ', type: 'SERVICE', 
    cost: 10 + floor * 5, 
    icon: Syringe, desc: 'Hồi 100% HP', rarity: 2,
    uid: Math.random().toString(36).substring(2, 11)
  });
  
  items.push({ 
    id: 'srv_box', name: 'Hộp Bí Ẩn', type: 'SERVICE', 
    cost: 50 + floor * 10, 
    icon: Package, desc: 'Vật phẩm ngẫu nhiên', rarity: 3,
    uid: Math.random().toString(36).substring(2, 11)
  });

  return items;
};

const PixelAvatar = ({ seed, size = 100, type = 'hero', isDead = false }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); const gridSize = 12; const pixelSize = canvas.width / gridSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let colors = [];
    if (type === 'hero') colors = ['#3b82f6', '#1d4ed8', '#93c5fd', '#fcd34d'];
    else if (type === 'monster') colors = ['#ef4444', '#7f1d1d', '#10b981', '#7c3aed', '#f59e0b'];
    else if (type === 'boss') colors = ['#7c3aed', '#4c1d95', '#c4b5fd', '#ffffff'];
    const random = (s) => { var x = Math.sin(s++) * 10000; return x - Math.floor(x); };
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize / 2; x++) {
        if (random(seed + x * y * 13) > 0.5) {
          const color = colors[Math.floor(random(seed + x + y) * colors.length)];
          ctx.fillStyle = isDead ? '#4b5563' : color;
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize); ctx.fillRect((gridSize - 1 - x) * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }, [seed, type, isDead]);
  return <canvas ref={canvasRef} width={120} height={120} style={{ width: size, height: size }} className="image-pixelated drop-shadow-lg" />;
};

const generateMap = (floor, zoneId) => {
  const numRooms = 6 + Math.floor(Math.random() * 3); 
  const rooms = [];
  rooms.push({ id: 0, type: 'START', completed: true, locked: false });
  for (let i = 1; i < numRooms - 1; i++) {
    const rand = Math.random();
    let type = 'COMBAT';
    if (i === Math.floor(numRooms / 2)) type = 'SHOP'; 
    else if (rand < 0.15) type = 'TREASURE';
    else if (rand < 0.3) type = 'ELITE';
    const isLocked = i !== 1;
    rooms.push({ id: i, type, completed: false, locked: isLocked });
  }
  rooms.push({ id: numRooms - 1, type: 'BOSS', completed: false, locked: true });
  return rooms;
};

// --- MAIN APP ---
export default function App() {
  const [gameState, setGameState] = useState(GAME_STATE.MENU);
  const [activeModal, setActiveModal] = useState(MODAL_STATE.NONE);
  const [logs, setLogs] = useState([]);
  const [effects, setEffects] = useState([]); 
  const [shopItems, setShopItems] = useState([]);
  const [loot, setLoot] = useState(null);

  const [tempStats, setTempStats] = useState(null);
  const [tempStatPoints, setTempStatPoints] = useState(0);
  const [statsTab, setStatsTab] = useState('STATS');

  const [zone, setZone] = useState(ZONES_DB[0]);
  const [floor, setFloor] = useState(1);
  const [mapRooms, setMapRooms] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(0);

  const [player, setPlayer] = useState({
    classId: null,
    level: 1, exp: 0, nextLevelExp: 100, statPoints: 0, skillPoints: 0,
    hp: 100, gold: 100,
    baseStats: { maxHp: 100, atk: 2, def: 0, luck: 0, diceSides: 6 },
    statsAllocated: { str: 0, agi: 0, vit: 0, luk: 0 },
    skills: {}, effects: [],
    inventory: [],
    equipment: { weapon: null, armor: null, accessory: null },
    seed: 12345
  });

  const [monster, setMonster] = useState(null);
  const [animState, setAnimState] = useState({ p: '', m: '' });
  const [diceResult, setDiceResult] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const { final: stats, breakdown: statBreakdown } = useMemo(() => computeFullStats(player), [player]);

  const addLog = (msg, color = 'text-slate-300') => {
    setLogs(prev => [{ id: Date.now() + Math.random(), msg, color }, ...prev].slice(0, 5));
  };

  const addEffect = (text, type = 'damage', x = 50, y = 50) => {
    const id = Date.now() + Math.random();
    setEffects(prev => [...prev, { id, text, type, x, y }]);
    setTimeout(() => setEffects(prev => prev.filter(e => e.id !== id)), 1000);
  };

  // --- GAME LOGIC ---

  const initGame = () => {
    setPlayer({
      classId: null,
      level: 1, exp: 0, nextLevelExp: 100, statPoints: 0, skillPoints: 0,
      hp: 100, gold: 100,
      baseStats: { maxHp: 100, atk: 2, def: 0, luck: 0, diceSides: 6 },
      statsAllocated: { str: 0, agi: 0, vit: 0, luk: 0 },
      skills: {}, effects: [],
      inventory: [],
      equipment: { weapon: null, armor: null, accessory: null },
      seed: Math.random()
    });
    setGameState(GAME_STATE.CLASS_SELECT);
  };

  const selectClass = (cId) => {
    let starterWeapon = ITEMS_DB[4]; 
    if (cId === 'rogue') starterWeapon = ITEMS_DB[6]; 
    else if (cId === 'mage') starterWeapon = ITEMS_DB[7];
    else if (cId === 'cleric') starterWeapon = ITEMS_DB[7];

    let effects = [];
    if (cId === 'warrior') effects.push({ ...EFFECTS_DB.SHIELD, value: 10, duration: 99, uid: Math.random() });

    setPlayer(p => ({
      ...p,
      classId: cId,
      statPoints: 5, skillPoints: 1,
      inventory: [generateItem(starterWeapon, 1), generateItem(ITEMS_DB[0], 1)],
      effects
    }));
    setGameState(GAME_STATE.ZONE_SELECT);
  };

  const enterZone = (selectedZone) => { setZone(selectedZone); setFloor(1); startFloor(1, selectedZone); };

  const startFloor = (floorNum, currentZone) => {
    const rooms = generateMap(floorNum, currentZone.id);
    setMapRooms(rooms); setCurrentRoomId(0); setGameState(GAME_STATE.MAP);
    addLog(`Đến Tầng ${floorNum} - ${currentZone.name}`);
  };

  const enterRoom = (room) => {
    if (room.locked) return;
    setCurrentRoomId(room.id);
    if (room.type === 'START') {} 
    else if (room.type === 'SHOP') { 
      setShopItems(generateShop(floor)); // Use new shop gen
      setActiveModal(MODAL_STATE.SHOP); 
    } 
    else if (room.type === 'TREASURE') {
       const lootData = generateLoot(zone.id, floor, 'TREASURE');
       setLoot(lootData);
       setGameState(GAME_STATE.VICTORY);
    } else if (['COMBAT', 'ELITE', 'BOSS'].includes(room.type)) {
      setMonster(generateMonster(floor, room.type));
      setGameState(GAME_STATE.COMBAT);
    }
  };

  const completeRoom = () => {
    const nextRoomId = currentRoomId + 1;
    if (nextRoomId < mapRooms.length) {
      setMapRooms(prev => prev.map(r => {
        if (r.id === currentRoomId) return { ...r, completed: true };
        if (r.id === nextRoomId) return { ...r, locked: false };
        return r;
      }));
      setGameState(GAME_STATE.MAP);
    } else {
      addLog("Hoàn thành tầng!");
      setFloor(f => f + 1); startFloor(floor + 1, zone);
    }
    setActiveModal(MODAL_STATE.NONE);
  };

  const generateMonster = (lvl, roomType) => {
    const zoneOffset = zone.difficulty;
    let typeModifier = 1;
    if (roomType === 'ELITE') typeModifier = 1.5;
    if (roomType === 'BOSS') typeModifier = 2.5;

    const hp = Math.floor(30 + (lvl * 15) + (zoneOffset * 20) * typeModifier);
    const atk = Math.floor((2 + lvl * 1.2 + zoneOffset * 0.5) * typeModifier);
    const prefix = MONSTER_PREFIXES[Math.floor(Math.random() * MONSTER_PREFIXES.length)];
    const mType = MONSTER_TYPES[Math.floor(Math.random() * MONSTER_TYPES.length)];
    
    const effects = [];
    if (zone.id === 'z_forest' && Math.random() < 0.3) effects.push({ ...EFFECTS_DB.POISON, duration: 999, uid: Math.random() });
    if (zone.id === 'z_dungeon' && Math.random() < 0.3) effects.push({ ...EFFECTS_DB.VULNERABLE, duration: 999, uid: Math.random() }); 

    return {
      name: `${roomType === 'BOSS' ? 'TRÙM ' : ''}${mType} ${prefix}`,
      hp, maxHp: hp, atk,
      exp: 0, gold: 0, // Loot calculated separately now
      diceSides: 4 + Math.floor(lvl / 3),
      type: roomType === 'BOSS' ? 'boss' : 'monster',
      seed: Math.random() * 99999,
      effects,
      roomType // keep for loot
    };
  };

  // --- COMBAT SYSTEM ---

  const tickEffects = (entity, isPlayer) => {
    let { hp, effects = [] } = entity;
    const computedStats = isPlayer ? stats : entity; 
    let isStunned = false;

    const nextEffects = effects.map(e => {
      if (e.dot) {
        let val = e.dot.val;
        if (e.dot.type === 'HP_PERCENT') val = Math.floor(computedStats.maxHp * val);
        hp = Math.min(computedStats.maxHp, hp + val);
        addEffect(val > 0 ? `+${val}` : `${val}`, val > 0 ? 'heal' : 'damage', isPlayer ? 20 : 80, 50);
      }
      if (e.isStun) isStunned = true;
      return { ...e, duration: e.duration - 1 };
    }).filter(e => e.duration > 0 || e.value > 0);

    return { ...entity, hp, effects: nextEffects, isStunned };
  };

  const checkDeath = (pState) => {
    if (pState.hp <= 0) {
      setGameState(GAME_STATE.GAME_OVER);
      return true;
    }
    return false;
  };

  const handleCombat = (playerMoveId) => {
    // 1. Pre-turn
    let pState = tickEffects(player, true);
    setPlayer(pState);
    if (checkDeath(pState)) return;

    if (pState.isStunned) {
      addLog("Bị choáng!", "text-yellow-400 font-bold");
      const mDmg = Math.max(1, monster.atk - stats.def);
      let actualDmg = mDmg;
      let newEffects = [...pState.effects];
      const shieldIdx = newEffects.findIndex(e => e.id === 'eff_shield' && e.value > 0);
      if (shieldIdx >= 0) {
        const shieldVal = newEffects[shieldIdx].value;
        if (shieldVal >= actualDmg) { newEffects[shieldIdx].value -= actualDmg; actualDmg = 0; addEffect("Block!", "heal", 20, 60); } 
        else { actualDmg -= shieldVal; newEffects[shieldIdx].value = 0; }
      }
      pState.effects = newEffects.filter(e => e.id !== 'eff_shield' || e.value > 0);
      const afterStunHp = pState.hp - actualDmg;
      setPlayer({ ...pState, hp: afterStunHp });
      if(actualDmg > 0) addEffect(`-${actualDmg}`, 'damage', 20, 60);
      if (afterStunHp <= 0) setGameState(GAME_STATE.GAME_OVER);
      return; 
    }

    // 2. Combat
    const allMoves = Object.values(MOVES);
    const mMove = allMoves[Math.floor(Math.random() * allMoves.length)];
    const pMove = allMoves.find(m => m.id === playerMoveId);
    if (!pMove || !mMove) return;

    let pDmg = 0, mDmg = 0, outcome = '';
    if (pMove.id === mMove.id) { outcome = 'DRAW'; addLog(`Hòa!`, 'text-yellow-400'); pDmg=1; mDmg=1; }
    else if (pMove.beats === mMove.id) {
      outcome = 'WIN';
      const isCrit = Math.random() * 100 < stats.crit;
      const roll = Math.floor(Math.random() * stats.diceSides) + 1 + stats.luck;
      pDmg = Math.max(1, roll + stats.atk);
      if (isCrit) { pDmg = Math.floor(pDmg * 1.5); addLog("BẠO KÍCH!", "text-red-500 font-bold"); }
      else addLog(`Đánh ${pDmg} st.`);
      
      if (player.classId === 'rogue' && Math.random() < 0.2) { setMonster(m => applyStatusEffect(m, 'POISON', 3)); addLog("Độc Sát!", "text-green-400"); }
      if (player.classId === 'mage' && Math.random() < 0.25) { 
        const effects = ['BURN', 'STUN', 'VULNERABLE']; 
        const rndEff = effects[Math.floor(Math.random()*effects.length)]; 
        setMonster(m => applyStatusEffect(m, rndEff, 2)); 
        addLog("Phép Thuật!", "text-purple-400"); 
      }

      setAnimState({ p: 'animate-attack', m: 'animate-hit' });
    } else {
      outcome = 'LOSE';
      const roll = Math.floor(Math.random() * monster.diceSides) + 1;
      let rawDmg = Math.max(1, roll + monster.atk - stats.def);
      const isVuln = pState.effects.find(e => e.id === 'eff_vuln');
      if (isVuln) { rawDmg = Math.floor(rawDmg * 1.2); addLog("Suy yếu!", "text-purple-400"); }
      mDmg = rawDmg;
      addLog(`Bị đánh ${mDmg} st`, 'text-red-400');
      setAnimState({ p: 'animate-hit', m: 'animate-attack' });
      if (zone.id === 'z_ruins' && Math.random() < 0.2) { setPlayer(p => applyStatusEffect(p, 'STUN', 1)); addLog("Choáng váng!", "text-yellow-400"); }
    }

    setDiceResult({ p: 0, m: 0, outcome, pMove, mMove });
    
    let finalMDmg = mDmg;
    let nextPEffects = [...pState.effects];
    if (finalMDmg > 0) {
      const shieldIdx = nextPEffects.findIndex(e => e.id === 'eff_shield' && e.value > 0);
      if (shieldIdx >= 0) {
        const shieldVal = nextPEffects[shieldIdx].value;
        if (shieldVal >= finalMDmg) { nextPEffects[shieldIdx].value -= finalMDmg; finalMDmg = 0; addEffect("Blocked", "heal", 20, 60); } 
        else { finalMDmg -= shieldVal; nextPEffects[shieldIdx].value = 0; }
      }
    }
    nextPEffects = nextPEffects.filter(e => e.id !== 'eff_shield' || e.value > 0);

    const nextPlayerHp = pState.hp - finalMDmg;
    const nextMonsterHp = monster.hp - pDmg;

    if (pDmg > 0) { addEffect(`-${pDmg}`, 'damage', 80, 40); setMonster(m => ({ ...m, hp: nextMonsterHp })); }
    if (finalMDmg > 0) { addEffect(`-${finalMDmg}`, 'damage', 20, 60); }
    
    setPlayer(p => ({ ...p, hp: nextPlayerHp, effects: nextPEffects }));

    setTimeout(() => setAnimState({ p: '', m: '' }), 500);

    setTimeout(() => {
      if (nextMonsterHp <= 0) {
        const lootData = generateLoot(zone.id, floor, monster.roomType || 'COMBAT');
        setLoot(lootData);
        setGameState(GAME_STATE.VICTORY);
      } else if (nextPlayerHp <= 0) {
        setGameState(GAME_STATE.GAME_OVER);
      } else {
        setMonster(m => tickEffects(m, false));
      }
    }, 600);
  };

  const claimRewards = () => {
    let { level, exp, nextLevelExp, statPoints, skillPoints, baseStats, hp } = player;
    let newExp = exp + loot.exp;
    let leveledUp = false;
    
    const goldBonus = stats.goldMult || 100;
    const finalGold = Math.floor(loot.gold * (goldBonus / 100));

    while (newExp >= nextLevelExp) {
      newExp -= nextLevelExp; level++; nextLevelExp = Math.floor(nextLevelExp * 1.2);
      baseStats.atk += 1; baseStats.def += 0.5; baseStats.maxHp += 5; hp += 5;
      statPoints += 3; if (level % 3 === 0) skillPoints += 1; 
      leveledUp = true;
    }
    if (leveledUp) addLog(`Lên cấp ${level}!`, 'text-yellow-400 font-bold');
    
    let newInv = [...player.inventory];
    if (loot.item && newInv.length < 16) newInv.push(loot.item);
    
    setPlayer(p => ({ ...p, gold: p.gold + finalGold, exp: newExp, level, nextLevelExp, statPoints, skillPoints, baseStats, hp: Math.min(hp, baseStats.maxHp), inventory: newInv }));
    completeRoom();
  };

  // --- ACTIONS ---
  const openStatsModal = () => { setTempStats({ ...player.statsAllocated }); setTempStatPoints(player.statPoints); setActiveModal(MODAL_STATE.STATS); };
  const adjustStat = (key, delta) => {
    if (delta > 0 && tempStatPoints > 0) { setTempStats(p => ({ ...p, [key]: p[key] + 1 })); setTempStatPoints(p => p - 1); }
    else if (delta < 0 && tempStats[key] > player.statsAllocated[key]) { setTempStats(p => ({ ...p, [key]: p[key] - 1 })); setTempStatPoints(p => p + 1); }
  };
  const commitStats = () => { setPlayer(p => ({ ...p, statsAllocated: tempStats, statPoints: tempStatPoints })); setActiveModal(MODAL_STATE.NONE); addLog("Đã lưu chỉ số!"); };
  const upgradeSkill = (skillId) => {
    if (player.skillPoints <= 0) return;
    const currentLevel = player.skills[skillId] || 0;
    const skill = CLASSES_DB[player.classId].skills.find(s => s.id === skillId);
    if (currentLevel >= skill.max) return;
    setPlayer(p => ({ ...p, skillPoints: p.skillPoints - 1, skills: { ...p.skills, [skillId]: currentLevel + 1 } }));
    addLog(`Đã học: ${skill.name}`);
  };
  
  const useConsumable = (item) => {
    if (item.effect) {
      setPlayer(prev => {
        const nextP = item.effect(prev, { stats });
        return { ...nextP, inventory: prev.inventory.filter(i => i.uid !== item.uid) };
      });
    }
    setSelectedItem(null);
    addLog(`Đã dùng ${item.name}`, 'text-green-400');
  };

  const equipItem = (item) => {
    const allowed = CLASSES_DB[player.classId].allowed;
    const slot = item.type === 'WEAPON' ? 'weapon' : item.type === 'ARMOR' ? 'armor' : 'accessory';
    if (slot !== 'accessory' && !allowed[slot].includes(item.subType)) {
      addLog("Không thể trang bị vật phẩm này!", "text-red-500");
      return;
    }
    const current = player.equipment[slot];
    const newInv = player.inventory.filter(i => i.uid !== item.uid);
    if (current) newInv.push(current);
    setPlayer(p => ({ ...p, inventory: newInv, equipment: { ...p.equipment, [slot]: item } }));
    setSelectedItem(null);
  };
  const unequipItem = (slot) => {
    const item = player.equipment[slot];
    if (!item || player.inventory.length >= 16) return;
    setPlayer(p => ({ ...p, equipment: { ...p.equipment, [slot]: null }, inventory: [...p.inventory, item] }));
  };
  const handleMerge = (item1) => {
    if (item1.level >= 9999) { addLog("Max Lv!"); return; }
    const invMatch = player.inventory.find(i => i.id === item1.id && i.level === item1.level && i.uid !== item1.uid);
    const slot = item1.type === 'WEAPON' ? 'weapon' : item1.type === 'ARMOR' ? 'armor' : 'accessory';
    const equipMatch = (player.equipment[slot] && player.equipment[slot].id === item1.id && player.equipment[slot].level === item1.level && player.equipment[slot].uid !== item1.uid) ? player.equipment[slot] : null;
    if (!invMatch && !equipMatch) { addLog("Cần 2 món cùng cấp!"); return; }
    const matchItem = equipMatch || invMatch;
    const isEquippedResult = !!equipMatch || (player.equipment[slot]?.uid === item1.uid);
    const newItem = { ...item1, uid: Math.random().toString(36).substring(2, 11), level: item1.level + 1 };
    newItem.cost = calculateCost(newItem); newItem.sellPrice = Math.floor(newItem.cost * 0.5);
    let newInv = player.inventory.filter(i => i.uid !== item1.uid && i.uid !== matchItem.uid);
    let newEquip = { ...player.equipment };
    if (isEquippedResult) newEquip[slot] = newItem; else newInv.push(newItem);
    setPlayer(p => ({ ...p, inventory: newInv, equipment: newEquip }));
    setSelectedItem(null); addLog(`Nâng cấp Lv.${newItem.level}`); addEffect("UPGRADE!", "heal", 50, 50);
  };

  const buyService = (service) => {
    if (player.gold < service.cost) { addLog("Không đủ tiền!", "text-red-500"); return; }
    
    if (service.id === 'srv_heal') {
      setPlayer(p => ({ ...p, gold: p.gold - service.cost, hp: stats.maxHp }));
      addLog("Đã hồi phục!", "text-green-400");
    } else if (service.id === 'srv_box') {
      const rarity = Math.random() > 0.8 ? 4 : (Math.random() > 0.5 ? 3 : 2);
      const dbItem = ITEMS_DB[Math.floor(Math.random() * (ITEMS_DB.length - 8)) + 8]; 
      const newItem = generateItem(dbItem, floor, rarity);
      if (player.inventory.length < 16) {
        setPlayer(p => ({ ...p, gold: p.gold - service.cost, inventory: [...p.inventory, newItem] }));
        addLog(`Nhận được ${newItem.name}`, "text-yellow-400");
      } else {
        addLog("Túi đầy!", "text-red-500");
      }
    }
  };

  const renderItemCard = (item, onClick, isSelected, badge = '') => {
    if(!item) return <div onClick={onClick} className="aspect-square bg-slate-900 border border-slate-800 rounded opacity-50 flex items-center justify-center text-slate-700"><Shirt size={16}/></div>;
    const rarity = RARITY_CONFIG[item.rarity || 1];
    return (
      <div onClick={onClick} className={`relative aspect-square ${rarity.bg} border-2 rounded p-1 cursor-pointer group hover:brightness-125 ${rarity.color} ${isSelected ? 'ring-2 ring-white scale-95' : ''}`}>
        {item.type !== 'CONSUMABLE' && <div className="absolute top-0 right-0 bg-black/60 text-white text-[8px] px-1 rounded-bl z-10">+{item.level}</div>}
        {badge && <div className="absolute bottom-0 left-0 bg-blue-600 text-white text-[8px] px-1 rounded-tr z-10">{badge}</div>}
        <div className="flex items-center justify-center h-full text-2xl drop-shadow-md">{renderIcon(item.icon, 24)}</div>
        {item.affixes?.length > 0 && <div className="absolute top-0 left-0 text-yellow-400 text-[8px] p-0.5"><Sparkles size={8}/></div>}
      </div>
    );
  };
  const StatAllocationRow = ({ label, code, val, tempVal }) => (
    <div className="flex items-center justify-between bg-slate-800 p-2 rounded mb-2"><div className="font-bold w-12">{label}</div><div className="flex items-center gap-3"><button onClick={() => adjustStat(code, -1)} disabled={tempVal <= player.statsAllocated[code]} className="bg-slate-700 p-1 rounded disabled:opacity-30"><Minus size={14}/></button><span className={`w-6 text-center font-bold ${tempVal > player.statsAllocated[code] ? 'text-green-400' : 'text-white'}`}>{tempVal}</span><button onClick={() => adjustStat(code, 1)} disabled={tempStatPoints <= 0} className="bg-blue-600 p-1 rounded disabled:opacity-30"><Plus size={14}/></button></div></div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white font-mono select-none flex items-center justify-center p-2">
       <style>{`
        .image-pixelated { image-rendering: pixelated; }
        @keyframes floatUp { 0% { transform: translateY(0); opacity:1; } 100% { transform: translateY(-40px); opacity:0; } }
        .anim-float { animation: floatUp 0.8s ease-out forwards; }
        .animate-attack { transform: translateX(30px); transition: 0.1s; }
        .animate-hit { animation: shake 0.4s; filter: brightness(2) sepia(1) hue-rotate(-50deg) saturate(5); }
      `}</style>
      <div className={`w-full max-w-[400px] h-[800px] bg-gradient-to-b ${zone.bg} border-4 border-slate-700 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col`}>
        {/* HEADER */}
        <div className="h-14 bg-slate-900/80 backdrop-blur border-b-4 border-slate-700 flex items-center justify-between px-3 z-20 shrink-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="bg-yellow-600 px-1.5 rounded text-black">LV.{player.level}</span>
              <div className="w-20 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-600"><div className="h-full bg-blue-400" style={{width: `${(player.exp/player.nextLevelExp)*100}%`}}></div></div>
            </div>
            <div className="text-yellow-400 text-sm font-bold flex items-center gap-1 mt-0.5"><Coins size={12}/> {player.gold}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setActiveModal(activeModal === MODAL_STATE.INVENTORY ? MODAL_STATE.NONE : MODAL_STATE.INVENTORY); setSelectedItem(null); }} className={`p-2 rounded hover:bg-blue-700/50 ${activeModal === MODAL_STATE.INVENTORY ? 'bg-blue-600 text-white' : 'bg-slate-700 text-blue-400'}`}><Backpack size={18}/></button>
            {player.classId && <button onClick={openStatsModal} className={`p-2 rounded hover:bg-slate-600 ${activeModal === MODAL_STATE.STATS ? 'bg-slate-500 text-white' : 'bg-slate-700 text-slate-300'}`}><User size={18}/></button>}
          </div>
        </div>

        {/* MAIN GAME */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          {effects.map(e => <div key={e.id} className="absolute anim-float font-bold text-2xl z-30 pointer-events-none" style={{ left: `${e.x}%`, top: `${e.y}%`, color: e.type === 'heal' ? '#4ade80' : '#f87171' }}>{e.text}</div>)}
          
          {gameState === GAME_STATE.MENU && (
            <div className="h-full flex flex-col items-center justify-center gap-6 bg-black/50 z-10">
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-600 tracking-tighter drop-shadow-xl">PIXEL<br/>ROGUE</h1>
              <PixelAvatar seed={123} size={120} type="hero" />
              <button onClick={initGame} className="bg-blue-600 text-white px-8 py-3 rounded font-bold border-b-4 border-blue-800 active:translate-y-1">BẮT ĐẦU</button>
            </div>
          )}

          {gameState === GAME_STATE.CLASS_SELECT && (
            <div className="h-full p-4 overflow-y-auto bg-black/80 z-10">
              <h2 className="text-xl font-bold mb-4 text-center">CHỌN NGHỀ NGHIỆP</h2>
              <div className="space-y-3">
                {Object.values(CLASSES_DB).map(c => (
                  <button key={c.id} onClick={() => selectClass(c.id)} className={`w-full text-left p-4 rounded border-2 bg-slate-800 border-slate-600 hover:border-white transition-all group`}>
                    <div className={`font-bold text-lg ${c.color} flex items-center gap-2`}>{renderIcon(c.icon, 24)} {c.name}</div>
                    <div className="text-xs text-slate-300 mt-1 mb-2">{c.desc}</div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400">
                       <span>ATK: +{c.baseMod.atk}</span><span>DEF: +{c.baseMod.def}</span>
                       <span>HP: {c.baseMod.maxHp > 0 ? '+' : ''}{c.baseMod.maxHp}</span><span>LUCK: +{c.baseMod.luck}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-700 text-[10px] text-yellow-500 italic">Nội tại: {c.passiveDesc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameState === GAME_STATE.ZONE_SELECT && (
            <div className="h-full p-4 overflow-y-auto bg-black/80 z-10">
              <h2 className="text-xl font-bold mb-4 text-center">CHỌN KHU VỰC</h2>
              <div className="space-y-3">{ZONES_DB.map(z => <button key={z.id} onClick={() => enterZone(z)} className={`w-full text-left p-4 rounded border-2 bg-gradient-to-r ${z.bg} border-slate-600 hover:border-white transition-all`}><div className={`font-bold text-lg ${z.color} flex justify-between`}>{z.name} <span className="text-xs bg-black/50 px-2 rounded flex items-center">Độ khó: {z.difficulty}</span></div><div className="text-xs text-slate-300 mt-1">{z.desc}</div></button>)}</div>
            </div>
          )}

          {gameState === GAME_STATE.MAP && (
            <div className="h-full flex flex-col items-center justify-center p-4 bg-black/60 z-10">
              <div className="text-center mb-6"><h2 className={`text-2xl font-black ${zone.color}`}>{zone.name}</h2><div className="text-sm text-slate-400 font-bold">TẦNG {floor}</div></div>
              <div className="flex flex-col gap-3 w-full max-w-xs relative">
                 <div className="absolute left-6 top-4 bottom-4 w-1 bg-slate-700 -z-10"></div>
                 {mapRooms.map((room) => {
                   const isCurrent = room.id === currentRoomId;
                   const rConfig = ROOM_TYPES[room.type];
                   const isClickable = !room.locked && !room.completed;
                   return (
                     <button key={room.id} disabled={room.locked || room.completed} onClick={() => enterRoom(room)} className={`flex items-center gap-4 p-3 rounded-r-xl border-l-4 transition-all ${isCurrent ? 'bg-slate-700 border-yellow-500 scale-105' : ''} ${room.completed ? 'bg-slate-900/50 border-green-600 opacity-50' : ''} ${room.locked ? 'bg-slate-900/30 border-slate-700 opacity-30 grayscale' : 'bg-slate-800 hover:bg-slate-700 cursor-pointer'} ${isClickable ? 'animate-pulse ring-1 ring-yellow-500/50' : ''}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${room.locked ? 'bg-slate-800 border-slate-600' : 'bg-slate-900 border-white'} ${rConfig.color}`}>{room.locked ? <Lock size={16}/> : renderIcon(rConfig.icon, 16)}</div>
                        <div className="text-left"><div className={`font-bold ${room.completed ? 'text-green-500 line-through' : 'text-white'}`}>Phòng {room.id}: {rConfig.label}</div>{isCurrent && <div className="text-[10px] text-yellow-400 font-bold">VỊ TRÍ HIỆN TẠI</div>}{isClickable && !isCurrent && <div className="text-[10px] text-green-400 font-bold flex items-center gap-1">TIẾP THEO <ChevronRight size={10}/></div>}</div>
                     </button>
                   )
                 })}
              </div>
            </div>
          )}

          {(gameState === GAME_STATE.COMBAT || gameState === GAME_STATE.GAME_OVER) && (
             <div className="h-full flex flex-col p-4">
              <div className={`mt-4 flex flex-col items-center transition-transform duration-200 ${animState.m}`}>
                <PixelAvatar seed={monster?.seed} size={130} type={monster?.type} isDead={monster?.hp <= 0} />
                <div className="w-48 mt-2 bg-slate-950 h-3 rounded-full border border-slate-700 relative overflow-hidden"><div className="h-full bg-red-500 transition-all duration-300" style={{width: `${Math.max(0, monster?.hp / monster?.maxHp * 100)}%`}}></div></div>
                <div className="text-red-400 font-bold mt-1 text-sm">{monster?.name} <span className="text-xs text-slate-500">({monster?.hp})</span></div>
                <div className="flex gap-1 mt-1">{monster?.effects?.map(e => <div key={e.uid} className={`bg-slate-900 border ${e.color} p-0.5 rounded text-[10px]`}>{renderIcon(e.icon, 12)}</div>)}</div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                 {diceResult ? (
                  <div className="flex items-center gap-6">
                    <div className="text-center animate-bounce"><div className={`text-4xl ${diceResult.pMove.color}`}>{renderIcon(diceResult.pMove.icon, 32)}</div>{diceResult.outcome === 'WIN' && <div className="text-xl font-bold text-blue-400 mt-1">{diceResult.p}</div>}</div>
                    <div className="text-xl font-black text-slate-700 italic">VS</div>
                    <div className="text-center animate-bounce delay-75"><div className="text-4xl text-slate-400 grayscale">{renderIcon(diceResult.mMove.icon, 32)}</div>{diceResult.outcome === 'LOSE' && <div className="text-xl font-bold text-red-400 mt-1">{diceResult.m}</div>}</div>
                  </div>
                ) : <div className="text-slate-600 animate-pulse font-bold text-sm">CHỌN NƯỚC ĐI</div>}
              </div>
              <div className={`mb-4 flex flex-col items-center transition-transform duration-200 ${animState.p}`}>
                 <div className="w-48 bg-slate-950 h-4 rounded-full border border-slate-700 relative overflow-hidden mb-2"><div className="h-full bg-blue-500 transition-all duration-300" style={{width: `${Math.max(0, player.hp / stats.maxHp * 100)}%`}}></div><span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">HP: {player.hp} / {stats.maxHp}</span></div>
                 <div className="flex gap-1 mb-2">{player.effects.map(e => <div key={e.uid} className={`bg-slate-900 border border-white/20 ${e.color} p-1 rounded-md text-[10px] flex items-center gap-1`}>{renderIcon(e.icon, 12)} {e.value ? `(${e.value})` : ''} <span>{e.duration}</span></div>)}</div>
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex flex-col justify-end pointer-events-none gap-1">
                {logs.map((log) => <div key={log.id} className={`text-[10px] bg-slate-950/80 px-2 py-0.5 rounded w-fit self-center ${log.color} animate-in fade-in slide-in-from-bottom-2`}>{log.msg}</div>)}
              </div>
             </div>
          )}

          {gameState === GAME_STATE.VICTORY && loot && (
            <div className="absolute inset-0 bg-slate-900/95 z-40 flex flex-col items-center justify-center p-6 animate-in zoom-in-95">
              <h2 className="text-3xl font-bold text-yellow-400 mb-6">CHIẾN THẮNG!</h2>
              <div className="bg-slate-800 p-6 rounded-lg border-2 border-slate-700 w-full max-w-xs space-y-4">
                <div className="flex justify-between font-bold"><span className="text-slate-400">Vàng</span><span className="text-yellow-400">+{Math.floor(loot.gold * (stats.goldMult || 100) / 100)}</span></div>
                <div className="flex justify-between font-bold"><span className="text-slate-400">EXP</span><span className="text-blue-400">+{loot.exp}</span></div>
                {loot.item && <div className="mt-4 pt-4 border-t border-slate-600 text-center text-sm text-green-400">Nhặt được: {loot.item.name}</div>}
              </div>
              <button onClick={claimRewards} className="mt-8 bg-green-600 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2">TIẾP TỤC <ArrowRight/></button>
            </div>
          )}

          {/* OVERLAYS: STATS, INVENTORY, SHOP */}
          {activeModal === MODAL_STATE.INVENTORY && (
            <div className="absolute inset-0 bg-slate-900 z-50 flex flex-col">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center"><span className="font-bold">Hành Trang</span><button onClick={() => setActiveModal(MODAL_STATE.NONE)}><X/></button></div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-4 gap-2 mb-6">{['weapon', 'armor', 'accessory'].map(slot => (
                  <div key={slot}>
                    {renderItemCard(player.equipment[slot], () => setSelectedItem({...player.equipment[slot], isEquipped: true, slot}), false, slot)}
                  </div>
                ))}</div>
                <div className="grid grid-cols-4 gap-2">{player.inventory.map(i => (
                  <div key={i.uid}>
                    {renderItemCard(i, () => setSelectedItem(i), selectedItem?.uid === i.uid)}
                  </div>
                ))}</div>
              </div>
              {selectedItem && selectedItem.uid && (
                <div className="bg-slate-800 p-4 border-t border-slate-700">
                   <div className="font-bold text-lg mb-1">{selectedItem.name} +{selectedItem.level}</div>
                   <div className="text-xs text-slate-400 mb-1">{selectedItem.desc || "Trang bị."}</div>
                   <div className="text-xs text-yellow-500 mb-4">Giá bán: {selectedItem.sellPrice} G</div>
                   <div className="grid grid-cols-2 gap-2">
                      {selectedItem.isEquipped ? <button onClick={() => unequipItem(selectedItem.slot)} className="bg-orange-600 py-2 rounded">Tháo</button> : <button onClick={() => selectedItem.type === 'CONSUMABLE' ? useConsumable(selectedItem) : equipItem(selectedItem)} className="bg-green-600 py-2 rounded">Dùng/Mặc</button>}
                      {selectedItem.type !== 'CONSUMABLE' && <button onClick={() => handleMerge(selectedItem)} className="bg-purple-600 py-2 rounded">Ghép</button>}
                      {!selectedItem.isEquipped && <button onClick={() => { setPlayer(p => ({ ...p, gold: p.gold + selectedItem.sellPrice, inventory: p.inventory.filter(i => i.uid !== selectedItem.uid) })); setSelectedItem(null); addLog(`Đã bán +${selectedItem.sellPrice}G`); addEffect(`+${selectedItem.sellPrice}G`, "upgrade", 50, 50); }} className="bg-red-900 text-red-200 py-2 rounded font-bold hover:bg-red-800">Bán</button>}
                   </div>
                </div>
              )}
            </div>
          )}
          {activeModal === MODAL_STATE.STATS && tempStats && player.classId && (
            <div className="absolute inset-0 bg-slate-900/95 z-50 flex flex-col animate-in slide-in-from-bottom-10">
              <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-800">
                <div className="flex gap-2">
                   <button onClick={() => setStatsTab('STATS')} className={`px-3 py-1 rounded text-xs font-bold ${statsTab === 'STATS' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>CHỈ SỐ</button>
                   <button onClick={() => setStatsTab('SKILLS')} className={`px-3 py-1 rounded text-xs font-bold ${statsTab === 'SKILLS' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>KỸ NĂNG</button>
                </div>
                <button onClick={() => setActiveModal(MODAL_STATE.NONE)}><X/></button>
              </div>
              <div className="p-4 overflow-y-auto">
                {statsTab === 'STATS' ? (
                  <>
                     <div className="bg-slate-800 p-3 rounded mb-4 flex justify-between items-center border border-slate-700"><span className="text-slate-400 font-bold text-sm">ĐIỂM TIỀM NĂNG</span><span className="text-yellow-400 font-bold text-xl">{tempStatPoints}</span></div>
                     <StatAllocationRow label="STR" code="str" val={player.statsAllocated.str} tempVal={tempStats.str} />
                     <StatAllocationRow label="VIT" code="vit" val={player.statsAllocated.vit} tempVal={tempStats.vit} />
                     <StatAllocationRow label="AGI" code="agi" val={player.statsAllocated.agi} tempVal={tempStats.agi} />
                     <StatAllocationRow label="LUK" code="luk" val={player.statsAllocated.luk} tempVal={tempStats.luk} />
                     {tempStatPoints !== player.statPoints && <button onClick={commitStats} className="w-full bg-green-600 py-3 rounded font-bold mt-4 shadow-lg active:scale-95">LƯU THAY ĐỔI</button>}
                  </>
                ) : (
                  <>
                    <div className="bg-slate-800 p-3 rounded mb-4 flex justify-between items-center border border-slate-700"><span className="text-slate-400 font-bold text-sm">ĐIỂM KỸ NĂNG</span><span className="text-blue-400 font-bold text-xl">{player.skillPoints}</span></div>
                     <div className="space-y-3">
                        {CLASSES_DB[player.classId].skills.map(sk => {
                           const lvl = player.skills[sk.id] || 0; const isMax = lvl >= sk.max;
                           return (
                             <div key={sk.id} className="bg-slate-800 p-3 rounded border border-slate-700">
                                <div className="flex justify-between items-start mb-1"><div className="font-bold text-white">{sk.name} <span className="text-xs text-yellow-500">Lv.{lvl}/{sk.max}</span></div>{!isMax && <button onClick={() => upgradeSkill(sk.id)} disabled={player.skillPoints <= 0} className="bg-blue-600 px-2 py-0.5 rounded text-xs disabled:opacity-30 active:scale-95">Nâng Cấp</button>}</div><div className="text-xs text-slate-400">{sk.desc}</div>
                             </div>
                           )
                        })}
                     </div>
                  </>
                )}
              </div>
            </div>
          )}
          {activeModal === MODAL_STATE.SHOP && (
            <div className="absolute inset-0 bg-slate-900 z-50 flex flex-col">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center"><span className="font-bold text-yellow-500">Cửa Hàng</span><button onClick={() => { setActiveModal(MODAL_STATE.NONE); completeRoom(); }}><X/></button></div>
              <div className="p-4 space-y-3 overflow-y-auto">
                 {shopItems.map(item => (
                   <div key={item.uid} className={`bg-slate-800 p-2 rounded border flex gap-3 items-center ${item.type === 'SERVICE' ? 'border-blue-500' : RARITY_CONFIG[item.rarity].color.replace('text-', 'border-')}`}>
                      <div className="text-2xl">{renderIcon(item.icon, 24)}</div>
                      <div className="flex-1"><div className="font-bold text-sm">{item.name} {item.level ? `+${item.level}` : ''}</div><div className="text-[10px] text-slate-400">{item.desc || (item.baseCost + ' G')}</div></div>
                      <button onClick={() => { if(item.type === 'SERVICE') buyService(item); else { if (player.gold >= item.cost && player.inventory.length < 16) { setPlayer(p => ({...p, gold: p.gold - item.cost, inventory: [...p.inventory, generateItem(item, 1)]})); addLog("Đã mua!"); addEffect("-G", "debuff", 80, 20); } } }} className="bg-yellow-600 text-black px-3 py-1 rounded text-xs font-bold">{item.cost} G</button>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {gameState === GAME_STATE.GAME_OVER && (
            <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-6 text-center">
               <Skull size={64} className="text-red-500 mb-4 animate-pulse"/>
               <h2 className="text-4xl font-black text-red-600 mb-2 tracking-tighter">BẠN ĐÃ CHẾT</h2>
               <p className="text-slate-400 mb-8">Hành trình kết thúc tại Tầng {floor}</p>
               <button onClick={() => setGameState(GAME_STATE.MENU)} className="bg-white text-black px-8 py-3 rounded-full font-bold">QUAY LẠI MENU</button>
            </div>
          )}
        </div>

        {/* CONTROLS */}
        <div className="h-20 bg-slate-900 border-t-4 border-slate-800 grid grid-cols-3 gap-2 p-2 shrink-0">
          {Object.values(MOVES).map(move => (
            <button key={move.id} onClick={() => handleCombat(move.id)} disabled={gameState !== GAME_STATE.COMBAT} className={`rounded flex flex-col items-center justify-center border-b-4 border-black active:border-b-0 active:translate-y-1 transition-all ${gameState === GAME_STATE.COMBAT ? 'bg-slate-800' : 'bg-slate-950 opacity-20'}`}>
              <span className="text-2xl">{renderIcon(move.icon, 24)}</span>
              <span className={`text-[8px] font-bold uppercase ${move.color}`}>{move.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}