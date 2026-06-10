const { TicTacToeGame } = require('./game');

// Joueur en attente (un seul à la fois)
let waitingPlayer = null;

// gameId → TicTacToeGame
const activeGames = new Map();

// socket.id → gameId
const playerRooms = new Map();

// socket.id → 'X' | 'O'
const playerSymbols = new Map();

let nextGameId = 1;

function addToQueue(socket, io) {
  if (waitingPlayer && waitingPlayer.id !== socket.id) {
    // Un adversaire attendait : on crée la partie
    const gameId = String(nextGameId++);
    const playerX = waitingPlayer;
    const playerO = socket;

    activeGames.set(gameId, new TicTacToeGame());
    playerRooms.set(playerX.id, gameId);
    playerRooms.set(playerO.id, gameId);
    playerSymbols.set(playerX.id, 'X');
    playerSymbols.set(playerO.id, 'O');

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
  const gameId = playerRooms.get(socket.id);
  if (gameId) {
    socket.to(gameId).emit('opponent-left');
    // Nettoyer les deux joueurs de la Map
    activeGames.get(gameId) && activeGames.delete(gameId);
    // Retirer tous les joueurs associés à cette partie
    for (const [id, gid] of playerRooms) {
      if (gid === gameId) {
        playerRooms.delete(id);
        playerSymbols.delete(id);
      }
    }
  }
}

module.exports = { addToQueue, handleDisconnect, activeGames, playerRooms, playerSymbols };
