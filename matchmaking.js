// Joueur en attente d'un adversaire (un seul à la fois)
let waitingPlayer = null;

// Parties en cours : { gameId -> { players: [socketX, socketO], board, turn } }
const games = {};

let nextGameId = 1;

function handleFindGame(socket, io) {
  if (waitingPlayer && waitingPlayer.id !== socket.id) {
    // Un joueur attendait : on crée la partie
    const gameId = String(nextGameId++);
    const playerX = waitingPlayer;
    const playerO = socket;

    games[gameId] = {
      players: [playerX, playerO],
      board: Array(9).fill(null),
      turn: 'X',
    };

    // On rattache chaque socket à la room de la partie
    playerX.join(gameId);
    playerO.join(gameId);

    playerX.emit('game-start', { gameId, symbol: 'X' });
    playerO.emit('game-start', { gameId, symbol: 'O' });

    waitingPlayer = null;
  } else {
    // Personne n'attendait : ce joueur entre en file
    waitingPlayer = socket;
    socket.emit('waiting');
  }
}

function handleDisconnect(socket, io) {
  // Retirer de la file d'attente si nécessaire
  if (waitingPlayer && waitingPlayer.id === socket.id) {
    waitingPlayer = null;
    return;
  }

  // Chercher si le joueur était dans une partie en cours
  for (const [gameId, game] of Object.entries(games)) {
    const isInGame = game.players.some((p) => p.id === socket.id);
    if (isInGame) {
      // Notifier l'adversaire
      socket.to(gameId).emit('opponent-left');
      // Nettoyer la partie pour éviter les fuites mémoire
      delete games[gameId];
      return;
    }
  }
}

module.exports = { handleFindGame, handleDisconnect, games };
