class Enemy {
    // 建立Enemy的屬性
    constructor(x, y, emoji = "😢") {
      this.pos = createVector(x, y);
      this.Max_Health = 1;
      this.Movement_Speed = 1;
      this.Bullet_Damage = 1;
      this.Body_Damage = 1;
      this.Bullet_Frequency = 180;
      this.Health_Regen = 1;
      this.Bullet_Speed = 1;

      this.cooldown = this.Bullet_Frequency;
      this.moveDir = p5.Vector.random2D().mult(this.Movement_Speed);
      this.changeDirCounter = 0;
      this.emoji = emoji;
      this.hp = this.Max_Health;
    }
  
    // 更新Enemy的位置跟方向跟冷卻時間
    update() {
      let next = this.pos.copy().add(this.moveDir);
      if (!collidesWithObstacle(next))  this.pos = next;
  
      this.changeDirCounter++;
      if (this.changeDirCounter > 60) {
        this.moveDir = p5.Vector.random2D().mult(this.Movement_Speed);
        this.changeDirCounter = 0;
      }
  
      this.cooldown--;
      if (this.cooldown <= 0) {
        let dir = p5.Vector.sub(player.pos, this.pos).normalize();
        enemyBullets.push(new Bullet(this.pos.x, this.pos.y, dir.mult(this.Bullet_Speed), "enemy",this.Bullet_Damage));
        this.cooldown = this.Bullet_Frequency;
      }
    }
  
    // 展示Enemy的圖案跟血量
    display() {
      textSize(32);
      text(this.emoji, this.pos.x, this.pos.y);
      stroke(255);
      fill(100);
      rect(this.pos.x - 40 / 2, this.pos.y - 30, 40, 5);
      fill(255, 0, 0);
      rect(this.pos.x - 40 / 2, this.pos.y - 30, 40 * (this.hp/this.Max_Health), 5);
    }
  
    // 檢查碰撞
    collides(p) {
      return dist(this.pos.x, this.pos.y, p.pos.x, p.pos.y) < 10;
    }
}