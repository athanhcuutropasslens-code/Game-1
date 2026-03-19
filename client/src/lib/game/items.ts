import type { GameItem } from '@/lib/gameTypes';

export const getConsumableValue = (item: Partial<GameItem>, playerClass?: string) => {
  const levelFactor = 1 + 0.1 * (((item.level as number) || 1) - 1);
  const baseVal = item.baseVal || 0;
  const healBoost = playerClass === 'cleric' && item.id?.startsWith('pot_') ? 1.5 : 1;

  return Math.floor(baseVal * levelFactor * healBoost);
};

export const getConsumableDescription = (item: Partial<GameItem>, playerClass?: string) => {
  if (typeof item.descFormat !== 'function') {
    return item.desc || '';
  }

  return item.descFormat(getConsumableValue(item, playerClass));
};
