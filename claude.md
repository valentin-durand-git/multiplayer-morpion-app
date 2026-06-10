# CLAUDE.md — Morpion temps réel (WebSockets)

## Contexte du projet

Application de morpion multijoueur en ligne : deux inconnus ouvrent la même URL, sont appariés automatiquement, et jouent en temps réel via WebSockets.

**Objectif pédagogique principal** : comprendre et juger le code généré par l'IA.
L'app est un prétexte — ce qui compte, c'est le réflexe de relecture critique.

---

## Stack technique

| Couche       | Technologie                          |
|--------------|--------------------------------------|
| Serveur      | Node.js + Express + Socket.io        |
| Client       | HTML/CSS/JS vanilla (pas de framework) |
| Déploiement  | Railway                              |
| Versioning   | Git + GitHub                         |

**Pas de base de données** : l'état des parties est gardé en mémoire (objets JS côté serveur). Une partie de morpion est éphémère — elle ne survit pas à la session.

---

## Architecture cible

```
morpion-ws/
├── server.js          # Serveur Express + logique WebSocket
├── public/
│   ├── index.html     # Interface joueur (HTML/CSS/JS)
│   └── client.js      # Logique WebSocket côté navigateur
├── package.json
├── .gitignore
└── CLAUDE.md          # Ce fichier
```

---

## Règles de développement

### Nommage
- Variables en camelCase : `gameState`, `currentPlayer`, `playerSymbol`
- Constantes en UPPER_SNAKE_CASE : `BOARD_SIZE`, `WIN_CONDITIONS`
- Fichiers en kebab-case : `game-logic.js` si extraction nécessaire

### WebSockets — messages entre client et serveur
Tous les messages sont des objets JSON avec un champ `type`. Exemples :

```json
{ "type": "waiting" }
{ "type": "game_start", "symbol": "X" }
{ "type": "move", "index": 4 }
{ "type": "game_over", "winner": "X" }
```

Toujours parser avec `JSON.parse()` et wrapper avec `JSON.stringify()`.

### État en mémoire côté serveur
L'état global est un objet simple :

```js
const games = {};
// Clé : gameId, valeur : { players: [ws1, ws2], board: Array(9).fill(null), turn: 'X' }

const waitingPlayer = { ws: null }; 
// File d'attente simplifiée : un seul joueur en attente max
```

**Jamais de base de données pour ce projet.**

### Gestion des déconnexions
- Si un joueur ferme son onglet → notifier l'adversaire
- Nettoyer l'entrée dans `games` pour éviter les fuites mémoire
- Écouter l'event `close` sur chaque WebSocket

---

## Concepts clés à comprendre (et à vérifier dans le code généré)

### 1. Handshake WebSocket
Le client initie avec une requête HTTP classique, le serveur répond 101 (Switching Protocols).
Après ça, la connexion est persistante et bidirectionnelle.

```js
// Côté client
const ws = new WebSocket('ws://localhost:3000');
ws.onopen = () => console.log('Connexion ouverte');
ws.onmessage = (event) => { const data = JSON.parse(event.data); };
ws.send(JSON.stringify({ type: 'move', index: 4 }));
```

```js
// Côté serveur (avec la lib `ws`)
wss.on('connection', (ws) => {
  ws.on('message', (message) => { const data = JSON.parse(message); });
  ws.send(JSON.stringify({ type: 'waiting' }));
});
```

### 2. Logique d'appariement
- Joueur 1 arrive → mis en attente (`waitingPlayer`)
- Joueur 2 arrive → appariement, création de la partie, envoi de `game_start` aux deux

### 3. Propagation d'un coup
Quand joueur X joue en case 4 :
1. Client envoie `{ type: 'move', index: 4 }` au serveur
2. Serveur valide (bonne case ? bon tour ?)
3. Serveur met à jour `board`
4. Serveur envoie `{ type: 'move', index: 4, symbol: 'X' }` **aux deux joueurs**
5. Chaque client met à jour son affichage

---

## Ce que tu dois vérifier à chaque étape

Avant de lancer le code généré, lis-le et checke :

- [ ] Les messages WebSocket ont-ils tous un champ `type` ?
- [ ] Le serveur valide-t-il qu'un coup est légal avant de l'appliquer ?
- [ ] La déconnexion d'un joueur est-elle gérée (event `close`) ?
- [ ] Les fuites mémoire sont-elles évitées (nettoyage de `games`) ?
- [ ] Le client gère-t-il le cas où la connexion est perdue ?

---

## Commandes utiles

```bash
# Installation
npm init -y
npm install express ws

# Lancement local
node server.js

# Test WebSocket rapide (dans la console navigateur)
const ws = new WebSocket('ws://localhost:3000');
ws.onmessage = e => console.log(JSON.parse(e.data));
```

---

## Décisions d'architecture expliquées

| Décision | Pourquoi |
|----------|----------|
| Pas de base de données | L'état d'une partie est éphémère, inutile de le persister |
| Lib `ws` et non `socket.io` | Plus bas niveau → on comprend vraiment ce qui se passe |
| JS vanilla côté client | Pas de couche d'abstraction entre toi et les WebSockets |
| JSON pour tous les messages | Format universel, lisible, parsable des deux côtés |

---

## Workflow git — règle importante

**Les commandes git sont exécutées par l'utilisateur, jamais par Claude.**
Claude fournit la commande exacte + une explication courte. L'utilisateur l'exécute lui-même pour s'entraîner et retenir les réflexes.

Workflow standard :
```bash
# Nouvelle feature → nouvelle branche
git checkout -b feat/nom-de-la-feature

# Sauvegarder une étape cohérente
git add fichier1 fichier2
git commit -m "feat: description courte"

# Une fois la feature stable → merger dans main
git checkout main
git merge feat/nom-de-la-feature
```

Convention des messages de commit :
- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `chore:` tâche technique (config, dépendances)
- `docs:` documentation

---

## Architecture réelle du projet

```
multiplayer_morpion_app/
├── server.js        # Express + Socket.io, point d'entrée
├── matchmaking.js   # File d'attente et appariement des joueurs
├── game.js          # Validation des coups, détection victoire/nul
├── public/
│   ├── index.html   # Interface futuriste (Orbitron, CSS animations)
│   └── client.js    # Logique Socket.io + effets visuels
├── STATUS.md        # Suivi de progression du projet
├── package.json
└── CLAUDE.md        # Ce fichier
```
