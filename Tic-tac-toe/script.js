// JavaScript code for the Tic-Tac-Toe game with hard-level AI bot

// Define the board size (standard Tic-Tac-Toe is 3x3)
const BOARD_SIZE = 3;

// Define players
const PLAYER_X = "X";
const PLAYER_O = "O";
const EMPTY_CELL = "";

// Create the game board as a 2D array
let board = Array.from(Array(BOARD_SIZE), () =>
  Array(BOARD_SIZE).fill(EMPTY_CELL)
);

// Variable to indicate if the game is over
let gameIsOver = false;

// Add a slight delay (in ms) for the AI's move execution
const AI_MOVE_DELAY = 500;

// Function to initialize the game board
function initializeBoard() {
  const boardElement = document.getElementById("board");
  boardElement.innerHTML = "";
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = document.createElement("div");
      cell.style.width = "100px";
      cell.style.height = "100px";
      cell.style.border = "1px solid black";
      cell.style.display = "flex";
      cell.style.alignItems = "center";
      cell.style.justifyContent = "center";
      cell.style.fontSize = "40px";
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener("click", handleCellClick);
      boardElement.appendChild(cell);
    }
  }
}

// Function to handle a cell click
function handleCellClick(event) {
  if (gameIsOver) return;

  const row = event.target.dataset.row;
  const col = event.target.dataset.col;

  // Check if the cell is empty
  if (board[row][col] === EMPTY_CELL) {
    // Update the board
    board[row][col] = PLAYER_X;

    // Update the UI
    event.target.textContent = PLAYER_X;

    // Check for a win or draw
    if (checkForWin(PLAYER_X)) {
      endGame(PLAYER_X + " wins!");
      return;
    } else if (checkForDraw()) {
      endGame("It's a draw!");
      return;
    }

    // AI's move
    setTimeout(aiMove, AI_MOVE_DELAY);
  }
}

// Function to check for a win
function checkForWin(player) {
  // Check rows, columns, and diagonals
  for (let i = 0; i < BOARD_SIZE; i++) {
    if (
      (board[i][0] === player &&
        board[i][1] === player &&
        board[i][2] === player) ||
      (board[0][i] === player &&
        board[1][i] === player &&
        board[2][i] === player)
    ) {
      return true;
    }
  }

  // Check diagonals
  if (
    (board[0][0] === player &&
      board[1][1] === player &&
      board[2][2] === player) ||
    (board[0][2] === player && board[1][1] === player && board[2][0] === player)
  ) {
    return true;
  }

  return false;
}

// Function to check for a draw
function checkForDraw() {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === EMPTY_CELL) {
        return false; // There's an empty cell, so it's not a draw yet
      }
    }
  }
  return true; // All cells are filled, it's a draw
}

// Function to end the game
function endGame(message) {
  gameIsOver = true;
  const gameResultElement = document.getElementById("game-result");
  gameResultElement.textContent = message;
}

let isHumanTurn = true;
let isBotTurn = false;

// Function to handle cell click
// function handleCellClick(event) {
//   if (!isHumanTurn || isBotTurn) return; // Prevent clicking during the computer's turn

//   const cell = event.target;
//   const row = parseInt(cell.getAttribute("data-row"));
//   const col = parseInt(cell.getAttribute("data-col"));

//   // Check if the cell is empty and the game is not over
//   if (board[row][col] === EMPTY_CELL && !gameIsOver) {
//     // Make the human player move
//     board[row][col] = PLAYER_X;
//     cell.textContent = PLAYER_X;

//     // Check for a win or draw after the human player's move
//     if (checkForWin(PLAYER_X)) {
//       endGame(PLAYER_X + " wins!");
//       return;
//     } else if (checkForDraw()) {
//       endGame("It's a draw!");
//       return;
//     }

//     // Disable clicking during the human player's turn
//     isHumanTurn = false;
//     isBotTurn = true;

//     // Simulate the AI's move after a slight delay
//     setTimeout(aiMove, AI_MOVE_DELAY);
//   }
// }

// Function to simulate the AI's move
function aiMove() {
  // Find the best move using the Minimax algorithm with Alpha-Beta Pruning
  const bestMove = getBestMove();

  // Make the AI's move
  board[bestMove.row][bestMove.col] = PLAYER_O;

  // Update the UI
  const cell = document.querySelector(
    `[data-row="${bestMove.row}"][data-col="${bestMove.col}"]`
  );
  cell.textContent = PLAYER_O;

  // Check for a win or draw after the AI's move
  if (checkForWin(PLAYER_O)) {
    endGame(PLAYER_O + " wins!");
  } else if (checkForDraw()) {
    endGame("It's a draw!");
  } else {
    // Enable clicking during the human player's turn
    isHumanTurn = true;
    isBotTurn = false;
  }
}
// Function to calculate the score of the current board state
function calculateScore() {
  if (checkForWin(PLAYER_O)) {
    return 10; // AI wins
  } else if (checkForWin(PLAYER_X)) {
    return -10; // Human wins
  } else {
    return 0; // Draw
  }
}

// Minimax algorithm with Alpha-Beta Pruning to find the best move for the AI
function minimax(alpha, beta, isMaximizing) {
  if (checkForWin(PLAYER_O)) return 10;
  if (checkForWin(PLAYER_X)) return -10;
  if (checkForDraw()) return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === EMPTY_CELL) {
          board[row][col] = PLAYER_O;
          const eval = minimax(alpha, beta, false);
          board[row][col] = EMPTY_CELL;
          maxEval = Math.max(maxEval, eval);
          alpha = Math.max(alpha, eval);
          if (beta <= alpha) break;
        }
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === EMPTY_CELL) {
          board[row][col] = PLAYER_X;
          const eval = minimax(alpha, beta, true);
          board[row][col] = EMPTY_CELL;
          minEval = Math.min(minEval, eval);
          beta = Math.min(beta, eval);
          if (beta <= alpha) break;
        }
      }
    }
    return minEval;
  }
}

// Function to get the best move for the AI using the Minimax algorithm with Alpha-Beta Pruning
function getBestMove() {
  let bestEval = -Infinity;
  let bestMove = { row: -1, col: -1 };

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === EMPTY_CELL) {
        board[row][col] = PLAYER_O;
        const eval = minimax(-Infinity, Infinity, false);
        board[row][col] = EMPTY_CELL;
        if (eval > bestEval) {
          bestEval = eval;
          bestMove.row = row;
          bestMove.col = col;
        }
      }
    }
  }
  return bestMove;
}

let isHumanFirst = true;
// Function to start a new game
function newGame(isHumanStarting) {
  // Clear the game result element
  const gameResultElement = document.getElementById("game-result");
  gameResultElement.textContent = "";

  // Set who goes first based on the button click
  isHumanFirst = isHumanStarting;

  // Reset the board and start the game
  board = Array.from(Array(BOARD_SIZE), () =>
    Array(BOARD_SIZE).fill(EMPTY_CELL)
  );
  gameIsOver = false;

  initializeBoard();

  // If the bot goes first, initiate the AI's move
  if (!isHumanFirst) {
    setTimeout(aiMove, AI_MOVE_DELAY);
  }
}

// Initialize the game
initializeBoard();

// Add event listeners for the "Human First" and "Bot First" buttons
const humanFirstButton = document.getElementById("human-first-button");
humanFirstButton.addEventListener("click", () => newGame(true));

const botFirstButton = document.getElementById("bot-first-button");
botFirstButton.addEventListener("click", () => newGame(false));
