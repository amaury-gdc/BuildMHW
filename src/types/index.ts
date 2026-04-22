export type Lang = 'fr' | 'en';
export type Theme = 'guild' | 'parchment' | 'verdant';
export type Slot = 'weapon' | 'head' | 'chest' | 'arms' | 'waist' | 'legs' | 'talisman';
export type Element = 'fire' | 'water' | 'thunder' | 'ice' | 'dragon';
export type SkillCat = 'atk' | 'def' | 'util';

export interface Skill {
  fr: string;
  en: string;
  max: number;
  cat: SkillCat;
  description?: { fr: string; en: string };
  ranks?: { fr: string; en: string }[];
}

export interface SkillOnItem {
  id: string;
  lvl: number;
}

export interface Item {
  id: string;
  fr: string;
  en: string;
  type?: string;
  origin?: string;
  rarity: number;
  attack?: number;
  affinity?: number;
  defense?: number;
  res?: Partial<Record<Element, number>>;
  slots: number[];
  skills?: SkillOnItem[];
}

export interface EquippedBuild {
  weapon:   string | null;
  head:     string | null;
  chest:    string | null;
  arms:     string | null;
  waist:    string | null;
  legs:     string | null;
  talisman: string | null;
  // Décorations : 3 emplacements par slot (null = vide)
  decos: Record<Slot, [string | null, string | null, string | null]>;
}

export const SLOT_ORDER: Slot[] = ['weapon', 'head', 'chest', 'arms', 'waist', 'legs', 'talisman'];
export const RES_KEYS: Element[] = ['fire', 'water', 'thunder', 'ice', 'dragon'];
