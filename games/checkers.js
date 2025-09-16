let board = [];
let currentPlayer = "red";
let gameMode = "pvp";
let aiDifficulty = "medium";
let playerNames = { red: "Red", black: "Black" };

const boardSize = 8;

function showPvPMenu() {
  document.getElementById("pvpSetup").classList.remove("hidden");
  document.getElementById("aiSetup").classList.add("hidden");
}
function showAIMenu() {
  document.getElementById("aiSetup").classList.remove("hidden");
  document.getElementById("pvpSetup").classList.add("hidden");
}

function startGame(mode) {
  gameMode = mode;
  board = [];
  currentPlayer = "red";

  if (mode === "pvp") {
    const p1 = document.getElementById("player1Name").value.trim() || "Player 1";
    const p2 = document.getElementById("player2Name").value.trim() || "Player 2";
    playerNames = { red: p1, black: p2 };
  } else {
    aiDifficulty = document.getElementById("difficulty").value;
    playerNames = { red: "You", black: `AI (${capitalize(aiDifficulty)})` };
  }

  document.getElementById("menu").style.display = "none";
  document.getElementById("gameArea").style.display = "block";
  document.getElementById("status").textContent = `${playerNames.red}'s Turn`;

  createBoard();
  drawBoard();
}

function createBoard() {
  for (let row = 0; row < boardSize; row++) {
    board[row] = [];
    for (let col = 0; col < boardSize; col++) {
      if ((row + col) % 2 === 1) {
        if (row < 3) board[row][col] = { player: "black", king: false };
        else if (row > 4) board[row][col] = { player: "red", king: false };
        else board[row][col] = null;
      } else board[row][col] = null;
    }
  }
}

function drawBoard() {
  const boardDiv = document.getElementById("board");
  boardDiv.innerHTML = "";

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const square = document.createElement("div");
      square.classList.add("square");
      square.classList.add((row + col) % 2 === 0 ? "light" : "dark");
      square.dataset.row = row;
      square.dataset.col = col;

      const piece = board[row][col];
      if (piece) {
        const pieceImg = document.createElement("img");
        pieceImg.classList.add("piece");
        pieceImg.src = piece.player === "red"
          ? (piece.king ? "assets/red-king.png" : "assets/red.png")
          : (piece.king ? "assets/black-king.png" : "assets/black.png");
        pieceImg.dataset.row = row;
        pieceImg.dataset.col = col;
        pieceImg.draggable = false;

        if (piece.player === currentPlayer &&
          (gameMode === "pvp" || (gameMode === "ai" && currentPlayer === "red"))) {
          pieceImg.addEventListener("click", selectPiece);
        }

        square.appendChild(pieceImg);
      }

      boardDiv.appendChild(square);
    }
  }
}

let selectedPiece = null;

function selectPiece(e) {
  if (!e.target.classList.contains("piece")) return;
  const row = parseInt(e.target.dataset.row);
  const col = parseInt(e.target.dataset.col);
  selectedPiece = { row, col };
  highlightMoves(row, col);
}

function highlightMoves(row, col) {
  drawBoard();
  const moves = getValidMoves(row, col);
  moves.forEach(move => {
    const square = document.querySelector(
      `.square[data-row='${move.row}'][data-col='${move.col}']`
    );
    if (square) {
      square.style.outline = "3px solid yellow";
      square.addEventListener("click", () => makeMove(row, col, move.row, move.col));
    }
  });
}

