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
        let result = game_facade.game.map.is_walkable(next);
        if (result.walkable)    this.pos = next;
        result = game_facade.game.map.tiles.find(tile => tile.pos.x === result.pos.x && tile.pos.y === result.pos.y);
        if(result)      this.deduct_blood(result.take_damage(result.type));
    }
    // 射擊子彈的速度跟方向
    attack() {
        if (this.cooldown > 0)    this.cooldown--;
    }
    // 射擊子彈的速度跟方向
    shoot(vec) {
        if (this.cooldown <= 0) {
            game_facade.game.bullets.push(new Bullet(this.pos.x, this.pos.y, vec.copy().normalize().mult(this.stats.Bullet_Speed), "player", this.stats.Bullet_Damage));
            this.cooldown = this.stats.Bullet_Frequency;
        }
    }
    // 射擊子彈的速度跟方向
    take_damage() {
        // 現在變成去用子彈來判斷是否有傷害他人
    }
    // Player扣血 
    deduct_blood(hurt) {
        this.hp += hurt;
    }
    // 判斷是否還活著
    is_live() {
        // 判斷是否還有血量  =>  GameOver
        if(this.hp<=0)        return false;    
        return true;
    }
    // 回復血量
    recovery() {
        if (this.hp<=this.stats.Max_Health)     this.hp += this.stats.Health_Regen;
        if (this.hp>=this.stats.Max_Health)     this.hp = this.stats.Max_Health;
    }
    // 升級數值
    upgrade_stats() {
        // Upgrade.html 跟 Upgrade.js
    }
    // 展示Player的圖案跟血量
    display() {
        textSize(32);
        text("😄", this.pos.x, this.pos.y);
        stroke(255);
        fill(100);
        rect(this.pos.x - 40 / 2, this.pos.y - 30, 40, 5);
        fill(255, 0, 0);
        rect(this.pos.x - 40 / 2, this.pos.y - 30, (40*this.hp)/this.stats.Max_Health, 5);
    }
}