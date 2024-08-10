const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth * 0.7;
  canvas.height = canvas.width / 4;
  drawBackground(); // Redraw the background after resizing
  // Redraw the game elements here if necessary
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // Initial call to set the canvas size

// Create a player instance
const player = new Player(
  canvas.width / 2 - 25,
  canvas.height / 2 - 25,
  50,
  30,
  "blue",
  5
);

// Create an enemy instance
const enemies = [];

// Player projectiles
const playerProjectiles = [];

function spawnEnemy() {
  const enemy = new Enemy(
    Math.random() * canvas.width, // Random x position
    Math.random() * canvas.height, // Random y position
    50, // Width
    50, // Height
    "red", // Color
    0.5 // Speed
  );
  enemies.push(enemy);
}

// for (let i = 0; i < 5; i++) {
//   spawnEnemy();
// }

function startSpawningEnemies() {
  setInterval(spawnEnemy, 2000); // Spawn an enemy every 2 seconds
}

// Background color or image
function drawBackground() {
  ctx.fillStyle = "darkgreen"; // Change this to any color you prefer
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// function drawHealthBar() {
//   ctx.fillStyle = "red";
//   ctx.fillRect(10, 10, 100, 10);
//   ctx.fillStyle = "green";
//   ctx.fillRect(10, 10, player.health, 10);
// }

function drawHealthBar() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Health: " + player.health, 10, 30);
}

function checkCollision(entity1, entity2) {
  return (
    entity1.x < entity2.x + entity2.width &&
    entity1.x + entity1.width > entity2.x &&
    entity1.y < entity2.y + entity2.height &&
    entity1.y + entity1.height > entity2.y
  );
}

// Game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  drawHealthBar();

  player.draw(ctx);

  // Update and draw player projectiles
  playerProjectiles.forEach((projectile) => {
    projectile.update();
    projectile.draw(ctx);

    // Check for collision with enemies
    enemies.forEach((enemy, enemyIndex) => {
      if (checkCollision(projectile, enemy)) {
        enemy.takeDamage(10);
        // Remove the projectile
        playerProjectiles.splice(playerProjectiles.indexOf(projectile), 1);
      }
    });

    // Remove the projectile if it goes out of bounds
    if (
      projectile.y < 0 ||
      projectile.y > canvas.height ||
      projectile.x < 0 ||
      projectile.x > canvas.width
    ) {
      playerProjectiles.splice(playerProjectiles.indexOf(projectile), 1);
    }
  });

  // Update and draw each enemy
  enemies.forEach((enemy) => {
    enemy.moveTowardsPlayer(player);
    enemy.draw(ctx);

    if (checkCollision(player, enemy)) {
      player.takeDamage(10); // Player takes damage on enemy contact
    }
  });

  requestAnimationFrame(gameLoop);
}

// Handle keyboard input
window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
      player.moveUp();
      break;
    case "ArrowDown":
      player.moveDown();
      break;
    case "ArrowLeft":
      player.moveLeft();
      break;
    case "ArrowRight":
      player.moveRight();
      break;
    case " ":
      player.shoot();
      break;
  }
});

function startAutoShoot() {
  setInterval(() => {
    player.shoot();
  }, 500); // Shoots every 500 milliseconds (adjust as needed)
}

// Call this function in the game setup or loop
startAutoShoot();

// Start the game loop
// startSpawningEnemies();
gameLoop();
