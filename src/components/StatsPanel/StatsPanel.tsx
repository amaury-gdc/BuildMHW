import { useBuildStats } from '../../hooks/useBuildStats';
import { useT } from '../../hooks/useT';
import { RES_KEYS, type Element } from '../../types';
import ElementIcon from '../icons/ElementIcon';

const RES_LABEL: Record<Element, 'res_fire' | 'res_water' | 'res_thunder' | 'res_ice' | 'res_dragon'> = {
  fire:    'res_fire',
  water:   'res_water',
  thunder: 'res_thunder',
  ice:     'res_ice',
  dragon:  'res_dragon',
};

export default function StatsPanel() {
  const t = useT();
  const { defense, resistances, attack, affinity, freeSlots } = useBuildStats();

  if (!defense && !attack) {
    return (
      <div className="panel-card stats-panel">
        <h3>{t('stats_title')}</h3>
        <p className="panel-empty">{t('no_skills')}</p>
      </div>
    );
  }

  return (
    <div className="panel-card stats-panel">
      <h3>{t('stats_title')}</h3>
      <div className="stats-list">

        {attack > 0 && (
          <div className="stat-row">
            <span className="stat-row-label">{t('stat_attack')}</span>
            <span className="stat-row-value num">{attack}</span>
          </div>
        )}

        {affinity !== 0 && (
          <div className="stat-row">
            <span className="stat-row-label">{t('stat_affinity')}</span>
            <span className={`stat-row-value num ${affinity >= 0 ? 'stat-pos' : 'stat-neg'}`}>
              {affinity > 0 ? '+' : ''}{affinity}%
            </span>
          </div>
        )}

        <div className="stat-row">
          <span className="stat-row-label">{t('stat_defense')}</span>
          <span className="stat-row-value num stat-val-def">{defense}</span>
        </div>

        {freeSlots > 0 && (
          <div className="stat-row">
            <span className="stat-row-label">{t('stat_slots')}</span>
            <span className="stat-row-value num">{freeSlots}</span>
          </div>
        )}

        <div className="stat-section-divider" />

        {RES_KEYS.map(el => (
          <div key={el} className="stat-row stat-row--res">
            <span className="stat-row-label">
              <ElementIcon element={el} size={10} />
              {t(RES_LABEL[el])}
            </span>
            <span className={`stat-row-value num ${
              resistances[el] > 0 ? 'stat-pos' : resistances[el] < 0 ? 'stat-neg' : ''
            }`}>
              {resistances[el] > 0 ? '+' : ''}{resistances[el]}
            </span>
          </div>
        ))}

      </div>
    </div>
  );
}
