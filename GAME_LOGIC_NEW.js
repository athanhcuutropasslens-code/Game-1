import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Heart, Shield, Sword, Coins, Skull, 
  ShoppingBag, ArrowRight, Backpack, Activity, User, X, 
  Store, Hammer, Zap, Shirt, Sparkles, Gift, Lock, Minus, Plus, ChevronRight, ChevronLeft, Flame, Droplets, Snowflake, Hourglass, Star, Scroll, Cross, Book, Crown, Wand, Package, Syringe, Search, Info
} from 'lucide-react';

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
  MONSTER_INFO: 'MONSTER_INFO' 
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
  { id: 'pot_small', name: 'Bình Máu Nhỏ', type: 'CONSUMABLE', baseCost: 20, rarity: 1, desc: 'Hồi 30 HP', effect: (p, ctx) => ({ ...p, hp: Math.min(ctx.stats.maxHp, p.hp + (p.classId === 'cleric' ? 45 : 30)) }), icon: Heart },
  { id: 'pot_large', name: 'Bình Máu Lớn', type: 'CONSUMABLE', baseCost: 50, rarity: 2, desc: 'Hồi 80 HP', effect: (p, ctx) => ({ ...p, hp: Math.min(ctx.stats.maxHp, p.hp + (p.classId === 'cleric' ? 120 : 80)) }), icon: Heart },
  { id: 'respec', name: 'Sách Lãng Quên', type: 'CONSUMABLE', baseCost: 500, rarity: 4, desc: 'Reset điểm', effect: (p) => ({ ...p, statPoints: 5, skillPoints: 1, statsAllocated: { str: 0, agi: 0, vit: 0, luk: 0 }, skills: {} }), icon: Book },
  
  // Buffs
  { id: 'pot_str', name: 'Thuốc Sức Mạnh', type: 'CONSUMABLE', baseCost: 40, rarity: 2, desc: '+5 ATK (3 lượt)', effect: (p) => ({ ...p, effects: [...p.effects, { ...EFFECTS_DB.STRONG_ATK, duration: 3, uid: Math.random() }] }), icon: Sword },
  { id: 'scroll_shield', name: 'Cuộn Bảo Vệ', type: 'CONSUMABLE', baseCost: 60, rarity: 3, desc: 'Tạo giáp ảo 20', effect: (p) => ({ ...p, effects: [...p.effects, { ...EFFECTS_DB.SHIELD, duration: 99, value: 20, uid: Math.random() }] }), icon: Scroll },

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

