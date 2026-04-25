import { useState } from 'react';
import { useBuildStats } from '../../hooks/useBuildStats';
import { useLang } from '../../contexts/LangContext';
import { SKILLS } from '../../data/skills';
import { EL_LABEL } from '../../data/elements';
import ElementIcon from '../icons/ElementIcon';
import { RES_KEYS } from '../../types';
import type { Lang, SkillCat } from '../../types';

/* ── Helpers ─────────────────────────────────────────────── */

function StatBig({ value, label, cls }: { value: string; label: string; cls?: string }) {
  return (
    <div className="rp-stat-big">
      <span className={`rp-stat-big-value num${cls ? ` ${cls}` : ''}`}>{value}</span>
      <span className="rp-stat-big-label">{label}</span>
    </div>
  );
}

function Pips({ lvl, max, cat }: { lvl: number; max: number; cat: SkillCat }) {
  const display = Math.min(max, 7);
  return (
    <div className="rp-pips">
      {Array.from({ length: display }, (_, i) => (
        <span key={i} className={`rp-pip ${i < lvl ? `rp-pip--${cat}` : 'rp-pip--empty'}`} />
      ))}
    </div>
  );
}

function SkillEntry({ id, lvl, lang }: { id: string; lvl: number; lang: Lang }) {
  const skill = SKILLS[id];
  if (!skill) return null;
  const rankDesc = skill.ranks?.[lvl - 1];
  return (
    <div className={`rp-skill rp-skill--${skill.cat}`}>
      <div className="rp-skill-header">
        <span className="rp-skill-name">{skill[lang]}</span>
        <Pips lvl={lvl} max={skill.max} cat={skill.cat} />
        <span className="rp-skill-lvl num">
          {lvl}<span className="rp-skill-max">/{skill.max}</span>
        </span>
      </div>
      {rankDesc && <p className="rp-skill-effect">{rankDesc[lang]}</p>}
    </div>
  );
}

function SectionShell({ type, title, children, defaultOpen = true }: {
  type: 'stats' | 'talents' | 'bonus';
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rp-section rp-section--${type}`}>
      <button
        className={`rp-section-title rp-section-title--${type} rp-section-toggle`}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className={`rp-section-dot rp-section-dot--${type}`} />
        <span className="rp-section-title-text">{title}</span>
        <svg
          className={`rp-section-chevron${open ? ' rp-section-chevron--open' : ''}`}
          viewBox="0 0 12 12" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="2,4 6,8 10,4" />
        </svg>
      </button>
      {open && children}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────── */

export default function RightPanel() {
  const {
    defense, resistances,
    attack, affinity, element, elementDmg, elementHidden,
    freeSlots, skills, setBonuses,
  } = useBuildStats();
  const { lang } = useLang();

  const hasWeaponStats = attack > 0 || affinity !== 0 || (element !== null && elementDmg > 0);
  const hasArmorStats  = defense > 0;
  const hasStats       = hasWeaponStats || hasArmorStats;
  const isEmpty        = !hasStats && skills.length === 0;

  if (isEmpty) {
    return (
      <aside className="right-panel">
        <div className="rp-empty">
          <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
            <rect x="10" y="10" width="44" height="44" rx="6" strokeDasharray="6 4" />
            <path d="M22 32h20M32 22v20" strokeLinecap="round" />
          </svg>
          <p>{lang === 'fr' ? 'Équipez des pièces pour voir vos statistiques' : 'Equip gear to see your statistics'}</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="right-panel">

      {/* ── STATS ── */}
      {hasStats && (
        <SectionShell type="stats" title={lang === 'fr' ? 'Statistiques' : 'Statistics'}>

          {/* Arme : attaque, élément, affinité, critique */}
          {hasWeaponStats && (
            <div className="rp-stat-row">
              {attack > 0 && (
                <StatBig value={String(attack)} label={lang === 'fr' ? 'Attaque' : 'Attack'} />
              )}
              {element && elementDmg > 0 && (
                <StatBig
                  value={elementHidden ? `(${elementDmg})` : String(elementDmg)}
                  label={EL_LABEL[element][lang]}
                  cls={`rp-el--${element}`}
                />
              )}
              {affinity !== 0 && (
                <StatBig
                  value={`${affinity > 0 ? '+' : ''}${affinity}%`}
                  label={lang === 'fr' ? 'Affinité' : 'Affinity'}
                  cls={affinity >= 0 ? 'stat-pos' : 'stat-neg'}
                />
              )}
              {affinity !== 0 && (
                <StatBig
                  value={`${25 + (Math.max(0, affinity) * 0.15 | 0)}%`}
                  label={lang === 'fr' ? 'Dégâts critique' : 'Crit damage'}
                  cls="rp-crit"
                />
              )}
            </div>
          )}

          {/* Armure : défense + résistances */}
          {hasArmorStats && (
            <div className="rp-def-row">
              <StatBig value={String(defense)} label={lang === 'fr' ? 'Défense' : 'Defense'} />
              <div className="rp-resistances">
                {RES_KEYS.map(el => {
                  const val = resistances[el] ?? 0;
                  return (
                    <div key={el} className={`rp-res-pill rp-res-pill--${el}`}>
                      <ElementIcon element={el} size={10} />
                      <span className="rp-res-el-label">{EL_LABEL[el][lang]}</span>
                      <span className={`rp-res-val num ${val > 0 ? 'stat-pos' : val < 0 ? 'stat-neg' : 'rp-res-zero'}`}>
                        {val > 0 ? '+' : ''}{val}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </SectionShell>
      )}

      {/* ── TALENTS ── */}
      {skills.length > 0 && (
        <SectionShell type="talents" title={lang === 'fr' ? 'Talents' : 'Skills'}>
          <div className="rp-skills">
            {skills.map(({ id, lvl }) => (
              <SkillEntry key={id} id={id} lvl={lvl} lang={lang} />
            ))}
          </div>
        </SectionShell>
      )}

      {/* ── BONUS DE SÉRIE ── */}
      {setBonuses.length > 0 && (
        <SectionShell type="bonus" title={lang === 'fr' ? 'Bonus de série' : 'Set Bonuses'}>
          <div className="rp-set-bonuses">
            {setBonuses.map(({ origin, count }) => (
              <div key={origin} className="rp-set-bonus">
                <span className="rp-set-bonus-gem" aria-hidden="true" />
                <span className="rp-set-bonus-name">{origin}</span>
                <div className="rp-set-bonus-pips">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className={`rp-set-pip ${i < count ? 'rp-set-pip--on' : 'rp-set-pip--off'}`} />
                  ))}
                </div>
                <span className="rp-set-bonus-count num">{count}<span className="rp-set-bonus-max">/5</span></span>
              </div>
            ))}
          </div>
        </SectionShell>
      )}

      {/* ── EMPLACEMENTS LIBRES ── */}
      {freeSlots > 0 && (
        <div className="rp-slots-row">
          <span className="rp-slots-label">
            {lang === 'fr' ? 'Emplacements déco libres' : 'Free deco slots'}
          </span>
          <span className="rp-slots-value num">{freeSlots}</span>
        </div>
      )}

    </aside>
  );
}
