const board = document.getElementById("board");
const statusText = document.getElementById("status");
const modeSelect = document.getElementById("modeSelect");
const gameUI = document.getElementById("gameUI");

let currentPlayer = "X";
let cells = Array(9).fill("");
let gameMode = null;
let gameOver = false;
let playerTurn = true;

// Names
let playerXName = "Player X";
let playerOName = "Player O";

function showNameInputs(mode) {
  gameMode = mode;
  document.getElementById("nameInputs").style.display = "block";

  if (mode === "pvp") {
    document.getElementById("pvpInputs").style.display = "block";
    document.getElementById("aiInputs").style.display = "none";
  } else {
    document.getElementById("pvpInputs").style.display = "none";
    document.getElementById("aiInputs").style.display = "block";
  }
}

function startGame() {
  // Assign player names
  if (gameMode === "pvp") {
    playerXName = document.getElementById("playerXName").value || "Player X";
    playerOName = document.getElementById("playerOName").value || "Player O";
  } else {
    playerXName = document.getElementById("playerName").value || "You";
    playerOName = "Evee";
  }

  cells = Array(9).fill("");
  currentPlayer = "X";
  gameOver = false;
  playerTurn = true;

  statusText.textContent = `${playerXName}'s turn (${currentPlayer})`;
  modeSelect.style.display = "none";
  gameUI.style.display = "block";

  createBoard();
}

function createBoard() {
  board.innerHTML = "";
  cells.forEach((val, i) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    if (val !== "") cell.classList.add(val);
    cell.textContent = val;
    cell.addEventListener("click", handleClick);
    board.appendChild(cell);
  });
}

function handleClick(e) {
  const index = e.target.dataset.index;
  if (cells[index] !== "" || gameOver || (gameMode === "ai" && !playerTurn)) return;

  cells[index] = currentPlayer;
  e.target.textContent = currentPlayer;
  e.target.classList.add(currentPlayer);

  if (checkWin(currentPlayer)) {
    statusText.textContent = `${getPlayerName(currentPlayer)} Wins! 🎉`;
    gameOver = true;
    return;
  }

  if (!cells.includes("")) {
    statusText.textContent = "It's a Draw!";
    gameOver = true;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `${getPlayerName(currentPlayer)}'s turn (${currentPlayer})`;

  if (gameMode === "ai" && currentPlayer === "O" && !gameOver) {
    playerTurn = false;
    setTimeout(aiMove, 500);
  }
}

function aiMove() {
  let move = findBestMove();
  cells[move] = "O";
  const cell = board.querySelector(`[data-index='${move}']`);
  cell.textContent = "O";
  cell.classList.add("O");

  if (checkWin("O")) {
    statusText.textContent = `${playerOName} Wins! 🤖`;
    gameOver = true;
    return;
  }

  if (!cells.includes("")) {
    statusText.textContent = "It's a Draw!";
    gameOver = true;
    return;
  }

  currentPlayer = "X";
  statusText.textContent = `${playerXName}'s turn (${currentPlayer})`;
  playerTurn = true;
}

function findBestMove() {
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === "") {
      cells[i] = "O";
      if (checkWin("O")) { cells[i] = ""; return i; }
      cells[i] = "";
    }
  }
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === "") {
      cells[i] = "X";
      if (checkWin("X")) { cells[i] = ""; return i; }
      cells[i] = "";
    }
  }
  let available = cells.map((v, i) => v === "" ? i : null).filter(v => v !== null);
  return available[Math.floor(Math.random() * available.length)];
}

function checkWin(player) {
  const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return winPatterns.some(pattern => {
    const [a,b,c] = pattern;
    return cells[a] === player && cells[b] === player && cells[c] === player;
  });
}

function getPlayerName(player) {
  return player === "X" ? playerXName : playerOName;
}

function restart() {
  startGame();
}

function exitGame() {
  gameOver = false;
  cells = Array(9).fill("");
  board.innerHTML = "";
  statusText.textContent = "";
  gameUI.style.display = "none";
  modeSelect.style.display = "block";
  document.getElementById("nameInputs").style.display = "none";
  window.location.href = "../index.html";
}
