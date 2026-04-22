import type { Item, Lang } from '../../types';
import { SKILLS } from '../../data/skills';
import { rarityColor } from '../../utils/rarity';
import { RES_KEYS } from '../../types';
import { EL_LABEL } from '../../data/elements';

interface Props {
  item: Item;
  x: number;
  y: number;
  lang: Lang;
  pinned?: boolean;
  onClose?: () => void;
}

const TW = 288;
const TH = 320;

function clampPos(x: number, y: number): { cx: number; cy: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let cx = x + 18;
  let cy = y - 12;
  if (cx + TW > vw - 8) cx = x - TW - 18;
  if (cy + TH > vh - 8) cy = vh - TH - 8;
  if (cy < 8) cy = 8;
  return { cx, cy };
}

export default function ItemTooltip({ item, x, y, lang, pinned, onClose }: Props) {
  const rColor = rarityColor(item.rarity);
  const { cx, cy } = clampPos(x, y);
  const hasRes = item.res && RES_KEYS.some(k => (item.res?.[k] ?? 0) !== 0);

  return (
    <div
      className={`item-tooltip${pinned ? ' item-tooltip--pinned' : ''}`}
      style={{ left: cx, top: cy, '--rarity': rColor } as React.CSSProperties}
    >
      {pinned && (
        <button className="item-tooltip-close" onClick={onClose} aria-label="Fermer">×</button>
      )}

      <div className="item-tooltip-header">
        <span className="item-tooltip-name">{lang === 'fr' ? item.fr : item.en}</span>
        <span className="item-tooltip-rarity">R{item.rarity}</span>
      </div>

      {(item.type || item.origin) && (
        <div className="item-tooltip-meta">
          {item.type && <span className="item-tooltip-type">{item.type}</span>}
          {item.origin && <span className="item-tooltip-origin">{item.origin}</span>}
        </div>
      )}

      <div className="item-tooltip-stats">
        {item.attack !== undefined && (
          <div className="item-tooltip-stat">
            <span className="item-tooltip-stat-label">{lang === 'fr' ? 'Attaque' : 'Attack'}</span>
            <span className="item-tooltip-stat-val num">{item.attack}</span>
          </div>
        )}
        {item.affinity !== undefined && item.affinity !== 0 && (
          <div className="item-tooltip-stat">
            <span className="item-tooltip-stat-label">{lang === 'fr' ? 'Affinité' : 'Affinity'}</span>
            <span className={`item-tooltip-stat-val num ${item.affinity >= 0 ? 'stat-pos' : 'stat-neg'}`}>
              {item.affinity > 0 ? '+' : ''}{item.affinity}%
            </span>
          </div>
        )}
        {item.defense !== undefined && item.defense > 0 && (
          <div className="item-tooltip-stat">
            <span className="item-tooltip-stat-label">{lang === 'fr' ? 'Défense' : 'Defense'}</span>
            <span className="item-tooltip-stat-val num">{item.defense}</span>
          </div>
        )}
      </div>

      {hasRes && (
        <div className="item-tooltip-section">
          {RES_KEYS.map(el => {
            const val = item.res?.[el] ?? 0;
            if (val === 0) return null;
            return (
              <div key={el} className="item-tooltip-stat">
                <span className={`item-tooltip-stat-label item-tooltip-el--${el}`}>
                  {EL_LABEL[el][lang]}
                </span>
                <span className={`item-tooltip-stat-val num ${val > 0 ? 'stat-pos' : 'stat-neg'}`}>
                  {val > 0 ? '+' : ''}{val}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {item.slots.some(s => s > 0) && (
        <div className="item-tooltip-section item-tooltip-slots-row">
          <span className="item-tooltip-stat-label">{lang === 'fr' ? 'Emplacements' : 'Slots'}</span>
          <div className="item-tooltip-slots-pips">
            {item.slots.filter(s => s > 0).map((s, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <span key={i} className={`picker-slot-pip picker-slot-pip--${s}`}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {(item.skills ?? []).length > 0 && (
        <div className="item-tooltip-section item-tooltip-skills">
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
    </div>
  );
}
