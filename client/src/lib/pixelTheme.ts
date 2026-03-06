export const PIXEL_THEME = {
  palette: {
    void900: '#0a0e27',
    void800: '#11172f',
    void700: '#1a1f3f',
    slate900: '#0f172a',
    slate700: '#334155',
    slate500: '#64748b',
    white: '#ffffff',
    black: '#000000',
    neonGreen: '#00ff41',
    neonPink: '#ff006e',
    neonPurple: '#ff00ff',
    neonCyan: '#00d9ff',
    neonYellow: '#ffd700',
    blue500: '#3b82f6',
    blue700: '#1d4ed8',
    red500: '#ef4444',
    red900: '#7f1d1d',
    orange500: '#f59e0b',
    emerald500: '#10b981',
    violet500: '#7c3aed',
    violet900: '#4c1d95',
    gray600: '#4b5563',
    gray800: '#1f2937',
  },
  scale: {
    x1: 1,
    x2: 2,
    x4: 4,
  },
  rules: {
    pixelBorderWidth: 2,
    borderStyle: 'solid',
    shadowSm: '0 0 4px',
    glowMd: '0 0 10px currentColor, 0 0 20px currentColor',
  },
  groups: {
    monster: {
      text: 'text-red-400',
      accent: '#ef4444',
      dark: '#7f1d1d',
    },
    class: {
      warrior: 'text-red-500',
      rogue: 'text-green-400',
      mage: 'text-purple-400',
      cleric: 'text-yellow-400',
    },
    consumable: {
      text: 'text-green-400',
      border: 'border-green-500',
    },
    weapon: {
      text: 'text-red-400',
      border: 'border-red-500',
    },
    armor: {
      text: 'text-blue-400',
      border: 'border-blue-500',
    },
    accessory: {
      text: 'text-yellow-400',
      border: 'border-yellow-500',
    },
    rarity: {
      1: { name: 'Thường', color: 'border-slate-500 text-slate-300', bg: 'bg-slate-800' },
      2: { name: 'Hiếm', color: 'border-green-500 text-green-400', bg: 'bg-slate-800' },
      3: { name: 'Cao Cấp', color: 'border-blue-500 text-blue-400', bg: 'bg-slate-900' },
      4: { name: 'Sử Thi', color: 'border-purple-500 text-purple-400', bg: 'bg-slate-900' },
      5: { name: 'Huyền Thoại', color: 'border-orange-500 text-orange-400', bg: 'bg-slate-950' },
    },
  },
  fx: {
    scanlineClass: 'pixel-scanline',
    glowClass: 'pixel-glow',
    borderClass: 'pixel-border',
  },
} as const;

export const PIXEL_AVATAR_COLORS = {
  hero: ['#3b82f6', '#1d4ed8', '#93c5fd', '#fcd34d'],
  monster: ['#ef4444', '#7f1d1d', '#10b981', '#7c3aed', '#f59e0b'],
  boss: ['#7c3aed', '#4c1d95', '#c4b5fd', '#ffffff'],
  dead: '#4b5563',
  deadBg: '#1a1a1a',
} as const;
