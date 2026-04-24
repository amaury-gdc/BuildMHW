// Télécharge tous les MHWilds-*_Rare_8.png depuis monsterhunterwiki.org
// Usage : node scripts/download-icons.mjs
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WIKI_API  = 'https://monsterhunterwiki.org/api.php';
const OUT_DIR   = join(__dirname, '../public/icons');

async function listCategoryFiles(category) {
  const files = [];
  let cmcontinue;
  do {
    const params = new URLSearchParams({
      action: 'query', list: 'categorymembers',
      cmtitle: `Category:${category}`, cmtype: 'file',
      cmlimit: '500', format: 'json', origin: '*',
      ...(cmcontinue ? { cmcontinue } : {}),
    });
    const data = await fetch(`${WIKI_API}?${params}`).then(r => r.json());
    files.push(...data.query.categorymembers.map(m => m.title.replace('File:', '')));
    cmcontinue = data.continue?.cmcontinue;
  } while (cmcontinue);
  return files;
}

async function getImageUrls(filenames) {
  const results = {};
  for (let i = 0; i < filenames.length; i += 50) {
    const batch = filenames.slice(i, i + 50);
    const params = new URLSearchParams({
      action: 'query',
      titles: batch.map(f => `File:${f}`).join('|'),
      prop: 'imageinfo', iiprop: 'url',
      format: 'json', origin: '*',
    });
    const data = await fetch(`${WIKI_API}?${params}`).then(r => r.json());
    for (const page of Object.values(data.query.pages)) {
      results[page.title.replace('File:', '')] = page.imageinfo?.[0]?.url ?? null;
    }
  }
  return results;
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': 'MHWildsBuilder/1.0 (projet perso)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}


mkdirSync(OUT_DIR, { recursive: true });

console.log('Récupération de la liste Category:Icons...');
const all    = await listCategoryFiles('MHWilds_Equipment_Icons');
const wanted = all.filter(f => /^MHWilds-.*Rare.?8\.png$/i.test(f));
console.log(`${wanted.length} icônes MHWilds Rare 8 trouvées\n`);

const urls = await getImageUrls(wanted);

let downloaded = 0, skipped = 0, failed = 0;
for (const [filename, url] of Object.entries(urls)) {
  const dest = join(OUT_DIR, filename);
  if (existsSync(dest)) { skipped++; continue; }
  if (!url) { console.log(`  MANQUANT : ${filename}`); failed++; continue; }

  process.stdout.write(`  ↓ ${filename} ... `);
  try {
    await download(url, dest);
    console.log('OK');
    downloaded++;
  } catch (e) {
    console.log(`ERREUR : ${e.message}`);
    failed++;
  }
}

console.log(`\nTerminé : ${downloaded} téléchargés, ${skipped} déjà présents, ${failed} en erreur`);
