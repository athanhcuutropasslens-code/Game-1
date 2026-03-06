import React from 'react';

import { PotStrengthSprite, getItemPaletteClass } from '@/assets/itemSprites';

type ItemLike = {
  id?: string;
  type?: string;
  icon?: any;
};

type PixelItemIconProps = {
  id?: string;
  itemType?: string;
  icon?: any;
  fallbackIcon?: any;
  size?: number;
  className?: string;
};

const renderIcon = (Icon: any, size: number, className = '') => {
  if (!Icon) return null;
  if (typeof Icon === 'string') {
    return (
      <span style={{ fontSize: size }} className={className}>
        {Icon}
      </span>
    );
  }
  const I = Icon;
  return <I size={size} className={className} />;
};

const resolveIcon = ({ id, icon, fallbackIcon }: PixelItemIconProps) => {
  if (id === 'pot_str' || icon === 'pot_str_sprite') return PotStrengthSprite;
  return icon || fallbackIcon;
};

export default function PixelItemIcon({
  id,
  itemType,
  icon,
  fallbackIcon,
  size = 24,
  className = '',
}: PixelItemIconProps) {
  const resolvedIcon = resolveIcon({ id, icon, fallbackIcon });
  const palette = getItemPaletteClass({ id, type: itemType } as ItemLike);
  return renderIcon(resolvedIcon, size, [palette, className].filter(Boolean).join(' '));
}
