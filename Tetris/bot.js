function getPossibleMoves(arena, player) {
  const possibleMoves = [];
  // Try all possible rotations and translations
  for (let rotation = 0; rotation < 4; rotation++) {
      const originalMatrix = player.matrix;
      player.orientation = rotation;
      // rotatePlayerTwo(player.matrix, 1); // Rotate the matrix
      playerRotateTwo(1); // Rotate the matrix

      // Try moving left
      player.pos.x--;
      while (!collidePlayerTwo(arena, player)) {
          player.pos.x--;
      }
      player.pos.x++;
      possibleMoves.push({
          matrix: player.matrix,
          position: { x: player.pos.x, y: player.pos.y },
          orientation: player.orientation
      });

      // Try moving right
      player.pos.x++;
      while (!collidePlayerTwo(arena, player)) {
          player.pos.x++;
      }
      player.pos.x--;
      possibleMoves.push({
          matrix: player.matrix,
          position: { x: player.pos.x, y: player.pos.y },
          orientation: player.orientation
      });

      // Restore the original matrix and rotate it back
      player.matrix = originalMatrix;
      // rotatePlayerTwo(player.matrix, -1);
      playerRotateTwo(-1);
  }
  
  return possibleMoves;
}




































// function getPossibleMoves(arena, player) {
//   const possibleMoves = [];
//   console.log(possibleMoves);
//   // Try all possible rotations and translations
//   for (let rotation = 0; rotation < 4; rotation++) {
//       const originalMatrix = player.matrix;
//       player.orientation = rotation;
//       // rotatePlayerTwo(player.matrix, 1); // Rotate the matrix
//       playerRotateTwo(1); // Rotate the matrix

//       // Try moving left
//       player.pos.x--;
//       while (!collidePlayerTwo(arena, player)) {
//           player.pos.x--;
//       }
//       player.pos.x++;
//       possibleMoves.push({
//           matrix: player.matrix,
//           position: { x: player.pos.x, y: player.pos.y },
//           orientation: player.orientation
//       });

//       // Try moving right
//       player.pos.x++;
//       while (!collidePlayerTwo(arena, player)) {
//           player.pos.x++;
//       }
//       player.pos.x--;
//       possibleMoves.push({
//           matrix: player.matrix,
//           position: { x: player.pos.x, y: player.pos.y },
//           orientation: player.orientation
//       });

//       // Restore the original matrix and rotate it back
//       player.matrix = originalMatrix;
//       // rotatePlayerTwo(player.matrix, -1);
//       playerRotateTwo(-1);
//   }

//   return possibleMoves;
// }

// function runBot(arena, piece, width, height) {
//     let bestScore = -Infinity;
//     let bestMove = null;
  
//     for (let rotation = 0; rotation < 4; rotation++) {
//       const pieceCopy = JSON.parse(JSON.stringify(piece));
  
//       for (let offsetX = -pieceCopy[0].length; offsetX < width; offsetX++) {
//         const potentialMove = {
//           pos: { x: offsetX, y: 0 },
//           matrix: pieceCopy,
//         };
  
//         while (!collidePlayerTwo(arena, potentialMove)) {
//           potentialMove.pos.y++;
//         }
  
//         potentialMove.pos.y--;
  
//         const score = evaluateMove(arena, potentialMove);
  
//         if (score > bestScore) {
//           bestScore = score;
//           bestMove = potentialMove;
//         }
//       }
  
//       rotatePlayerTwo(pieceCopy, 1);
//     }
  
//     if (bestMove) {
//       playerTwo.matrix = bestMove.matrix;
//       playerTwo.pos.x = bestMove.pos.x;
//     }
//   }
  
//   function evaluateMove(arena, move) {
//     const originalPos = playerTwo.pos;
//     playerTwo.pos = move.pos;
  
//     mergePlayerTwo(arena, playerTwo);
//     arenaSweepPlayerTwo();
  
//     const score = playerTwo.score;
  
//     playerTwo.score = 0;
//     playerTwo.pos = originalPos;
  
//     return score;
//   }
  

// Testing
// function getPossibleMoves(gameState) {
//   const { fallingTetrimino, grid } = gameState;
//   const possibleMoves = [];

//   // Get the current position and orientation of the falling Tetrimino
//   const { position, orientation } = fallingTetrimino;
//   const { x, y } = position;

//   // Generate all possible moves: left, right, down, and rotation
//   const potentialMoves = [
//     { x: x - 1, y },
//     { x: x + 1, y },
//     { x, y: y + 1 },
//     { x, y, orientation: (orientation + 1) % 4 },
//   ];

//   // Check if each potential move is valid (within bounds and no collisions)
//   potentialMoves.forEach(move => {
//     if (isValidMove(move, gameState)) {
//       possibleMoves.push(move);
//     }
//   });

//   return possibleMoves;
// }

// function isValidMove(move, gameState) {
//   // Check if the move is within the bounds of the grid
//   if (
//     move.x < 0 ||
//     move.x >= gridWidth ||
//     move.y < 0 ||
//     move.y >= gridHeight
//   ) {
//     return false;
//   }

//   const { fallingTetrimino, grid } = gameState;
//   const { shape, orientation } = fallingTetrimino;

//   // Get the rotated blocks of the Tetrimino based on the move's orientation
//   const rotatedBlocks = rotateBlocks(shape, orientation);

//   // Check for collisions with existing blocks in the grid
//   for (let row = 0; row < rotatedBlocks.length; row++) {
//     for (let col = 0; col < rotatedBlocks[row].length; col++) {
//       const block = rotatedBlocks[row][col];

//       if (block !== 0) {
//         const gridRow = move.y + row;
//         const gridCol = move.x + col;

//         // Check if the move would collide with an existing block in the grid
//         if (grid[gridRow][gridCol] !== 0) {
//           return false;
//         }
//       }
//     }
//   }

//   return true;
// }

// function rotateBlocks(shape, orientation) {
//   // Return the rotated blocks of the Tetrimino based on the orientation
//   // This is a placeholder implementation, you would need to define the rotation logic for each Tetrimino shape
//   // You can represent each shape as a matrix of 0s and non-zero values to indicate the blocks
//   // Rotate the matrix based on the orientation to get the rotated blocks
//   // For example, a 2x2 square would be represented as [[1, 1], [1, 1]], and rotating it would yield [[1, 1], [1, 1]]
//   // Implement the rotation logic for each Tetrimino shape accordingly
// }
