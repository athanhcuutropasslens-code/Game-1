export const generateShop = ({
  floor,
  playerClass,
  itemsDb,
  isItemUsableByClass,
  classesDb,
  generateItem,
  rollRarity,
  createId,
  random = Math.random,
}: any) => {
  const items = [
    generateItem(itemsDb[0], 1, 1),
    generateItem(itemsDb[1], 1, 2),
  ];
  const usableEquip = itemsDb.filter(
    (item: any) =>
      !["CONSUMABLE", "SERVICE"].includes(item.type) &&
      isItemUsableByClass(item, playerClass, classesDb),
  );
  const weapons = usableEquip.filter((item: any) => item.type === "WEAPON");
  const armors = usableEquip.filter((item: any) => item.type === "ARMOR");
  const accessories = usableEquip.filter(
    (item: any) => item.type === "ACCESSORY",
  );

  if (weapons.length)
    items.push(
      generateItem(weapons[Math.floor(random() * weapons.length)], floor),
    );
  if (armors.length)
    items.push(
      generateItem(armors[Math.floor(random() * armors.length)], floor),
    );

  const misc = [...accessories, ...usableEquip];
  for (let index = 0; index < 2 + Math.floor(floor / 4); index += 1) {
    const base = misc[Math.floor(random() * misc.length)];
    items.push(
      generateItem(
        base,
        Math.max(1, floor + Math.floor(random() * 2)),
        Math.min(4, rollRarity(floor, random)),
      ),
    );
  }

  items.push({
    id: "srv_heal",
    name: "Hồi Phục",
    type: "SERVICE",
    cost: 10 + floor * 5,
    desc: "Hồi đầy HP",
    rarity: 2,
    uid: `service_heal_${createId()}`,
    baseCost: 10 + floor * 5,
  });
  items.push({
    id: "srv_box",
    name: "Hộp Bí Ẩn",
    type: "SERVICE",
    cost: 50 + floor * 10,
    desc: "Nhận vật phẩm ngẫu nhiên hiếm",
    rarity: 3,
    uid: `service_box_${createId()}`,
    baseCost: 50 + floor * 10,
  });
  return items;
};

export const buyService = ({
  service,
  player,
  currentStats,
  floor,
  itemsDb,
  classesDb,
  isItemUsableByClass,
  generateItem,
  rarityConfig,
  random = Math.random,
}: any) => {
  if (player.gold < service.cost)
    return { ok: false, reason: "NOT_ENOUGH_GOLD" };

  if (service.id === "srv_heal") {
    return {
      ok: true,
      player: {
        ...player,
        gold: player.gold - service.cost,
        hp: currentStats.maxHp,
      },
      log: "Đã hồi phục toàn bộ HP!",
    };
  }

  if (service.id === "srv_box") {
    const rarity = 2 + Math.floor(random() * 3);
    const usable = itemsDb.filter((item: any) =>
      isItemUsableByClass(item, player.classId, classesDb),
    );
    const dbItem = usable[Math.floor(random() * usable.length)];
    const newItem = generateItem(dbItem, floor, rarity);
    return {
      ok: true,
      player: {
        ...player,
        gold: player.gold - service.cost,
        inventory: [...player.inventory, newItem],
      },
      item: newItem,
      log: `Nhận được ${newItem.name} (${rarityConfig[rarity].name})`,
    };
  }

  return { ok: false, reason: "UNKNOWN_SERVICE" };
};
