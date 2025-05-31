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
        // setup()
        game_facade.setup();
    });
}

// 去繪圖 (會一直呼叫)
function draw() {
    // 如果後端還沒載入完成就return                註記：要main()跑完再開始話比較好 不然會物件畫不出來   =>   可以設flag == true 來判斷
    if (!bool_ready)   return;
    if (!game_facade.game.player)   return; 
    
    // draw()
    game_facade.draw();
}

// 處理放大縮小問題
window.onload = () => {
  document.addEventListener('touchstart', (event) => {
    if (event.touches.length > 1) {
       event.preventDefault();
    }
  });
  
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
}