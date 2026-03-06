export type ItemIconMetadata = {
  src: string;
  baseSize: 16 | 32;
};

/**
 * Pixel icon metadata for all ITEMS_DB ids.
 * Key format must follow itemId/entityId snake_case.
 */
export const ITEM_ICON_MAP: Record<string, ItemIconMetadata> = {
  pot_small: { src: "/assets/icons/items/pot_small.svg", baseSize: 16 },
  pot_large: { src: "/assets/icons/items/pot_large.svg", baseSize: 16 },
  respec: { src: "/assets/icons/items/respec.svg", baseSize: 16 },
  pot_str: { src: "/assets/icons/items/pot_str.svg", baseSize: 16 },
  scroll_shield: { src: "/assets/icons/items/scroll_shield.svg", baseSize: 16 },
  w_sword: { src: "/assets/icons/items/w_sword.svg", baseSize: 32 },
  w_axe: { src: "/assets/icons/items/w_axe.svg", baseSize: 32 },
  w_dagger: { src: "/assets/icons/items/w_dagger.svg", baseSize: 32 },
  w_staff: { src: "/assets/icons/items/w_staff.svg", baseSize: 32 },
  a_plate: { src: "/assets/icons/items/a_plate.svg", baseSize: 32 },
  a_robe: { src: "/assets/icons/items/a_robe.svg", baseSize: 32 },
  a_leather: { src: "/assets/icons/items/a_leather.svg", baseSize: 32 },
  ac_ring: { src: "/assets/icons/items/ac_ring.svg", baseSize: 16 },
};
