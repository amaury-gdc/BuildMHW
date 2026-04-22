import { useState, useMemo } from 'react';
import { Dialog } from 'primereact/dialog';
import { useBuild } from '../../contexts/BuildContext';
import { useLang } from '../../contexts/LangContext';
import { useT } from '../../hooks/useT';
import { SKILLS } from '../../data/skills';
import { DECORATIONS } from '../../data/decorations';
import type { DecoTarget } from '../SlotGrid/SlotGrid';

interface Props {
  target:  DecoTarget | null;
  onClose: () => void;
}

export default function DecoDialog({ target, onClose }: Props) {
  const { build, setDeco } = useBuild();
  const { lang }           = useLang();
  const t                  = useT();

  const [search, setSearch] = useState('');

  const currentDecoId = target ? build.decos[target.slot][target.index] : null;

  const filtered = useMemo(() => {
    if (!target) return [];
    const q = search.toLowerCase().trim();
    return DECORATIONS
      .filter(d => d.size <= target.size)
      .filter(d => {
        if (!q) return true;
        const name = (lang === 'fr' ? d.fr : d.en).toLowerCase();
        if (name.includes(q)) return true;
        return (d.skills ?? []).some(s => {
          const sk = SKILLS[s.id];
          if (!sk) return false;
          return (lang === 'fr' ? sk.fr : sk.en).toLowerCase().includes(q);
        });
      })
      .sort((a, b) => b.size - a.size || b.rarity - a.rarity);
  }, [target, search, lang]);

  const handleSelect = (decoId: string) => {
    if (!target) return;
    setDeco(target.slot, target.index, decoId);
    onClose();
  };

  const handleRemove = () => {
    if (!target) return;
    setDeco(target.slot, target.index, null);
    onClose();
  };

  const title = target
    ? `${t('deco_slot')} ${t('deco_size')} ${target.size}`
    : '';

  return (
    <Dialog
      visible={target !== null}
      onHide={onClose}
      header={
        <div className="picker-header-content">
          <span>{title}</span>
          <span className="picker-count num">{filtered.length} {t('items_available')}</span>
        </div>
      }
      className="picker-dialog picker-dialog--deco"
      modal
      dismissableMask
      resizable={false}
      draggable={false}
    >
      <div className="picker-filters">
        <div className="picker-search-wrap">
          <svg className="picker-search-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <circle cx="6.5" cy="6.5" r="4.5" />
            <line x1="10.5" y1="10.5" x2="14" y2="14" />
          </svg>
          <input
            className="picker-search"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('search_placeholder')}
            autoFocus
          />
          {search && (
            <button className="picker-search-clear" onClick={() => setSearch('')} aria-label="Effacer">×</button>
          )}
        </div>
      </div>

      <div className="picker-list">
        {currentDecoId && (
          <button className="picker-item picker-item--none" onClick={handleRemove}>
            <span className="picker-none-label">— {lang === 'fr' ? 'Retirer la décoration' : 'Remove decoration'} —</span>
          </button>
        )}

        {DECORATIONS.length === 0 ? (
          <div className="picker-empty">
            <p className="picker-empty-title">{lang === 'fr' ? 'Données en cours de chargement…' : 'Loading data…'}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="picker-empty">
            <p className="picker-empty-title">{t('no_results_title')}</p>
            <p className="picker-empty-sub">{t('no_results_sub')}</p>
          </div>
        ) : (
          filtered.map(deco => {
            const isActive = deco.id === currentDecoId;
            return (
              <button
                key={deco.id}
                className={`picker-item picker-item--deco${isActive ? ' picker-item--active' : ''}`}
                onClick={() => handleSelect(deco.id)}
                aria-pressed={isActive}
              >
                {/* Losange taille */}
                <div className={`deco-slot deco-${deco.size} deco-slot-preview`}>
                  <span className="deco-lvl">{deco.size}</span>
                </div>

                <div className="picker-item-body">
                  <div className="picker-item-top">
                    <span className="picker-item-name">{lang === 'fr' ? deco.fr : deco.en}</span>
                    <span className="picker-item-rarity" style={{ color: `var(--rarity-${deco.rarity})` }}>R{deco.rarity}</span>
                  </div>
                  {(deco.skills ?? []).length > 0 && (
                    <div className="picker-item-skills">
                      {(deco.skills ?? []).map(s => {
                        const sk = SKILLS[s.id];
                        if (!sk) return null;
                        return (
                          <span key={s.id} className={`skill-badge skill-badge--${sk.cat}`}>
                            {lang === 'fr' ? sk.fr : sk.en} {s.lvl}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </Dialog>
  );
}
