let playerScore = 0;
let computerScore = 0;

function playGame(playerChoice) {
  const choices = ["rock", "paper", "scissors"];
  const computerChoice = choices[Math.floor(Math.random() * choices.length)];

  const playerWeapon = document.getElementById("player-weapon");
  const computerWeapon = document.getElementById("computer-weapon");
  const resultText = document.getElementById("result-text");

  // Always start with ROCK for suspense
  playerWeapon.src = `assets/rock.png`;
  computerWeapon.src = `assets/rock.png`;

  // Show & animate
  playerWeapon.style.opacity = "1";
  computerWeapon.style.opacity = "1";
  playerWeapon.classList.add("bounce");
  computerWeapon.classList.add("bounce");

  // Delay reveal to simulate battle animation
  setTimeout(() => {
    // Reveal real weapons
    playerWeapon.src = `assets/${playerChoice}.png`;
    computerWeapon.src = `assets/${computerChoice}.png`;

    // Stop bouncing after reveal
    playerWeapon.classList.remove("bounce");
    computerWeapon.classList.remove("bounce");

    // Decide winner
    let result = "";
    if (playerChoice === computerChoice) {
      result = `It's a tie! You both chose ${playerChoice.toUpperCase()}`;
    } else if (
      (playerChoice === "rock" && computerChoice === "scissors") ||
      (playerChoice === "paper" && computerChoice === "rock") ||
      (playerChoice === "scissors" && computerChoice === "paper")
    ) {
      result = `You WIN! ${playerChoice.toUpperCase()} beats ${computerChoice.toUpperCase()}`;
      playerScore++;
    } else {
      result = `You LOSE! ${computerChoice.toUpperCase()} beats ${playerChoice.toUpperCase()}`;
      computerScore++;
    }

    // Update scoreboard
    resultText.textContent = result;
    document.getElementById("player-score").textContent = playerScore;
    document.getElementById("computer-score").textContent = computerScore;

  }, 1200); // reveal after bounce animation
}

function restartGame() {
  playerScore = 0;
  computerScore = 0;
  document.getElementById("player-score").textContent = "0";
  document.getElementById("computer-score").textContent = "0";
  document.getElementById("result-text").textContent = "Make your choice!";

  // Reset arena
  document.getElementById("player-weapon").style.opacity = "0";
  document.getElementById("computer-weapon").style.opacity = "0";
}
