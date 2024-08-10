class Enemy extends Entity {
  constructor(x, y, width, height, color, speed) {
    super(x, y, width, height, color);
    this.speed = speed;
    this.health = 50; // Enemy health
  }

  moveTowardsPlayer(player) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const speedFactor = 0.5; // Adjust this factor to make the enemies slower
    this.x += (dx / distance) * this.speed * speedFactor;
    this.y += (dy / distance) * this.speed * speedFactor;
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.death();
    }
  }

  death() {
    console.log("Enemy defeated!");
    // Remove the enemy from the enemies array
    const index = enemies.indexOf(this);
    if (index > -1) {
      enemies.splice(index, 1);
    }
  }
}
