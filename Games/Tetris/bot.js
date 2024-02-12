function getPossibleMoves(arena, player) {
  const possibleMoves = [];
  // Try all possible rotations and translations
  for (let rotation = 0; rotation < 4; rotation++) {
    const originalMatrix = player.matrix;
    player.orientation = rotation;
    // rotatePlayerTwo(player.matrix, 1); // Rotate the matrix
    playerRotateTwo(1); // Rotate the matrix

    // Try moving left
    player.pos.y--;
    while (!collidePlayerTwo(arena, player)) {
      player.pos.y--;
    }
    player.pos.y++;
    possibleMoves.push({
      matrix: player.matrix,
      position: { x: player.pos.x, y: player.pos.y },
      orientation: player.orientation,
    });

    // Try moving right
    player.pos.y++;
    while (!collidePlayerTwo(arena, player)) {
      player.pos.y++;
    }
    player.pos.y--;
    possibleMoves.push({
      matrix: player.matrix,
      position: { x: player.pos.x, y: player.pos.y },
      orientation: player.orientation,
    });

    // Restore the original matrix and rotate it back
    player.matrix = originalMatrix;
    // rotatePlayerTwo(player.matrix, -1);
    playerRotateTwo(-1);
  }

  return possibleMoves;
}

// class TetrisBot {
//   constructor(arenaWidth, arenaHeight) {
//     this.arenaWidth = arenaWidth;
//     this.arenaHeight = arenaHeight;
//   }

//   evaluateMove(gameState) {
//     const possibleMoves = this.getPossibleMoves(
//       gameState.grid,
//       gameState.fallingPiece
//     );

//     // If there are no possible moves, return a default move
//     if (possibleMoves.length === 0) {
//       return {
//         matrix: gameState.fallingPiece.shape,
//         position: {
//           x: gameState.fallingPiece.position.x,
//           y: gameState.fallingPiece.position.y,
//         },
//         orientation: gameState.fallingPiece.orientation,
//         score: 0, // Adjust score based on your scoring strategy
//       };
//     }

//     let bestMove = possibleMoves[0];
//     let bestMoveScore = this.scoreMove(bestMove, gameState);

//     // Evaluate all possible moves and choose the best one
//     for (const move of possibleMoves) {
//       const moveScore = this.scoreMove(move, gameState);
//       if (moveScore > bestMoveScore) {
//         bestMove = move;
//         bestMoveScore = moveScore;
//       }
//     }

//     return bestMove;
//   }

//   getPossibleMoves(arena, player) {
//     const possibleMoves = [];
//     // Try all possible rotations and translations
//     for (let rotation = 0; rotation < 4; rotation++) {
//       const originalMatrix = player.matrix;
//       player.orientation = rotation;
//       // rotatePlayerTwo(player.matrix, 1); // Rotate the matrix
//       playerRotateTwo(1); // Rotate the matrix

//       // Try moving left
//       player.pos.x--;
//       while (!collidePlayerTwo(arena, player)) {
//         player.pos.x--;
//       }
//       player.pos.x++;
//       possibleMoves.push({
//         matrix: player.matrix,
//         position: { x: player.pos.x, y: player.pos.y },
//         orientation: player.orientation,
//       });

//       // Try moving right
//       player.pos.x++;
//       while (!collidePlayerTwo(arena, player)) {
//         player.pos.x++;
//       }
//       player.pos.x--;
//       possibleMoves.push({
//         matrix: player.matrix,
//         position: { x: player.pos.x, y: player.pos.y },
//         orientation: player.orientation,
//       });

//       // Restore the original matrix and rotate it back
//       player.matrix = originalMatrix;
//       // rotatePlayerTwo(player.matrix, -1);
//       playerRotateTwo(-1);
//     }

//     return possibleMoves;
//   }

//   getBestMove(possibleMoves, grid) {
//     let bestMove = null;
//     let bestScore = -Infinity;
//     possibleMoves.forEach((move) => {
//       const score = this.scoreMove(move, grid);
//       if (score > bestScore) {
//         bestMove = move;
//         bestScore = score;
//       }
//     });
//     return bestMove;
//   }

