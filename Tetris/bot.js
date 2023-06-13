function runBot(arena, piece, width, height) {
    let bestScore = -Infinity;
    let bestMove = null;
  
    for (let rotation = 0; rotation < 4; rotation++) {
      const pieceCopy = JSON.parse(JSON.stringify(piece));
  
      for (let offsetX = -pieceCopy[0].length; offsetX < width; offsetX++) {
        const potentialMove = {
          pos: { x: offsetX, y: 0 },
          matrix: pieceCopy,
        };
  
        while (!collidePlayerTwo(arena, potentialMove)) {
          potentialMove.pos.y++;
        }
  
        potentialMove.pos.y--;
  
        const score = evaluateMove(arena, potentialMove);
  
        if (score > bestScore) {
          bestScore = score;
          bestMove = potentialMove;
        }
      }
  
      rotatePlayerTwo(pieceCopy, 1);
    }
  
    if (bestMove) {
      playerTwo.matrix = bestMove.matrix;
      playerTwo.pos.x = bestMove.pos.x;
    }
  }
  
  function evaluateMove(arena, move) {
    const originalPos = playerTwo.pos;
    playerTwo.pos = move.pos;
  
    mergePlayerTwo(arena, playerTwo);
    arenaSweepPlayerTwo();
  
    const score = playerTwo.score;
  
    playerTwo.score = 0;
    playerTwo.pos = originalPos;
  
    return score;
  }
  