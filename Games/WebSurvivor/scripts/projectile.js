class Projectile extends Entity {
  constructor(x, y, width, height, color, speed, direction) {
    super(x, y, width, height, color);
    this.speed = speed;
    this.direction = direction; // Direction as {x: 0, y: -1} for upward, etc.
  }

  update() {
    this.x += this.speed * this.direction.x;
    this.y += this.speed * this.direction.y;
  }
}

function findNearestEnemy(player, enemies) {
  let nearestEnemy = null;
  let minDistance = Infinity;

  enemies.forEach((enemy) => {
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < minDistance) {
      minDistance = distance;
      nearestEnemy = enemy;
    }
  });

  return nearestEnemy;
}
