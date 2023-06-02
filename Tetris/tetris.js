// Tetris game logic
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

// Block Preview
const blockPreviewCanvas = document.getElementById('blockPreview');
const blockPreviewContext = blockPreviewCanvas.getContext('2d');

context.scale(20, 20);

let isPaused = false;
let nextBlockPreviewValue = null;
let nextPieceMatrix = null;
const pieces = 'ILJOTSZ';
// const pieces = 'I'; // Testing purposes


function play() {
    if (isPaused) {
      // Resume the game from a paused state
      isPaused = false;
      playButton.textContent = 'Play';  
      update();
    } else {
      // Start the game
      //playButton.disabled = true; // Disable the play button
      updateScore();
      update();
    }
  }

  function pause() {
    if (!isPaused) {
      // Pause the game
      isPaused = true;
      
      playButton.textContent = 'Resume';
    }
  }

  function restart() {
    // Reset the game to the initial state
    playerReset();
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
    playButton.disabled = false; // Enable the play button
    isPaused = false; // Reset the paused state
    playButton.textContent = 'Play'; // Reset the play button text
    update();
  }

  function drawBlockPreview() {
    blockPreviewContext.fillStyle = '#000';
    blockPreviewContext.fillRect(0, 0, blockPreviewCanvas.width, blockPreviewCanvas.height);

    
    const blockSize = Math.min(
        blockPreviewCanvas.width / nextPieceMatrix[0].length,
        blockPreviewCanvas.height / nextPieceMatrix.length
    );

    nextPieceMatrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                
                blockPreviewContext.fillStyle = colors[value];
                blockPreviewContext.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
            }
        });
    });
    nextBlockPreviewValue = nextPieceMatrix;
}

function arenaSweep() {
let rowCount = 0;

outer: for (let y = arena.length - 1; y >= 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
    if (arena[y][x] === 0) {
        continue outer;
    }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;

    rowCount++;



    // If Player scores, they will hear this sound
    const pointsUpSound = document.getElementById('sound-points-up');
    pointsUpSound.play();
    pointsSoundVar = true;
}

let pointsSoundVar = false;
if (pointsSoundVar === false){
    const dropBlocksSound = document.getElementById('sound-drop-blocks');
    dropBlocksSound.play();
}

let previousScore = player.score;
if (rowCount === 4) {
    // Display "Tetris!" announcer
    displayAnnouncer("Tetris!");
    player.score += 70;
    //
    const comboPointsUpSound = document.getElementById('sound-combo-points-up');
    comboPointsUpSound.play();
} else {
    player.score += rowCount * 10;
}

let isSpeedUp = true;


// If player clears 10 rows, the speed will increase.
// Bug cannot level up... when player score up by 10 when it's 100 it levels up
// while (player.score - previousScore >= 100 && isSpeedUp) {
    
//     increaseSpeed(); // Call the function to increase the speed  
//     isSpeedUp = false;
// } 

while (Math.floor(player.score / 100) > Math.floor(previousScore / 100) && isSpeedUp) {
    increaseSpeed(); // Call the function to increase the speed  
    previousScore = Math.floor(player.score / 100) * 100; // Update previousScore
}

function increaseSpeed() {
    dropInterval -= 100;
    if (dropInterval < 0) {
        dropInterval = 100; // Limit the drop interval to 0
    }
    player.level += 1; // Decrease the drop interval to increase the speed
}

updateScore();


}

function displayAnnouncer(text) {
    const announcerElement = document.getElementById('announcer');
    announcerElement.textContent = text;
    announcerElement.classList.add('show');
  
    setTimeout(() => {
      announcerElement.classList.remove('show');
    }, 1500); // Display the announcer for 1.5 seconds
  }

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
        if (
        m[y][x] !== 0 &&
        (arena[y + o.y] &&
            arena[y + o.y][x + o.x]) !== 0
        ) {
        return true;
        }
    }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
    matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
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

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
    drawGhostPiece();
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
            context.fillStyle = colors[value];
            context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function drawGhostPiece() {
    const ghost = {
        pos: { x: player.pos.x, y: player.pos.y },
        matrix: player.matrix,
    };

    while (!collide(arena, ghost)) {
    ghost.pos.y++;
    }

    ghost.pos.y--;

    drawMatrix(ghost.matrix, ghost.pos, true);
}