//   // Inside the TetrisBot class
//   mergeWithArena(arena, piece, position, matrix) {
//     for (let y = 0; y < matrix.length; y++) {
//       for (let x = 0; x < matrix[y].length; x++) {
//         if (matrix[y][x] !== 0) {
//           arena[position.y + y][position.x + x] = matrix[y][x];
//         }
//       }
//     }
//   }

//   clearLines(arena) {
//     let linesCleared = 0;
//     outer: for (let y = arena.length - 1; y >= 0; y--) {
//       for (let x = 0; x < arena[y].length; x++) {
//         if (arena[y][x] === 0) {
//           continue outer;
//         }
//       }
//       const row = arena.splice(y, 1)[0].fill(0);
//       arena.unshift(row);
//       linesCleared++;
//     }
//     return linesCleared;
//   }

//   countHoles(arena) {
//     let holesCount = 0;
//     for (let x = 0; x < arena[0].length; x++) {
//       let blockAboveHole = false;
//       for (let y = arena.length - 1; y >= 0; y--) {
//         if (arena[y][x] === 0 && blockAboveHole) {
//           holesCount++;
//         } else if (arena[y][x] !== 0) {
//           blockAboveHole = true;
//         }
//       }
//     }
//     return holesCount;
//   }

//   calculateBumpiness(arena) {
//     let bumpiness = 0;
//     for (let x = 0; x < arena[0].length - 1; x++) {
//       const columnHeight1 = this.getColumnHeight(arena, x);
//       const columnHeight2 = this.getColumnHeight(arena, x + 1);
//       bumpiness += Math.abs(columnHeight1 - columnHeight2);
//     }
//     return bumpiness;
//   }

//   getColumnHeight(arena, column) {
//     for (let y = 0; y < arena.length; y++) {
//       if (arena[y][column] !== 0) {
//         return arena.length - y;
//       }
//     }
//     return 0;
//   }

//   calculateMaxHeight(arena) {
//     let maxHeight = 0;
//     for (let x = 0; x < arena[0].length; x++) {
//       const columnHeight = this.getColumnHeight(arena, x);
//       maxHeight = Math.max(maxHeight, columnHeight);
//     }
//     return maxHeight;
//   }

//   scoreMove(move, gameState) {
//     const { grid, fallingPiece } = gameState;

//     const testArena = JSON.parse(JSON.stringify(gameState)); // Create a copy of the grid for testing the move
//     // console.log(arenaTwo);
//     // Merge the falling piece with the test arena based on the move
//     this.mergeWithArena(testArena, fallingPiece, move.position, move.matrix);

//     // Calculate the number of lines cleared by this move
//     const linesCleared = this.clearLines(testArena);

//     // Calculate the number of holes in the test arena
//     const holesCount = this.countHoles(testArena);

//     // Calculate the bumpiness of the test arena
//     const bumpiness = this.calculateBumpiness(testArena);

//     // Calculate the height of the tallest column in the test arena
//     const maxHeight = this.calculateMaxHeight(testArena);

//     // Define weights for each factor in the scoring strategy (adjust these based on your desired gameplay)
//     const linesClearedWeight = 100;
//     const holesCountWeight = -50;
//     const bumpinessWeight = -10;
//     const maxHeightWeight = -20;

//     // Calculate the total score for the move based on the weights and factors
//     const score =
//       linesCleared * linesClearedWeight +
//       holesCount * holesCountWeight +
//       bumpiness * bumpinessWeight +
//       maxHeight * maxHeightWeight;

//     return score;
//   }
// }

// ... (rest of the code, including the existing game logic) ...

// Example usage of the bot during the game loop
// const bot = new TetrisBot(12, 20);

// function updatePlayerTwo() {
//   if (!isPausedPlayerTwo) {
//     const currentGameState = gameState();
//     const bestMove = bot.evaluateMove(currentGameState);

//     // Make the bot perform the best move
//     playerTwo.matrix = bestMove.matrix;
//     playerTwo.pos.x = bestMove.position.x;
//     playerTwo.pos.y = bestMove.position.y;
//     playerTwo.orientation = bestMove.orientation;

//     // ... (rest of the game loop) ...
//     // ... (rest of the game loop) ...
//   }
//   requestAnimationFrame(updatePlayerTwo);
// }
