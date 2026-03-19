import { ArrowRight, Gift, Skull, Store, Sword, Zap } from "lucide-react";

export const ROOM_TYPES = {
  START: { icon: ArrowRight, color: "text-white", label: "Lối Vào" },
  COMBAT: { icon: Sword, color: "text-slate-300", label: "Quái Vật" },
  ELITE: { icon: Skull, color: "text-red-400", label: "Tinh Anh" },
  TREASURE: { icon: Gift, color: "text-yellow-400", label: "Kho Báu" },
  SHOP: { icon: Store, color: "text-blue-400", label: "Cửa Hàng" },
  BOSS: { icon: Zap, color: "text-purple-500", label: "TRÙM" },
};