function drawMatrix(matrix, offset, isGhost) {
matrix.forEach((row, y) => {
    row.forEach((value, x) => {
    if (value !== 0) {
        const color = isGhost ? 'rgba(255, 255, 255, 0.3)' : colors[value];
        context.fillStyle = color;
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
    }
    });
});
}


function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
    


}


function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();

    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
    player.pos.x -= dir;
    }
}

function playerReset() {
    // const pieces = 'ILJOTSZ';
    if (nextBlockPreviewValue === null) { // Check if there is a saved preview block value
        player.matrix = createPiece(pieces[(pieces.length * Math.random()) | 0]);
    } else {
        player.matrix = nextBlockPreviewValue; // Use the saved preview block value
        // drawBlockPreview();
    }

    nextPieceMatrix = createPiece(pieces[(pieces.length * Math.random()) | 0]);
    drawBlockPreview();

    player.pos.y = 0;
    player.pos.x =
    ((arena[0].length / 2) | 0) -
    ((player.matrix[0].length / 2) | 0);
    if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    
    if (player.score > player.highScore) {
        localStorage.setItem('highScore', player.score);
        player.highScore = localStorage.getItem('highScore');
    }
    player.score = 0;
    dropInterval = 1000;
    
    
    updateScore();

    const resetSound = document.getElementById('sound-reset');
    resetSound.play();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
        rotate(player.matrix, -dir);
        player.pos.x = pos;
        return;
    }
    }
}

function playerMoveBottom() {
    while (!collide(arena, player)) {
    player.pos.y++;
    }

    player.pos.y--;

    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
    dropCounter = 0;
}

function rotate(matrix, dir) {
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

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;

function update(time = 0) {
    if (!isPaused) {
      const deltaTime = time - lastTime;
      lastTime = time;

      dropCounter += deltaTime;
      if (dropCounter > dropInterval) {
        playerDrop();
      }

      draw();
    }

    requestAnimationFrame(update);
  }

function updateScore() {
    document.getElementById('score').textContent = 'Score: ' + player.score;
    document.getElementById('high-score').textContent = 'High Score: ' + player.highScore;
    document.getElementById('level').textContent = 'Level: ' + player.level;

    // drawBlockPreview();
}

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

const arena = createMatrix(12, 20);

// The Player
const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
    highScore: localStorage.getItem('highScore'),
    level: 0
};

// Player Movements
const playButton = document.getElementById('playButton');
const pauseButton = document.getElementById('pauseButton');
const restartButton = document.getElementById('restartButton');

playButton.addEventListener('click', play);
pauseButton.addEventListener('click', pause);
restartButton.addEventListener('click', restart);

document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
        playerMove(-1);
    } else if (event.key === 'ArrowRight') {
        playerMove(1);
    } else if (event.key === 'ArrowDown') {
        playerDrop();
    } else if (event.key === 'ArrowUp') {
        playerRotate(1);
    } else if (event.key === 'Control') {
        playerRotate(-1);
    } else if (event.key === ' ') {
        playerMoveBottom();
    } else if (event.key === "q" || event.key === "Q") {
        play();
    } else if (event.key === "t" || event.key === "t") {
        pause();
    } else if (event.key === "r" || event.key === "R") {
        restart();
    }
});

const muteButton = document.getElementById('muteButton');
function toggleMute() {
    if (pointsUpSound.muted) {
      pointsUpSound.muted = false; // Unmute the audio
      dropBlocksSound.muted = false; // Unmute the audio
      comboPointsUpSound.muted = false; // Unmute the audio
      resetSound.muted = false; // Unmute the audio
      muteButton.textContent = 'Mute';
    } else {
        pointsUpSound.muted = true; // Unmute the audio
        dropBlocksSound.muted = true; // Unmute the audio
        comboPointsUpSound.muted = true; // Unmute the audio
        resetSound.muted = true; // Unmute the audio
      muteButton.textContent = 'Unmute';
    }
  }

playerReset();
updateScore();
update();