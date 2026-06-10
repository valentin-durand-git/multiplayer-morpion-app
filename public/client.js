const socket = io();

// État local
let gameId = null;
let mySymbol = null;
let myTurn = false;

// Effets par symbole
const FX = {
  X: ['fx-plasma', 'fx-glitch', 'fx-pulse'],
  O: ['fx-matrix', 'fx-hologram', 'fx-flare'],
};

// Éléments du DOM
const overlay     = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlaySub  = document.getElementById('overlay-sub');
const btnPlay     = document.getElementById('btn-play');
const statusEl    = document.getElementById('status');
const cells       = document.querySelectorAll('.cell');

// ── Helpers ──────────────────────────────────────────────────────────────────

function setStatus(text, type = '') {
  statusEl.textContent = text;
  statusEl.className = type;
}

function showOverlay(title, sub, color = 'var(--cyan)', showBtn = true) {
  overlayTitle.textContent = title;
  overlayTitle.style.color = color;
  overlaySub.textContent = sub;
  btnPlay.style.display = showBtn ? 'block' : 'none';
  overlay.classList.remove('hidden');
}

function hideOverlay() {
  overlay.classList.add('hidden');
}

function resetBoard() {
  cells.forEach((cell) => {
    cell.textContent = '';
    cell.className = 'cell';
  });
}

function playEffect(cell, symbol) {
  const pool = FX[symbol];
  const fx = pool[Math.floor(Math.random() * pool.length)];

  // Retirer l'effet précédent pour le rejouer si même case (ne devrait pas arriver)
  FX.X.concat(FX.O).forEach((c) => cell.classList.remove(c));

  // Forcer un reflow pour relancer l'animation
  void cell.offsetWidth;
  cell.classList.add(fx);

  // Nettoyer la classe après l'animation
  setTimeout(() => cell.classList.remove(fx), 700);
}

// ── Événements DOM ───────────────────────────────────────────────────────────

btnPlay.addEventListener('click', () => {
  btnPlay.disabled = true;
  socket.emit('find-game');
  overlayTitle.textContent = 'RECHERCHE';
  overlayTitle.className = 'dot-loader';
  overlaySub.textContent = 'En attente d\'un adversaire';
  btnPlay.style.display = 'none';
});

cells.forEach((cell) => {
  cell.addEventListener('click', () => {
    if (!myTurn || cell.classList.contains('taken')) return;
    const index = parseInt(cell.dataset.index, 10);
    socket.emit('make-move', { gameId, index });
  });
});

// ── Événements Socket.io ─────────────────────────────────────────────────────

socket.on('waiting', () => {
  setStatus('En attente d\'un adversaire...', 'active');
});

socket.on('game-start', ({ gameId: id, symbol }) => {
  gameId = id;
  mySymbol = symbol;
  myTurn = symbol === 'X';

  resetBoard();
  hideOverlay();
  overlayTitle.className = '';
  btnPlay.disabled = false;

  setStatus(
    myTurn ? 'TON TOUR — TU JOUES ' + symbol : 'ADVERSAIRE COMMENCE — TU ES ' + symbol,
    'active'
  );
});

socket.on('move-made', ({ index, symbol }) => {
  const cell = cells[index];
  cell.textContent = symbol;
  cell.classList.add('taken', symbol);
  playEffect(cell, symbol);

  myTurn = symbol !== mySymbol;
  setStatus(myTurn ? 'TON TOUR' : 'ADVERSAIRE JOUE...', myTurn ? 'active' : '');
});

socket.on('game-over', ({ result }) => {
  myTurn = false;

  if (result === 'draw') {
    // Toutes les cases flickent
    cells.forEach((c) => {
      if (c.classList.contains('taken')) {
        void c.offsetWidth;
        c.classList.add('fx-glitch');
        setTimeout(() => c.classList.remove('fx-glitch'), 500);
      }
    });
    setTimeout(() => showOverlay('ÉGALITÉ', 'Aucun vainqueur', '#888'), 600);
    return;
  }

  const iWon = result === mySymbol;
  const color = result === 'X' ? 'var(--cyan)' : 'var(--violet)';

  // Illuminer les cases gagnantes
  cells.forEach((c) => {
    if (c.classList.contains(result)) {
      c.classList.add('winner');
    }
  });

  setTimeout(() => {
    showOverlay(
      iWon ? 'VICTOIRE' : 'DÉFAITE',
      iWon ? 'Tu as dominé l\'adversaire' : 'L\'adversaire a gagné',
      iWon ? color : '#ff4466'
    );
    gameId = null;
    mySymbol = null;
  }, 900);
});

socket.on('opponent-left', () => {
  myTurn = false;
  gameId = null;
  mySymbol = null;

  // Effet glitch sur tout le plateau
  cells.forEach((c, i) => {
    setTimeout(() => {
      void c.offsetWidth;
      c.classList.add('fx-glitch');
      setTimeout(() => c.classList.remove('fx-glitch'), 500);
    }, i * 50);
  });

  setTimeout(() => {
    showOverlay('SIGNAL PERDU', 'L\'adversaire s\'est déconnecté', '#ff4466');
    btnPlay.textContent = 'NOUVELLE PARTIE';
    btnPlay.disabled = false;
  }, 600);
});

socket.on('move-error', ({ reason }) => {
  setStatus('COUP INVALIDE : ' + reason, 'error');
  setTimeout(() => setStatus(myTurn ? 'TON TOUR' : 'ADVERSAIRE JOUE...', myTurn ? 'active' : ''), 1500);
});
