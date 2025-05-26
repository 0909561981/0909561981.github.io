class Player {
    // 建立Player的屬性
    constructor(x, y, Max_Health, Movement_Speed, Bullet_Damage, Body_Damage, Bullet_Frequency, Health_Regen, Bullet_Speed) {
        this.pos = createVector(x, y);
        this.stats = new Stats("player", Max_Health, Movement_Speed, Bullet_Damage, Body_Damage, Bullet_Frequency, Health_Regen, Bullet_Speed);

        this.cooldown = 0;
        this.hp = this.stats.Max_Health;
    }

    // 更新Player的位置跟冷卻時間
    move(vec) {
        let next = this.pos.copy().add(vec.copy().mult(this.stats.Movement_Speed));
        if (!collidesWithObstacle(next, true))    this.pos = next;
    }
    // 射擊子彈的速度跟方向
    attack() {
        if (this.cooldown > 0)    this.cooldown--;
        if (this.cooldown <= 0) {
            bullets.push(new Bullet(this.pos.x, this.pos.y, vec.copy().normalize().mult(this.stats.Bullet_Speed), "player", this.stats.Bullet_Damage));
            this.cooldown = this.stats.Bullet_Frequency;
        }
    }
    // 射擊子彈的速度跟方向
    take_damage() {

    }
    // 回復血量
    recovery() {
        if (player.hp<=player.Max_Health)     player.hp += this.Health_Regen;
        if (player.hp>=player.Max_Health)     player.hp = this.Max_Health;
    }
    // 升級數值
    upgrade_stats() {

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
}