import { useTheme } from '../../contexts/ThemeContext';
import { useLang } from '../../contexts/LangContext';
import { useBuild } from '../../contexts/BuildContext';
import { useT } from '../../hooks/useT';
import type { Theme, Lang, Slot } from '../../types';

const SLOTS: Slot[] = ['weapon', 'head', 'chest', 'arms', 'waist', 'legs', 'talisman'];

const THEMES: { value: Theme; label: string }[] = [
  { value: 'guild',     label: 'Guild'     },
  { value: 'parchment', label: 'Parchment' },
  { value: 'verdant',   label: 'Verdant'   },
];

const LANGS: { value: Lang; label: string }[] = [
  { value: 'fr', label: 'FR' },
  { value: 'en', label: 'EN' },
];

export default function Header() {
  const { theme, setTheme }         = useTheme();
  const { lang, setLang }           = useLang();
  const { build, buildName, setBuildName } = useBuild();
  const t = useT();

  const equippedCount = SLOTS.filter(s => build[s] !== null).length;

  return (
    <header className="header">
      {/* Marque */}
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 28 28" fill="currentColor" aria-hidden="true">
            <polygon points="14,2 17,10 26,10 19,15.5 21.5,24 14,19 6.5,24 9,15.5 2,10 11,10" />
          </svg>
        </div>
        <div>
          <div className="brand-name">Wilds Builder</div>
          <div className="brand-sub">{t('tagline')}</div>
        </div>
      </div>

      {/* Nom du build */}
      <div className="header-name-field">
        <span className="field-label">{t('build_label')}</span>
        <input
          type="text"
          value={buildName}
          onChange={e => setBuildName(e.target.value)}
          aria-label={t('build_label')}
        />
      </div>

      {/* Compteur de pièces */}
      <div className="header-piece-count" aria-label={`${equippedCount} / 7 ${t('pieces_equipped')}`}>
        <span className="piece-count-num">{equippedCount}<span className="piece-count-total">/7</span></span>
        <span className="piece-count-label">{t('pieces_equipped')}</span>
      </div>

      <div className="header-spacer" />

      <div className="header-actions">
        {/* Toggle thème */}
        <div className="segmented" role="group" aria-label="Thème">
          {THEMES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={theme === value}
              onClick={() => setTheme(value)}
              title={label}
            >
              {label.slice(0, 1)}
            </button>
          ))}
        </div>

        {/* Toggle langue */}
        <div className="segmented" role="group" aria-label="Langue">
          {LANGS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={lang === value}
              onClick={() => setLang(value)}
              aria-label={`Langue : ${label}`}
            >
              {label}
            </button>
          ))}
        </div>

        <button type="button" className="btn btn--ghost">
          {t('btn_save')}
        </button>
        <button type="button" className="btn btn--primary">
          {t('btn_share')}
        </button>
      </div>
    </header>
  );
}
