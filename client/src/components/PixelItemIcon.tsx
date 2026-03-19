import type { LucideIcon } from 'lucide-react';
import React from 'react';
import { getPixelIconData } from '@/lib/pixelIconMap';

type PixelItemIconProps = {
  id?: string;
  fallbackIcon?: LucideIcon | string | null;
  size?: number;
  className?: string;
  kind?: 'item' | 'effect';
};

const renderFallbackIcon = (
  fallbackIcon: PixelItemIconProps['fallbackIcon'],
  size: number,
  className?: string,
) => {
  if (!fallbackIcon) return null;
  if (typeof fallbackIcon === 'string') {
    return (
      <span style={{ fontSize: size }} className={className}>
        {fallbackIcon}
      </span>
    );
  }

  const Icon = fallbackIcon;
  return <Icon size={size} className={className} />;
};

const PixelItemIcon = ({
  id,
  fallbackIcon = null,
  size = 16,
  className = '',
  kind = 'item',
}: PixelItemIconProps) => {
  const pixelData = getPixelIconData(id, kind);
  if (!pixelData) return renderFallbackIcon(fallbackIcon, size, className);

  const scaledSize = Math.max(16, Math.round(size));
  const tileOffsetX = pixelData.tile * -scaledSize;

  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        width: scaledSize,
        height: scaledSize,
        backgroundImage: `url(${pixelData.atlasUrl})`,
        backgroundSize: 'auto 100%',
        backgroundPositionX: `${tileOffsetX}px`,
        backgroundPositionY: '0px',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
      }}
      aria-hidden="true"
    />
  );
};

export default PixelItemIcon;
