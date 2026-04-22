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
  'Hammer':        `${base}icons/MHWilds-Hammer_Icon_Rare_8.png`,
  'Heavy Bowgun':  `${base}icons/MHWilds-Heavy_Bowgun_Icon_Rare_8.png`,
  'Switch Axe':    `${base}icons/MHWilds-Switch_Axe_Icon_Rare_8.png`,
  'Charge Blade':  `${base}icons/MHWilds-Charge_Blade_Icon_Rare_8.png`,
  'SnS':           `${base}icons/MHWilds-Sword_and_Shield_Icon_Rare_8.png`,
};

export const SLOT_PNG: Partial<Record<Slot, string>> = {
  head:     `${base}icons/MHWilds-Helmet_Icon_Rare_8.png`,
  chest:    `${base}icons/MHWilds-Chestplate_Icon_Rare_8.png`,
  arms:     `${base}icons/MHWilds-Armguards_Icon_Rare_8.png`,
  waist:    `${base}icons/MHWilds-Waist_Icon_Rare_8.png`,
  legs:     `${base}icons/MHWilds-Leggings_Icon_Rare_8.png`,
  talisman: `${base}icons/MHWilds-Talisman_Icon_Rare_8.png`,
};
