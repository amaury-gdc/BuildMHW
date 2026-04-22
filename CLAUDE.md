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
npm run build      # build de production dans dist/
npm run preview    # prévisualise le build de production
```

Il n'y a pas de tests automatisés pour l'instant. La vérification se fait via `typecheck` + test visuel dans le navigateur.

---

## État d'implémentation

| Composant / fichier | État |
|---|---|
| `Header` — toggle thème + toggle FR/EN + input nom du build | ✅ fonctionnel |
| `SlotGrid` + `SlotCard` — 7 cartes, filet rareté, bouton ×, deco slots, skill badges | ✅ fonctionnel |
| `SlotIcon` — PNG si dispo, sinon SVG fallback | ✅ fonctionnel |
| `ElementIcon` — losange coloré | ✅ fonctionnel |
| `BuildContext` — état `EquippedBuild`, build par défaut "As de la Guilde" | ✅ fonctionnel |
| `LangContext` + `useT()` — i18n FR/EN | ✅ fonctionnel |
| `ThemeContext` — `data-theme` sur `<html>` | ✅ fonctionnel |
| `src/data/equipment.ts` — 50 items (8w + 8h + 8c + 7a + 6w + 7l + 6t) | ✅ complet |
| `src/data/skills.ts` — 21 talents (atk / def / util) | ✅ complet |
| `src/data/i18n.ts` — dictionnaire FR/EN complet | ✅ complet |
| `PickerDialog` — modale PrimeReact Dialog | 🔲 stub vide |
| `MetaPanel`, `StatsPanel`, `SetBonusPanel`, `SkillsPanel` | 🔲 stubs vides |
| `useBuildStats` — calculs défense, résistances, talents agrégés | 🔲 stub (retourne zéros) |

---

## Vision

Application web de **build planning pour Monster Hunter Wilds**. L'utilisateur (Amaury,
joueur francophone) trouve difficile de visualiser ses builds dans le jeu. Cet outil permet
de composer un build complet (arme + 5 pièces d'armure + talisman + décorations) en cliquant
sur chaque emplacement, avec recherche et tri par talents.

**Utilisateur cible** : chasseurs francophones et anglophones. Tous les noms d'items, de talents,
d'origines doivent être disponibles dans les deux langues avec un **toggle global FR ⇄ EN**.

**Non-dev** : le commanditaire n'est pas développeur de métier. Le code doit être clair,
commenté quand la logique n'est pas évidente, organisé en fichiers courts et nommés explicitement.

---

## Stack technique

- **React 18** + **TypeScript** (strict)
- **Vite** comme build tool
- **PrimeReact** comme librairie UI (https://primereact.org)
- **PrimeIcons** pour les icônes utilitaires
- Pas de lib CSS externe : **CSS modules ou CSS simple** avec design tokens en variables CSS
- Pas de state manager externe pour le MVP : **Context API** suffit (thème, langue, build)

---

## Décisions design (à respecter)

### Thèmes
Trois thèmes, sélectionnables via un toggle dans le header. Le thème s'applique via un
attribut `data-theme` sur `<html>` ou `<body>`, qui redéfinit des variables CSS.

- **`guild`** (par défaut) — dark warm brown inspiré du menu in-game. Fond `#1a140b`,
  accent or `#e8b653`, texte crème `#ede1b8`. Filets dorés sur les bordures de panneaux.
  Overlay de bruit subtil pour l'effet parchemin/cuir.
- **`parchment`** — clair, journal de chasseur. Beige `#ebe0c9`, accent rouille `#a0451a`.
- **`verdant`** — clair, forêt. Vert clair `#e7ecde`, accent vert forêt `#3a6f3e`.

