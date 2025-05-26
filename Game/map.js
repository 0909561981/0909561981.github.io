class Map {
    // 建立Map的屬性
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tiles = [];
        // this.game = new Game();
        // this.factory = new Enemy_Factory();
    }

    build() {
        // 建立遊戲邊界障礙物   -- wall
        const spacing = 10;
        for (let x = 0; x < this.width; x += spacing) {
            this.tiles.push(new Tile(x, 0, "wall"));
            this.tiles.push(new Tile(x, this.height - 1, "wall"));
        }
        for (let y = spacing; y < this.height - spacing; y += spacing) {
            this.tiles.push(new Tile(0, y, "wall"));
            this.tiles.push(new Tile(this.width - 1, y, "wall"));
        }

        // 建立有刺障礙物       -- spike
        this.tiles.push(new Tile(this.width / 2 - this.width * 3 / 16, this.height / 2, "spike"));
        this.tiles.push(new Tile(this.width / 2 + this.width * 3 / 16, this.height / 2, "spike"));

        // 建立井跟敵人         -- well
        this.tiles.push(new Tile(this.width / 8, this.width / 8, "well", 0));
        this.tiles.push(new Tile(this.width - this.width / 8, this.width / 8, "well", 1));
        this.tiles.push(new Tile(this.width / 8, this.height - this.width / 4, "well", 2));
        this.tiles.push(new Tile(this.width - this.width / 8, this.height - this.width / 4, "well", 3));
        this.tiles.push(new Tile(this.width / 2, this.height / 4, "well", 4));
    }

    // 判斷下一步是否能走                                  註記：game.js的ollidesWithObstacle()    Player.js的move()
    is_walkable(pos) {
        for (let ob of this.tiles) {
            if (dist(pos.x, pos.y, ob.pos.x, ob.pos.y) < 30) {
                return { walkable: false, type: ob.type, pos: ob.pos};
            }
        }
        return { walkable: true };
    }
}