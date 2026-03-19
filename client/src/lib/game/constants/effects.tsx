type InlineIconProps = { size?: number; className?: string };

import { Droplets, Heart, Shield, Sword } from "lucide-react";

const StarsIcon = ({ size, className }: InlineIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M9 3v4" />
    <path d="M3 5h4" />
    <path d="M3 9h4" />
  </svg>
);

const BrokenShieldIcon = ({ size, className }: InlineIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m4.05 11 15.9 0" />
  </svg>
);

export const EFFECTS_DB = {
  STRONG_ATK: {
    id: "eff_strong",
    name: "Tăng Lực",
    type: "BUFF",
    icon: Sword,
    color: "text-red-400",
    desc: "+5 ATK",
    mods: { atk: 5 },
  },
  REGEN: {
    id: "eff_regen",
    name: "Hồi Phục",
    type: "BUFF",
    icon: Heart,
    color: "text-pink-400",
    desc: "+3 HP/lượt",
    dot: { type: "HP_FLAT", val: 3 },
  },
  POISON: {
    id: "eff_poison",
    name: "Trúng Độc",
    type: "DEBUFF",
    icon: Droplets,
    color: "text-green-400",
    desc: "-4 HP/lượt",
    dot: { type: "HP_FLAT", val: -4 },
  },
  SHIELD: {
    id: "eff_shield",
    name: "Lá Chắn",
    type: "BUFF",
    icon: Shield,
    color: "text-blue-300",
    desc: "Hấp thụ 20 ST",
    shieldVal: 20,
  },
  STUN: {
    id: "eff_stun",
    name: "Choáng",
    type: "DEBUFF",
    icon: StarsIcon,
    color: "text-yellow-400",
    desc: "Mất lượt",
    isStun: true,
  },
  VULNERABLE: {
    id: "eff_vuln",
    name: "Suy Yếu",
    type: "DEBUFF",
    icon: BrokenShieldIcon,
    color: "text-purple-400",
    desc: "+20% ST nhận vào",
    incomingPercent: 20,
  },
};
