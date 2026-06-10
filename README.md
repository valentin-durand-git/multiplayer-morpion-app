# Morpion // Online

Morpion multijoueur en temps réel. Deux joueurs ouvrent la même URL, sont appariés automatiquement, et jouent via WebSockets.

## Stack

- **Serveur** : Node.js + Express + Socket.io
- **Client** : HTML/CSS/JS vanilla
- **Déploiement** : Render

## Lancer en local

```bash
npm install
node server.js
```

Ouvrir deux onglets sur `http://localhost:3002`.

## Architecture

```
├── server.js        # Point d'entrée Express + Socket.io
├── matchmaking.js   # File d'attente et appariement (Maps)
├── game.js          # Classe TicTacToeGame (logique, validation, victoire)
└── public/
    ├── index.html   # Interface futuriste (Orbitron, CSS animations)
    └── client.js    # Logique Socket.io + effets visuels
```

## Événements Socket.io

| Événement | Direction | Description |
|-----------|-----------|-------------|
| `find-game` | client → serveur | Chercher une partie |
| `waiting` | serveur → client | En attente d'un adversaire |
| `game-start` | serveur → client | Partie lancée, symbole attribué |
| `make-move` | client → serveur | Jouer un coup |
| `move-made` | serveur → client | Coup validé, mise à jour plateau |
| `move-error` | serveur → client | Coup invalide |
| `game-over` | serveur → client | Fin de partie (victoire/nul) |
| `opponent-left` | serveur → client | Adversaire déconnecté |
