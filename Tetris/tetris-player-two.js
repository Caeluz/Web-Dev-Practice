// Tetris game logic
const canvasPlayerTwo = document.getElementById('tetris-player-two');
const contextPlayerTwo = canvasPlayerTwo.getContext('2d');

// Block Preview
const blockPreviewCanvasPlayerTwo = document.getElementById('blockPreviewPlayerTwo');
const blockPreviewContextPlayerTwo = blockPreviewCanvasPlayerTwo.getContext('2d');
contextPlayerTwo.scale(20, 20);


let isPausedPlayerTwo = false;
let nextBlockPreviewValuePlayerTwo = null;
let nextPieceMatrixPlayerTwo = null;
const piecesPlayerTwo = 'ILJOTSZ';
// const pieces = 'I'; // Testing purposes

function playPlayerTwo() {
    if (isPausedPlayerTwo) {
      // Resume the game from a paused state
      isPausedPlayerTwo = false;
      playButtonPlayerTwo.textContent = 'Play';  
      updatePlayerTwo();
    } else {
      // Start the game
      //playButton.disabled = true; // Disable the play button
      updateScorePlayerTwo();
      updatePlayerTwo();
    }
  }

  function pausePlayerTwo() {
    if (!isPausedPlayerTwo) {
      // Pause the game
      isPausedPlayerTwo = true;
      
      playButtonPlayerTwo.textContent = 'Resume';
    }
  }

  function restart() {
    // Reset the game to the initial state
    playerResetPlayerTwo();
    arenaTwo.forEach(row => row.fill(0));
    playerTwo.score = 0;
    updateScorePlayerTwo();
    playButtonPlayerTwo.disabled = false; // Enable the play button
    isPausedPlayerTwo = false; // Reset the paused state
    playButtonPlayerTwo.textContent = 'Play'; // Reset the play button text
    updatePlayerTwo();
  }

  function drawBlockPreviewPlayerTwo() {
    blockPreviewContextPlayerTwo.fillStyle = '#000';
    blockPreviewContextPlayerTwo.fillRect(0, 0, blockPreviewCanvasPlayerTwo.width, blockPreviewCanvasPlayerTwo.height);

    const blockSize = Math.min(
        blockPreviewCanvasPlayerTwo.width / nextPieceMatrixPlayerTwo[0].length,
        blockPreviewCanvasPlayerTwo.height / nextPieceMatrixPlayerTwo.length
    );

    nextPieceMatrixPlayerTwo.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                
                blockPreviewContextPlayerTwo.fillStyle = colorsPlayerTwo[value];
                blockPreviewContextPlayerTwo.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
            }
        });
    });
    nextBlockPreviewValuePlayerTwo = nextPieceMatrixPlayerTwo;
}

function arenaSweepPlayerTwo() {
let rowCountPlayerTwo = 0;

outer: for (let y = arenaTwo.length - 1; y >= 0; --y) {
    for (let x = 0; x < arenaTwo[y].length; ++x) {
    if (arenaTwo[y][x] === 0) {
        continue outer;
    }
    }
    const rowPlayerTwo = arenaTwo.splice(y, 1)[0].fill(0);
    arenaTwo.unshift(rowPlayerTwo);
    ++y;

    rowCountPlayerTwo++;


}



let previousScorePlayerTwo = playerTwo.score;
if (rowCountPlayerTwo === 4) {
    // Display "Tetris!" announcer
    displayAnnouncer("Tetris!");
    playerTwo.score += 70;
    //
    
    
} else {
    playerTwo.score += rowCountPlayerTwo * 10;
}

let isSpeedUpPlayerTwo = true;


// If player clears 10 rows, the speed will increase.
// Bug cannot level up... when player score up by 10 when it's 100 it levels up
// while (player.score - previousScore >= 100 && isSpeedUp) {
    
//     increaseSpeed(); // Call the function to increase the speed  
//     isSpeedUp = false;
// } 

while (Math.floor(playerTwo.score / 100) > Math.floor(previousScorePlayerTwo / 100) && isSpeedUpPlayerTwo) {
    increaseSpeed(); // Call the function to increase the speed  
    previousScorePlayerTwo = Math.floor(playerTwo.score / 100) * 100; // Update previousScore
}

function increaseSpeed() {
    dropIntervalPlayerTwo -= 100;
    if (dropIntervalPlayerTwo < 0) {
        dropIntervalPlayerTwo = 100; // Limit the drop interval to 0
    }
    playerTwo.level += 1; // Decrease the drop interval to increase the speed
}

updateScorePlayerTwo();


}

function displayAnnouncer(text) {
    const announcerElement = document.getElementById('announcer-player-two');
    announcerElement.textContent = text;
    announcerElement.classList.add('show');
  
    setTimeout(() => {
      announcerElement.classList.remove('show');
    }, 1500); // Display the announcer for 1.5 seconds
  }

