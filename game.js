const WINS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // lignes
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // colonnes
  [0, 4, 8], [2, 4, 6],             // diagonales
];

class TicTacToeGame {
  constructor() {
    this.board = Array(9).fill(null);
    this.turn = 'X';
  }

  // Retourne { valid, reason?, symbol?, winner?, isDraw?, board }
  makeMove(index) {
    if (this.board[index] !== null) {
      return { valid: false, reason: 'cell already taken' };
    }
    if (this.turn !== 'X' && this.turn !== 'O') {
      return { valid: false, reason: 'invalid turn' };
    }

    const symbol = this.turn;
    this.board[index] = symbol;
    this.turn = symbol === 'X' ? 'O' : 'X';

    const winner = this._checkWinner();
    const isDraw = !winner && this.board.every((c) => c !== null);
    return { valid: true, symbol, winner, isDraw, board: this.board };
  }

  getState() {
    return { board: this.board, turn: this.turn };
  }

  _checkWinner() {
    for (const [a, b, c] of WINS) {
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        return this.board[a];
      }
    }
    return null;
  }
}

module.exports = { TicTacToeGame };
