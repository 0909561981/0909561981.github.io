class Tile {
    // 建立Tile的屬性
    constructor(x, y, type, index = -1) {
        this.pos = createVector(x, y);
        this.type = type;
        this.index = index                  // well 專屬
        this.lv = playerData.lv + index;    // well 專屬
        this.queue = [];                    // well 專屬
        this.emoji = null;                  // well 專屬
    }
    // 判斷是否撞到障礙物and傷害
    take_damage(type,pos) {
        if(type === "wall")            return 0;
        else if(type === "well")       return 0;        
        else if(type === "spike") {
            // let id = `${pos.x},${pos.y}`;
            // if (!spike_damage_cooldown.has(id)) {
            //     console.log("1223");
            //     spike_damage_cooldown.add(id);
            //     setTimeout(() => spike_damage_cooldown.delete(id), 1000);
            //     return -1;
            // }
            return -0.1;
        }
    }
}