function collidePlayerTwo(arenaTwo, playerTwo) {
    const [m, o] = [playerTwo.matrix, playerTwo.pos];
    for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
        if (
        m[y][x] !== 0 &&
        (arenaTwo[y + o.y] &&
            arenaTwo[y + o.y][x + o.x]) !== 0
        ) {
        return true;
        }
    }
    }
    return false;
}

function createMatrixPlayerTwo(w, h) {
    const matrixPlayerTwo = [];
    while (h--) {
    matrixPlayerTwo.push(new Array(w).fill(0));
    }
    return matrixPlayerTwo;
}

function createPiecePlayerTwo(type) {
    if (type === 'T') {
    return [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
    ];
    } else if (type === 'O') {
    return [
        [2, 2],
        [2, 2],
    ];
    } else if (type === 'L') {
    return [
        [0, 3, 0],
        [0, 3, 0],
        [0, 3, 3],
    ];
    } else if (type === 'J') {
    return [
        [0, 4, 0],
        [0, 4, 0],
        [4, 4, 0],
    ];
    } else if (type === 'I') {
    return [
        [0, 5, 0, 0],
        [0, 5, 0, 0],
        [0, 5, 0, 0],
        [0, 5, 0, 0],
    ];
    } else if (type === 'S') {
    return [
        [0, 6, 6],
        [6, 6, 0],
        [0, 0, 0],
    ];
    } else if (type === 'Z') {
    return [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0],
    ];
    // return [
    //     [0, 0, 0, 0],
    //     [1, 1, 1, 1],
    //     [0, 0, 0, 0],
    //     [0, 0, 0, 0],
    //   ];
    }
}

function drawPlayerTwo() {
    contextPlayerTwo.fillStyle = '#000';
    contextPlayerTwo.fillRect(0, 0, canvasPlayerTwo.width, canvasPlayerTwo.height);

    drawMatrixPlayerTwo(arenaTwo, { x: 0, y: 0 });
    drawMatrixPlayerTwo(playerTwo.matrix, playerTwo.pos);
    drawGhostPiecePlayerTwo();
}

// function drawMatrix(matrix, offset) {
//     matrix.forEach((rowPlayerTwo, y) => {
//         rowPlayerTwo.forEach((value, x) => {
//             if (value !== 0) {
//             contextPlayerTwo.fillStyle = colorsPlayerTwo[value];
//             contextPlayerTwo.fillRect(x + offset.x, y + offset.y, 1, 1);
//             }
//         });
//     });
// }

function drawGhostPiecePlayerTwo() {
    const ghost = {
        pos: { x: playerTwo.pos.x, y: playerTwo.pos.y },
        matrix: playerTwo.matrix,
    };

    while (!collidePlayerTwo(arenaTwo, ghost)) {
    ghost.pos.y++;
    }

    ghost.pos.y--;

    drawMatrixPlayerTwo(ghost.matrix, ghost.pos, true);
}

function drawMatrixPlayerTwo(matrix, offset, isGhost) {
matrix.forEach((rowPlayerTwo, y) => {
    rowPlayerTwo.forEach((value, x) => {
    if (value !== 0) {
        const colorPlayerTwo = isGhost ? 'rgba(255, 255, 255, 0.3)' : colorsPlayerTwo[value];
        contextPlayerTwo.fillStyle = colorPlayerTwo;
        contextPlayerTwo.fillRect(x + offset.x, y + offset.y, 1, 1);
    }
    });
});
}


function mergePlayerTwo(arenaTwo, playerTwo) {
    playerTwo.matrix.forEach((rowPlayerTwo, y) => {
        rowPlayerTwo.forEach((value, x) => {
            if (value !== 0) {
                arenaTwo[y + playerTwo.pos.y][x + playerTwo.pos.x] = value;
            }
        });
    });
}


function playerDropPlayerTwo() {
    playerTwo.pos.y++;
    if (collidePlayerTwo(arenaTwo, playerTwo)) {
    playerTwo.pos.y--;
    mergePlayerTwo(arenaTwo, playerTwo);
    playerResetPlayerTwo();
    arenaSweepPlayerTwo();
    updateScorePlayerTwo();

    }
    dropCounterPlayerTwo = 0;
}

function playerMovePlayerTwo(dir) {
    playerTwo.pos.x += dir;
    if (collidePlayerTwo(arenaTwo, playerTwo)) {
    playerTwo.pos.x -= dir;
    }
}

