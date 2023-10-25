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

let gameActive = true;
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
  if (e.key == "Up" || e.key == "ArrowUp") {
    upPressed = true;
  } else if (e.key == "Down" || e.key == "ArrowDown") {
    downPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key == "Up" || e.key == "ArrowUp") {
    upPressed = false;
  } else if (e.key == "Down" || e.key == "ArrowDown") {
    downPressed = false;
  }
}

// Move the bot (right paddle) based on the ball's position
function moveBot() {
  if (botDifficulty === "easy") {
    // Easy: Bot follows the ball with a slight delay
    if (ballY < rightPaddleY + paddleHeight / 2) {
      rightPaddleY -= botSpeed;
    } else if (ballY > rightPaddleY + paddleHeight / 2) {
      rightPaddleY += botSpeed;
    }
  } else if (botDifficulty === "medium") {
    // Medium: Bot follows the ball with moderate speed
    if (ballY < rightPaddleY + paddleHeight / 2) {
      rightPaddleY -= botSpeed;
    } else if (ballY > rightPaddleY + paddleHeight / 2) {
      rightPaddleY += botSpeed;
    }
  } else if (botDifficulty === "hard") {
    // Hard: Bot tracks the ball very closely
    if (ballY < rightPaddleY + paddleHeight / 2) {
      rightPaddleY -= botSpeed * 2; // Faster response
    } else if (ballY > rightPaddleY + paddleHeight / 2) {
      rightPaddleY += botSpeed * 2; // Faster response
    }
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
    resetBall();
  } else if (ballX + ballSize > canvas.width) {
    // Ball went past the right paddle (bot missed)
    playerScore++;
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
  resetBall();
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

// Game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();

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
