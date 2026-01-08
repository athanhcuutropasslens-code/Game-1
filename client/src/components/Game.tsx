/**
 * Pixel Rogue - Main Game Component
 * Design: Retro Arcade Cyberpunk
 * A turn-based RPG with class selection, dungeon exploration, and equipment system
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Coins, Backpack, User, Minus, Plus, X, Lock, Sparkles, ChevronRight } from 'lucide-react';
import PixelAvatar from './PixelAvatar';
import {
  GAME_STATE,
  MODAL_STATE,
  CLASSES_DB,
  ZONES_DB,
  EFFECTS_DB,
  ROOM_TYPES,
  MOVES,
  RARITY_CONFIG,
  MONSTER_PREFIXES,
  MONSTER_TYPES,
  ITEMS_DB,
} from '@/lib/gameConstants';
import {
  resetPoints,
  applyStatusEffect,
  calculateCost,
  generateItem,
  generateLoot,
  generateMapRooms,
} from '@/lib/gameUtils';
import { Player, Monster, GameEffect, GameItem, Zone, MapRoom } from '@/lib/gameTypes';

export default function Game() {
  // Game State
  const [gameState, setGameState] = useState<string>(GAME_STATE.MENU);
  const [activeModal, setActiveModal] = useState<string>(MODAL_STATE.NONE);
  const [zone, setZone] = useState<Zone | null>(null);
  const [floor, setFloor] = useState(1);
  const [currentRoomId, setCurrentRoomId] = useState(0);
  const [mapRooms, setMapRooms] = useState<MapRoom[]>([]);

  // Player State
  const [player, setPlayer] = useState<Player | null>(null);
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null);

  // Combat State
  const [monster, setMonster] = useState<Monster | null>(null);
  const [loot, setLoot] = useState<any>(null);
  const [diceResult, setDiceResult] = useState<any>(null);
  const [animState, setAnimState] = useState({ p: '', m: '' });

  // UI State
  const [effects, setEffects] = useState<any[]>([]);
  const [log, setLog] = useState<any[]>([]);
  const [tempStats, setTempStats] = useState<any>({});
  const [tempStatPoints, setTempStatPoints] = useState(0);

  // Computed Stats
  const stats = useMemo(() => {
    if (!player) return {};
    const classData = CLASSES_DB[player.classId as keyof typeof CLASSES_DB];
    const allocated = player.statsAllocated;

    return {
      atk: (player.baseStats.atk || 0) + classData.baseMod.atk + allocated.str,
      def: (player.baseStats.def || 0) + classData.baseMod.def + allocated.agi,
      maxHp: (player.baseStats.maxHp || 0) + classData.baseMod.maxHp + allocated.vit * 2,
      crit: (player.baseStats.crit || 0) + ((classData.baseMod as any).crit || 0),
      luck: (player.baseStats.luck || 0) + classData.baseMod.luck + allocated.luk,
      diceSides: 4,
      goldMult: 100,
      hpRegen: 0,
    };
  }, [player]);

  // Utility Functions
  const addLog = (text: string, className = 'text-white') => {
    setLog((prev) => [...prev, { id: Math.random(), text, className }]);
  };

  const addEffect = (text: string, type: 'heal' | 'damage', x: number, y: number) => {
    const id = Math.random();
    setEffects((prev) => [...prev, { id, text, type, x, y }]);
    setTimeout(() => setEffects((prev) => prev.filter((e) => e.id !== id)), 800);
  };

  // Game Flow
  const initGame = () => {
    setGameState(GAME_STATE.CLASS_SELECT);
    setLog([]);
  };

  const selectClass = (classId: string) => {
    const classData = CLASSES_DB[classId as keyof typeof CLASSES_DB];
    const newPlayer: Player = {
      classId,
      level: 1,
      exp: 0,
      nextLevelExp: 100,
      hp: 100 + classData.baseMod.maxHp,
      gold: 50,
      statPoints: 5,
      skillPoints: 0,
      baseStats: {
        atk: 5 + classData.baseMod.atk,
        def: 2 + classData.baseMod.def,
        maxHp: 100 + classData.baseMod.maxHp,
        crit: (classData.baseMod as any).crit || 0,
        luck: classData.baseMod.luck,
      },
      statsAllocated: { str: 0, agi: 0, vit: 0, luk: 0 },
      skills: {},
      inventory: [],
      equipment: { weapon: null, armor: null, accessory: null },
      effects: [],
    };
    setPlayer(newPlayer);
    setGameState(GAME_STATE.ZONE_SELECT);
    addLog(`Chọn ${classData.name}!`, 'text-green-400');
  };

  const enterZone = (selectedZone: Zone) => {
    setZone(selectedZone);
    setFloor(1);
    startFloor(1, selectedZone);
  };

  const startFloor = (floorNum: number, selectedZone: Zone) => {
    const rooms = generateMapRooms(floorNum);
    setMapRooms(rooms);
    setCurrentRoomId(0);
    setGameState(GAME_STATE.MAP);
    addLog(`Tầng ${floorNum} - ${selectedZone.name}`, selectedZone.color);
  };

  const enterRoom = (room: MapRoom) => {
    setCurrentRoomId(room.id);

    if (room.type === 'SHOP') {
      setActiveModal(MODAL_STATE.SHOP);
      setGameState(GAME_STATE.MAP);
    } else if (room.type === 'TREASURE') {
      const lootData = generateLoot(zone?.id || '', floor, 'TREASURE');
      setLoot(lootData);
      setGameState(GAME_STATE.VICTORY);
    } else if (['COMBAT', 'ELITE', 'BOSS'].includes(room.type)) {
      const newMonster: Monster = generateMonster(floor, room.type);
      setMonster(newMonster);
      setGameState(GAME_STATE.COMBAT);
    }
  };

  const generateMonster = (lvl: number, roomType: string): Monster => {
    const zoneOffset = zone?.difficulty || 0;
    let typeModifier = 1;
    if (roomType === 'ELITE') typeModifier = 1.5;
    if (roomType === 'BOSS') typeModifier = 2.5;

    const hp = Math.floor((30 + lvl * 15 + zoneOffset * 20) * typeModifier);
    const atk = Math.floor((2 + lvl * 1.2 + zoneOffset * 0.5) * typeModifier);
    const prefix = MONSTER_PREFIXES[Math.floor(Math.random() * MONSTER_PREFIXES.length)];
    const mType = MONSTER_TYPES[Math.floor(Math.random() * MONSTER_TYPES.length)];

    const effects: GameEffect[] = [];
    if (zone?.id === 'z_forest' && Math.random() < 0.3) {
      effects.push({
        ...(EFFECTS_DB.POISON as any),
        duration: 999,
        uid: Math.random().toString(),
      });
    }

    return {
      name: `${roomType === 'BOSS' ? 'TRÙM ' : ''}${mType} ${prefix}`,
      hp,
      maxHp: hp,
      atk,
      exp: 0,
      gold: 0,
      diceSides: 4 + Math.floor(lvl / 3),
      type: roomType === 'BOSS' ? 'boss' : 'monster',
      seed: Math.random() * 99999,
      effects,
      roomType,
    };
  };

  const completeRoom = () => {
    const nextRoomId = currentRoomId + 1;
    if (nextRoomId < mapRooms.length) {
      setMapRooms((prev) =>
        prev.map((r) => {
          if (r.id === currentRoomId) return { ...r, completed: true };
          if (r.id === nextRoomId) return { ...r, locked: false };
          return r;
        })
      );
      setGameState(GAME_STATE.MAP);
    } else {
      addLog('Hoàn thành tầng!', 'text-yellow-400 font-bold');
      setFloor((f) => f + 1);
      startFloor(floor + 1, zone!);
    }
    setActiveModal(MODAL_STATE.NONE);
  };

  // Combat System
  const handleCombat = (playerMoveId: string) => {
    if (!monster || !player) return;

    const allMoves = Object.values(MOVES);
    const mMove = allMoves[Math.floor(Math.random() * allMoves.length)];
    const pMove = allMoves.find((m) => m.id === playerMoveId);

    if (!pMove || !mMove) return;

    let pDmg = 0,
      mDmg = 0,
      outcome = '';

    if (pMove.id === mMove.id) {
      outcome = 'DRAW';
      addLog('Hòa!', 'text-yellow-400');
      pDmg = 1;
      mDmg = 1;
    } else if (pMove.beats === mMove.id) {
      outcome = 'WIN';
      const isCrit = Math.random() * 100 < (stats.crit || 0);
      const roll = Math.floor(Math.random() * (stats.diceSides || 4)) + 1 + (stats.luck || 0);
      pDmg = Math.max(1, roll + (stats.atk || 0));
      if (isCrit) {
        pDmg = Math.floor(pDmg * 1.5);
        addLog('BẠO KÍCH!', 'text-red-500 font-bold');
      } else {
        addLog(`Đánh ${pDmg} st.`);
      }
      setAnimState({ p: 'animate-attack', m: 'animate-hit' });
    } else {
      outcome = 'LOSE';
      const roll = Math.floor(Math.random() * monster.diceSides) + 1;
      mDmg = Math.max(1, roll + monster.atk - (stats.def || 0));
      addLog(`Bị đánh ${mDmg} st`, 'text-red-400');
      setAnimState({ p: 'animate-hit', m: 'animate-attack' });
    }

    setDiceResult({ p: 0, m: 0, outcome, pMove, mMove });

    if (pDmg > 0) {
      addEffect(`-${pDmg}`, 'damage', 80, 40);
      setMonster((m) => (m ? { ...m, hp: m.hp - pDmg } : null));
    }
    if (mDmg > 0) {
      addEffect(`-${mDmg}`, 'damage', 20, 60);
    }

    setPlayer((p) => (p ? { ...p, hp: Math.max(0, p.hp - mDmg) } : null));

    setTimeout(() => setAnimState({ p: '', m: '' }), 500);

    setTimeout(() => {
      if (monster && monster.hp - pDmg <= 0) {
        const lootData = generateLoot(zone?.id || '', floor, monster.roomType || 'COMBAT');
        setLoot(lootData);
        setGameState(GAME_STATE.VICTORY);
      } else if (player && player.hp - mDmg <= 0) {
        setGameState(GAME_STATE.GAME_OVER);
      }
    }, 600);
  };

  const claimRewards = () => {
    if (!player || !loot) return;

    let { level, exp, nextLevelExp, statPoints, skillPoints, baseStats, hp } = player;
    let newExp = exp + loot.exp;
    let leveledUp = false;

    const goldBonus = stats.goldMult || 100;
    const finalGold = Math.floor(loot.gold * (goldBonus / 100));

    while (newExp >= nextLevelExp) {
      newExp -= nextLevelExp;
      level++;
      nextLevelExp = Math.floor(nextLevelExp * 1.2);
      baseStats.atk = (baseStats.atk || 0) + 1;
      baseStats.def = (baseStats.def || 0) + 0.5;
      baseStats.maxHp = (baseStats.maxHp || 0) + 5;
      hp += 5;
      statPoints += 3;
      if (level % 3 === 0) skillPoints += 1;
      leveledUp = true;
    }

    if (leveledUp) addLog(`Lên cấp ${level}!`, 'text-yellow-400 font-bold');

    let newInv = [...(player as any)?.inventory || []];
    if (loot.item && newInv.length < 16) newInv.push(loot.item);

    setPlayer((p) =>
      p
        ? {
            ...p,
            gold: p.gold + finalGold,
            exp: newExp,
            level,
            nextLevelExp,
            statPoints,
            skillPoints,
            baseStats,
            hp: Math.min(hp, baseStats.maxHp || 100),
            inventory: newInv,
          }
        : null
    );

    completeRoom();
  };

  // Stat Management
  const openStatsModal = () => {
    if (!player) return;
    setTempStats({ ...player.statsAllocated });
    setTempStatPoints(player.statPoints);
    setActiveModal(MODAL_STATE.STATS);
  };

  const adjustStat = (key: string, delta: number) => {
    if (!player) return;
    if (delta > 0 && tempStatPoints > 0) {
      setTempStats((p: any) => ({ ...p, [key]: p[key] + 1 }));
      setTempStatPoints((p) => p - 1);
    } else if (delta < 0 && tempStats[key] > player.statsAllocated[key as keyof typeof player.statsAllocated]) {
      setTempStats((p: any) => ({ ...p, [key]: p[key] - 1 }));
      setTempStatPoints((p) => p + 1);
    }
  };

  const commitStats = () => {
    if (!player) return;
    setPlayer((p) =>
      p
        ? {
            ...p,
            statsAllocated: tempStats,
            statPoints: tempStatPoints,
          }
        : null
    );
    setActiveModal(MODAL_STATE.NONE);
    addLog('Đã lưu chỉ số!');
  };

  // Render Functions
  const renderItemCard = (item: any, onClick: () => void, isSelected: boolean) => {
    if (!item) {
      return (
        <div
          onClick={onClick}
          className="aspect-square bg-slate-900 border border-slate-800 rounded opacity-50 flex items-center justify-center text-slate-700"
        >
          👕
        </div>
      );
    }

    const rarity = RARITY_CONFIG[item.rarity as keyof typeof RARITY_CONFIG];
    return (
      <div
        onClick={onClick}
        className={`relative aspect-square ${rarity.bg} border-2 rounded p-1 cursor-pointer group hover:brightness-125 ${rarity.color} ${
          isSelected ? 'ring-2 ring-white scale-95' : ''
        }`}
      >
        {item.type !== 'CONSUMABLE' && (
          <div className="absolute top-0 right-0 bg-black/60 text-white text-[8px] px-1 rounded-bl z-10">
            +{item.level}
          </div>
        )}
        <div className="flex items-center justify-center h-full text-2xl drop-shadow-md">{item.icon}</div>
        {item.affixes && item.affixes.length > 0 && (
          <div className="absolute top-0 left-0 text-yellow-400 text-[8px] p-0.5">
            <Sparkles size={8} />
          </div>
        )}
      </div>
    );
  };

  if (!player) {
    return (
      <div className="min-h-screen bg-[#0a0e27] text-[#00ff41] font-mono select-none flex items-center justify-center p-2 scanlines">
        <style>{`
          @keyframes floatUp { 0% { transform: translateY(0); opacity:1; } 100% { transform: translateY(-40px); opacity:0; } }
          .anim-float { animation: floatUp 0.8s ease-out forwards; }
          .animate-attack { transform: translateX(30px); transition: 0.1s; }
          .animate-hit { animation: glitch 0.4s; }
        `}</style>

        <div className="w-full max-w-[400px] h-[800px] bg-gradient-to-b from-[#0a0e27] to-[#1a1a3e] border-4 border-[#00d9ff] rounded-lg overflow-hidden shadow-[0_0_20px_rgba(0,217,255,0.5)] relative flex flex-col">
          {gameState === GAME_STATE.MENU && (
            <div className="h-full flex flex-col items-center justify-center gap-6 bg-black/50 z-10">
              <h1 className="text-5xl font-black text-[#00ff41] tracking-tighter drop-shadow-xl drop-shadow-lg">
                PIXEL
                <br />
                ROGUE
              </h1>
              <PixelAvatar seed={123} size={120} type="hero" />
              <button
                onClick={initGame}
                className="arcade-button"
              >
                BẮT ĐẦU
              </button>
            </div>
          )}

          {gameState === GAME_STATE.CLASS_SELECT && (
            <div className="h-full p-4 overflow-y-auto bg-black/80 z-10">
              <h2 className="text-xl font-bold mb-4 text-center neon-green">CHỌN NGHỀ NGHIỆP</h2>
              <div className="space-y-3">
                {Object.values(CLASSES_DB).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectClass(c.id)}
                    className="w-full text-left p-4 rounded border-2 bg-[#0f1419] border-[#00d9ff] hover:border-[#00ff41] transition-all group"
                  >
                    <div className={`font-bold text-lg ${c.color} flex items-center gap-2`}>
                      {c.name}
                    </div>
                    <div className="text-xs text-slate-300 mt-1 mb-2">{c.desc}</div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400">
                      <span>ATK: +{c.baseMod.atk}</span>
                      <span>DEF: +{c.baseMod.def}</span>
                      <span>HP: {c.baseMod.maxHp > 0 ? '+' : ''}{c.baseMod.maxHp}</span>
                      <span>LUCK: +{c.baseMod.luck}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-[#00d9ff] text-[10px] text-[#ffd700] italic">
                      Nội tại: {c.passiveDesc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameState === GAME_STATE.ZONE_SELECT && (
            <div className="h-full p-4 overflow-y-auto bg-black/80 z-10">
              <h2 className="text-xl font-bold mb-4 text-center neon-green">CHỌN KHU VỰC</h2>
              <div className="space-y-3">
                {ZONES_DB.map((z) => (
                  <button
                    key={z.id}
                    onClick={() => enterZone(z)}
                    className="w-full text-left p-4 rounded border-2 bg-gradient-to-r from-[#0f1419] to-[#1a1a3e] border-[#00d9ff] hover:border-[#00ff41] transition-all"
                  >
                    <div className={`font-bold text-lg ${z.color} flex justify-between`}>
                      {z.name}
                      <span className="text-xs bg-black/50 px-2 rounded flex items-center">
                        Độ khó: {z.difficulty}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 mt-1">{z.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameState === GAME_STATE.MAP && (
            <div className="h-full flex flex-col items-center justify-center p-4 bg-black/60 z-10">
              <div className="text-center mb-6">
                <h2 className={`text-2xl font-black ${zone?.color}`}>{zone?.name}</h2>
                <div className="text-sm text-slate-400 font-bold">TẦNG {floor}</div>
              </div>
              <div className="flex flex-col gap-3 w-full max-w-xs relative">
                <div className="absolute left-6 top-4 bottom-4 w-1 bg-slate-700 -z-10"></div>
                {mapRooms.map((room) => {
                  const isCurrent = room.id === currentRoomId;
                  const rConfig = ROOM_TYPES[room.type as keyof typeof ROOM_TYPES];
                  const isClickable = !room.locked && !room.completed;

                  return (
                    <button
                      key={room.id}
                      disabled={room.locked || room.completed}
                      onClick={() => enterRoom(room)}
                      className={`flex items-center gap-4 p-3 rounded-r-xl border-l-4 transition-all ${
                        isCurrent ? 'bg-slate-700 border-yellow-500 scale-105' : ''
                      } ${room.completed ? 'bg-slate-900/50 border-green-600 opacity-50' : ''} ${
                        room.locked
                          ? 'bg-slate-900/30 border-slate-700 opacity-30 grayscale'
                          : 'bg-slate-800 hover:bg-slate-700 cursor-pointer'
                      } ${isClickable ? 'animate-pulse ring-1 ring-yellow-500/50' : ''}`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                          room.locked
                            ? 'bg-slate-800 border-slate-600'
                            : 'bg-slate-900 border-white'
                        } ${rConfig.color}`}
                      >
                        {room.locked ? <Lock size={16} /> : rConfig.icon}
                      </div>
                      <div className="text-left">
                        <div
                          className={`font-bold ${
                            room.completed
                              ? 'text-green-500 line-through'
                              : 'text-white'
                          }`}
                        >
                          Phòng {room.id}: {rConfig.label}
                        </div>
                        {isCurrent && (
                          <div className="text-[10px] text-yellow-400 font-bold">
                            VỊ TRÍ HIỆN TẠI
                          </div>
                        )}
                        {isClickable && !isCurrent && (
                          <div className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                            TIẾP THEO <ChevronRight size={10} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(gameState === GAME_STATE.COMBAT || gameState === GAME_STATE.GAME_OVER) && monster && (
            <div className="h-full flex flex-col p-4">
              <div className={`mt-4 flex flex-col items-center transition-transform duration-200 ${animState.m}`}>
                <PixelAvatar
                  seed={monster.seed}
                  size={130}
                  type={monster.type}
                  isDead={monster.hp <= 0}
                />
                <div className="w-48 mt-2 bg-slate-950 h-3 rounded-full border border-slate-700 relative overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{
                      width: `${Math.max(0, (monster.hp / monster.maxHp) * 100)}%`,
                    }}
                  ></div>
                </div>
                <div className="text-red-400 font-bold mt-1 text-sm">
                  {monster.name} <span className="text-xs text-slate-500">({monster.hp})</span>
                </div>
              </div>

              {gameState === GAME_STATE.COMBAT && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                  <div className="text-center text-sm text-slate-300">Chọn hành động:</div>
                  <div className="flex gap-3">
                    {Object.values(MOVES).map((move) => (
                      <button
                        key={move.id}
                        onClick={() => handleCombat(move.id)}
                        className="arcade-button text-lg"
                      >
                        {move.icon} {move.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {gameState === GAME_STATE.GAME_OVER && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                  <div className="text-2xl font-bold text-red-500 drop-shadow-lg">GAME OVER</div>
                  <button
                    onClick={() => {
                      setGameState(GAME_STATE.ZONE_SELECT);
                      setPlayer(null);
                    }}
                    className="arcade-button"
                  >
                    QUAY LẠI
                  </button>
                </div>
              )}

              {effects.map((e) => (
                <div
                  key={e.id}
                  className="absolute anim-float font-bold text-2xl z-30 pointer-events-none"
                  style={{
                    left: `${e.x}%`,
                    top: `${e.y}%`,
                    color: e.type === 'heal' ? '#4ade80' : '#f87171',
                  }}
                >
                  {e.text}
                </div>
              ))}
            </div>
          )}

          {gameState === GAME_STATE.VICTORY && (
            <div className="h-full flex flex-col items-center justify-center gap-4 bg-black/80 z-10 p-4">
              <div className="text-2xl font-bold text-[#00ff41] drop-shadow-lg">CHIẾN THẮNG!</div>
              {loot && (
                <div className="text-center">
                  <div className="text-[#ffd700]">+{loot.exp} EXP</div>
                  <div className="text-[#00ff41]">+{loot.gold} GOLD</div>
                  {loot.item && (
                    <div className="text-[#ff00ff]">Nhận: {loot.item.name}</div>
                  )}
                </div>
              )}
              <button onClick={claimRewards} className="arcade-button">
                NHẬN THƯỞNG
              </button>
            </div>
          )}

          {/* Header */}
          <div className="h-14 bg-slate-900/80 backdrop-blur border-b-4 border-[#00d9ff] flex items-center justify-between px-3 z-20 shrink-0">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="bg-[#ffd700] px-1.5 rounded text-black">
                  LV.{(player as any)?.level || 0}
                </span>
                <div className="w-20 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-600">
                  <div
                    className="h-full bg-blue-400"
                    style={{
                      width: `${(((player as any)?.exp || 0) / ((player as any)?.nextLevelExp || 1)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="text-[#ffd700] text-sm font-bold flex items-center gap-1 mt-0.5">
                <Coins size={12} /> {(player as any)?.gold || 0}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveModal(
                    activeModal === MODAL_STATE.INVENTORY
                      ? MODAL_STATE.NONE
                      : MODAL_STATE.INVENTORY
                  );
                  setSelectedItem(null);
                }}
                className={`p-2 rounded hover:bg-blue-700/50 ${
                  activeModal === MODAL_STATE.INVENTORY
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-blue-400'
                }`}
              >
                <Backpack size={18} />
              </button>
              {player && (
                <button
                  onClick={openStatsModal}
                  className={`p-2 rounded hover:bg-slate-600 ${
                    activeModal === MODAL_STATE.STATS
                      ? 'bg-slate-500 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  <User size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Modals */}
          {activeModal === MODAL_STATE.INVENTORY && player && (
            <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="bg-[#0f1419] border-2 border-[#00d9ff] rounded-lg p-4 max-w-sm w-full max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[#00ff41]">TÚI ĐỒ</h3>
                  <button
                    onClick={() => setActiveModal(MODAL_STATE.NONE)}
                    className="p-1 hover:bg-slate-700 rounded"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {((player as any)?.inventory || []).map((item: any) => (
                    <div key={item.uid} onClick={() => setSelectedItem(item)}>
                      {renderItemCard(item, () => setSelectedItem(item), selectedItem?.uid === item.uid)}
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, 16 - (player as any)?.inventory || [].length) }).map((_, i) => (
                    <div key={`empty-${i}`}>{renderItemCard(null, () => {}, false)}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeModal === MODAL_STATE.STATS && player && (
            <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="bg-[#0f1419] border-2 border-[#00d9ff] rounded-lg p-4 max-w-sm w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[#00ff41]">CHỈ SỐ</h3>
                  <button
                    onClick={() => setActiveModal(MODAL_STATE.NONE)}
                    className="p-1 hover:bg-slate-700 rounded"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between bg-slate-800 p-2 rounded">
                    <span className="font-bold">Điểm còn lại:</span>
                    <span className="text-[#00ff41]">{tempStatPoints}</span>
                  </div>
                  {[
                    { label: 'STR', code: 'str' },
                    { label: 'AGI', code: 'agi' },
                    { label: 'VIT', code: 'vit' },
                    { label: 'LUK', code: 'luk' },
                  ].map(({ label, code }) => (
                    <div key={code} className="flex items-center justify-between bg-slate-800 p-2 rounded">
                      <div className="font-bold w-12">{label}</div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => adjustStat(code, -1)}
                          disabled={tempStats[code] <= ((player as any)?.statsAllocated)[code]}
                          className="bg-slate-700 p-1 rounded disabled:opacity-30"
                        >
                          <Minus size={14} />
                        </button>
                        <span
                          className={`w-6 text-center font-bold ${
                            tempStats[code] > ((player as any)?.statsAllocated)[code]
                              ? 'text-green-400'
                              : 'text-white'
                          }`}
                        >
                          {tempStats[code]}
                        </span>
                        <button
                          onClick={() => adjustStat(code, 1)}
                          disabled={tempStatPoints <= 0}
                          className="bg-blue-600 p-1 rounded disabled:opacity-30"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={commitStats} className="arcade-button w-full">
                  LƯU
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