function playerResetPlayerTwo() {
    // const pieces = 'ILJOTSZ';
    if (nextBlockPreviewValuePlayerTwo === null) { // Check if there is a saved preview block value
        playerTwo.matrix = createPiecePlayerTwo(piecesPlayerTwo[(piecesPlayerTwo.length * Math.random()) | 0]);
    } else {
        playerTwo.matrix = nextBlockPreviewValuePlayerTwo; // Use the saved preview block value
        // drawBlockPreview();
    }

    nextPieceMatrixPlayerTwo = createPiecePlayerTwo(piecesPlayerTwo[(piecesPlayerTwo.length * Math.random()) | 0]);
    drawBlockPreviewPlayerTwo();

    playerTwo.pos.y = 0;
    playerTwo.pos.x =
    ((arenaTwo[0].length / 2) | 0) -
    ((playerTwo.matrix[0].length / 2) | 0);
    if (collidePlayerTwo(arenaTwo, playerTwo)) {
    arenaTwo.forEach(rowPlayerTwo => rowPlayerTwo.fill(0));
    
    if (playerTwo.score > playerTwo.highScore) {
        localStorage.setItem('highScore', playerTwo.score);
        playerTwo.highScore = localStorage.getItem('highScore');
    }
    playerTwo.score = 0;
    dropIntervalPlayerTwo = 1000;
    
    
    updateScorePlayerTwo();


    }
}

function playerRotateTwo(dir) {
    const pos = playerTwo.pos.x;
    let offset = 1;
    rotatePlayerTwo(playerTwo.matrix, dir);
    while (collidePlayerTwo(arenaTwo, playerTwo)) {
    playerTwo.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > playerTwo.matrix[0].length) {
        rotatePlayerTwo(playerTwo.matrix, -dir);
        playerTwo.pos.x = pos;
        return;
    }
    }
}

function playerMoveBottomPlayerTwo() {
    while (!collidePlayerTwo(arenaTwo, playerTwo)) {
    playerTwo.pos.y++;
    }

    playerTwo.pos.y--;

    mergePlayerTwo(arenaTwo, playerTwo);
    playerResetPlayerTwo();
    arenaSweepPlayerTwo();
    updateScorePlayerTwo();
    dropCounterPlayerTwo = 0;
}

function rotatePlayerTwo(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
        [matrix[x][y], matrix[y][x]] = [
        matrix[y][x],
        matrix[x][y],
        ];
    }
    }

    if (dir > 0) {
    matrix.forEach(row => row.reverse());
    } else {
    matrix.reverse();
    }
}

let dropCounterPlayerTwo = 0;
let dropIntervalPlayerTwo = 1000;

let lastTimePlayerTwo = 0;

function updatePlayerTwo(time = 0) {
    if (!isPausedPlayerTwo) {
      const deltaTimePlayerTwo = time - lastTimePlayerTwo;
      lastTimePlayerTwo = time;
      

      dropCounterPlayerTwo += deltaTimePlayerTwo;
      if (dropCounterPlayerTwo > dropIntervalPlayerTwo) {
        playerDropPlayerTwo();
        
      }
      
      
      drawPlayerTwo();
    }

    requestAnimationFrame(updatePlayerTwo);
  }

function updateScorePlayerTwo() {
    document.getElementById('score-player-two').textContent = 'Score: ' + playerTwo.score;
    document.getElementById('high-score-player-two').textContent = 'High Score: ' + playerTwo.highScore;
    document.getElementById('level-player-two').textContent = 'Level: ' + playerTwo.level;

}

const colorsPlayerTwo = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

const arenaTwo = createMatrixPlayerTwo(12, 20);

// The Player
const playerTwo = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
    highScore: localStorage.getItem('highScore'),
    level: 0
};

// Player Movements
const playButtonPlayerTwo = document.getElementById('playButton');
const pauseButtonPlayerTwo = document.getElementById('pauseButton');
const restartButtonPlayerTwo = document.getElementById('restartButton');

playButtonPlayerTwo.addEventListener('click', play);
pauseButtonPlayerTwo.addEventListener('click', pausePlayerTwo);
restartButtonPlayerTwo.addEventListener('click', restart);

document.addEventListener('keydown', event => {
    if (isPausedPlayerTwo) {
      return; // If paused, do not process key events
    }
    
    if  (event.key === 'ArrowLeft') {
      playerMovePlayerTwo(-1);
    } else if (event.key === 'ArrowRight') {
      playerMovePlayerTwo(1);
    } else if (event.key === 'ArrowDown') {
      playerDropPlayerTwo();
    } else if (event.key === 'ArrowUp') {
      playerRotateTwo(1);
    } else if (event.key === ']') {
      playerRotateTwo(-1);
    } else if (event.key === '\\') {
      event.preventDefault();
      playerMoveBottomPlayerTwo();
    } else if (event.key === "q" || event.key === "Q") {
      playPlayerTwo();
    } else if (event.key === "t" || event.key === "t") {
      pausePlayerTwo();
    } else if (event.key === "r" || event.key === "R") {
      restart();
    }
  });



  
 
playerResetPlayerTwo();
updateScorePlayerTwo();
updatePlayerTwo();
