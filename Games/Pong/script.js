const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

// Define the paddles and ball
let ballSpeed = 5;
const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 10;
const botSpeed = 3;
const winningScore = 5;
const ballSpeedRange = document.getElementById("ball-speed-range");

let gameActive = false; // Initially, the game is not active
let leftPaddleY = canvas.height / 2 - paddleHeight / 2;
let rightPaddleY = canvas.height / 2 - paddleHeight / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = ballSpeed;
let ballSpeedY = ballSpeed;
let playerScore = 0;
let botScore = 0;
let botDifficulty = "medium"; // easy, medium, hard
let winningPlayer = null;

// Define user input
let upPressed = false;
let downPressed = false;

// Update user input
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
  if (e.key == "Up" || e.key == "ArrowUp" || e.key == "w") {
    upPressed = true;
  } else if (e.key == "Down" || e.key == "ArrowDown" || e.key == "s") {
    downPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key == "Up" || e.key == "ArrowUp" || e.key == "w") {
    upPressed = false;
  } else if (e.key == "Down" || e.key == "ArrowDown" || e.key == "s") {
    downPressed = false;
  }
}

// Move the bot (right paddle) based on the ball's position
function moveBot() {
  let predictedBallY = ballY;

  // Predict the future position of the ball based on its current trajectory
  if (ballSpeedX > 0) {
    // Ball is moving towards the bot
    const timeToReachPaddle = (canvas.width - paddleWidth - ballX) / ballSpeedX;
    predictedBallY = ballY + ballSpeedY * timeToReachPaddle;

    // Handle ball bouncing off the top and bottom walls
    while (predictedBallY < 0 || predictedBallY > canvas.height) {
      if (predictedBallY < 0) {
        predictedBallY = -predictedBallY;
      } else if (predictedBallY > canvas.height) {
        predictedBallY = 2 * canvas.height - predictedBallY;
      }
    }
  }

  if (botDifficulty === "easy") {
    // Easy: Bot follows the ball with a significant delay and reduced speed
    if (predictedBallY < rightPaddleY + paddleHeight / 2) {
      rightPaddleY -= botSpeed * 0.5; // Reduced speed
    } else if (predictedBallY > rightPaddleY + paddleHeight / 2) {
      rightPaddleY += botSpeed * 0.5; // Reduced speed
    }
  } else if (botDifficulty === "medium") {
    // Medium: Bot follows the ball with moderate speed
    if (predictedBallY < rightPaddleY + paddleHeight / 2) {
      rightPaddleY -= botSpeed * 1.5;
    } else if (predictedBallY > rightPaddleY + paddleHeight / 2) {
      rightPaddleY += botSpeed * 1.5;
    }
  } else if (botDifficulty === "hard") {
    // Hard: Bot tracks the ball very closely
    if (predictedBallY < rightPaddleY + paddleHeight / 2) {
      rightPaddleY -= botSpeed * 2; // Faster response
    } else if (predictedBallY > rightPaddleY + paddleHeight / 2) {
      rightPaddleY += botSpeed * 2; // Faster response
    }
  }

  // Ensure the paddle stays within the canvas boundaries
  if (rightPaddleY < 0) {
    rightPaddleY = 0;
  } else if (rightPaddleY + paddleHeight > canvas.height) {
    rightPaddleY = canvas.height - paddleHeight;
  }
}

// Update the game state
function update() {
  // Move the paddles
  if (upPressed && leftPaddleY > 0) {
    leftPaddleY -= 5;
  } else if (downPressed && leftPaddleY < canvas.height - paddleHeight) {
    leftPaddleY += 5;
  }

  // Move the bot
  moveBot();

  // Move the ball
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Ball collision with top and bottom walls
  if (ballY + ballSize > canvas.height || ballY - ballSize < 0) {
    ballSpeedY = -ballSpeedY;
  }

  // Ball collision with paddles
  if (
    (ballX - ballSize < paddleWidth &&
      ballY + ballSize > leftPaddleY &&
      ballY - ballSize < leftPaddleY + paddleHeight) ||
    (ballX + ballSize > canvas.width - paddleWidth &&
      ballY + ballSize > rightPaddleY &&
      ballY - ballSize < rightPaddleY + paddleHeight)
  ) {
    ballSpeedX = -ballSpeedX;
  }

  // Check if the ball goes out of bounds
  if (ballX - ballSize < 0) {
    // Ball went past the left paddle (player missed)
    botScore++;
    triggerScoreEffect();
    resetBall();
  } else if (ballX + ballSize > canvas.width) {
    // Ball went past the right paddle (bot missed)
    playerScore++;
    triggerScoreEffect();
    resetBall();
  }

  // Check for a winner
  if (playerScore === winningScore) {
    // Player wins
    winningPlayer = "Player";
    resetGame();
  } else if (botScore === winningScore) {
    // Bot wins
    winningPlayer = "Bot";
    resetGame();
  }
}

