import React from 'react';

export const PotStrengthSprite = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    aria-label="Strength potion"
  >
    <defs>
      <radialGradient id="potStrAura" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#fb923c" stopOpacity="0.65" />
        <stop offset="60%" stopColor="#f97316" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="potStrLiquid" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fdba74" />
        <stop offset="100%" stopColor="#dc2626" />
      </linearGradient>
    </defs>

    <circle cx="12" cy="12" r="10" fill="url(#potStrAura)" />

    <path d="M10 4h4v2h-4z" fill="#fef3c7" opacity="0.9" />
    <path d="M9 6h6c0 1-.4 1.8-1.1 2.4.9.8 1.6 2 1.6 3.6V18a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-6c0-1.6.7-2.8 1.6-3.6C9.4 7.8 9 7 9 6z" fill="#334155" />
    <path d="M9.6 12.3c0-1.4.6-2.3 1.3-2.9h2.2c.7.6 1.3 1.5 1.3 2.9v5.3c0 .7-.6 1.3-1.3 1.3h-2.2c-.7 0-1.3-.6-1.3-1.3z" fill="url(#potStrLiquid)" />

    <path d="M11 11.3h2.2" stroke="#fff7ed" strokeWidth="0.9" strokeLinecap="round" opacity="0.7" />
    <path d="M10.7 13.3h2.7" stroke="#fff7ed" strokeWidth="0.9" strokeLinecap="round" opacity="0.55" />

    <path d="M5.8 11.8c.8-.2 1.1-.6 1.4-1.2" stroke="#fb923c" strokeWidth="0.9" strokeLinecap="round" opacity="0.7" />
    <path d="M17 10.1c.7.2 1.1.8 1.2 1.4" stroke="#f97316" strokeWidth="0.9" strokeLinecap="round" opacity="0.75" />
    <path d="M16.4 14.9c.6.1 1 .6 1.1 1.2" stroke="#ea580c" strokeWidth="0.9" strokeLinecap="round" opacity="0.75" />
  </svg>
);

export const getItemPaletteClass = (item: { id?: string; type?: string }) => {
  if (item?.id === 'pot_str') return 'text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.7)]';
  if (item?.type === 'WEAPON') return 'text-slate-300';
  return '';
};
