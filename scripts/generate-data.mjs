/**
 * scripts/generate-data.mjs
 * Régénère src/data/skills.ts, equipment.ts et decorations.ts
 * depuis l'API wilds.mhdb.io
 *
 * Usage : node scripts/generate-data.mjs
 * Requiert : Node.js 18+
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, '../src/data');
const API  = 'https://wilds.mhdb.io';

// ── Helpers réseau ────────────────────────────────────────────────────────────

async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function getAll(locale, resource) {
  const data = await get(`${API}/${locale}/${resource}`);
  return Array.isArray(data) ? data : [];
}

async function getBilingual(resource) {
  process.stdout.write(`  ${resource}...`);
  const [fr, en] = await Promise.all([getAll('fr', resource), getAll('en', resource)]);
  const frById = new Map(fr.map(x => [x.id, x]));
  const enById = new Map(en.map(x => [x.id, x]));
  console.log(` ${en.length}`);
  return { frById, enById };
}

// ── Utilitaires ───────────────────────────────────────────────────────────────

function esc(str) {
  return String(str ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n|\r/g, ' ');
}

function normalizeSlots(slots) {
  const s = Array.isArray(slots) ? [...slots] : [];
  while (s.length < 3) s.push(0);
  return s.slice(0, 3);
}

function buildRes(resistances) {
  if (!resistances) return null;
  const entries = Object.entries(resistances).filter(([, v]) => v !== 0);
  return entries.length ? Object.fromEntries(entries) : null;
}

const KIND_TO_TYPE = {
  'bow': 'Bow', 'charge-blade': 'Charge Blade', 'dual-blades': 'Dual Blades',
  'great-sword': 'Great Sword', 'gunlance': 'Gunlance', 'hammer': 'Hammer',
  'heavy-bowgun': 'Heavy Bowgun', 'hunting-horn': 'Hunting Horn',
  'insect-glaive': 'Insect Glaive', 'lance': 'Lance', 'light-bowgun': 'Light Bowgun',
  'long-sword': 'Long Sword', 'switch-axe': 'Switch Axe', 'sword-shield': 'SnS',
};

function inferCat(name, kind) {
  const n = name.toLowerCase();
  const def = [
    'resistance', 'defense boost', 'divine blessing', 'health boost', 'recovery up',
    'recovery speed', 'guard up', 'earplugs', 'stun resistance', 'blight resistance',
    'tremor resistance', 'wind resistance', 'mud resistance', 'heat guard', 'cold immunity',
    'resuscitate', 'heroics', 'guts', 'hunger resistance', 'adaptability',
    'bleeding resistance', 'bind resistance', 'paralysis resistance', 'poison resistance',
    'blast resistance', 'sleep resistance', 'iron skin', "guardian's protection",
    "guardian's pulse", 'fortifying pelt', 'fire resistance', 'water resistance',
    'thunder resistance', 'ice resistance', 'dragon resistance', 'offensive guard',
    'resentment', 'peak performance',
  ];
  const atk = [
    'attack boost', 'critical eye', 'weakness exploit', 'critical boost', 'critical draw',
    'critical element', 'critical status', 'agitator', 'burst', 'flayer', 'maximum might',
    'partbreaker', 'power shots', 'normal shots', 'spread', 'pierce shots', 'ammo up',
    'artillery', 'slugger', 'bludgeoner', 'rapid morph', 'focus', 'handicraft',
    'razor sharp', 'speed sharpening', 'protective polish', 'punishing draw', 'airborne',
    'horn maestro', 'opening shot', 'stamina thief', 'load shells', 'piercing shots',
    'rapid fire up', 'special ammo', 'ballistics', 'capacity boost', 'coalescence',
    'power prolonger', "mind's eye", "master's touch", 'buildup boost', 'dereliction',
    'bloodlust', 'strife', 'mail of hellfire', 'dragon conversion', 'foray',
    'latent power', 'counterstrike', 'adrenaline rush', 'furious', 'affinity sliding',
    'fire attack', 'water attack', 'thunder attack', 'ice attack', 'dragon attack',
    'poison attack', 'paralysis attack', 'blast attack', 'sleep attack',
    'exhaust functionality', 'blast functionality', 'poison functionality',
    'sleep functionality', 'para functionality', 'charge master', 'flinger',
    'evading reload', 'omega resonance',
  ];
  for (const w of def) if (n.includes(w)) return 'def';
  for (const w of atk) if (n.includes(w)) return 'atk';
  if (kind === 'weapon') return 'atk';
  return 'util';
}

function serializeItem(item) {
  let out = `    { id:'${item.id}', fr:"${esc(item.fr)}", en:"${esc(item.en)}"`;
  if (item.type     != null) out += `, type:"${esc(item.type)}"`;
  if (item.origin   != null) out += `, origin:"${esc(item.origin)}"`;
  out += `, rarity:${item.rarity}`;
  if (item.attack   != null && item.attack   !== 0) out += `, attack:${item.attack}`;
  if (item.affinity != null && item.affinity !== 0) out += `, affinity:${item.affinity}`;
  if (item.defense  != null && item.defense  !== 0) out += `, defense:${item.defense}`;
  if (item.res) {
    const r = Object.entries(item.res).map(([k, v]) => `${k}:${v}`).join(',');
    out += `, res:{${r}}`;
  }
  out += `, slots:[${item.slots.join(',')}]`;
  if (item.skills?.length) {
    const sk = item.skills.map(s => `{id:'${s.id}',lvl:${s.lvl}}`).join(',');
    out += `, skills:[${sk}]`;
  }
  out += ` }`;
  return out;
}

// ── Générateurs ───────────────────────────────────────────────────────────────

function makeSkillsFile(frById, enById) {
  const lines = [];
  for (const [id, en] of enById) {
    const fr  = frById.get(id) ?? en;
    const cat = inferCat(en.name, en.kind);
    const max = en.ranks?.length || 1;
    let line  = `  "${id}": { fr: "${esc(fr.name)}", en: "${esc(en.name)}", max: ${max}, cat: '${cat}'`;
    if (en.description) {
      line += `, description: { fr: "${esc(fr.description ?? en.description)}", en: "${esc(en.description)}" }`;
    }
    if (en.ranks?.length) {
      const frRanks = fr.ranks ?? [];
      const ranks = en.ranks.map((r, i) =>
        `{ fr: "${esc(frRanks[i]?.description ?? r.description ?? '')}", en: "${esc(r.description ?? '')}" }`
      ).join(', ');
      line += `, ranks: [${ranks}]`;
    }
    line += ` }`;
    lines.push(line);
  }
  return `import type { Skill } from '../types';\n\nexport const SKILLS: Record<string, Skill> = {\n${lines.join(',\n')},\n};\n`;
}

function makeEquipmentFile(
  armorFr, armorEn,
  weaponFr, weaponEn,
  charmFr, charmEn,
) {
  // Armes
  const weapons = [];
  for (const [id, en] of weaponEn) {
    const fr   = weaponFr.get(id) ?? en;
    const type = KIND_TO_TYPE[en.kind];
    if (!type) continue;
    weapons.push(serializeItem({
      id:       `w${id}`,
      fr:       fr.name,
      en:       en.name,
      type,
      rarity:   en.rarity ?? 1,
      attack:   en.damage?.raw ?? 0,
      affinity: en.affinity ?? 0,
      slots:    normalizeSlots(en.slots),
      skills:   (en.skills ?? []).map(s => ({ id: String(s.skill.id), lvl: s.level })),
    }));
  }

  // Armures
  const PREFIXES = { head: 'h', chest: 'c', arms: 'a', waist: 'wa', legs: 'l' };
  const bySlot   = { head: [], chest: [], arms: [], waist: [], legs: [] };
  for (const [id, en] of armorEn) {
    if (!bySlot[en.kind]) continue;
    const fr     = armorFr.get(id) ?? en;
    const origin = en.armorSet?.name?.replace(/\s+[αβγ]$/, '').trim()
                ?? fr.armorSet?.name?.replace(/\s+[αβγ]$/, '').trim();
    const res    = buildRes(en.resistances);
    bySlot[en.kind].push(serializeItem({
      id:      `${PREFIXES[en.kind]}${id}`,
      fr:      fr.name,
      en:      en.name,
      origin,
      rarity:  en.rarity ?? 1,
      defense: en.defense?.base ?? 0,
      res,
      slots:   normalizeSlots(en.slots),
      skills:  (en.skills ?? []).map(s => ({ id: String(s.skill.id), lvl: s.level })),
    }));
  }

  // Talismans (charms aplatis par rank)
  const frCharmRank = new Map();
  for (const fr of charmFr.values()) {
    for (const r of fr.ranks ?? []) frCharmRank.set(r.id, r);
  }
  const talismans = [];
  for (const en of charmEn.values()) {
    for (const rank of en.ranks ?? []) {
      const frR = frCharmRank.get(rank.id);
      talismans.push(serializeItem({
        id:     `t${rank.id}`,
        fr:     frR?.name ?? rank.name,
        en:     rank.name,
        rarity: rank.rarity ?? 5,
        slots:  [0, 0, 0],
        skills: (rank.skills ?? []).map(s => ({ id: String(s.skill.id), lvl: s.level })),
      }));
    }
  }

  const section = (name, items) => `  ${name}: [\n${items.join(',\n')},\n  ]`;
  return `import type { Item, Slot } from '../types';\n\nexport const EQUIPMENT: Record<Slot, Item[]> = {\n${[
    section('weapon',   weapons),
    section('head',     bySlot.head),
    section('chest',    bySlot.chest),
    section('arms',     bySlot.arms),
    section('waist',    bySlot.waist),
    section('legs',     bySlot.legs),
    section('talisman', talismans),
  ].join(',\n\n')},\n};\n`;
}

function makeDecorationsFile(frById, enById) {
  const lines = [];
  for (const [id, en] of enById) {
    const fr     = frById.get(id) ?? en;
    const skills = (en.skills ?? []).map(s => `{id:'${s.skill.id}',lvl:${s.level}}`).join(',');
    lines.push(
      `  { id:'d${id}', fr:"${esc(fr.name)}", en:"${esc(en.name)}", rarity:${en.rarity}, size:${en.slot ?? 1}, skills:[${skills}] }`
    );
  }
  return `import type { SkillOnItem } from '../types';\n\nexport interface DecorationItem {\n  id: string;\n  fr: string;\n  en: string;\n  rarity: number;\n  size: number;\n  skills: SkillOnItem[];\n}\n\nexport const DECORATIONS: DecorationItem[] = [\n${lines.join(',\n')},\n];\n`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching wilds.mhdb.io...\n');

  const [
    { frById: skillFr,  enById: skillEn  },
    { frById: armorFr,  enById: armorEn  },
    { frById: weaponFr, enById: weaponEn },
    { frById: charmFr,  enById: charmEn  },
    { frById: decoFr,   enById: decoEn   },
  ] = await Promise.all([
    getBilingual('skills'),
    getBilingual('armor'),
    getBilingual('weapons'),
    getBilingual('charms'),
    getBilingual('decorations'),
  ]);

  console.log('\nGénération des fichiers...');

  writeFileSync(join(DATA, 'skills.ts'),      makeSkillsFile(skillFr, skillEn));
  writeFileSync(join(DATA, 'equipment.ts'),   makeEquipmentFile(armorFr, armorEn, weaponFr, weaponEn, charmFr, charmEn));
  writeFileSync(join(DATA, 'decorations.ts'), makeDecorationsFile(decoFr, decoEn));

  console.log('  ✓ src/data/skills.ts');
  console.log('  ✓ src/data/equipment.ts');
  console.log('  ✓ src/data/decorations.ts');
  console.log('\nLance npm run typecheck pour vérifier.');
}

main().catch(err => {
  console.error('\n✗ Erreur :', err.message);
  process.exit(1);
});
