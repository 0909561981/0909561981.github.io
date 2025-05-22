class Player {
  // 建立Player的屬性
  constructor(x, y, Max_Health, Movement_Speed, Bullet_Damage, Body_Damage, Bullet_Frequency, Health_Regen, Bullet_Speed) {
    this.pos = createVector(x, y);
    this.Max_Health = Max_Health * 3;
    this.Movement_Speed = Movement_Speed * 10;
    this.Bullet_Damage = Bullet_Damage * 1;
    this.Body_Damage = Body_Damage * 1;
    this.Bullet_Frequency = Bullet_Frequency * 10;
    this.Health_Regen = Health_Regen * 0.01;
    this.Bullet_Speed = Bullet_Speed * 10;
  
    this.cooldown = 0;
    this.hp = this.Max_Health;
  }

  // 更新Player的位置跟冷卻時間
  update(vec) {
    let next = this.pos.copy().add(vec.copy().mult(this.Movement_Speed));
    if (!collidesWithObstacle(next, true))    this.pos = next;
    if (this.cooldown > 0)    this.cooldown--;
    if (player.hp<=player.Max_Health)     player.hp += this.Health_Regen;
    if (player.hp>=player.Max_Health)     player.hp = this.Max_Health;
  }

  // 展示Player的圖案跟血量
  display() {
    textSize(32);
    text("😄", this.pos.x, this.pos.y);
    stroke(255);
    fill(100);
    rect(this.pos.x - 40 / 2, this.pos.y - 30, 40, 5);
    fill(255, 0, 0);
    rect(this.pos.x - 40 / 2, this.pos.y - 30, (40*this.hp)/this.Max_Health, 5);
  }

  // 射擊子彈的速度跟方向
  shoot(vec) {
    if (this.cooldown <= 0) {
      bullets.push(new Bullet(this.pos.x, this.pos.y, vec.copy().normalize().mult(this.Bullet_Speed), "player", this.Bullet_Damage));
      this.cooldown = this.Bullet_Frequency;
    }
  }
}