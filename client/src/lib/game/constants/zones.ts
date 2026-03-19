import type { GameZoneDefinition } from "@/lib/gameTypes";

export const ZONES_DB: GameZoneDefinition[] = [
  {
    id: "z_forest",
    name: "Rừng Độc",
    difficulty: 0,
    desc: "Quái vật gây Độc.",
    color: "text-green-400",
    bg: "from-green-900 to-slate-900",
  },
  {
    id: "z_ruins",
    name: "Tàn Tích",
    difficulty: 2,
    desc: "Quái vật gây Choáng.",
    color: "text-yellow-400",
    bg: "from-yellow-900 to-slate-900",
  },
  {
    id: "z_dungeon",
    name: "Hầm Ngục",
    difficulty: 5,
    desc: "Quái vật gây Suy Yếu.",
    color: "text-purple-400",
    bg: "from-purple-900 to-slate-900",
  },
  {
    id: "z_hell",
    name: "Địa Ngục",
    difficulty: 10,
    desc: "Thử thách cực đại.",
    color: "text-red-500",
    bg: "from-red-900 to-orange-900",
  },
];
