const grid = document.getElementById("grid");
const statusText = document.getElementById("status");
const timerText = document.getElementById("timer");
const bestTimeText = document.getElementById("bestTime");
const restartBtn = document.getElementById("restartBtn");
const exitBtn = document.getElementById("exitBtn");

const controls = document.getElementById("controls");
const gameUI = document.getElementById("gameUI");

const iconsPool = ["🍎","🍌","🍒","🍇","🍉","🥝","🍍","🥥","🥕","🍓","🍑","🥭",
                   "🥦","🥔","🥬","🍋","🥑","🍈","🍐","🍊","🥜","🌽","🍆","🍄",
                   "🧄","🧅","🍔","🍟","🍕","🍩","🍪","🍫","🍿","🍵","🥤","🍗"];

let cards = [];
let flipped = [];
let matched = [];
let lockBoard = false;
let currentDifficulty = null;

// Timer
let timerInterval = null;
let elapsedTime = 0;

// Best Times (stored in localStorage)
let bestTimes = JSON.parse(localStorage.getItem("bestTimes")) || {
  easy: null,
  medium: null,
  hard: null
};

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function startGame(difficulty) {
  currentDifficulty = difficulty;
  matched = [];
  flipped = [];
  lockBoard = false;
  statusText.textContent = "";
  exitBtn.style.display = "inline-block";
  restartBtn.style.display = "inline-block";

  controls.style.display = "none";
  gameUI.style.display = "block";

  let pairs, gridSize;
  if (difficulty === "easy") {
    pairs = 8;
    gridSize = 4;
  } else if (difficulty === "medium") {
    pairs = 18;
    gridSize = 6;
  } else if (difficulty === "hard") {
    pairs = 32;
    gridSize = 8;
  }

  grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

  cards = shuffle(iconsPool).slice(0, pairs);
  cards = shuffle([...cards, ...cards]);

  createBoard();
  startTimer();
  showBestTime();
}

function createBoard() {
  grid.innerHTML = "";
  cards.forEach(icon => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.icon = icon;
    card.addEventListener("click", flipCard);
    grid.appendChild(card);
  });
}

function flipCard(e) {
  const card = e.target;
  if (lockBoard) return;
  if (card.classList.contains("flipped")) return;

  card.classList.add("flipped");
  flipped.push(card);

  if (flipped.length === 2) {
    lockBoard = true;
    checkMatch();
  }
}

function checkMatch() {
  const [card1, card2] = flipped;

  if (card1.dataset.icon === card2.dataset.icon) {
    matched.push(card1, card2);
    statusText.textContent = `Matched: ${matched.length / 2}`;
    resetFlipped();
  } else {
    setTimeout(() => {
      card1.classList.remove("flipped");
      card2.classList.remove("flipped");
      resetFlipped();
    }, 800);
  }

  if (matched.length === cards.length) {
    stopTimer();
    statusText.textContent = `🎉 You Won in ${elapsedTime}s!`;
    updateBestTime(currentDifficulty, elapsedTime);
    exitBtn.style.display = "inline-block";
  }
}

function resetFlipped() {
  flipped = [];
  lockBoard = false;
}

function restart() {
  if (currentDifficulty) {
    startGame(currentDifficulty);
  }
}

function exitGame() {
  stopTimer();
  grid.innerHTML = "";
  statusText.textContent = "";
  timerText.textContent = "⏱ Time: 0s";
  bestTimeText.textContent = "🏆 Best Time: N/A";
  currentDifficulty = null;
  gameUI.style.display = "none";
  controls.style.display = "block";
  window.location.href = "../index.html";
}

// Timer functions
function startTimer() {
  stopTimer();
  elapsedTime = 0;
  timerText.textContent = `⏱ Time: 0s`;
  timerInterval = setInterval(() => {
    elapsedTime++;
    timerText.textContent = `⏱ Time: ${elapsedTime}s`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

// Best Time functions
function updateBestTime(difficulty, time) {
  if (!bestTimes[difficulty] || time < bestTimes[difficulty]) {
    bestTimes[difficulty] = time;
    localStorage.setItem("bestTimes", JSON.stringify(bestTimes));
  }
  showBestTime();
}

function showBestTime() {
  const best = bestTimes[currentDifficulty];
  bestTimeText.textContent = best 
    ? `🏆 Best Time: ${best}s` 
    : `🏆 Best Time: N/A`;
}
