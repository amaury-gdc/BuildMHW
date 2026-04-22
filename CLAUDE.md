# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Wilds Builder — Contexte projet

Document de référence pour toute IA qui travaille sur ce projet (Claude Code, Cursor, etc.).
À garder à la racine du repo. À lire au début de chaque session.

---

## Commandes

```bash
npm run dev        # serveur de dev → http://localhost:5173
npm run typecheck  # vérifie les types TS (0 erreur attendu avant tout commit)
npm run lint       # ESLint (0 erreur, 0 warning attendu avant tout commit)
npm run build      # build de production dans dist/
npm run preview    # prévisualise le build de production
```

Pas de tests automatisés. La vérification se fait via `typecheck` + `lint` + test visuel dans le navigateur.

---

## État d'implémentation

| Composant / fichier | État |
|---|---|
| `Header` — toggle thème + toggle FR/EN + input nom du build | ✅ fonctionnel |
| `SlotGrid` + `SlotCard` — 7 cartes, filet rareté, bouton ×, deco slots, skill badges | ✅ fonctionnel |
| `SlotIcon` — PNG rareté-dynamique (R1-R8) si dispo, sinon SVG fallback | ✅ fonctionnel |
| `ElementIcon` — losange coloré | ✅ fonctionnel |
| `PickerDialog` — modale de sélection avec recherche, tri, filtre talent, tooltip épinglable | ✅ fonctionnel |
| `DecoDialog` — modale de sélection de décorations | ✅ fonctionnel |
| `ItemTooltip` — tooltip hover + épinglage Ctrl/AltGr | ✅ fonctionnel |
| `RightPanel` — stats défense/attaque/affinité, résistances, talents par catégorie, bonus de série | ✅ fonctionnel |
| `BuildContext` — état `EquippedBuild` avec décos, build par défaut "As de la Guilde" | ✅ fonctionnel |
| `LangContext` + `useT()` — i18n FR/EN | ✅ fonctionnel |
| `ThemeContext` — `data-theme` sur `<html>`, synchronisé via `useEffect([theme])` | ✅ fonctionnel |
| `useBuildStats` — défense, résistances, attaque, affinité, talents agrégés, bonus de série, slots libres | ✅ fonctionnel |
| `src/data/equipment.ts` — ~50 items (placeholder MVP) | ⚠️ données fictives, pas les vraies données du jeu |
| `src/data/skills.ts` — 21 talents (atk / def / util) | ⚠️ partiel |
| `src/data/elements.ts` — `EL_LABEL` centralisé | ✅ complet |
| `src/data/i18n.ts` — dictionnaire FR/EN complet | ✅ complet |
| `src/utils/icons.ts` — `weaponIconUrl(type, rarity)` + `slotIconUrl(slot, rarity)` | ✅ fonctionnel |
| ESLint (flat config) — `eslint.config.js` | ✅ configuré |
| `MetaPanel`, `StatsPanel`, `SetBonusPanel`, `SkillsPanel` | 🔲 stubs vides (non utilisés) |
| Persistance localStorage | 🔲 non implémenté |
| Partage par URL | 🔲 non implémenté |
| Filtre par type d'arme dans le picker | 🔲 non implémenté |
| Compteur "X/7 pièces équipées" dans le header | 🔲 non implémenté |
| Filtre CSS sur les PNG pour thèmes clairs | 🔲 non implémenté |

---

## Vision

