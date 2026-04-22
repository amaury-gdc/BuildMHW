import { useState } from 'react';
import { useBuild } from '../../contexts/BuildContext';
import { useT } from '../../hooks/useT';
import { SLOT_ORDER, type Item, type Slot } from '../../types';
import { EQUIPMENT } from '../../data/equipment';
import { rarityColor } from '../../utils/rarity';
import SlotCard from './SlotCard';
import PickerDialog from '../Picker/PickerDialog';
import DecoDialog from '../Picker/DecoDialog';

export interface DecoTarget {
  slot:  Slot;
  index: 0 | 1 | 2;
  size:  number;
}

export default function SlotGrid() {
  const t = useT();
  const { build } = useBuild();

  const [pickerSlot, setPickerSlot] = useState<Slot | null>(null);
  const [decoTarget, setDecoTarget] = useState<DecoTarget | null>(null);

  // Résumé
  const equippedItems: Item[] = SLOT_ORDER
    .map(slot => {
      const id = build[slot as Slot];
      if (!id) return null;
      return EQUIPMENT[slot as Slot].find(item => item.id === id) ?? null;
    })
    .filter((item): item is Item => item !== null);

  const equipped  = equippedItems.length;
  const avgRarity = equipped > 0
    ? Math.round(equippedItems.reduce((sum, item) => sum + item.rarity, 0) / equipped)
    : 0;

  return (
    <div className="builder-section">
      <div className="builder-header">
        <div>
          <h2>{t('builder_title')}</h2>
          <p className="sub">{t('builder_sub')}</p>
        </div>
        <div className="build-progress" aria-live="polite">
          <span className="num">{equipped}</span>/7 {t('pieces_equipped')}
        </div>
      </div>

      <div className="slot-grid">
        {SLOT_ORDER.map(slot => (
          <SlotCard
            key={slot}
            slot={slot as Slot}
            onOpenPicker={() => setPickerSlot(slot as Slot)}
            onOpenDeco={(index, size) => setDecoTarget({ slot: slot as Slot, index, size })}
          />
        ))}

        {/* Cellule résumé à droite du talisman (cf. CLAUDE.md §UX-9) */}
        <div className="build-summary" aria-label="Résumé du build">
          <span className="summary-count num">{equipped}/7</span>
          <span className="summary-label">{t('pieces_equipped')}</span>
          {avgRarity > 0 && (
            <span
              className="summary-rarity"
              style={{ color: rarityColor(avgRarity) }}
            >
              {t('rarity_avg')} R<span className="num">{avgRarity}</span>
            </span>
          )}
        </div>
      </div>

      <PickerDialog slot={pickerSlot} onClose={() => setPickerSlot(null)} />
      <DecoDialog   target={decoTarget} onClose={() => setDecoTarget(null)} />
    </div>
  );
}
