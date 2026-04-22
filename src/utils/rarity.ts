/** Retourne la variable CSS correspondant à la rareté d'un item. */
export function rarityColor(rarity: number): string {
  const r = Math.min(Math.max(Math.round(rarity), 1), 8);
  return `var(--rarity-${r})`;
}
