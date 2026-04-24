import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Dialog } from 'primereact/dialog';
import { useBuild } from '../../contexts/BuildContext';
import { useLang } from '../../contexts/LangContext';
import { useT } from '../../hooks/useT';
import { EQUIPMENT } from '../../data/equipment';
import { SKILLS } from '../../data/skills';
import { rarityColor } from '../../utils/rarity';
import SlotIcon from '../icons/SlotIcon';
import ItemTooltip from './ItemTooltip';
import ElementIcon from '../icons/ElementIcon';
import type { Element, Item, Slot } from '../../types';

const STATUS_COLOR: Record<string, string> = {
  poison:      'var(--el-dragon)',
  paralysis:   'var(--el-thunder)',
  sleep:       'var(--el-ice)',
  blastblight: 'var(--el-fire)',
};

type SortKey = 'def_desc' | 'def_asc' | 'atk_desc' | 'atk_asc' | 'rarity' | 'name' | 'slots';

interface Props {
  slot: Slot | null;
  onClose: () => void;
}

function sortItems(items: Item[], sort: SortKey): Item[] {
  return [...items].sort((a, b) => {
    switch (sort) {
      case 'def_desc': return (b.defense ?? 0) - (a.defense ?? 0);
      case 'def_asc':  return (a.defense ?? 0) - (b.defense ?? 0);
      case 'atk_desc': return (b.attack  ?? 0) - (a.attack  ?? 0);
      case 'atk_asc':  return (a.attack  ?? 0) - (b.attack  ?? 0);
      case 'rarity':   return b.rarity - a.rarity;
      case 'slots':    return b.slots.reduce((s, v) => s + v, 0) - a.slots.reduce((s, v) => s + v, 0);
      case 'name':     return (a.fr < b.fr ? -1 : a.fr > b.fr ? 1 : 0);
    }
  });
}

