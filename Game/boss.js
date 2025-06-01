class Boss {
    // 建立Boss的屬性
    constructor(x, y, emoji = "👹", lv, index) {
        this.pos = createVector(x, y);
        this.stats = new Stats("boss", lv, lv, lv, lv, lv, lv, lv);

        this.lv = lv;
        this.cooldown = this.stats.Bullet_Frequency;
        this.hp = this.stats.Max_Health;

        this.moveDir = p5.Vector.random2D().mult(this.stats.Movement_Speed);
        this.changeDirCounter = 0;
    
        this.emoji = emoji;
        this.index = index;
    }
    
    // 更新Boss的位置跟方向跟冷卻時間
    move() {
        let next = this.pos.copy().add(this.moveDir);
        let result = game_facade.game.map.is_walkable(next);
        if (result.walkable)    this.pos = next;

        this.changeDirCounter++;
        if (this.changeDirCounter > 60) {
            this.moveDir = p5.Vector.random2D().mult(this.stats.Movement_Speed);
            this.changeDirCounter = 0;
        }
        
        if(this.is_collides(game_facade.game.player)) {
            this.deduct_blood(-1 * game_facade.game.player.stats.Body_Damage);
            game_facade.game.player.deduct_blood(-1 * this.stats.Body_Damage);
        }
    }
    // 射擊子彈的速度跟方向
    attack() {
        if (this.cooldown > 0)    this.cooldown--;
        if (this.cooldown <= 0) {
            let dir1 = p5.Vector.sub(game_facade.game.player.pos, this.pos).normalize().rotate(PI / 12);
            let dir2 = p5.Vector.sub(game_facade.game.player.pos, this.pos).normalize().rotate(-PI / 12);
            game_facade.game.bullets.push(new Bullet(this.pos.x, this.pos.y, dir1.mult(this.stats.Bullet_Speed), "enemy", this.stats.Bullet_Damage, this.lv));
            game_facade.game.bullets.push(new Bullet(this.pos.x, this.pos.y, dir2.mult(this.stats.Bullet_Speed), "enemy", this.stats.Bullet_Damage, this.lv));
            this.cooldown = this.stats.Bullet_Frequency;
        }
    }
    // Boss扣血 
    deduct_blood(hurt) {
        this.hp += hurt;
    }
    // 判斷是否還活著
    is_live() {
        // 判斷是否還有血量  =>  GameOver
        if(this.hp<=0)        return false;    
        return true;
    }
    // 展示Boss的圖案跟血量
    display() {
        textSize(game_facade.game.width * 0.04);  // textSize(32);
        text(this.emoji, this.pos.x, this.pos.y);
        stroke(255);
        fill(100);
        rect(this.pos.x - 40 / 2, this.pos.y - 30, 40, 5);
        fill(255, 0, 0);
        rect(this.pos.x - 40 / 2, this.pos.y - 30, 40 * (this.hp/this.stats.Max_Health), 5);
    }
    // 檢查碰撞
    is_collides(player) {
        return dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y) < 20;
    }
}