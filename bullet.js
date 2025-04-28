class Bullet {
    // 建立Bullet的屬性
    constructor(x, y, vel, type, damage) {
      this.pos = createVector(x, y);
      this.vel = vel; // 速度
      this.type = type;
      this.Bullet_Damage = damage
    }

    // 更新Bullet的位置跟方向跟冷卻時間
    update() {
      this.pos.add(this.vel);
    }
  
    // 展示Bullet的圖案跟血量
    display() {
      fill(this.type === "player" ? "yellow" : "red");
      ellipse(this.pos.x, this.pos.y, 10);
    }
  
    // 判斷子彈是否超出了螢幕邊界
    offscreen() {
      return (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height);
    }
  
    // 判斷子彈是否與目標發生碰撞
    hits(target) {
      return dist(this.pos.x, this.pos.y, target.pos.x, target.pos.y) < 25;
    }
}

function bulletHitsObstacle(bullet) {
    return obstacles.some(ob => dist(bullet.pos.x, bullet.pos.y, ob.pos.x, ob.pos.y) < 25);
}