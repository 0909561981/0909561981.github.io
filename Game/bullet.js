class Bullet {
    // 建立Bullet的屬性
    constructor(x, y, vel, type, damage) {
        this.pos = createVector(x, y);
        this.vel = vel; // 速度
        this.type = type;
        this.Bullet_Damage = damage;
    }

    // 更新Bullet的位置
    move(player) {
        let next = this.pos.copy().add(this.vel);
        // 是否撞到障礙物
        let result = game_facade.game.map.is_walkable(next);
        if (result.walkable)    this.pos = next;
        else        return false;

        // 是否撞到人
        if(this.type === "player") {
            for (let enemy of game_facade.game.enemies) {
                if (this.bool_hit(enemy)) {
                    // 扣血 and 讓子彈消失
                    enemy.deduct_blood(-1 * this.Bullet_Damage);
                    return false;
                }
            }
        }
        else if(this.type === "enemy" || this.type === "boss") {
            if (this.bool_hit(game_facade.game.player)) {
                
                // 扣血 and 讓子彈消失
                game_facade.game.player.deduct_blood(-1 * this.Bullet_Damage);
                return false;
            }
        }
        return true;
    }
    // 判斷子彈是否與目標發生碰撞
    bool_hit(target) {
        if (!target || !target.pos) return false;
        return dist(this.pos.x, this.pos.y, target.pos.x, target.pos.y) < 25;
    }
    // 展示Bullet的圖案跟血量
    display() {
        fill(this.type === "player" ? "yellow" : "red");
        ellipse(this.pos.x, this.pos.y, 10);
    }
}