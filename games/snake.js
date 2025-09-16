const foodImg = new Image();
foodImg.src = "assets/apple.png"; 

const obstacleImg = new Image();
obstacleImg.src = "assets/skull.png"; 

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("status");
const scoreBoard = document.getElementById("scoreBoard");
const modeSelect = document.getElementById("modeSelect");
const gameUI = document.getElementById("gameUI");

let snake, snakeColors, direction, food, badFoods, box, score, bestScore, gameOver;
let gameInterval, speed;

// ✅ Start game
function startGame() {
  modeSelect.style.display = "none";
  gameUI.style.display = "block";
  canvas.focus(); 
  initGame();
}

// ✅ Initialize/reset
function initGame() {
  snake = [{ x: 200, y: 200 }];
  snakeColors = []; 
  direction = "RIGHT";
  box = 20;
  score = 0;
  gameOver = false;
  bestScore = localStorage.getItem("bestScore") || 0;
  speed = 200; // ✅ slower start speed (200ms per move)

  food = randomPosition();
  badFoods = [];

  updateScore();

  clearInterval(gameInterval);
  gameInterval = setInterval(draw, speed);
}

// ✅ Random grid position
function randomPosition() {
  return {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box
  };
}

// ✅ Random color generator
function getRandomColor() {
  const colors = ["#ff4b5c", "#ffb400", "#4caf50", "#9c27b0", "#ff9800", "#00bcd4", "#e91e63"];
  return colors[Math.floor(Math.random() * colors.length)];
}

// ✅ Key controls
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  else if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
});

function draw() {
  if (gameOver) return;

  // ✅ Checkerboard background
  for (let row = 0; row < canvas.height / box; row++) {
    for (let col = 0; col < canvas.width / box; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? "#001f3f" : "#00132b"; 
      ctx.fillRect(col * box, row * box, box, box);
    }
  }

  // Draw snake
  for (let i = 0; i < snake.length; i++) {
    ctx.beginPath();
    ctx.arc(snake[i].x + box / 2, snake[i].y + box / 2, box / 2, 0, Math.PI * 2);

    if (i === 0) {
      ctx.fillStyle = "#2a87ff";
      ctx.shadowColor = "#2a87ff";
    } else {
      ctx.fillStyle = snakeColors[i - 1] || "#1e3c72"; 
      ctx.shadowColor = snakeColors[i - 1] || "#1e3c72";
    }

    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Food
  ctx.drawImage(foodImg, food.x, food.y, box, box);

  // Obstacles
  badFoods.forEach(bad => {
    ctx.drawImage(obstacleImg, bad.x, bad.y, box, box);
  });

  // Movement
  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (direction === "LEFT") snakeX -= box;
  if (direction === "UP") snakeY -= box;
  if (direction === "RIGHT") snakeX += box;
  if (direction === "DOWN") snakeY += box;

  // Wrap around
  if (snakeX < 0) snakeX = canvas.width - box;
  if (snakeY < 0) snakeY = canvas.height - box;
  if (snakeX >= canvas.width) snakeX = 0;
  if (snakeY >= canvas.height) snakeY = 0;

  let newHead = { x: snakeX, y: snakeY };

  // ✅ Eat food
  if (snakeX === food.x && snakeY === food.y) {
    score++;
    updateScore();
    food = randomPosition();

    snake.unshift(newHead);
    snakeColors.unshift(getRandomColor());

    // ✅ Speed up each time food is eaten
    if (speed > 60) { // cap minimum speed
      speed -= 10;
      clearInterval(gameInterval);
      gameInterval = setInterval(draw, speed);
    }

    // ✅ Add obstacle every 2 points, far from snake
    if (score % 2 === 0) {
      let obstacle;
      do {
        obstacle = randomPosition();
      } while (distance(obstacle, snake[0]) < box * 5); // at least 5 blocks away
      badFoods.push(obstacle);
    }
  } else {
    snake.unshift(newHead);
    snake.pop();
  }

  // Obstacle collision
  for (let bad of badFoods) {
    if (snakeX === bad.x && snakeY === bad.y) {
      endGame("💀 Hit Obstacle!");
      return;
    }
  }

  // Self collision
  if (collision(newHead, snake.slice(1))) {
    endGame("💀 You Died!");
    return;
  }

  statusText.textContent = `Score: ${score}`;
}

// ✅ Distance check
function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// ✅ Collision check
function collision(head, array) {
  return array.some(part => head.x === part.x && head.y === part.y);
}

// ✅ End game
function endGame(message) {
  clearInterval(gameInterval);
  gameOver = true;
  statusText.textContent = `${message} Final Score: ${score}`;

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
  }
  updateScore();

  const overlay = document.getElementById("gameOverOverlay");
  const finalMsg = document.getElementById("finalMessage");
  finalMsg.textContent = `${message} | Score: ${score} | Best: ${bestScore}`;
  overlay.style.display = "flex";
}

// ✅ Scoreboard
function updateScore() {
  scoreBoard.textContent = `Score: ${score} | Best: ${bestScore}`;
}

// ✅ Restart
function restart() {
  const overlay = document.getElementById("gameOverOverlay");
  overlay.style.display = "none"; 
  initGame();
  statusText.textContent = "Game restarted! Use Arrow Keys to Control";
  canvas.focus();
}

// ✅ Exit
function exitGame() {
  window.location.href = "../index.html";
}

// ✅ Mobile controls
function setDirection(dir) {
  if (dir === "LEFT" && direction !== "RIGHT") direction = "LEFT";
  else if (dir === "UP" && direction !== "DOWN") direction = "UP";
  else if (dir === "RIGHT" && direction !== "LEFT") direction = "RIGHT";
  else if (dir === "DOWN" && direction !== "UP") direction = "DOWN";
}
