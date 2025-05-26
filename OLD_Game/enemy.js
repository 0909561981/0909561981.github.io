class enemy {
    // 建立Enemy的屬性
    constructor(x, y, emoji = "😢",lv) {
        this.pos = createVector(x, y);
        this.stats = new Stats("enemy", lv, lv, lv, lv, lv, lv, lv);

        this.cooldown = this.stats.Bullet_Frequency;
        this.hp = this.stats.Max_Health;

        this.moveDir = p5.Vector.random2D().mult(this.stats.Movement_Speed);
        this.changeDirCounter = 0;
    
        this.emoji = emoji;
    }

    // 更新Enemy的位置跟方向跟冷卻時間
    move(vec) {
        let next = this.pos.copy().add(this.moveDir.mult(this.stats.Movement_Speed));
        if (!collidesWithObstacle(next, true))    this.pos = next;
        this.changeDirCounter++;
        if (this.changeDirCounter > 60) {
            this.moveDir = p5.Vector.random2D().mult(this.stats.Movement_Speed);
            this.changeDirCounter = 0;
        }
    }
    // 射擊子彈的速度跟方向
    attack() {
        if (this.cooldown > 0)    this.cooldown--;
        if (this.cooldown <= 0) {
            let dir = p5.Vector.sub(player.pos, this.pos).normalize();
            enemyBullets.push(new Bullet(this.pos.x, this.pos.y, dir.mult(this.stats.Bullet_Speed), "enemy",this.stats.Bullet_Damage));
            this.cooldown = this.stats.Bullet_Frequency;
        }
    }
    // 射擊子彈的速度跟方向
    take_damage() {

    }
    // 升級數值
    upgrade_stats() {

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