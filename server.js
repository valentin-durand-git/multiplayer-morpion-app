const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { addToQueue, handleDisconnect, activeGames, playerRooms, playerSymbols } = require('./matchmaking');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on('find-game', () => {
    addToQueue(socket, io);
  });

  socket.on('make-move', ({ index }) => {
    const gameId = playerRooms.get(socket.id);
    if (!gameId) return;

    const game = activeGames.get(gameId);
    if (!game) return;

    const symbol = playerSymbols.get(socket.id);

    if (symbol !== game.turn) {
      socket.emit('move-error', { reason: 'not your turn' });
      return;
    }

    const result = game.makeMove(index);

    if (!result.valid) {
      socket.emit('move-error', { reason: result.reason });
      return;
    }

    io.to(gameId).emit('move-made', { index, symbol: result.symbol });

    if (result.winner) {
      io.to(gameId).emit('game-over', { result: result.winner });
      activeGames.delete(gameId);
      for (const [id, gid] of playerRooms) {
        if (gid === gameId) {
          playerRooms.delete(id);
          playerSymbols.delete(id);
        }
      }
    } else if (result.isDraw) {
      io.to(gameId).emit('game-over', { result: 'draw' });
      activeGames.delete(gameId);
      for (const [id, gid] of playerRooms) {
        if (gid === gameId) {
          playerRooms.delete(id);
          playerSymbols.delete(id);
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    handleDisconnect(socket, io);
  });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
