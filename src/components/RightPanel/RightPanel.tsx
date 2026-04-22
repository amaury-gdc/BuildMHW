import { useBuildStats } from '../../hooks/useBuildStats';
import { useLang } from '../../contexts/LangContext';
import { SKILLS } from '../../data/skills';
import ElementIcon from '../icons/ElementIcon';
import { RES_KEYS } from '../../types';
import type { Lang, Element, SkillCat } from '../../types';

const EL_LABEL: Record<Element, { fr: string; en: string }> = {
  fire:    { fr: 'Feu',    en: 'Fire'    },
  water:   { fr: 'Eau',    en: 'Water'   },
  thunder: { fr: 'Foudre', en: 'Thunder' },
  ice:     { fr: 'Glace',  en: 'Ice'     },
  dragon:  { fr: 'Dragon', en: 'Dragon'  },
};

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

function Section({ cat, title, children }: { cat: SkillCat | 'bonus'; title: string; children: React.ReactNode }) {
  return (
    <div className={`rp-section rp-section--${cat}`}>
      <div className={`rp-section-title rp-section-title--${cat}`}>
        <span className={`rp-section-dot rp-section-dot--${cat}`} />
        {title}
      </div>
      {children}
    </div>
  );
}

export default function RightPanel() {
  const { defense, resistances, attack, affinity, freeSlots, skills, setBonuses } = useBuildStats();
  const { lang } = useLang();

  const atkSkills  = skills.filter(s => SKILLS[s.id]?.cat === 'atk');
  const defSkills  = skills.filter(s => SKILLS[s.id]?.cat === 'def');
  const utilSkills = skills.filter(s => SKILLS[s.id]?.cat === 'util');

  const hasOffense = attack > 0 || atkSkills.length > 0;
  const hasDefense = defense > 0 || defSkills.length > 0;
  const isEmpty    = !hasOffense && !hasDefense && utilSkills.length === 0;

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

      {/* ── OFFENSIF ── */}
      {hasOffense && (
        <Section cat="atk" title={lang === 'fr' ? 'Offensif' : 'Offensive'}>
          {(attack > 0 || affinity !== 0) && (
            <div className="rp-stat-row">
              {attack > 0 && (
                <StatBig value={String(attack)} label={lang === 'fr' ? 'Attaque' : 'Attack'} />
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
                  value={`${25 + Math.max(0, affinity) * 0.15 | 0}%`}
                  label={lang === 'fr' ? 'Dégâts critique' : 'Crit damage'}
                  cls="rp-crit"
                />
              )}
            </div>
          )}
          {atkSkills.length > 0 && (
            <div className="rp-skills">
              {atkSkills.map(({ id, lvl }) => (
                <SkillEntry key={id} id={id} lvl={lvl} lang={lang} />
              ))}
            </div>
          )}
        </Section>
      )}

      {/* ── DÉFENSIF ── */}
      {hasDefense && (
        <Section cat="def" title={lang === 'fr' ? 'Défensif' : 'Defensive'}>
          <div className="rp-def-row">
            {defense > 0 && (
              <StatBig value={String(defense)} label={lang === 'fr' ? 'Défense' : 'Defense'} />
            )}
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
          {defSkills.length > 0 && (
            <div className="rp-skills">
              {defSkills.map(({ id, lvl }) => (
                <SkillEntry key={id} id={id} lvl={lvl} lang={lang} />
              ))}
            </div>
          )}
        </Section>
      )}

      {/* ── UTILITAIRES ── */}
      {utilSkills.length > 0 && (
        <Section cat="util" title={lang === 'fr' ? 'Utilitaires' : 'Utility'}>
          <div className="rp-skills">
            {utilSkills.map(({ id, lvl }) => (
              <SkillEntry key={id} id={id} lvl={lvl} lang={lang} />
            ))}
          </div>
        </Section>
      )}

      {/* ── BONUS DE SÉRIE ── */}
      {setBonuses.length > 0 && (
        <Section cat="bonus" title={lang === 'fr' ? 'Bonus de série' : 'Set Bonuses'}>
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
        </Section>
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
