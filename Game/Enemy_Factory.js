class Enemy_Factory {
    // 建立game_facade的屬性
    constructor() {

    }

    // 初始生成怪物
    create_enemy(num_enemy, num_boss) {
        game_facade.game.map.tiles.forEach((w, i) => {
            if (w.type === TileType.WELL) {
                const queue = [];
                for (let j = 0; j < num_enemy; j++) queue.push("enemy");
                for (let j = 0; j < num_boss; j++)  queue.push("boss");
                shuffle(queue, true); // 打亂順序

                // 加入 spawnQueue 和 emoji 資訊
                w.queue = queue;
                w.emoji = wellEmojis[i];
            }
        });
    }

    // 派出下個怪物
    spawn_next_enemy() {
        let candidates = game_facade.game.map.tiles.filter(t => t.type === TileType.WELL).filter(w => w.queue.length > 0);

        if (candidates.length > 0) {
            let well = random(candidates);
            let type = well.queue.shift();
            let offset = p5.Vector.random2D().mult(30);
            let pos = p5.Vector.add(well.pos, offset);

            if (type === "enemy") {
                let emoji = wellEmojis[well.index];
                game_facade.game.enemies.push(new Enemy(pos.x, pos.y, emoji, well.lv, well.index));
            } else if (type === "boss") {
                let emoji = bossEmojis[well.index];
                game_facade.game.enemies.push(new Boss(pos.x, pos.y, emoji, well.lv, well.index));
            }
            // 冷卻後再隨機從其他井繼續生成
            let nextCandidates = game_facade.game.map.tiles.filter(t => t.type === TileType.WELL && t.queue.length > 0);
            if (nextCandidates.length > 0) {
                time = Date.now()
                enemyID = setTimeout(() => this.spawn_next_enemy(), 7000);
            }
        }
    }

    // 印出當前剩餘怪物              註記：debug用
    print_enemy() {
        game_facade.game.map.tiles.forEach((well, index) => {
            if(well.type === TileType.WELL)    {
                const enemyIcons = well.queue.map(type => {
                if (type === "enemy") {
                    return well.enemyEmoji || "👾"; // 預設敵人emoji
                } else if (type === "boss") {
                    return well.bossEmoji || "👹";  // 預設boss emoji
                }
                return "?";
                }).join(" ");

                console.log(`${well.emoji || "🕳️"} 井 ${well.index} (Lv${well.lv}) 剩下: ${enemyIcons}`);
                }
        });
    }
}