function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = -ballSpeedX;
  ballSpeedY = ballSpeed;
}

// Function to reset the game state
function resetGame() {
  playerScore = 0;
  botScore = 0;
  leftPaddleY = canvas.height / 2 - paddleHeight / 2;
  rightPaddleY = canvas.height / 2 - paddleHeight / 2;
  resetBall();
  gameActive = false;
  playButton.hidden = false;
  winningPlayer = null;
  cancelAnimationFrame(gameLoopId);
  updateGameStatus("Not Started");
}

// Render the game
function draw() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw paddles
  ctx.fillStyle = "white";
  ctx.fillRect(0, leftPaddleY, paddleWidth, paddleHeight);
  ctx.fillRect(
    canvas.width - paddleWidth,
    rightPaddleY,
    paddleWidth,
    paddleHeight
  );

  // Draw ball
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();

  // Draw the scores
  ctx.font = "30px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("Player: " + playerScore, 50, 50);
  ctx.fillText("Bot: " + botScore, canvas.width - 150, 50);

  // Display the winner
  if (winningPlayer) {
    ctx.font = "50px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(
      `${winningPlayer} wins!`,
      canvas.width / 2 - 100,
      canvas.height / 2
    );
  }
}

let gameLoopId; // Variable to store the requestAnimationFrame ID

// Game loop
function gameLoop() {
  if (gameActive) {
    update();
    draw();
    gameLoopId = requestAnimationFrame(gameLoop);
  }
}

// Function to start the game
function startGame() {
  gameActive = true;
  playButton.hidden = true;
  updateGameStatus("Playing");
  gameLoopId = requestAnimationFrame(gameLoop);
}

// Function for reset button, it would reset game then start it
function resetAndStartGame() {
  resetGame();
  startGame();
}

function pauseGame() {
  gameActive = !gameActive;
  if (gameActive) {
    updateGameStatus("Playing");
    startGame();
    pauseButton.textContent = "Pause";
  } else {
    updateGameStatus("Paused");
    pauseButton.textContent = "Resume";
  }
}

// Function to trigger a score effect
function triggerScoreEffect() {
  const container = document.querySelector("#pong");
  container.classList.add("score-effect");
  setTimeout(() => {
    container.classList.remove("score-effect");
  }, 1000);
}

const gameStatus = document.getElementById("game-status");

function updateGameStatus(status) {
  gameStatus.textContent = `Game Status: ${status}`;
}

const pauseButton = document.getElementById("pause-button");
pauseButton.addEventListener("click", pauseGame);

const resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", resetAndStartGame);

const playButton = document.getElementById("play-button");
playButton.addEventListener("click", startGame);

const easyButton = document.getElementById("easy-button");
const mediumButton = document.getElementById("medium-button");
const hardButton = document.getElementById("hard-button");

easyButton.addEventListener("click", () => {
  botDifficulty = "easy";
});

mediumButton.addEventListener("click", () => {
  botDifficulty = "medium";
});

hardButton.addEventListener("click", () => {
  botDifficulty = "hard";
});

// Add an event listener to update the ball speed when the input changes
ballSpeedRange.addEventListener("input", function () {
  const newSpeed = parseInt(this.value, 10);
  updateBallSpeed(newSpeed);
});

// Function to update the ball speed
function updateBallSpeed(newSpeed) {
  ballSpeed = newSpeed; // Update the ball speed variable
  ballSpeedX = ballSpeed;
  ballSpeedY = ballSpeed;
}