Application web de **build planning pour Monster Hunter Wilds**. L'utilisateur (Amaury,
joueur francophone) trouve difficile de visualiser ses builds dans le jeu. Cet outil permet
de composer un build complet (arme + 5 pièces d'armure + talisman + décorations) en cliquant
sur chaque emplacement, avec recherche et tri par talents.

**Utilisateur cible** : chasseurs francophones et anglophones. Tous les noms d'items, de talents,
d'origines doivent être disponibles dans les deux langues avec un **toggle global FR ⇄ EN**.

---

## Stack technique

- **React 18** + **TypeScript** (strict)
- **Vite** comme build tool
- **PrimeReact 10** comme librairie UI — CSS importés dans `main.tsx`
- **PrimeIcons** pour les icônes utilitaires
- **ESLint 9** (flat config) avec plugins react, react-hooks, jsx-a11y, typescript-eslint
- Pas de lib CSS externe : CSS simple avec design tokens en variables CSS
- Pas de state manager externe : **Context API** (thème, langue, build)

---

## Décisions design (à respecter)

### Thèmes
Le thème s'applique via `data-theme` sur `<html>`, synchronisé par `ThemeContext`.

- **`guild`** (par défaut) — dark warm brown. Fond `#1a140b`, accent or `#e8b653`, texte crème `#ede1b8`.
- **`parchment`** — clair, journal de chasseur. Beige `#ebe0c9`, accent rouille `#a0451a`.
- **`verdant`** — clair, forêt. Vert clair `#e7ecde`, accent vert forêt `#3a6f3e`.

### Typographie
- **Barlow** (Google Fonts), poids 500-800. **Barlow Condensed** pour les chiffres.
- **Poids minimum 500** partout. JAMAIS de font-weight 400.

### Couleurs d'éléments
```
--el-fire:    #e06a5a
--el-water:   #5aa5d8
--el-thunder: #e0d050
--el-ice:     #90d8dc
--el-dragon:  #c566b0
```
Icônes d'éléments : **losanges** (diamant), pas des cercles.

### Raretés R1 à R8
```
--rarity-1: #b8b0a2  --rarity-2: #c5b78b  --rarity-3: #90b076  --rarity-4: #5ea5ab
--rarity-5: #7b71b8  --rarity-6: #b36a86  --rarity-7: #d48a3c  --rarity-8: #e8aa3d
```
Chaque carte porte un filet vertical coloré (3px) à gauche selon la rareté de l'item.

### Catégorisation des talents
- `atk` (rouge `#c14d36`) — offensif
- `def` (bleu `#4a7eb8`) — défensif
- `util` (violet `#8a6dbe`) — utilitaire

### Design tokens (variables CSS)
Espaces : `--sp-1` (4px) à `--sp-12` (48px). Radius : `--r-sm` (3px) à `--r-xl` (14px).
Textes : `--text-xs` (11px) à `--text-3xl` (38px). Animations : `--dur-fast`, `--dur-med`, `--dur-slow`.

---

## Modèle de données

```ts
type Lang    = 'fr' | 'en';
type Theme   = 'guild' | 'parchment' | 'verdant';
type Slot    = 'weapon' | 'head' | 'chest' | 'arms' | 'waist' | 'legs' | 'talisman';
type Element = 'fire' | 'water' | 'thunder' | 'ice' | 'dragon';
type SkillCat = 'atk' | 'def' | 'util';

interface Skill {
  fr: string;
  en: string;
  max: number;
  cat: SkillCat;
  ranks?: { fr: string; en: string }[];   // description par niveau (index 0 = niveau 1)
}

interface SkillOnItem {
  id: string;   // clé dans SKILLS
  lvl: number;
}

interface Item {
  id: string;
  fr: string;
  en: string;
  type?: string;           // armes : 'Great Sword', 'Long Sword', 'Switch Axe', etc.
  origin?: string;         // monstre d'origine (ex. 'Arkveld')
  rarity: number;          // 1-8
  attack?: number;
  affinity?: number;       // en %
  defense?: number;
  res?: Partial<Record<Element, number>>;
  slots: number[];         // toujours 3 entrées, valeurs 0-4 (0 = pas de slot)
  skills?: SkillOnItem[];
}

interface EquippedBuild {
  weapon:   string | null;
  head:     string | null;
  chest:    string | null;
  arms:     string | null;
  waist:    string | null;
  legs:     string | null;
  talisman: string | null;
  decos: Record<Slot, [string | null, string | null, string | null]>;
}
```

`SLOT_ORDER` = `['weapon', 'head', 'chest', 'arms', 'waist', 'legs', 'talisman']`
`RES_KEYS`   = `['fire', 'water', 'thunder', 'ice', 'dragon']`

---

## Architecture réelle (état actuel)

```
BuildMHW/
├── public/
│   └── icons/              # PNG MHWilds-{Type}_Icon_Rare_{1-8}.png (tous présents R1-R8)
├── src/
│   ├── main.tsx
│   ├── App.tsx             # 2 colonnes : SlotGrid (gauche) + RightPanel (droite sticky)
│   │
│   ├── data/
│   │   ├── equipment.ts    # EQUIPMENT: Record<Slot, Item[]>
│   │   ├── skills.ts       # SKILLS: Record<string, Skill>
│   │   ├── decorations.ts  # DECORATIONS: Decoration[]
│   │   ├── elements.ts     # EL_LABEL: Record<Element, {fr,en}> — source unique
│   │   └── i18n.ts         # I18N: { fr, en } — I18nKey = keyof typeof I18N['fr']
│   │
│   ├── types/index.ts
│   ├── contexts/           # ThemeContext, LangContext, BuildContext
│   ├── hooks/
│   │   ├── useT.ts
│   │   └── useBuildStats.ts
│   │
│   ├── components/
│   │   ├── Header/Header.tsx
│   │   ├── SlotGrid/
│   │   │   ├── SlotGrid.tsx
│   │   │   └── SlotCard.tsx
│   │   ├── Picker/
│   │   │   ├── PickerDialog.tsx   # recherche + tri + filtre talent + tooltip épinglable
│   │   │   ├── DecoDialog.tsx     # sélection de décorations
│   │   │   └── ItemTooltip.tsx    # tooltip hover/épinglé (Ctrl ou AltGr pour épingler)
│   │   ├── RightPanel/RightPanel.tsx  # stats + talents par catégorie + bonus de série
│   │   ├── icons/
│   │   │   ├── SlotIcon.tsx       # <img> PNG rareté-dynamique ou <svg> fallback
│   │   │   └── ElementIcon.tsx    # losange coloré
│   │   └── [MetaPanel|StatsPanel|SetBonusPanel|SkillsPanel]/  # stubs non utilisés
│   │
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── themes.css
│   │   └── globals.css
│   │
│   └── utils/
│       ├── rarity.ts       # rarityColor(r) → var(--rarity-N)
│       └── icons.ts        # weaponIconUrl(type, rarity), slotIconUrl(slot, rarity)
│
├── eslint.config.js        # flat config ESLint 9
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Conventions PrimeReact

CSS importés dans `main.tsx` :
```ts
import 'primereact/resources/themes/lara-dark-amber/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
```
Les couleurs PrimeReact sont overridées via nos variables CSS (`--accent`, `--bg`, `--surface`).

---

## UX — consignes fortes

1. **Bouton × (clear)** : toujours visible à faible opacité (0.4), `stopPropagation` pour ne pas déclencher le picker.
2. **Focus trap dans la modale** : Échap ferme la Dialog PrimeReact.
3. **Empty state de slot** : "＋" doré + "Cliquer pour choisir" en italique.
4. **Toggle FR/EN / thèmes** : `aria-label` systématique.
5. **Progression** : "X/7 pièces équipées" prévu dans le header (pas encore implémenté).
6. **Contraste** : `text-faint` ≥ 4.5:1 sur le fond.
7. **PNG sur thèmes clairs** : appliquer `filter: brightness(0.2) contrast(1.5)` sur Parchment/Verdant (pas encore implémenté).
8. **Talisman** : demi-largeur dans la grille.

---

## Icônes

Tous les PNG `MHWilds-{Type}_Icon_Rare_{N}.png` sont présents pour R1 à R8, pour :
- 14 types d'armes : Great_Sword, Long_Sword, Dual_Blades, Lance, Gunlance, Hunting_Horn, Insect_Glaive, Bow, Light_Bowgun, Hammer, Heavy_Bowgun, Switch_Axe, Charge_Blade, Sword_and_Shield
- 6 pièces d'armure : Helmet, Chestplate, Armguards, Waist, Leggings, Talisman

`weaponIconUrl(type, rarity)` et `slotIconUrl(slot, rarity)` dans `src/utils/icons.ts` construisent les URLs dynamiquement. `SlotIcon` utilise `item.rarity` pour choisir le bon PNG.

Licence : assets Capcom (fair-use personnel/non-commercial).

---

## Calculs de build

`hooks/useBuildStats.ts` retourne :
- `defense` — somme des pièces d'armure
- `resistances` — somme par élément
- `attack`, `affinity` — depuis l'arme équipée
- `freeSlots` — slots deco `>0` non occupés
- `skills` — `{ id, lvl }[]` agrégés et plafonnés à `SKILLS[id].max`
- `setBonuses` — `{ origin, count }[]` pour les `origin` avec ≥ 2 pièces parmi les armures

---

## Préférences de l'utilisateur

- **Langue de communication** : français
- **Commentaires de code** : en français, concis, seulement si la logique n'est pas évidente
- **Clean code** : noms explicites, fichiers courts (< 200 lignes), fonctions pures
- **Pas d'over-engineering** : pas de Redux/Zustand, pas de micro-optimisation prématurée
- **Commits** : messages en français, style infinitif ("ajouter X", "corriger Y", "porter Z")

---

## Prochaines améliorations prévues (par priorité)

### Priorité haute — impact utilisateur direct
1. **Persistance localStorage** — le build disparaît au rechargement, c'est la friction n°1
2. **Compteur "X/7 pièces équipées"** dans le header (prévu UX §5, non implémenté)
3. **Filtre par type d'arme** dans le picker weapons — 14 types, la liste est longue
4. **Filtre CSS PNG sur thèmes clairs** — icônes illisibles sur Parchment/Verdant (prévu UX §7)

### Priorité moyenne
5. **Partage par URL** — encoder le build en base64 dans l'URL
6. **Bouton "Réinitialiser le build"** — tout effacer en un clic
7. **Responsive mobile** — layout deux colonnes cassé sur petit écran
8. **Tri par affinité** dans le picker armes

### Données (le vrai contenu)
9. **Données réelles MH Wilds** — les ~50 items actuels sont des placeholders. Source : API KIRA DB ou wiki.
10. **Catalogue complet des talents** — 21 actuels, le jeu en a plusieurs dizaines
11. **Bonus de série réels** du jeu

### Plus tard
12. **Comparaison avant/après** dans le picker — deltas de stats au survol
13. **Calcul de dégâts estimé**
14. **Export/import JSON** du build
15. **Liste de builds sauvegardés** + comparateur
