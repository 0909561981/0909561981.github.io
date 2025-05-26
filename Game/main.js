let playerData = null;

let game_facade;

let time;
let enemyID;

const wellEmojis = ["😠", "🤕", "🤬", "😷", "🤮"];
const bossEmojis = ["🚓", "🚑", "🚒", "🚜", "🚁"];

let moveJoystick, shootJoystick;
let moveVector, shootVector;

let pauseButton, pauseMenu;
let game_over = false;
let game_paused = false;
let bool_ready = false;

let spike_damage_cooldown = new Set();

//-------------------------------------------------------------------------------

// 讀取 URL 參數取得 account
function getAccount() {
    let account = localStorage.getItem('account') || new URLSearchParams(window.location.search).get('account');
    return account || '';
}

// 前端跟後端拿資料
async function fetchPlayerInfo(account) {
  try {
    const data = await ApiService.postToBackend('/get_player_info', { account });

    if (data && data.success) {
      console.log('✅ 玩家資料取得成功：', data);
      return data;
    } else {
      console.warn('⚠️ 找不到該玩家資訊：', data);
      return undefined;
    }
  } catch (error) {
    console.error('🚨 請求玩家資訊時發生錯誤：', error);
    return undefined;
  }
}

// 前端跟後端拿資料 
async function main() {
    const account = getAccount();
    try {
        playerData = await fetchPlayerInfo(account);
        if (!playerData)    throw new Error("玩家資料取得失敗");
        bool_ready = true;
    }
    catch (err) {    console.error(err);       }
}

// 初始setup()
function setup() {
    // 建立畫布(讓畫面適配瀏覽器)
    createCanvas(windowWidth, windowHeight);
    textAlign(CENTER, CENTER);

    // 等前端跟後端拿完資料 才能執行的程式
    main().then(() => {    
        game_facade = new Game_Facade(width, height, playerData);
        game_facade.game.setup();

        game_facade.factory.create_enemy(3,1);
        setTimeout(() => game_facade.factory.spawn_next_enemy(), 3000);

        // 其他初始化邏輯可以寫在這裡
    });
}

// 去繪圖 (會一直呼叫)
function draw() {
    if(game_paused)     return;

    // 如果後端還沒載入完成就return                註記：要main()跑完再開始話比較好 不然會物件畫不出來   =>   可以設flag == true 來判斷
    if (!bool_ready)   return;
    if (!game_facade.game.player)   return; 
    
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
    game_facade.game.map.tiles.forEach(ob => {
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
    if(!game_facade.game.player.is_live()) {
        game_facade.Game_Over();
        return;
    }
    game_facade.game.player.move(moveVector);
    game_facade.game.player.attack(moveVector);
    game_facade.game.player.display();

    // Player攻擊
    game_facade.game.player.attack();
    if (shootVector.mag() > 0)   game_facade.game.player.shoot(shootVector);

    // 
    game_facade.game.player.recovery();

    // Enemies移動
    if(game_facade.game.enemies) {
        death = game_facade.game.enemies.filter(enemy => !enemy.is_live());
        death.forEach(enemy => {
            let bossIndex = bossEmojis.indexOf(enemy.emoji);
            if (bossIndex !== -1) {
                game_facade.reload(bossIndex);
            }
        });

        game_facade.game.enemies = game_facade.game.enemies.filter(enemy => enemy.is_live());   // 判斷是否還活著
        game_facade.game.enemies.forEach(enemy => {
            enemy.move();
            enemy.attack();
            enemy.display();
        });
    }
    
    // 子彈移動
    for (let i = game_facade.game.bullets.length - 1; i >= 0; i--) {
        let b = game_facade.game.bullets[i];

        // 若移動後不合法（例如撞牆）或已出畫面，移除
        if (!b.move(b.vel)) {
            game_facade.game.bullets.splice(i, 1);
            continue;
        }

        b.display();
    }
}