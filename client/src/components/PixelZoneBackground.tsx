import React from 'react';

type ZoneVisual = {
  farTile: string;
  midTile: string;
  nearTile: string;
  overlay: string;
  fogColor: string;
  fogOpacity: number;
  lightColor: string;
  lightOpacity: number;
  darkOverlay: number;
};

type PixelZoneBackgroundProps = {
  zoneVisual?: ZoneVisual;
  isCombat?: boolean;
};

const defaultVisual: ZoneVisual = {
  farTile: 'repeating-linear-gradient(45deg, rgba(30,41,59,0.28) 0 14px, rgba(15,23,42,0.28) 14px 28px)',
  midTile: 'repeating-linear-gradient(90deg, rgba(51,65,85,0.3) 0 10px, rgba(30,41,59,0.3) 10px 20px)',
  nearTile: 'repeating-linear-gradient(0deg, rgba(71,85,105,0.32) 0 8px, rgba(30,41,59,0.32) 8px 16px)',
  overlay: 'linear-gradient(to bottom, rgba(2,6,23,0.22), rgba(2,6,23,0.33))',
  fogColor: '148,163,184',
  fogOpacity: 0.08,
  lightColor: '191,219,254',
  lightOpacity: 0.05,
  darkOverlay: 0.28,
};

export default function PixelZoneBackground({ zoneVisual, isCombat = false }: PixelZoneBackgroundProps) {
  const visual = zoneVisual ?? defaultVisual;
  const combatBoost = isCombat ? 0.04 : 0;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div
        className="absolute inset-[-8%] pixel-zone-parallax-far"
        style={{
          backgroundImage: visual.farTile,
          opacity: 0.95,
          filter: 'saturate(1.05)',
        }}
      />

      <div
        className="absolute inset-[-10%] pixel-zone-parallax-mid"
        style={{
          backgroundImage: visual.midTile,
          opacity: 0.9,
          mixBlendMode: 'screen',
        }}
      />

      <div
        className="absolute inset-[-12%] pixel-zone-parallax-near"
        style={{
          backgroundImage: visual.nearTile,
          opacity: 0.85,
          mixBlendMode: 'overlay',
        }}
      />

      <div className="absolute inset-0" style={{ backgroundImage: visual.overlay }} />
      <div className="absolute inset-0" style={{ backgroundColor: `rgba(2, 6, 23, ${Math.min(0.35, visual.darkOverlay + combatBoost)})` }} />
      <div className="absolute inset-0" style={{ backgroundColor: `rgba(${visual.fogColor}, ${visual.fogOpacity + combatBoost * 0.2})` }} />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 35%, rgba(${visual.lightColor}, ${visual.lightOpacity + combatBoost * 0.25}) 0%, rgba(2,6,23,0) 65%)`,
        }}
      />
    </div>
  );
}
