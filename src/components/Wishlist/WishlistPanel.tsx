import { useState, useRef, useEffect } from 'react';
import { useWishlist } from '../../contexts/WishlistContext';
import { useBuildStats } from '../../hooks/useBuildStats';
import { useLang } from '../../contexts/LangContext';
import { SKILLS } from '../../data/skills';
import type { SkillCat } from '../../types';

interface TargetRowProps {
  id:       string;
  want:     number;
  have:     number;
  met:      boolean;
  name:     string;
  cat:      SkillCat;
  max:      number;
  onWant:   (w: number) => void;
  onRemove: () => void;
}

function TargetRow({ want, have, met, name, cat, max, onWant, onRemove }: TargetRowProps) {
  const display = Math.min(max, 7);
  return (
    <div className={`wl-target${met ? ' wl-target--met' : ''}`}>
      <span className={`wl-target-dot wl-target-dot--${cat}`} />
      <span className={`wl-target-name wl-target-name--${cat}`}>{name}</span>
      <div className="wl-pips">
        {Array.from({ length: display }, (_, i) => {
          const lvl = i + 1;
          if (lvl <= have && lvl <= want) return <span key={i} className={`wl-pip wl-pip--have wl-pip--${cat}`} />;
          if (lvl <= want)                return <span key={i} className="wl-pip wl-pip--want" />;
          if (lvl <= have)                return <span key={i} className={`wl-pip wl-pip--extra wl-pip--${cat}`} />;
          return                                  <span key={i} className="wl-pip wl-pip--empty" />;
        })}
      </div>
      <div className="wl-stepper">
        <button
          className="wl-step"
          onClick={() => onWant(Math.max(1, want - 1))}
          disabled={want <= 1}
        >−</button>
        <span className="wl-step-val num">
          {have}<span className="wl-step-sep">/</span>{want}
        </span>
        <button
          className="wl-step"
          onClick={() => onWant(Math.min(max, want + 1))}
          disabled={want >= max}
        >+</button>
      </div>
      <button className="wl-remove" onClick={onRemove} aria-label="Retirer">×</button>
    </div>
  );
}

export default function WishlistPanel() {
  const { targets, setTarget, removeTarget, clearAll } = useWishlist();
  const { skills: buildSkills } = useBuildStats();
  const { lang } = useLang();

  const [open, setOpen] = useState(targets.length > 0);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef  = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        !searchRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const buildMap  = new Map(buildSkills.map(s => [s.id, s.lvl]));
  const targetIds = new Set(targets.map(t => t.id));
  const metCount  = targets.filter(t => (buildMap.get(t.id) ?? 0) >= t.want).length;

  const q           = search.toLowerCase().trim();
  const suggestions = q
    ? Object.entries(SKILLS)
        .filter(([id, sk]) =>
          !targetIds.has(id) &&
          (sk.fr.toLowerCase().includes(q) || sk.en.toLowerCase().includes(q))
        )
        .slice(0, 10)
    : [];

  return (
    <div className="wl-panel">
      <button className="wl-header" onClick={() => setOpen(o => !o)}>
        <svg
          className={`wl-chevron${open ? ' wl-chevron--open' : ''}`}
          viewBox="0 0 12 12" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="2,4 6,8 10,4" />
        </svg>
        <span className="wl-title">
          {lang === 'fr' ? 'Objectifs de talents' : 'Skill Goals'}
        </span>
        {targets.length > 0 && (
          <span className={`wl-count-badge${metCount === targets.length ? ' wl-count-badge--full' : ''}`}>
            {metCount}/{targets.length}
          </span>
        )}
        {targets.length > 0 && (
          <button
            className="wl-clear-btn"
            onClick={e => { e.stopPropagation(); clearAll(); }}
            title={lang === 'fr' ? 'Tout effacer' : 'Clear all'}
          >
            {lang === 'fr' ? 'Effacer' : 'Clear'}
          </button>
        )}
      </button>

      {open && (
        <div className="wl-body">
          {targets.length === 0 ? (
            <p className="wl-empty">
              {lang === 'fr' ? 'Aucun objectif défini.' : 'No skill goals set.'}
            </p>
          ) : (
            <div className="wl-targets">
              {targets.map(({ id, want }) => {
                const skill = SKILLS[id];
                if (!skill) return null;
                const have = buildMap.get(id) ?? 0;
                return (
                  <TargetRow
                    key={id}
                    id={id}
                    want={want}
                    have={have}
                    met={have >= want}
                    name={lang === 'fr' ? skill.fr : skill.en}
                    cat={skill.cat}
                    max={skill.max}
                    onWant={w => setTarget(id, w)}
                    onRemove={() => removeTarget(id)}
                  />
                );
              })}
            </div>
          )}

          <div className="wl-add">
            <svg className="wl-add-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <circle cx="6.5" cy="6.5" r="4.5" />
              <line x1="10.5" y1="10.5" x2="14" y2="14" />
            </svg>
            <input
              ref={searchRef}
              className="wl-search"
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              placeholder={lang === 'fr' ? 'Ajouter un talent…' : 'Add a skill…'}
            />
            {showDropdown && suggestions.length > 0 && (
              <div ref={dropdownRef} className="wl-dropdown">
                {suggestions.map(([id, sk]) => (
                  <button
                    key={id}
                    className={`wl-suggest wl-suggest--${sk.cat}`}
                    onMouseDown={() => {
                      setTarget(id, 1);
                      setSearch('');
                      setShowDropdown(false);
                      searchRef.current?.focus();
                    }}
                  >
                    <span className={`wl-suggest-dot wl-suggest-dot--${sk.cat}`} />
                    {lang === 'fr' ? sk.fr : sk.en}
                    <span className="wl-suggest-max">/{sk.max}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
