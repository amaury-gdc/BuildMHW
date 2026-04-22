import type { Slot } from '../types';

const base = import.meta.env.BASE_URL;

export const WEAPON_PNG: Record<string, string> = {
  'Great Sword':   `${base}icons/MHWilds-Great_Sword_Icon_Rare_8.png`,
  'Long Sword':    `${base}icons/MHWilds-Long_Sword_Icon_Rare_8.png`,
  'Dual Blades':   `${base}icons/MHWilds-Dual_Blades_Icon_Rare_8.png`,
  'Lance':         `${base}icons/MHWilds-Lance_Icon_Rare_8.png`,
  'Gunlance':      `${base}icons/MHWilds-Gunlance_Icon_Rare_8.png`,
  'Hunting Horn':  `${base}icons/MHWilds-Hunting_Horn_Icon_Rare_8.png`,
  'Insect Glaive': `${base}icons/MHWilds-Insect_Glaive_Icon_Rare_8.png`,
  'Bow':           `${base}icons/MHWilds-Bow_Icon_Rare_8.png`,
  'Light Bowgun':  `${base}icons/MHWilds-Light_Bowgun_Icon_Rare_8.png`,
};

export const SLOT_PNG: Partial<Record<Slot, string>> = {
  head:  `${base}icons/MHWilds-Helmet_Icon_Rare_8.png`,
  chest: `${base}icons/MHWilds-Chestplate_Icon_Rare_8.png`,
  legs:  `${base}icons/MHWilds-Leggings_Icon_Rare_8.png`,
};
