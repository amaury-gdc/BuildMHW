# Wilds Builder

Outil de composition de builds pour **Monster Hunter Wilds**.

## Commandes

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement (http://localhost:5173)
npm run dev

# Vérifier les types TypeScript
npm run typecheck

# Build de production
npm run build
```

## Stack

- React 18 + TypeScript (strict)
- Vite 6
- PrimeReact 10 + PrimeIcons 7

## Versions des dépendances

Si `npm install` échoue sur une version introuvable, lancer :

```bash
npm install react@latest react-dom@latest primereact@^10 primeicons@^7
```

puis mettre à jour `package.json` avec les versions installées.
