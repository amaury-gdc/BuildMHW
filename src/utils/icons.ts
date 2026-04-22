import type { Slot } from '../types';

/**
 * Mapping type d'arme → fichier PNG dans /public/icons/.
 * Les armes sans PNG (Switch Axe, Hammer, etc.) ne sont pas listées ici
 * → SlotIcon bascule automatiquement sur le SVG fallback.
 */
export const WEAPON_PNG: Record<string, string> = {
  'Great Sword':   '/icons/MHWilds-Great_Sword_Icon_Rare_8.png',
  'Long Sword':    '/icons/MHWilds-Long_Sword_Icon_Rare_8.png',
  'Dual Blades':   '/icons/MHWilds-Dual_Blades_Icon_Rare_8.png',
  'Lance':         '/icons/MHWilds-Lance_Icon_Rare_8.png',
  'Gunlance':      '/icons/MHWilds-Gunlance_Icon_Rare_8.png',
  'Hunting Horn':  '/icons/MHWilds-Hunting_Horn_Icon_Rare_8.png',
  'Insect Glaive': '/icons/MHWilds-Insect_Glaive_Icon_Rare_8.png',
  'Bow':           '/icons/MHWilds-Bow_Icon_Rare_8.png',
  'Light Bowgun':  '/icons/MHWilds-Light_Bowgun_Icon_Rare_8.png',
};

/**
 * Mapping emplacement d'armure → fichier PNG.
 * weapon est géré via WEAPON_PNG (dépend du type de l'arme).
 * arms / waist / talisman n'ont pas de PNG disponible → fallback SVG.
 */
export const SLOT_PNG: Partial<Record<Slot, string>> = {
  head:  '/icons/MHWilds-Helmet_Icon_Rare_8.png',
  chest: '/icons/MHWilds-Chestplate_Icon_Rare_8.png',
  legs:  '/icons/MHWilds-Leggings_Icon_Rare_8.png',
};
