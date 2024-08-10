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
