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
    take_damage(type) {
        if(type === TileType.WALL)            return 0;
        else if(type === TileType.WELL)       return 0;        
        else if(type === TileType.SPIKE)      return -0.1;     // 目前是會持續扣血  也可改成每隔X秒扣血一次
    }
}