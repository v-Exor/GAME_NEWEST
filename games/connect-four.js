const board = document.getElementById("board");
const statusText = document.getElementById("status");
const modeSelect = document.getElementById("modeSelect");
const gameUI = document.getElementById("gameUI");

// Setup panels
const setupPvP = document.getElementById("setupPvP");
const setupAI = document.getElementById("setupAI");
const p1NameInput = document.getElementById("p1Name");
const p2NameInput = document.getElementById("p2Name");
const humanNameInput = document.getElementById("humanName");
const aiNameInput = document.getElementById("aiName");

let gameBoard = [];
let currentPlayer = "red"; // red always starts
let gameMode = null; // "pvp" or "ai"
let gameOver = false;
let lockInput = false; // prevents multiple moves during animation

// Name mapping by token color
let playerNames = { red: "Red", yellow: "Yellow" };
// For AI/human ownership by token color
let isHuman = { red: true, yellow: true };

// ===== Setup UI helpers =====
function showSetup(mode) {
  setupPvP.style.display = mode === "pvp" ? "grid" : "none";
  setupAI.style.display = mode === "ai" ? "grid" : "none";
}
function hideSetups() {
  setupPvP.style.display = "none";
  setupAI.style.display = "none";
}

function applySetupAndStart(mode) {
  if (mode === "pvp") {
    const p1 = (p1NameInput.value || "Player 1").trim();
    const p2 = (p2NameInput.value || "Player 2").trim();

    // 🎲 Randomize Player 1's color
    const p1Color = Math.random() < 0.5 ? "red" : "yellow";
    const p2Color = p1Color === "red" ? "yellow" : "red";

    playerNames[p1Color] = p1;
    playerNames[p2Color] = p2;
    isHuman = { red: true, yellow: true };
  } else {
    const human = (humanNameInput.value || "You").trim();
    const cpu = (aiNameInput.value || "CPU").trim();
    const humanColor = document.querySelector('input[name="humanColor"]:checked').value; // red|yellow
    const aiColor = humanColor === "red" ? "yellow" : "red";

    playerNames[humanColor] = human;
    playerNames[aiColor] = cpu;
    isHuman = { red: humanColor === "red", yellow: humanColor === "yellow" };
  }
  startGame(mode);
}


function startGame(mode) {
  gameMode = mode;
  gameOver = false;
  currentPlayer = "red";
  lockInput = false;

  // Reset board
  gameBoard = Array.from({ length: 6 }, () => Array(7).fill(""));

  // Show UI
  hideSetups();
  modeSelect.style.display = "none";
  gameUI.style.display = "block";

  createBoard();
  statusText.textContent = `${labelFor("red")}'s turn`;

  // ✅ If AI is red, let it move first
  if (gameMode === "ai" && !isHuman["red"]) {
    setTimeout(() => {
      const colPick = aiMove();
      if (colPick !== -1) handleClick(colPick);
    }, 500);
  }
}


function createBoard() {
  board.innerHTML = "";
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = row;
      cell.dataset.col = col;
      // Click handler
      cell.addEventListener("click", () => handleColumnTap(col));
      // Also support keyboard nav for accessibility
      cell.tabIndex = 0;
      cell.setAttribute("role", "button");
      cell.setAttribute("aria-label", `Column ${col + 1}`);
      cell.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") handleColumnTap(col);
      });
      board.appendChild(cell);
    }
  }
}

function handleColumnTap(col) {
  // Only allow human to move (in AI mode), or anyone in PvP
  if (gameOver || lockInput) return;
  if (gameMode === "ai" && !isHuman[currentPlayer]) return;

  handleClick(col);
}

function handleClick(col) {
  if (gameOver || lockInput) return; // block input while animating

  // Find lowest empty spot in column
  let rowToFill = -1;
  for (let row = 5; row >= 0; row--) {
    if (gameBoard[row][col] === "") {
      rowToFill = row;
      break;
    }
  }
  if (rowToFill === -1) return; // column full

  lockInput = true; // lock until animation finishes
  animateDrop(rowToFill, col, currentPlayer);
}

