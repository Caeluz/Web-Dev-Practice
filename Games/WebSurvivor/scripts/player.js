class Player extends Entity {
  constructor(x, y, width, height, color, speed) {
    super(x, y, width, height, color);
    this.score = 0;
    this.speed = speed;
    this.health = 100; // Player health
  }

  moveUp() {
    this.y -= this.speed;
  }

  moveDown() {
    this.y += this.speed;
  }

  moveLeft() {
    this.x -= this.speed;
  }

  moveRight() {
    this.x += this.speed;
  }

  //   shoot() {
  //     const projectile = new Projectile(
  //       this.x + this.width / 2 - 5,
  //       this.y,
  //       10,
  //       10,
  //       "yellow",
  //       5,
  //       { x: 0, y: -1 }
  //     );
  //     // Add the projectile to an array of player projectiles
  //     playerProjectiles.push(projectile);
  //   }

  shoot() {
    const nearestEnemy = findNearestEnemy(this, enemies);

    if (nearestEnemy) {
      const dx = nearestEnemy.x - this.x;
      const dy = nearestEnemy.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const direction = {
        x: dx / distance,
        y: dy / distance,
      };

      const projectile = new Projectile(
        this.x + this.width / 2 - 5, // Centered horizontally
        this.y + this.height / 2 - 5, // Centered vertically
        10, // Projectile width
        10, // Projectile height
        "yellow", // Projectile color
        10, // Projectile speed
        direction // Calculated direction
      );

      playerProjectiles.push(projectile);
    }
  }

  reset() {
    this.score = 0;
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.death();
    }
  }

  death() {
    console.log("Game Over!");
    this.reset();
  }
}

// export default Player;
