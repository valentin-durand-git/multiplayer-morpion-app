const WINNING_COMBINATIONS = [
  [0, 1, 2], // ligne haute
  [3, 4, 5], // ligne milieu
  [6, 7, 8], // ligne basse
  [0, 3, 6], // colonne gauche
  [1, 4, 7], // colonne milieu
  [2, 5, 8], // colonne droite
  [0, 4, 8], // diagonale
  [2, 4, 6], // diagonale inverse
];

// Retourne 'X', 'O', 'draw', ou null si la partie continue
function checkGameOver(board) {
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every((cell) => cell !== null)) return 'draw';
  return null;
}

// Retourne { valid, reason }
function validateMove(game, index, symbol) {
  if (game.turn !== symbol) {
    return { valid: false, reason: 'not your turn' };
  }
  if (game.board[index] !== null) {
    return { valid: false, reason: 'cell already taken' };
  }
  return { valid: true };
}

function applyMove(game, index, symbol) {
  game.board[index] = symbol;
  game.turn = symbol === 'X' ? 'O' : 'X';
}

module.exports = { checkGameOver, validateMove, applyMove };
