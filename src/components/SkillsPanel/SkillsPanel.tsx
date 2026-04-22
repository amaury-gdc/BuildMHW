import { useBuildStats } from '../../hooks/useBuildStats';
import { useT } from '../../hooks/useT';
import { useLang } from '../../contexts/LangContext';
import { SKILLS } from '../../data/skills';

export default function SkillsPanel() {
  const t    = useT();
  const { lang } = useLang();
  const { skills } = useBuildStats();

  if (skills.length === 0) {
    return (
      <div className="panel-card skills-panel">
        <h3>{t('skills_title')}</h3>
        <p className="panel-empty">{t('no_skills')}</p>
      </div>
    );
  }

  return (
    <div className="panel-card skills-panel">
      <h3>
        {t('skills_title')}
        <span className="panel-count num">{skills.length}</span>
      </h3>
      <div className="skills-list">
        {skills.map(({ id, lvl }) => {
          const skill = SKILLS[id];
          if (!skill) return null;
          const pct = Math.round((lvl / skill.max) * 100);
          return (
            <div key={id} className="skill-row">
              <div className="skill-row-header">
                <span className={`skill-row-name skill-row-name--${skill.cat}`}>{skill[lang]}</span>
                <span className="skill-row-level">
                  <span className="num">{lvl}</span>/{skill.max}
                </span>
              </div>
              <div className="skill-bar-track">
                <div
                  className={`skill-bar-fill skill-bar-fill--${skill.cat}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
