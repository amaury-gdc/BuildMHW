import type { Item, Slot } from '../../types';
import { weaponIconUrl, slotIconUrl } from '../../utils/icons';

interface Props {
  slot: Slot;
  item?: Item;
}

/** SVG de fallback par emplacement quand le PNG est absent. */
function FallbackSvg({ slot }: { slot: Slot }) {
  switch (slot) {
    case 'weapon':
      return (
        <svg viewBox="0 0 42 42" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="8" y1="34" x2="28" y2="14" />
          <line x1="22" y1="8" x2="34" y2="20" />
          <line x1="22" y1="8" x2="26" y2="12" />
          <circle cx="8" cy="34" r="3" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'arms':
      return (
        <svg viewBox="0 0 42 42" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="12" y="10" width="18" height="22" rx="4" />
          <line x1="12" y1="18" x2="30" y2="18" />
          <line x1="16" y1="10" x2="16" y2="8" />
          <line x1="26" y1="10" x2="26" y2="8" />
        </svg>
      );
    case 'waist':
      return (
        <svg viewBox="0 0 42 42" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="10" y="16" width="22" height="10" rx="3" />
          <line x1="10" y1="21" x2="32" y2="21" />
          <circle cx="21" cy="21" r="3" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'talisman':
      return (
        <svg viewBox="0 0 42 42" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polygon points="21,6 27,18 40,18 30,26 34,38 21,30 8,38 12,26 2,18 15,18" fill="currentColor" opacity="0.3" />
          <polygon points="21,6 27,18 40,18 30,26 34,38 21,30 8,38 12,26 2,18 15,18" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 42 42" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="8" y="8" width="26" height="26" rx="4" />
          <line x1="21" y1="14" x2="21" y2="28" />
          <line x1="14" y1="21" x2="28" y2="21" />
        </svg>
      );
  }
}

export default function SlotIcon({ slot, item }: Props) {
  let pngSrc: string | undefined;
  const rarity = item?.rarity ?? 8;

  if (slot === 'weapon' && item?.type) {
    pngSrc = weaponIconUrl(item.type, rarity);
  } else if (slot !== 'weapon') {
    pngSrc = slotIconUrl(slot, rarity);
  }

  if (pngSrc) {
    return <img src={pngSrc} alt="" aria-hidden="true" />;
  }

  return <FallbackSvg slot={slot} />;
}