// --- LOGIC FUNCTIONS ---
const calculateCost = (item) => {
  if (item.type === 'CONSUMABLE' || item.type === 'SERVICE') return item.baseCost;
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
  const item = { ...baseItem, uid: Math.random().toString(36).substring(2, 11), level };
  if (forceRarity) item.rarity = forceRarity; 
  else if (!item.rarity) item.rarity = 1;
  
  if (item.type !== 'CONSUMABLE') {
    const config = RARITY_CONFIG[item.rarity]; 
    const availableAffixes = AFFIX_DB.filter(a => a.type.includes(item.type)); 
    item.affixes = [];
    for (let i = 0; i < config.affixes; i++) { 
      if (availableAffixes.length > 0) {
        item.affixes.push({...availableAffixes[Math.floor(Math.random() * availableAffixes.length)]});
      }
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

const generateLoot = (zoneId, floor, roomType, playerClass) => {
  let goldBase = 10 * floor; 
  let xpBase = 10 * floor; 
  let itemChance = 0.3; 
  let itemRarity = 1;
  
  if (roomType === 'ELITE') { 
    goldBase *= 2; 
    xpBase *= 2; 
    itemChance = 0.6; 
    itemRarity = Math.max(2, rollRarity(floor)); 
  }
  if (roomType === 'BOSS') { 
    goldBase *= 5; 
    xpBase *= 5; 
    itemChance = 1.0; 
    itemRarity = Math.max(3, rollRarity(floor + 5)); 
  }
  if (roomType === 'TREASURE') { 
    goldBase *= 3; 
    itemChance = 1.0; 
    itemRarity = rollRarity(floor); 
  }

  const gold = Math.floor(goldBase * (0.8 + Math.random() * 0.4)); 
  const exp = Math.floor(xpBase); 
  let item = null;
  
  if (Math.random() < itemChance) {
    const usableItems = ITEMS_DB.filter(i => isItemUsableByClass(i, playerClass));
    if (usableItems.length > 0) { 
      const dbItem = usableItems[Math.floor(Math.random() * usableItems.length)]; 
      item = generateItem(dbItem, floor, itemRarity); 
    }
  }
  return { gold, exp, item };
};

const generateShop = (floor, playerClass) => {
  const items = [];
  items.push(generateItem(ITEMS_DB[0], 1)); 
  items.push(generateItem(ITEMS_DB[1], 1)); 
  
  const usableEquip = ITEMS_DB.filter(i => i.type !== 'CONSUMABLE' && i.type !== 'SERVICE' && isItemUsableByClass(i, playerClass));
  if (usableEquip.length > 0) {
    const weapons = usableEquip.filter(i => i.type === 'WEAPON'); 
    const armors = usableEquip.filter(i => i.type === 'ARMOR');
    
    if (weapons.length > 0) items.push(generateItem(weapons[Math.floor(Math.random() * weapons.length)], floor));
    if (armors.length > 0) items.push(generateItem(armors[Math.floor(Math.random() * armors.length)], floor));
    
    const numFiller = 2 + Math.floor(floor / 5); 
    for(let i = 0; i < numFiller; i++) { 
      items.push(generateItem(usableEquip[Math.floor(Math.random() * usableEquip.length)], Math.max(1, floor + Math.floor(Math.random()*2 - 1)))); 
    }
  }
  
  items.push({ 
    id: 'srv_heal', 
    name: 'Hồi Phục', 
    type: 'SERVICE', 
    cost: 10 + floor * 5, 
    icon: Syringe, 
    desc: 'Hồi 100% HP', 
    rarity: 2, 
    uid: 'service_heal_' + Date.now(), 
    baseCost: 10 + floor * 5 
  });
  
  items.push({ 
    id: 'srv_box', 
    name: 'Hộp Bí Ẩn', 
    type: 'SERVICE', 
    cost: 50 + floor * 10, 
    icon: Package, 
    desc: 'Vật phẩm ngẫu nhiên', 
    rarity: 3, 
    uid: 'service_box_' + Date.now(), 
    baseCost: 50 + floor * 10 
  });
  
  return items;
};

const generateMonster = (floor, roomType) => {
  const prefix = MONSTER_PREFIXES[Math.floor(Math.random() * MONSTER_PREFIXES.length)];
  const type = MONSTER_TYPES[Math.floor(Math.random() * MONSTER_TYPES.length)];
  const name = `${prefix} ${type}`;
  const isElite = roomType === 'ELITE';
  const isBoss = roomType === 'BOSS';
  
  let baseHp = 20 + floor * 10;
  let baseAtk = 5 + floor * 2;
  
  if (isElite) {
    baseHp *= 2;
    baseAtk *= 1.5;
  }
  if (isBoss) {
    baseHp *= 5;
    baseAtk *= 3;
  }
  
  return {
    uid: Math.random().toString(36).substring(2, 11),
    name,
    hp: baseHp,
    maxHp: baseHp,
    atk: baseAtk,
    diceSides: 6,
    seed: Math.random() * 1000,
    type: isBoss ? 'boss' : 'monster',
    roomType
  };
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
export default function App() {
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
    seed: Math.floor(Math.random() * 10000)
  });
  
  const [monster, setMonster] = useState(null);
  const [animState, setAnimState] = useState({ p: '', m: '' });
  const [diceResult, setDiceResult] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const { final: stats, breakdown: statBreakdown } = useMemo(() => computeFullStats(player, tempStats), [player, tempStats]);
  const { final: currentRealStats } = useMemo(() => computeFullStats(player), [player]);

  const addLog = useCallback((msg, color = 'text-slate-300') => {
    setLogs(prev => [{ id: Date.now() + Math.random(), msg, color }, ...prev].slice(0, 5));
  }, []);

  const addEffect = useCallback((text, type = 'damage', x = 50, y = 50) => {
    const id = Date.now() + Math.random();
    setEffects(prev => [...prev, { id, text, type, x, y }]);
    setTimeout(() => setEffects(prev => prev.filter(e => e.id !== id)), 1000);
  }, []);

  // --- GAME ACTIONS ---
  const initGame = useCallback(() => {
    setPlayer({ 
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
      seed: Math.floor(Math.random() * 10000)
    });
    setGameState(GAME_STATE.CLASS_SELECT);
    addLog("Bắt đầu game mới!");
  }, [addLog]);

  const selectClass = useCallback((cId) => {
    let starterWepId = 'w_sword';
    if (cId === 'rogue') starterWepId = 'w_dagger';
    else if (cId === 'mage') starterWepId = 'w_staff';
    else if (cId === 'cleric') starterWepId = 'w_staff';
    else if (cId === 'warrior') starterWepId = 'w_axe';
    
    const weaponBase = ITEMS_DB.find(i => i.id === starterWepId) || ITEMS_DB[4];
    let starterArmId = 'a_leather';
    if (cId === 'warrior') starterArmId = 'a_plate';
    else if (cId === 'mage' || cId === 'cleric') starterArmId = 'a_robe';
    
    const armorBase = ITEMS_DB.find(i => i.id === starterArmId) || ITEMS_DB[10];
    
    let initialEffects = [];
    if (cId === 'warrior') {
      initialEffects.push({ ...EFFECTS_DB.SHIELD, value: 10, duration: 99, uid: Math.random() });
    }
    
    setPlayer(p => ({ 
      ...p, 
      classId: cId, 
      statPoints: 5, 
      skillPoints: 1, 
      inventory: [
        generateItem(weaponBase, 1), 
        generateItem(armorBase, 1), 
        generateItem(ITEMS_DB[0], 1)
      ], 
      effects: initialEffects 
    }));
    setGameState(GAME_STATE.ZONE_SELECT);
    addLog(`Đã chọn lớp: ${CLASSES_DB[cId].name}`);
  }, [addLog]);

  const enterZone = useCallback((z) => {
    setZone(z);
    setFloor(1);
    startFloor(1, z.id);
  }, []);

  const startFloor = useCallback((f, zId) => {
    const rooms = generateMap(f, zId);
    setMapRooms(rooms);
    setCurrentRoomId(0);
    setGameState(GAME_STATE.MAP);
    addLog(`Tầng ${f} - ${ZONES_DB.find(z => z.id === zId)?.name}`);
  }, [addLog]);

  const enterRoom = useCallback((r) => {
    if (r.locked || r.completed) return;
    setCurrentRoomId(r.id);
    
    if (r.type === 'SHOP') {
      setShopItems(generateShop(floor, player.classId));
      setActiveModal(MODAL_STATE.SHOP);
    } else if (r.type === 'TREASURE') {
      const lootData = generateLoot(zone.id, floor, 'TREASURE', player.classId);
      setLoot(lootData);
      setGameState(GAME_STATE.VICTORY);
      // Mark room as completed and unlock next
      setMapRooms(prev => prev.map(room => 
        room.id === r.id 
          ? { ...room, completed: true } 
          : (room.id === r.id + 1 ? { ...room, locked: false } : room)
      ));
    } else if (['COMBAT', 'ELITE', 'BOSS'].includes(r.type)) {
      setMonster(generateMonster(floor, r.type));
      setGameState(GAME_STATE.COMBAT);
    }
  }, [floor, player.classId, zone.id]);

  const handleCombat = useCallback((moveId) => {
    if (!monster) return;
    
    const pDmg = Math.floor(Math.random() * stats.diceSides) + 1 + stats.atk;
    const mDmg = Math.max(0, Math.floor(Math.random() * monster.diceSides) + monster.atk - stats.def);
    
    // Update monster HP
    const newMonsterHp = monster.hp - pDmg;
    setMonster(m => ({ ...m, hp: newMonsterHp }));
    
    // Update player HP
    const newPlayerHp = player.hp - mDmg;
    setPlayer(p => ({ ...p, hp: newPlayerHp }));
    
    addLog(`Đánh ${pDmg}, nhận ${mDmg} ST.`);
    addEffect(`-${pDmg}`, 'damage', 30, 30);
    
    // Check results after state updates
    setTimeout(() => {
      if (newMonsterHp <= 0) {
        const lootData = generateLoot(zone.id, floor, monster.roomType || 'COMBAT', player.classId);
        setLoot(lootData);
        setGameState(GAME_STATE.VICTORY);
        // Mark room as completed and unlock next
        setMapRooms(prev => prev.map(room => 
          room.id === currentRoomId 
            ? { ...room, completed: true } 
            : (room.id === currentRoomId + 1 ? { ...room, locked: false } : room)
        ));
        addLog(`Đã đánh bại ${monster.name}!`, 'text-green-400');
      } else if (newPlayerHp <= 0) {
        setGameState(GAME_STATE.GAME_OVER);
        addLog("Bạn đã thua trận!", 'text-red-500');
      }
    }, 100);
  }, [monster, stats, player.hp, addLog, addEffect, zone.id, floor, player.classId, currentRoomId]);

  const claimLoot = useCallback(() => {
    if (!loot) return;
    
    let newPlayer = { ...player };
    let { level, exp, nextLevelExp, statPoints, skillPoints, baseStats, hp } = newPlayer;
    let newExp = exp + loot.exp;
    let leveledUp = false;
    
    // Gold bonus
    const goldBonus = stats.goldMult || 100;
    const finalGold = Math.floor(loot.gold * (goldBonus / 100));
    
    // Level up check
    while (newExp >= nextLevelExp) {
      newExp -= nextLevelExp;
      level++;
      nextLevelExp = Math.floor(nextLevelExp * 1.2);
      baseStats = { ...baseStats, atk: baseStats.atk + 1, def: baseStats.def + 0.5, maxHp: baseStats.maxHp + 5 };
      hp += 5;
      statPoints += 3;
      if (level % 3 === 0) skillPoints += 1;
      leveledUp = true;
    }
    
    if (leveledUp) {
      addLog(`Lên cấp ${level}!`, 'text-yellow-400 font-bold');
      addEffect("LEVEL UP!", "upgrade", 50, 50);
    }
    
    // Add item to inventory if exists
    let newInv = [...player.inventory];
    if (loot.item) {
      newInv.push(loot.item);
      addLog(`Nhận được: ${loot.item.name}`, 'text-green-400');
    }
    
    // Update player
    setPlayer({
      ...player,
      gold: player.gold + finalGold,
      exp: newExp,
      level,
      nextLevelExp,
      statPoints,
      skillPoints,
      baseStats,
      hp: Math.min(hp, baseStats.maxHp),
      inventory: newInv
    });
    
    // Reset states
    setLoot(null);
    setGameState(GAME_STATE.MAP);
    setActiveModal(MODAL_STATE.NONE);
  }, [loot, player, stats.goldMult, addLog, addEffect]);

  const openStatsModal = useCallback(() => {
    setTempStats({ ...player.statsAllocated });
    setTempStatPoints(player.statPoints);
    setActiveModal(MODAL_STATE.STATS);
  }, [player]);

  const adjustStat = useCallback((key, delta) => {
    if (delta > 0 && tempStatPoints > 0) {
      setTempStats(p => ({ ...p, [key]: p[key] + 1 }));
      setTempStatPoints(p => p - 1);
    } else if (delta < 0 && tempStats[key] > (player.statsAllocated[key] || 0)) {
      setTempStats(p => ({ ...p, [key]: p[key] - 1 }));
      setTempStatPoints(p => p + 1);
    }
  }, [tempStatPoints, tempStats, player.statsAllocated]);

  const commitStats = useCallback(() => {
    setPlayer(p => ({ ...p, statsAllocated: tempStats, statPoints: tempStatPoints }));
    setActiveModal(MODAL_STATE.NONE);
    addLog("Đã lưu chỉ số!", 'text-green-400');
  }, [tempStats, tempStatPoints, addLog]);

  const upgradeSkill = useCallback((skillId) => {
    if (player.skillPoints <= 0) return;
    
    const currentLevel = player.skills[skillId] || 0;
    const skill = CLASSES_DB[player.classId]?.skills.find(s => s.id === skillId);
    if (!skill || currentLevel >= skill.max) return;
    
    setPlayer(p => ({ 
      ...p, 
      skillPoints: p.skillPoints - 1, 
      skills: { ...p.skills, [skillId]: currentLevel + 1 } 
    }));
    addLog(`Đã học: ${skill.name} cấp ${currentLevel + 1}`, 'text-blue-400');
  }, [player.skillPoints, player.skills, player.classId, addLog]);

  const useConsumable = useCallback((item) => {
    if (!item.effect) return;
    
    setPlayer(prev => {
      const nextP = item.effect(prev, { stats });
      return { 
        ...nextP, 
        inventory: prev.inventory.filter(i => i.uid !== item.uid) 
      };
    });
    
    setSelectedItem(null);
    addLog(`Đã dùng ${item.name}`, 'text-green-400');
  }, [stats, addLog]);

  const equipItem = useCallback((item) => {
    if (!player.classId) return;
    
    const allowed = CLASSES_DB[player.classId]?.allowed;
    const slot = item.type === 'WEAPON' ? 'weapon' : item.type === 'ARMOR' ? 'armor' : 'accessory';
    
    if (slot !== 'accessory' && allowed && !allowed[slot]?.includes(item.subType)) {
      addLog("Lớp này không thể trang bị vật phẩm này!", "text-red-500");
      return;
    }
    
    const current = player.equipment[slot];
    const newInv = player.inventory.filter(i => i.uid !== item.uid);
    if (current) newInv.push(current);
    
    setPlayer(p => ({ 
      ...p, 
      inventory: newInv, 
      equipment: { ...p.equipment, [slot]: item } 
    }));
    setSelectedItem(null);
    addLog(`Đã trang bị ${item.name}`, 'text-blue-400');
  }, [player.classId, player.equipment, player.inventory, addLog]);

  const unequipItem = useCallback((slot) => {
    const item = player.equipment[slot];
    if (!item) return;
    
    setPlayer(p => ({ 
      ...p, 
      equipment: { ...p.equipment, [slot]: null }, 
      inventory: [...p.inventory, item] 
    }));
    setSelectedItem(null);
    addLog(`Đã tháo ${item.name}`, 'text-yellow-400');
  }, [player.equipment, player.inventory, addLog]);

  const handleMerge = useCallback((item1) => {
    if (item1.level >= 9999) {
      addLog("Đã đạt cấp tối đa!", "text-red-500");
      return;
    }
    
    // Find matching item
    const invMatch = player.inventory.find(i => 
      i.id === item1.id && 
      i.level === item1.level && 
      i.uid !== item1.uid
    );
    
    const slot = item1.type === 'WEAPON' ? 'weapon' : item1.type === 'ARMOR' ? 'armor' : 'accessory';
    const equipMatch = (player.equipment[slot] && 
      player.equipment[slot].id === item1.id && 
      player.equipment[slot].level === item1.level && 
      player.equipment[slot].uid !== item1.uid) ? player.equipment[slot] : null;
    
    if (!invMatch && !equipMatch) {
      addLog("Cần 2 món cùng loại và cùng cấp để hợp nhất!", "text-red-500");
      return;
    }
    
    const matchItem = equipMatch || invMatch;
    const isEquippedResult = !!equipMatch || (player.equipment[slot]?.uid === item1.uid);
    
    // Create upgraded item
    const newItem = { 
      ...item1, 
      uid: Math.random().toString(36).substring(2, 11), 
      level: item1.level + 1 
    };
    newItem.cost = calculateCost(newItem);
    newItem.sellPrice = Math.floor(newItem.cost * 0.45);
    
    // Update inventory and equipment
    let newInv = player.inventory.filter(i => i.uid !== item1.uid && i.uid !== matchItem.uid);
    let newEquip = { ...player.equipment };
    
    if (isEquippedResult) {
      newEquip[slot] = newItem;
    } else {
      newInv.push(newItem);
    }
    
    setPlayer(p => ({ ...p, inventory: newInv, equipment: newEquip }));
    setSelectedItem(null);
    addLog(`Nâng cấp thành công! ${newItem.name} Lv.${newItem.level}`, 'text-purple-400');
    addEffect("UPGRADE!", "heal", 50, 50);
  }, [player.inventory, player.equipment, addLog, addEffect]);

  const buyService = useCallback((service) => {
    if (player.gold < service.cost) {
      addLog("Không đủ vàng!", "text-red-500");
      return;
    }
    
    if (service.id === 'srv_heal') {
      setPlayer(p => ({ 
        ...p, 
        gold: p.gold - service.cost, 
        hp: stats.maxHp 
      }));
      addLog("Đã hồi phục toàn bộ HP!", "text-green-400");
    } else if (service.id === 'srv_box') {
      const rarity = Math.random() > 0.8 ? 4 : (Math.random() > 0.5 ? 3 : 2);
      const usable = ITEMS_DB.filter(i => isItemUsableByClass(i, player.classId));
      const dbItem = usable[Math.floor(Math.random() * usable.length)];
      const newItem = generateItem(dbItem, floor, rarity);
      
      setPlayer(p => ({ 
        ...p, 
        gold: p.gold - service.cost, 
        inventory: [...p.inventory, newItem] 
      }));
      addLog(`Nhận được ${newItem.name} (${RARITY_CONFIG[rarity].name})`, "text-yellow-400");
    }
  }, [player.gold, player.classId, stats.maxHp, floor, addLog]);

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
          {renderIcon(item.icon, 24)}
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
            <button 
              onClick={() => { 
                setActiveModal(activeModal === MODAL_STATE.INVENTORY ? MODAL_STATE.NONE : MODAL_STATE.INVENTORY); 
                setSelectedItem(null); 
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
              <h2 className={`text-2xl font-black ${zone.color} mb-6`}>
                {zone.name} - Tầng {floor}
              </h2>
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
                      <span>{ROOM_TYPES[r.type].label}</span>
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
                  <PixelAvatar 
                    seed={monster.seed} 
                    size={120} 
                    type={monster.type} 
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
                <div className="text-xs text-slate-400">
                  HP: {Math.max(0, monster.hp)}/{monster.maxHp}
                </div>
              </div>

              {/* VS Separator */}
              <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                VS
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
                <PixelAvatar 
                  seed={player.seed} 
                  size={80} 
                  type="hero" 
                  isDead={player.hp <= 0}
                />
                <div className="text-xs text-slate-400 mt-1">
                  {CLASSES_DB[player.classId]?.name || 'Chưa chọn lớp'}
                </div>
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
                  <PixelAvatar seed={monster.seed} size={100} type={monster.type} />
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
                            onClick={() => setSelectedItem({...player.equipment[slot], isEquipped: true, slot})}
                            className={`aspect-square border-2 rounded p-1 cursor-pointer bg-slate-800 ${RARITY_CONFIG[player.equipment[slot].rarity].color}`}
                          >
                            {renderIcon(player.equipment[slot].icon, 24)}
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
                    <div 
                      key={i.uid}
                      onClick={() => setSelectedItem(i)}
                      className={`aspect-square border-2 rounded p-1 cursor-pointer bg-slate-800 hover:brightness-125 ${RARITY_CONFIG[i.rarity].color}`}
                    >
                      {renderIcon(i.icon, 24)}
                      {i.level > 1 && (
                        <div className="absolute top-0 right-0 bg-black/60 text-white text-[8px] px-1 rounded-bl">
                          +{i.level}
                        </div>
                      )}
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
                  
                  {selectedItem.desc && (
                    <div className="text-xs text-yellow-500 mb-3">{selectedItem.desc}</div>
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
                    
                    {selectedItem.type !== 'CONSUMABLE' && (
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
                          setSelectedItem(null);
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
                <button onClick={() => setActiveModal(MODAL_STATE.NONE)}>
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
                      {renderIcon(item.icon, 24)}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm">
                        {item.name} {item.level ? `+${item.level}` : ''}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.desc || (item.baseCost + ' G')}
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
                              inventory: [...p.inventory, generateItem(item, 1)]
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