export default function PickerDialog({ slot, onClose }: Props) {
  const { build, equip } = useBuild();
  const { lang }         = useLang();
  const t                = useT();

  const [search,      setSearch]      = useState('');
  const [sort,        setSort]        = useState<SortKey>('def_desc');
  const [skillFilter, setSkillFilter] = useState('');
  const [weaponType,  setWeaponType]  = useState('');

  const [hoveredItem, setHoveredItem]       = useState<Item | null>(null);
  const [tooltipPos,  setTooltipPos]        = useState({ x: 0, y: 0 });
  const [pinnedTooltips, setPinnedTooltips] = useState<Array<{ id: number; item: Item; x: number; y: number }>>([]);
  const nextIdRef    = useRef(0);
  const hoveredRef   = useRef<Item | null>(null);
  const posRef       = useRef({ x: 0, y: 0 });

  hoveredRef.current = hoveredItem;
  posRef.current     = tooltipPos;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Control' || e.key === 'AltGraph') && hoveredRef.current) {
        e.preventDefault();
        const item = hoveredRef.current;
        const pos  = posRef.current;
        setPinnedTooltips(prev => [...prev, { id: nextIdRef.current++, item, x: pos.x, y: pos.y }]);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    setHoveredItem(null);
    setPinnedTooltips([]);
    setWeaponType('');
  }, [slot]);

  const items = useMemo(() => (slot ? EQUIPMENT[slot] : []), [slot]);

  const isWeapon = slot === 'weapon';
  const defaultSort: SortKey = isWeapon ? 'atk_desc' : 'def_desc';

  // Liste des types d'armes uniques (uniquement pour le slot weapon)
  const weaponTypes = useMemo(() => {
    if (!isWeapon) return [];
    const seen = new Set<string>();
    for (const item of EQUIPMENT['weapon']) {
      if (item.type) seen.add(item.type);
    }
    return Array.from(seen).sort();
  }, [isWeapon]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const sk = skillFilter;

    const result = items.filter(item => {
      const name = (lang === 'fr' ? item.fr : item.en).toLowerCase();
      const matchName  = !q || name.includes(q) || (item.origin ?? '').toLowerCase().includes(q);
      const matchSkill = !sk || (item.skills ?? []).some(s => s.id === sk);
      // Recherche dans les noms de skills
      const matchSkillName = !q || (item.skills ?? []).some(s => {
        const sk = SKILLS[s.id];
        if (!sk) return false;
        return (lang === 'fr' ? sk.fr : sk.en).toLowerCase().includes(q);
      });
      const matchType = !weaponType || item.type === weaponType;
      return (matchName || matchSkillName) && matchSkill && matchType;
    });

    return sortItems(result, sort || defaultSort);
  }, [items, search, sort, skillFilter, lang, defaultSort, weaponType]);

  const skillOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const item of items) {
      for (const s of item.skills ?? []) {
        if (!seen.has(s.id)) {
          const sk = SKILLS[s.id];
          if (sk) seen.set(s.id, lang === 'fr' ? sk.fr : sk.en);
        }
      }
    }
    return Array.from(seen.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [items, lang]);

  const handleSelect = (item: Item) => {
    if (!slot) return;
    equip(slot, item.id);
    onClose();
  };

  const handleClear = () => {
    if (!slot) return;
    equip(slot, null);
    onClose();
  };

  const currentId = slot ? build[slot] : null;

  const title = slot ? t(`pick_title_${slot}` as Parameters<typeof t>[0]) : '';

  const sortOptions: { value: SortKey; label: string }[] = isWeapon
    ? [
        { value: 'atk_desc', label: t('sort_atk_desc') },
        { value: 'atk_asc',  label: t('sort_atk_asc') },
        { value: 'rarity',   label: t('sort_rarity') },
        { value: 'name',     label: t('sort_name') },
        { value: 'slots',    label: t('sort_slots') },
      ]
    : [
        { value: 'def_desc', label: t('sort_def_desc') },
        { value: 'def_asc',  label: t('sort_def_asc') },
        { value: 'rarity',   label: t('sort_rarity') },
        { value: 'name',     label: t('sort_name') },
        { value: 'slots',    label: t('sort_slots') },
      ];

  const tooltipPortal = createPortal(
    <>
      {hoveredItem && (
        <ItemTooltip item={hoveredItem} x={tooltipPos.x} y={tooltipPos.y} lang={lang} />
      )}
      {pinnedTooltips.map(({ id, item, x, y }) => (
        <ItemTooltip
          key={id}
          item={item}
          x={x}
          y={y}
          lang={lang}
          pinned
          onClose={() => setPinnedTooltips(prev => prev.filter(t => t.id !== id))}
        />
      ))}
    </>,
    document.body
  );

  return (
    <>
    <Dialog
      visible={slot !== null}
      onHide={onClose}
      header={
        <div className="picker-header-content">
          <div className="picker-header-icon">
            <SlotIcon slot={slot!} item={slot === 'weapon' ? (EQUIPMENT[slot].find(i => i.id === currentId) ?? undefined) : undefined} />
          </div>
          <div className="picker-header-titles">
            <span className="picker-header-title">{title}</span>
            <span className="picker-count">{filtered.length} {t('items_available')}</span>
          </div>
        </div>
      }
      className="picker-dialog"
      style={{ width: '78vw', maxWidth: '78vw' }}
      modal
      dismissableMask
      resizable={false}
      draggable={false}
    >
      {/* Barre de filtres */}
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
            <button className="picker-search-clear" onClick={() => setSearch('')} aria-label={t('clear')}>×</button>
          )}
        </div>

        <div className="picker-controls">
          {isWeapon && weaponTypes.length > 0 && (
            <label className="picker-select-wrap">
              <span className="picker-select-label">{t('filter_weapon_type')}</span>
              <select
                className="picker-select"
                value={weaponType}
                onChange={e => setWeaponType(e.target.value)}
              >
                <option value="">— {t('all')} —</option>
                {weaponTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
          )}

          <label className="picker-select-wrap">
            <span className="picker-select-label">{t('sort_by')}</span>
            <select
              className="picker-select"
              value={sort || defaultSort}
              onChange={e => setSort(e.target.value as SortKey)}
            >
              {sortOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>

          {skillOptions.length > 0 && (
            <label className="picker-select-wrap">
              <span className="picker-select-label">{t('filter_skill')}</span>
              <select
                className="picker-select"
                value={skillFilter}
                onChange={e => setSkillFilter(e.target.value)}
              >
                <option value="">— {t('all')} —</option>
                {skillOptions.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>

      {/* Liste d'items */}
      <div className="picker-list">
        {/* Option "Aucun" */}
        {currentId && (
          <button className="picker-item picker-item--none" onClick={handleClear}>
            <span className="picker-none-label">— {t('remove_equipment')} —</span>
          </button>
        )}

        {filtered.length === 0 ? (
          <div className="picker-empty">
            <p className="picker-empty-title">{t('no_results_title')}</p>
            <p className="picker-empty-sub">{t('no_results_sub')}</p>
          </div>
        ) : (
          filtered.map(item => {
            const rColor = rarityColor(item.rarity);
            const isActive = item.id === currentId;
            return (
              <button
                key={item.id}
                className={`picker-item${isActive ? ' picker-item--active' : ''}`}
                style={{ '--rarity': rColor } as React.CSSProperties}
                onClick={() => handleSelect(item)}
                aria-pressed={isActive}
                onMouseEnter={e => { setHoveredItem(item); setTooltipPos({ x: e.clientX, y: e.clientY }); }}
                onMouseMove={e => setTooltipPos({ x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {isActive && (
                  <div className="picker-item-check" aria-hidden="true">
                    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="2,6 5,9 10,3" />
                    </svg>
                  </div>
                )}

                <div className="picker-item-head">
                  <div className="picker-item-thumb">
                    <SlotIcon slot={slot!} item={item} />
                  </div>
                  <div className="picker-item-title-area">
                    <div className="picker-item-name-row">
                      <span className="picker-item-name">{lang === 'fr' ? item.fr : item.en}</span>
                      <span className="picker-rarity-pill">R{item.rarity}</span>
                    </div>
                    {item.origin && (
                      <span className="picker-item-origin">{item.origin}</span>
                    )}
                  </div>
                </div>

                <div className="picker-item-stats">
                  {item.attack !== undefined && (
                    <span className="picker-stat">{t('attack')} <b className="num">{item.attack}</b></span>
                  )}
                  {item.affinity !== undefined && item.affinity !== 0 && (
                    <span className={`picker-stat ${item.affinity >= 0 ? 'stat-pos' : 'stat-neg'}`}>
                      {t('affinity')} <b className="num">{item.affinity > 0 ? '+' : ''}{item.affinity}%</b>
                    </span>
                  )}
                  {item.defense !== undefined && item.defense > 0 && (
                    <span className="picker-stat stat-val-def">{t('def')} <b className="num">{item.defense}</b></span>
                  )}
                  {item.element && item.elementDmg !== undefined && (
                    <span className="picker-stat" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <ElementIcon element={item.element as Element} size={10} />
                      <b className="num">{item.elementHidden ? `(${item.elementDmg})` : item.elementDmg}</b>
                    </span>
                  )}
                  {item.status && item.statusDmg !== undefined && (
                    <span className="picker-stat" style={{ color: STATUS_COLOR[item.status] }}>
                      <b className="num">{item.statusDmg}</b>
                    </span>
                  )}
                  <span className="picker-item-slots">
                    {item.slots.filter(s => s > 0).map((s, i) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <span key={i} className={`picker-slot-pip picker-slot-pip--${s}`}>{s}</span>
                    ))}
                  </span>
                </div>

                {(item.skills ?? []).length > 0 && (
                  <div className="picker-item-skills">
                    {(item.skills ?? []).map(s => {
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
              </button>
            );
          })
        )}
      </div>
    </Dialog>
    {tooltipPortal}
    </>
  );
}
