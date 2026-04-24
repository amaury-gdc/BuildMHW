import type { KeyboardEvent } from 'react';
import { useBuild } from '../../contexts/BuildContext';

import { useLang } from '../../contexts/LangContext';
import { useT } from '../../hooks/useT';
import { EQUIPMENT } from '../../data/equipment';
import { SKILLS } from '../../data/skills';
import SlotIcon from '../icons/SlotIcon';
import ElementIcon from '../icons/ElementIcon';
import { rarityColor } from '../../utils/rarity';
import type { Slot, Element } from '../../types';

const STATUS_COLOR: Record<string, string> = {
  poison:      'var(--el-dragon)',
  paralysis:   'var(--el-thunder)',
  sleep:       'var(--el-ice)',
  blastblight: 'var(--el-fire)',
};

interface Props {
  slot: Slot;
  onOpenPicker: () => void;
  onOpenDeco:   (index: 0 | 1 | 2, size: number) => void;
}

export default function SlotCard({ slot, onOpenPicker, onOpenDeco }: Props) {
  const { build } = useBuild();
  const { lang }         = useLang();
  const t                = useT();

  const itemId = build[slot];
  const items  = EQUIPMENT[slot] ?? [];
  const item   = items.find(i => i.id === itemId);
  const isEmpty = !item;

  const placedDecos = build.decos[slot];
  const rarityVar = item ? rarityColor(item.rarity) : undefined;

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpenPicker();
    }
  };

  const handleDecoClick = (e: React.MouseEvent, index: 0 | 1 | 2, size: number) => {
    e.stopPropagation();
    if (size === 0) return;
    onOpenDeco(index, size);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`slot slot--${slot}${isEmpty ? ' slot--empty' : ''}`}
      style={rarityVar ? ({ '--rarity': rarityVar } as React.CSSProperties) : undefined}
      onClick={onOpenPicker}
      onKeyDown={handleKeyDown}
      aria-label={`${t(`slot_${slot}` as Parameters<typeof t>[0])} : ${isEmpty ? t('select_empty') : (lang === 'fr' ? item.fr : item.en)}`}
    >
      {/* Icône */}
      <div className="slot-icon">
        <SlotIcon slot={slot} item={item} />
      </div>

      {/* Contenu */}
      <div className="slot-content">
        <div className="slot-header">
          <span className="slot-label">{t(`slot_${slot}` as Parameters<typeof t>[0])}</span>
          {item && (
            <span className="slot-rarity-tag">R{item.rarity}</span>
          )}
        </div>

        <div className="slot-item-name">
          {isEmpty ? t('select_empty') : (lang === 'fr' ? item.fr : item.en)}
        </div>

        {item?.origin && (
          <div className="slot-origin">{item.origin}</div>
        )}

        {item && (
          <div className="slot-body-row">
            {/* Stats */}
            <div className="slot-stats">
              {item.attack !== undefined && (
                <span className="stat-chip">
                  {t('attack')} <span className="num">{item.attack}</span>
                </span>
              )}
              {item.affinity !== undefined && item.affinity !== 0 && (
                <span className="stat-chip">
                  {t('affinity')} <span className="num">{item.affinity > 0 ? '+' : ''}{item.affinity}%</span>
                </span>
              )}
              {item.defense !== undefined && item.defense > 0 && (
                <span className="stat-chip stat-def">
                  {t('def')} <span className="num">{item.defense}</span>
                </span>
              )}
              {item.element && item.elementDmg !== undefined && (
                <span className="stat-chip stat-chip--element">
                  <ElementIcon element={item.element as Element} size={10} />
                  <span className="num">{item.elementHidden ? `(${item.elementDmg})` : item.elementDmg}</span>
                </span>
              )}
              {item.status && item.statusDmg !== undefined && (
                <span className="stat-chip" style={{ color: STATUS_COLOR[item.status] }}>
                  <span className="num">{item.statusDmg}</span>
                </span>
              )}
            </div>

            {/* Emplacements décos — cliquables */}
            <div className="slot-decos">
              {item.slots.map((size, i) => {
                const idx = i as 0 | 1 | 2;
                const placedId   = placedDecos[idx];
                const hasPlaced  = !!placedId;
                const canPlace   = size > 0;
                return (
                  // eslint-disable-next-line react/no-array-index-key -- tableau fixe de 3 slots, jamais réordonné
                  <div key={i}
                    role={canPlace ? 'button' : undefined}
                    tabIndex={canPlace ? 0 : undefined}
                    className={`deco-slot${size === 0 ? ' deco-empty' : ` deco-${size}`}${hasPlaced ? ' deco-filled' : ''}${canPlace ? ' deco-clickable' : ''}`}
                    title={
                      !canPlace
                        ? t('deco_empty')
                        : hasPlaced
                          ? t('change_decoration')
                          : `${t('deco_slot')} ${t('deco_size')} ${size}`
                    }
                    onClick={e => handleDecoClick(e, idx, size)}
                    onKeyDown={e => {
                      if (canPlace && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        e.stopPropagation();
                        onOpenDeco(idx, size);
                      }
                    }}
                  >
                    {hasPlaced
                      ? <span className="deco-placed-dot" />
                      : <span className="deco-lvl">{size > 0 ? size : '○'}</span>
                    }
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Talents */}
        {item?.skills && item.skills.length > 0 && (
          <div className="slot-skills">
            {item.skills.map(s => {
              const skill = SKILLS[s.id];
              if (!skill) return null;
              return (
                <span key={s.id} className={`skill-badge skill-badge--${skill.cat}`}>
                  {lang === 'fr' ? skill.fr : skill.en} {s.lvl}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