### Typographie
- **Barlow** (Google Fonts) en police principale, poids 500-800.
- **Barlow Condensed** pour les chiffres (stats, raretés).
- **Poids minimum 500** partout, 600 par défaut pour le corps. JAMAIS de font-weight 400
  (l'utilisateur a explicitement rejeté les typos "trop fines").
- Pas de serif. Barlow donne un rendu proche du menu in-game.

### Couleurs d'éléments (identiques au jeu)
```
--el-fire:    #e06a5a
--el-water:   #5aa5d8
--el-thunder: #e0d050
--el-ice:     #90d8dc
--el-dragon:  #c566b0
```
Les icônes d'éléments sont des **losanges** (diamant), pas des cercles, pour matcher le jeu.

### Raretés R1 à R8
Couleurs progressives, accentuant la rareté d'un item :
```
--rarity-1: #b8b0a2  (gris)
--rarity-2: #c5b78b  (beige)
--rarity-3: #90b076  (vert)
--rarity-4: #5ea5ab  (cyan)
--rarity-5: #7b71b8  (violet)
--rarity-6: #b36a86  (rose)
--rarity-7: #d48a3c  (orange)
--rarity-8: #e8aa3d  (or — rareté max)
```
Chaque carte d'emplacement porte un **filet vertical coloré** (3px) à gauche qui utilise
la couleur de la rareté de l'item équipé.

### Catégorisation des talents
Chaque talent a une catégorie qui détermine la couleur du badge :
- `atk` (rouge `#c14d36`) — Attaque, Œil critique, Opportuniste, Boost critique, etc.
- `def` (bleu `#4a7eb8`) — Défense, Résistance, Peau dure, etc.
- `util` (violet `#8a6dbe`) — Fenêtre d'esquive, Furtivité, Géologie, etc.

Les pastilles sont rondes avec une icône blanche centrée (pointe vers le haut, bouclier, engrenage).

### Design tokens (variables CSS)
Espaces : `--sp-1` (4px) à `--sp-12` (48px). Radius : `--r-sm` (3px) à `--r-xl` (14px).
Textes : `--text-xs` (11px) à `--text-3xl` (38px). Animations : `--dur-fast`, `--dur-med`, `--dur-slow`.

---

## Modèle de données

### Types (TypeScript)
```ts
type Lang = 'fr' | 'en';
type Theme = 'guild' | 'parchment' | 'verdant';
type Slot = 'weapon' | 'head' | 'chest' | 'arms' | 'waist' | 'legs' | 'talisman';
type Element = 'fire' | 'water' | 'thunder' | 'ice' | 'dragon';
type SkillCat = 'atk' | 'def' | 'util';

interface Skill {
  fr: string;
  en: string;
  max: number;      // niveau maximum du talent
  cat: SkillCat;
}

interface SkillOnItem {
  id: string;       // clé dans SKILLS
  lvl: number;
}

interface Item {
  id: string;              // identifiant unique (ex. 'h6', 'w8')
  fr: string;
  en: string;
  type?: string;           // pour les armes : 'Great Sword', 'Long Sword', etc.
  origin?: string;         // monstre d'origine (ex. 'Arkveld')
  rarity: number;          // 1-8
  attack?: number;         // armes
  affinity?: number;       // armes, en %
  defense?: number;        // armures
  res?: Partial<Record<Element, number>>;
  slots: number[];         // 3 emplacements de décos, valeurs 0 (vide) à 4 (taille)
  skills?: SkillOnItem[];
}

interface EquippedBuild {
  weapon: string | null;
  head:   string | null;
  chest:  string | null;
  arms:   string | null;
  waist:  string | null;
  legs:   string | null;
  talisman: string | null;
}
```

### SLOT_ORDER
Ordre d'affichage des cartes : `['weapon', 'head', 'chest', 'arms', 'waist', 'legs', 'talisman']`.

### RES_KEYS
`['fire', 'water', 'thunder', 'ice', 'dragon']`.

---

## Système bilingue

- **Source unique de vérité** : fichier `src/data/i18n.ts` exportant un objet `I18N = { fr: {...}, en: {...} }`.
- **Hook `useT()`** retourne une fonction `t(key)` qui lit la clé dans la langue courante.
- Les noms d'items/talents sont directement dans l'objet (`item.fr`, `item.en`) — pas de clé i18n séparée.
- Le toggle dans le header change la langue ; **tout re-rend en direct**, aucun rechargement.

---

## Architecture cible

```
wilds-builder/
├── public/
│   └── icons/              # PNG du wiki MH (déjà présents : voir /public/icons/)
├── src/
│   ├── main.tsx            # entry point, imports PrimeReact CSS
│   ├── App.tsx             # shell + providers
│   │
│   ├── data/
│   │   ├── equipment.ts    # EQUIPMENT: Record<Slot, Item[]>
│   │   ├── skills.ts       # SKILLS: Record<string, Skill>
│   │   └── i18n.ts         # I18N: { fr, en }
│   │
│   ├── types/
│   │   └── index.ts        # tous les types exportés
│   │
│   ├── contexts/
│   │   ├── ThemeContext.tsx
│   │   ├── LangContext.tsx
│   │   └── BuildContext.tsx
│   │
│   ├── hooks/
│   │   ├── useT.ts         # accès à i18n
│   │   └── useBuildStats.ts # calcule défense totale, résistances, talents agrégés, bonus de série
│   │
│   ├── components/
│   │   ├── Header/
│   │   ├── SlotGrid/       # SlotGrid.tsx + SlotCard.tsx
│   │   ├── Picker/         # PickerDialog.tsx + ItemCard.tsx (utilise PrimeReact Dialog)
│   │   ├── MetaPanel/
│   │   ├── StatsPanel/
│   │   ├── SetBonusPanel/
│   │   ├── SkillsPanel/
│   │   └── icons/
│   │       ├── SlotIcon.tsx     # rend un <img> PNG ou un <svg> fallback
│   │       └── ElementIcon.tsx  # losange coloré
│   │
│   ├── styles/
│   │   ├── tokens.css      # variables CSS (espaces, rayons, poids, etc.)
│   │   ├── themes.css      # [data-theme="guild|parchment|verdant"]
│   │   └── globals.css
│   │
│   └── utils/
│       ├── rarity.ts       # rarityColor(r: number) => string
│       └── icons.ts        # SLOT_PNG, WEAPON_PNG mappings
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── CLAUDE.md               # ce fichier
```

---

## Mapping des composants PrimeReact

| Besoin | PrimeReact | Notes |
|---|---|---|
| Modale de sélection | `<Dialog>` | Avec `header`, `footer` custom, `resizable={false}`, `maximizable` sur desktop large |
| Toggle thème / langue | `<SelectButton>` | 2 boutons pour FR/EN, 3 pour les thèmes |
| Input de recherche | `<IconField>` + `<InputText>` | Avec icône loupe `pi pi-search` |
| Tri | `<Dropdown>` | Options dans un tableau `[{label, value}]` |
| Filtre par talent | `<Dropdown>` ou `<AutoComplete>` | Multi-valeurs si besoin |
| Chip de filtre actif | `<Chip removable>` | Pour afficher le filtre talent sélectionné |
| Bouton principal (Sauvegarder) | `<Button>` | `severity="warning"` pour l'accent or |
| Toast "Build sauvegardé" | `<Toast>` | Via `useRef` |
| Input nom du build | `<InputText>` | Dans un conteneur custom avec label |

**Conventions PrimeReact** :
- Importer les CSS dans `main.tsx` :
  ```ts
  import 'primereact/resources/themes/lara-dark-amber/theme.css';
  import 'primereact/resources/primereact.min.css';
  import 'primeicons/primeicons.css';
  ```
- On **override les couleurs PrimeReact** via nos variables `--accent`, `--bg`, `--surface`
  pour que les composants suivent nos 3 thèmes (pas le thème lara-dark-amber seul).
- Utiliser `PrimeReactProvider` au niveau racine pour injecter la config globale.

---

## UX — consignes fortes (issues de la critique de design)

1. **Bouton × (clear) d'un emplacement** : toujours visible à faible opacité (0.4), pas
   uniquement au hover. Doit être un `<button>` focusable au clavier. Ne pas piéger le clic
   dans l'ouverture du picker (stopPropagation).
2. **Ordre des tabulations** : slots dans l'ordre de lecture naturel, puis côté droit (stats → skills).
3. **Focus trap dans la modale** : verrouiller le focus. Touche Échap ferme. Bouton close
   affiche "ESC" en micro-label.
4. **Empty state de slot** : afficher un "＋" doré + "Cliquer pour choisir" en italique.
   Bordure pointillée au hover.
5. **Toggle FR/EN / thèmes** : labels visibles (pas juste G/P/V). Utiliser `aria-label` systématique.
6. **Progression du build** : "X/7 pièces équipées" visible dans le header ou en haut du builder.
7. **Contraste** : `text-faint` doit être ≥ 4.5:1 sur le fond. Si ça casse un thème, remonter
   la couleur (ex. `#a89463` au lieu de `#8a7a55` en guild).
8. **PNG sur thèmes clairs** : les icônes du wiki sont conçues pour fonds sombres. Appliquer
   un filtre conditionnel `filter: brightness(0.2) contrast(1.5)` sur Parchment/Verdant, OU
   retomber sur les SVG sprites inline pour ces thèmes.
9. **Talisman pas full-width** : remettre en demi-largeur, utiliser la cellule libre pour un
   "résumé du build" (score global, nombre de talents actifs, etc.).
10. **Rarity pills** : séparer la couleur de texte de la couleur de fond ; le fond porte la
    rareté, le texte reste sur `--text` pour garantir le contraste sur toutes les raretés.

---

## Icônes

### Fichiers disponibles dans `public/icons/` (noms réels)
**Armes** (PNG) :
`MHWilds-Bow_Icon_Rare_8.png`, `MHWilds-Dual_Blades_Icon_Rare_8.png`,
`MHWilds-Great_Sword_Icon_Rare_8.png`, `MHWilds-Gunlance_Icon_Rare_8.png`,
`MHWilds-Hunting_Horn_Icon_Rare_8.png`, `MHWilds-Insect_Glaive_Icon_Rare_8.png`,
`MHWilds-Lance_Icon_Rare_8.png`, `MHWilds-Light_Bowgun_Icon_Rare_8.png`,
`MHWilds-Long_Sword_Icon_Rare_8.png`

**Armure** (PNG) : `MHWilds-Helmet_Icon_Rare_8.png`, `MHWilds-Chestplate_Icon_Rare_8.png`, `MHWilds-Leggings_Icon_Rare_8.png`

**Inutilisables** (`.htm`, pas des PNG) : `File_MHWilds-Armguards_Icon_Rare_8.htm`, `File_MHWilds-Charge_Blade_Icon_Rare_8.htm`

Les mappings réels sont dans `src/utils/icons.ts` (`WEAPON_PNG`, `SLOT_PNG`).

### Icônes manquantes (à récupérer du wiki par l'utilisateur)
**Armes** : Hammer, Sword & Shield (`SnS`), Switch Axe, Heavy Bowgun
**Armure** : Arms (brassards), Waist (ceinture), Talisman
**Éléments** (losanges colorés) : feu, eau, foudre, glace, dragon — SVG inline acceptable en fallback
**Décorations** : gemmes taille 1, 2, 3, 4

En attendant les PNG manquants : **fallback sur un SVG inline** dans `components/icons/SlotIcon.tsx`
(cette logique existe déjà dans la maquette HTML, fichier `docs/mockup.html`).

### Licence
Les icônes viennent de `monsterhunterwiki.org` et sont des assets **Capcom** sous usage
communautaire (fair-use). OK pour un projet personnel/non-commercial. Si distribution
commerciale : soit les refaire, soit obtenir accord Capcom.

---

## État par défaut

Le premier rendu doit afficher le build **"As de la Guilde"** qui reproduit le screenshot
in-game fourni par l'utilisateur :
- **Arme** : Volto-hache chrono (Switch Axe, R8, attaque 210, affinité +19%, slots 3-2-1)
- **Tête** : Cache-œil Roi-dragon α (Arkveld, R8)
- **Torse, Bras, Taille, Jambes** : pièces As de la Guilde α (Arkveld, R8)
- **Talisman** : Talisman de fureur

Thème par défaut : `guild`. Langue par défaut : `fr`.

---

## Calculs de build (logique métier)

Dans `hooks/useBuildStats.ts`, agréger à partir des items équipés :

- **Défense totale** = somme des `defense` des 5 pièces d'armure
- **Résistances** : pour chaque élément, somme des `res[el]` des pièces d'armure
- **Emplacements libres** (pour décos) : nombre de slots `>0` non encore occupés par une déco
- **Talents agrégés** : additionner `lvl` par `id` de skill à travers toutes les pièces
  (arme comprise + talisman). Ne pas dépasser `SKILLS[id].max`.
- **Bonus de série** : compter les occurrences d'un même `origin` parmi les 5 pièces d'armure ;
  afficher un bonus quand ≥ 2 (ex. "Série Arkveld — 4 pièces actives").

---

## Référence : la maquette HTML

Fichier `docs/mockup.html` (à copier depuis `/sessions/…/outputs/mh-wilds-builder-mockup.html`)
contient toute la logique data, styles et interactions dans un seul fichier, entièrement fonctionnel.
**Utiliser comme source de vérité pour :**
- Les données (arrays EQUIPMENT, SKILLS, I18N)
- Les styles (tokens, thèmes, layouts)
- Les animations et transitions
- Le comportement du picker (recherche, tri, filtre)
- Les calculs de stats et bonus de série

**Ne pas l'intégrer dans la build** — c'est juste une référence de design et de logique.

---

## Préférences de l'utilisateur

- **Langue de communication** : français
- **Commentaires de code** : en français, concis, seulement là où la logique n'est pas évidente
- **Clean code** : noms explicites, fichiers courts (< 200 lignes idéalement), fonctions pures quand possible
- **Pas d'over-engineering** : pas de Redux/Zustand pour le MVP, pas de micro-optimisation prématurée
- **Commits** : messages clairs en français, style "verbe à l'infinitif" ("ajouter picker",
  "corriger contraste", "porter i18n")

---

## Prochaines étapes possibles (hors MVP)

- Écran de **placement des décorations** sur les slots disponibles
- **Persistance** des builds (localStorage au début, puis backend si besoin)
- **Liste des builds sauvegardés** + comparateur
- **Partage par URL** (state sérialisé en base64)
- **Import/export JSON** du build
- **Données réelles** : scraper ou consommer une API MH Wilds (wiki, KIRA DB)
- **Calcul de dégâts théoriques** (DPS estimé)
- **Suggestions de talents** en fonction du monstre cible