class Game_Facade {
    // 建立Game_Facade的屬性
    constructor(width, height, playerData) {
        this.game = new Game(width, height, playerData);
        this.factory = new Enemy_Factory();
    }    

    // 遊戲初始化
    setup() {
        this.game.setup();

        this.factory.create_enemy(3,1);
        setTimeout(() => this.factory.spawn_next_enemy(), 3000);
    }

    // draw()
    draw() {
        if(game_paused)     return;
    
        // 背景設為黑色
        background(0);

        // 詳情請查看Joystick.js
        moveJoystick.display();
        shootJoystick.display();
        moveJoystick.update();
        shootJoystick.update();
        moveVector = moveJoystick.getDirection();
        shootVector = shootJoystick.getDirection();

        // 畫障礙物款式
        this.game.map.tiles.forEach(ob => {
            push();
            textSize(48);
            if (ob.type === TileType.WELL) {
                text("🗑", ob.pos.x, ob.pos.y);
                fill(255);
                textSize(12);
                text("Lv " + ob.lv, ob.pos.x, ob.pos.y + 30);
            }
            else if (ob.type === TileType.WALL) {  
                noStroke();   
                fill(255, 204, 0); 
                rectMode(CENTER);  
                rect(ob.pos.x, ob.pos.y, 40, 40); 
            }
            else if (ob.type === TileType.SPIKE)  text("🌵", ob.pos.x, ob.pos.y);
            pop();
        });

        // Player移動
        if(!this.game.player.is_live()) {
            this.game.Game_Over();
            return;
        }
        this.game.player.move(moveVector);
        this.game.player.attack(moveVector);
        this.game.player.display();

        // Player攻擊
        this.game.player.attack();
        if (shootVector.mag() > 0)   this.game.player.shoot(shootVector);

        // Player回血
        this.game.player.recovery();

        // Enemies移動
        if(this.game.enemies) {
            let death = this.game.enemies.filter(enemy => !enemy.is_live());
            death.forEach(enemy => {
                let bossIndex = bossEmojis.indexOf(enemy.emoji);
                if (bossIndex !== -1) {
                    this.game.reload(bossIndex);
                }
            });

            this.game.enemies = this.game.enemies.filter(enemy => enemy.is_live());   // 判斷是否還活著
            this.game.enemies.forEach(enemy => {
                enemy.move();
                enemy.attack();
                enemy.display();
            });
        }
        
        // 子彈移動
        for (let i = this.game.bullets.length - 1; i >= 0; i--) {
            let b = this.game.bullets[i];

            // 若移動後不合法（例如撞牆）或已出畫面，移除
            if (!b.move(b.vel)) {
                this.game.bullets.splice(i, 1);
                continue;
            }

            b.display();
        }
    }       
}