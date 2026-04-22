import type { Slot } from '../types';

const base = import.meta.env.BASE_URL;

const WEAPON_FILE: Record<string, string> = {
  'Great Sword':   'Great_Sword',
  'Long Sword':    'Long_Sword',
  'Dual Blades':   'Dual_Blades',
  'Lance':         'Lance',
  'Gunlance':      'Gunlance',
  'Hunting Horn':  'Hunting_Horn',
  'Insect Glaive': 'Insect_Glaive',
  'Bow':           'Bow',
  'Light Bowgun':  'Light_Bowgun',
  'Hammer':        'Hammer',
  'Heavy Bowgun':  'Heavy_Bowgun',
  'Switch Axe':    'Switch_Axe',
  'Charge Blade':  'Charge_Blade',
  'SnS':           'Sword_and_Shield',
};

const SLOT_FILE: Partial<Record<Slot, string>> = {
  head:     'Helmet',
  chest:    'Chestplate',
  arms:     'Armguards',
  waist:    'Waist',
  legs:     'Leggings',
  talisman: 'Talisman',
};

export function weaponIconUrl(type: string, rarity: number): string | undefined {
  const file = WEAPON_FILE[type];
  if (!file) return undefined;
  return `${base}icons/MHWilds-${file}_Icon_Rare_${rarity}.png`;
}

export function slotIconUrl(slot: Slot, rarity: number): string | undefined {
  const file = SLOT_FILE[slot];
  if (!file) return undefined;
  return `${base}icons/MHWilds-${file}_Icon_Rare_${rarity}.png`;
}
