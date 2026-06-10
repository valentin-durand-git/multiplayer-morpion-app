# STATUS — Morpion multijoueur futuriste

## Légende
- ✅ Done
- 🔄 In progress
- ⏳ Todo

---

## [2026-06-10] — État actuel

| Feature | Status |
|---------|--------|
| Serveur Express + Socket.io | ✅ |
| Logique de matchmaking | ✅ |
| Logique de jeu (validation, victoire, nul) | ✅ |
| Interface futuriste (HTML/CSS Orbitron) | ✅ |
| Animations par symbole (plasma, glitch, pulse, matrix, hologram, flare) | ✅ |
| Gestion déconnexion adversaire | ✅ |
| Écrans de fin (victoire, défaite, égalité, signal perdu) | ✅ |
| STATUS.md + règle git dans CLAUDE.md | 🔄 |
| Déploiement Railway | ⏳ |

---

## Prochaines étapes

1. Finaliser STATUS.md + CLAUDE.md ← on est là
2. Merger `feat/game-server` dans `main`
3. Préparer `railway.toml` et déployer

---

## Branches git

| Branche | Rôle |
|---------|------|
| `main` | Code stable, prêt à déployer |
| `feat/game-server` | Construction complète du jeu ← branche active |
