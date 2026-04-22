import { useBuild } from '../contexts/BuildContext';
import { EQUIPMENT } from '../data/equipment';
import { SKILLS } from '../data/skills';
import { DECORATIONS } from '../data/decorations';
import type { Element, Slot } from '../types';

const ARMOR_SLOTS: Slot[] = ['head', 'chest', 'arms', 'waist', 'legs'];

export function useBuildStats() {
  const { build } = useBuild();

  const getItem = (slot: Slot) => {
    const id = build[slot];
    if (!id) return null;
    return EQUIPMENT[slot].find(item => item.id === id) ?? null;
  };

  const weapon     = getItem('weapon');
  const armorItems = ARMOR_SLOTS.map(s => getItem(s)).filter((i): i is NonNullable<typeof i> => i !== null);
  const talisman   = getItem('talisman');
  const allItems   = [weapon, ...armorItems, talisman].filter((i): i is NonNullable<typeof i> => i !== null);

  const defense = armorItems.reduce((sum, item) => sum + (item.defense ?? 0), 0)
    + (talisman?.defense ?? 0);

  const resistances = (['fire', 'water', 'thunder', 'ice', 'dragon'] as Element[]).reduce(
    (acc, el) => ({ ...acc, [el]: armorItems.reduce((sum, item) => sum + (item.res?.[el] ?? 0), 0) }),
    {} as Record<Element, number>,
  );

  const attack   = weapon?.attack   ?? 0;
  const affinity = weapon?.affinity ?? 0;

  const freeSlots = allItems.reduce(
    (sum, item) => sum + item.slots.filter(s => s > 0).length,
    0,
  );

  const skillMap = new Map<string, number>();
  for (const item of allItems) {
    for (const s of item.skills ?? []) {
      skillMap.set(s.id, (skillMap.get(s.id) ?? 0) + s.lvl);
    }
  }
  // Ajouter les skills des décorations placées
  for (const slot of [...ARMOR_SLOTS, 'weapon', 'talisman'] as Slot[]) {
    for (const decoId of build.decos[slot]) {
      if (!decoId) continue;
      const deco = DECORATIONS.find(d => d.id === decoId);
      if (!deco) continue;
      for (const s of deco.skills) {
        skillMap.set(s.id, (skillMap.get(s.id) ?? 0) + s.lvl);
      }
    }
  }
  const skills = Array.from(skillMap.entries())
    .map(([id, lvl]) => ({ id, lvl: Math.min(lvl, SKILLS[id]?.max ?? lvl) }))
    .sort((a, b) => b.lvl - a.lvl);

  const originCount = new Map<string, number>();
  for (const item of armorItems) {
    if (item.origin) originCount.set(item.origin, (originCount.get(item.origin) ?? 0) + 1);
  }
  const setBonuses = Array.from(originCount.entries())
    .filter(([, count]) => count >= 2)
    .map(([origin, count]) => ({ origin, count }))
    .sort((a, b) => b.count - a.count);

  return { defense, resistances, attack, affinity, freeSlots, skills, setBonuses };
}