function getValidMoves(row, col) {
  const piece = board[row][col];
  if (!piece) return [];

  const directions = piece.king
    ? [[1,1],[1,-1],[-1,1],[-1,-1]]
    : (piece.player === "red" ? [[-1,1],[-1,-1]] : [[1,1],[1,-1]]);

  let moves = [];
  for (let [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;

    if (isInsideBoard(newRow, newCol) && !board[newRow][newCol]) {
      moves.push({ row: newRow, col: newCol });
    } else if (isInsideBoard(newRow, newCol) && board[newRow][newCol]?.player !== piece.player) {
      const jumpRow = newRow + dr;
      const jumpCol = newCol + dc;
      if (isInsideBoard(jumpRow, jumpCol) && !board[jumpRow][jumpCol]) {
        moves.push({ row: jumpRow, col: jumpCol, capture: { row: newRow, col: newCol } });
      }
    }
  }
  return moves;
}

function isInsideBoard(row, col) {
  return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
}

function makeMove(fromRow, fromCol, toRow, toCol, isAI = false) {
  if (currentPlayer === "black" && gameMode === "ai" && !isAI) return;

  const piece = board[fromRow][fromCol];
  const move = getValidMoves(fromRow, fromCol).find(m => m.row === toRow && m.col === toCol);
  if (!move) return;

  board[toRow][toCol] = piece;
  board[fromRow][fromCol] = null;

  if (move.capture) {
    board[move.capture.row][move.capture.col] = null;
    highlightCapture(toRow, toCol);
  }

  if ((piece.player === "red" && toRow === 0) || (piece.player === "black" && toRow === boardSize - 1)) {
    piece.king = true;
  }

  drawBoard();

  if (move.capture) {
    const moreMoves = getValidMoves(toRow, toCol).filter(m => m.capture);
    if (moreMoves.length > 0) {
      selectedPiece = { row: toRow, col: toCol };
      highlightMoves(toRow, toCol);
      return;
    }
  }
  switchTurn();
}

function highlightCapture(row, col) {
  const pieceDiv = document.querySelector(`.piece[data-row='${row}'][data-col='${col}']`);
  if (pieceDiv) {
    pieceDiv.style.boxShadow = "0 0 15px 5px gold";
    setTimeout(() => pieceDiv.style.boxShadow = "", 600);
  }
}

function switchTurn() {
  currentPlayer = currentPlayer === "red" ? "black" : "red";
  document.getElementById("status").textContent = `${playerNames[currentPlayer]}'s Turn`;
  drawBoard();

  if (gameMode === "ai" && currentPlayer === "black") {
    setTimeout(aiMove, 800);
  }
}

/* ---------------- AI LOGIC ---------------- */
function aiMove() {
  let moves = [];
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      if (board[row][col]?.player === "black") {
        let validMoves = getValidMoves(row, col);
        validMoves.forEach(m => moves.push({ fromRow: row, fromCol: col, ...m }));
      }
    }
  }

  if (moves.length === 0) {
    document.getElementById("status").textContent = `${playerNames.red} Wins!`;
    return;
  }

  let chosenMove;

  if (aiDifficulty === "easy") {
    // Easy AI: capture if available, otherwise random
    let captureMoves = moves.filter(m => m.capture);
    chosenMove = captureMoves.length > 0
      ? captureMoves[Math.floor(Math.random() * captureMoves.length)]
      : moves[Math.floor(Math.random() * moves.length)];

  } else if (aiDifficulty === "medium") {
    // Medium AI: Captures > Safe moves > Random
    let captureMoves = moves.filter(m => m.capture);
    if (captureMoves.length > 0) {
      chosenMove = captureMoves[Math.floor(Math.random() * captureMoves.length)];
    } else {
      // Prefer non-dangerous moves
      let safeMoves = moves.filter(m => !isMoveDangerous(m));
      chosenMove = safeMoves.length > 0
        ? safeMoves[Math.floor(Math.random() * safeMoves.length)]
        : moves[Math.floor(Math.random() * moves.length)];
    }

  } else { 
    // Hard AI: Captures > Safe captures > Moves toward kinging > Safe moves > Random
    let captureMoves = moves.filter(m => m.capture);

    if (captureMoves.length > 0) {
      let safeCaptures = captureMoves.filter(m => !isMoveDangerous(m));
      chosenMove = safeCaptures.length > 0
        ? safeCaptures[Math.floor(Math.random() * safeCaptures.length)]
        : captureMoves[Math.floor(Math.random() * captureMoves.length)];
    } else {
      // Prefer moves that advance pieces toward kinging
      moves.sort((a, b) => {
        const distA = boardSize - 1 - a.row; 
        const distB = boardSize - 1 - b.row;
        return distA - distB; // closer to king row first
      });

      // Filter to safe advancing moves if possible
      let safeAdvancers = moves.filter(m => !isMoveDangerous(m));
      chosenMove = safeAdvancers.length > 0 ? safeAdvancers[0] : moves[0];
    }
  }

  executeAIMove(chosenMove);
}



function executeAIMove(move) {
  makeMove(move.fromRow, move.fromCol, move.row, move.col, true);

  if (move.capture) {
    const moreMoves = getValidMoves(move.row, move.col).filter(m => m.capture);
    if (moreMoves.length > 0) {
      setTimeout(() => {
        const nextMove = moreMoves[Math.floor(Math.random() * moreMoves.length)];
        executeAIMove({ fromRow: move.row, fromCol: move.col, ...nextMove });
      }, 600);
    }
  }
}

/* --- Helper: Check if a move puts the piece in danger --- */
function isMoveDangerous(move) {
  const tempBoard = JSON.parse(JSON.stringify(board));
  const piece = tempBoard[move.fromRow][move.fromCol];
  tempBoard[move.row][move.col] = piece;
  tempBoard[move.fromRow][move.fromCol] = null;
  if (move.capture) tempBoard[move.capture.row][move.capture.col] = null;

  // Check if after this move, a red piece can capture this square
  const dangerDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  for (let [dr, dc] of dangerDirections) {
    let enemyRow = move.row + dr;
    let enemyCol = move.col + dc;
    let landingRow = move.row - dr;
    let landingCol = move.col - dc;

    if (
      isInsideBoard(enemyRow, enemyCol) &&
      tempBoard[enemyRow][enemyCol]?.player === "red" &&
      isInsideBoard(landingRow, landingCol) &&
      !tempBoard[landingRow][landingCol]
    ) {
      return true; // enemy could jump this piece
    }
  }
  return false;
}

function resetGame() {
  startGame(gameMode);
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