function animateDrop(row, col, player) {
  // Use the board element as the positioning container
  const boardEl = board; // board is already const board = document.getElementById("board");
  const boardRect = boardEl.getBoundingClientRect();

  const firstCell = boardEl.querySelector(`.cell[data-row="0"][data-col="${col}"]`);
  const targetCell = boardEl.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);

  const startRect = firstCell.getBoundingClientRect();
  const endRect = targetCell.getBoundingClientRect();

  // Handle possible CSS scale/transform on the board:
  // bounding rect is post-transform; clientWidth/Height are layout sizes pre-transform.
  const scaleX = boardRect.width && boardEl.clientWidth ? (boardRect.width / boardEl.clientWidth) : 1;
  const scaleY = boardRect.height && boardEl.clientHeight ? (boardRect.height / boardEl.clientHeight) : 1;

  // Compute coordinates relative to board's content box (and undo transform scale)
  const startLeft = Math.round((startRect.left - boardRect.left) / scaleX);
  const startTop  = Math.round((startRect.top  - boardRect.top)  / scaleY);
  const endLeft   = Math.round((endRect.left   - boardRect.left) / scaleX);
  const endTop    = Math.round((endRect.top    - boardRect.top)  / scaleY);

  const disc = document.createElement("div");
  disc.classList.add("falling");
  disc.style.position = "absolute";
  disc.style.left = startLeft + "px";
  disc.style.top  = startTop + "px";
  // color
  disc.style.background = player === "red"
    ? "radial-gradient(ellipse at 30% 30%, #ff6b6b, #d90429)"
    : "radial-gradient(ellipse at 30% 30%, #fff06b, #f0c400)";

  // Put the falling disc inside the board element (so coordinates match)
  boardEl.appendChild(disc);

  // Animate (longer, smoother drop with bounce)
  const overshoot = 12; // px overshoot at bottom
  const bounceUp = -6;  // px bounce up

  disc.animate(
    [
      { top: startTop + "px", offset: 0 },
      { top: (endTop + overshoot) + "px", offset: 0.85, easing: "ease-in" },
      { top: (endTop + bounceUp) + "px", offset: 0.95, easing: "ease-out" },
      { top: endTop + "px", offset: 1 }
    ],
    {
      duration: 600,  // ✅ slower than before
      easing: "linear", // easing handled in keyframes
      fill: "forwards"
    }
  ).onfinish = () => {
    disc.remove();
    // Apply piece permanently
    gameBoard[row][col] = player;
    updateBoard();

    if (checkWin(row, col)) {
      statusText.textContent = `${labelFor(player)} Wins! 🎉`;
      gameOver = true;
      lockInput = false;
      return;
    }
    if (isFull()) {
      statusText.textContent = "It's a Draw!";
      gameOver = true;
      lockInput = false;
      return;
    }

    // Switch turn
    currentPlayer = currentPlayer === "red" ? "yellow" : "red";
    statusText.textContent = `${labelFor(currentPlayer)}'s turn`;

    lockInput = false;

    if (gameMode === "ai" && !gameOver && !isHuman[currentPlayer]) {
      setTimeout(() => {
        const colPick = aiMove();
        if (colPick !== -1) handleClick(colPick);
      }, 500);
    }
  };

}


function updateBoard() {
  const cells = board.querySelectorAll(".cell");
  cells.forEach(cell => {
    const row = cell.dataset.row;
    const col = cell.dataset.col;
    cell.classList.remove("red", "yellow");
    if (gameBoard[row][col] === "red") cell.classList.add("red");
    if (gameBoard[row][col] === "yellow") cell.classList.add("yellow");
  });
}

function checkWin(row, col) {
  const player = gameBoard[row][col];
  return (
    checkDirection(row, col, 1, 0, player) || // vertical
    checkDirection(row, col, 0, 1, player) || // horizontal
    checkDirection(row, col, 1, 1, player) || // diagonal ↘
    checkDirection(row, col, 1, -1, player)   // diagonal ↙
  );
}

function checkDirection(row, col, rowDir, colDir, player) {
  let count = 1;

  // Forward
  let r = row + rowDir;
  let c = col + colDir;
  while (r >= 0 && r < 6 && c >= 0 && c < 7 && gameBoard[r][c] === player) {
    count++;
    r += rowDir;
    c += colDir;
  }

  // Backward
  r = row - rowDir;
  c = col - colDir;
  while (r >= 0 && r < 6 && c >= 0 && c < 7 && gameBoard[r][c] === player) {
    count++;
    r -= rowDir;
    c -= colDir;
  }

  return count >= 4;
}

function isFull() {
  return gameBoard.every(row => row.every(cell => cell !== ""));
}

// AI: pick random available column (kept)
// AI: smarter but still imperfect
function aiMove() {
  let availableCols = [];
  for (let col = 0; col < 7; col++) {
    if (gameBoard[0][col] === "") availableCols.push(col);
  }
  if (availableCols.length === 0) return -1;

  const aiColor = currentPlayer; // AI is always currentPlayer when called
  const humanColor = aiColor === "red" ? "yellow" : "red";

  // 👀 Sometimes AI plays random (to simulate mistakes)
  if (Math.random() < 0.2) { // 20% chance of mistake
    return availableCols[Math.floor(Math.random() * availableCols.length)];
  }

  // === Step 1: Try to win immediately ===
  for (let col of availableCols) {
    if (wouldWin(aiColor, col)) return col;
  }

  // === Step 2: Block human win ===
  for (let col of availableCols) {
    if (wouldWin(humanColor, col)) return col;
  }

  // === Step 3: Prefer center columns ===
  const centerOrder = [3, 2, 4, 1, 5, 0, 6];
  for (let col of centerOrder) {
    if (availableCols.includes(col)) return col;
  }

  // Fallback (shouldn’t happen often)
  return availableCols[Math.floor(Math.random() * availableCols.length)];
}

// Simulate dropping a piece in a column and check if it leads to a win
function wouldWin(player, col) {
  // Find lowest empty spot in that column
  let rowToFill = -1;
  for (let row = 5; row >= 0; row--) {
    if (gameBoard[row][col] === "") {
      rowToFill = row;
      break;
    }
  }
  if (rowToFill === -1) return false;

  // Temporarily place piece
  gameBoard[rowToFill][col] = player;
  const win = checkWin(rowToFill, col);
  gameBoard[rowToFill][col] = ""; // undo
  return win;
}

function restart() {
  // Restart with same mode and same setup (names/colors preserved)
  startGame(gameMode);
}

function exitGame() {
  window.location.href = "../index.html"; // back to hub
}

// ===== Helpers =====
function labelFor(token) {
  // Returns emoji + name for the token color
  const emoji = token === "red" ? "🔴" : "🟡";
  return `${emoji} ${playerNames[token] || (token === "red" ? "Red" : "Yellow")}`;
}