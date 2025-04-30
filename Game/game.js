let player;
let bullets = [];

let enemies = [];
let enemyBullets = [];

let bosses = [];
let bossBullets = [];

let gameOver = false;
let gamePaused = false;
let enemyID;
let time;

let moveJoystick, shootJoystick;
let moveVector, shootVector;

const wells = [];
const obstacles = [];
let wells_level = [1,2,3,4,5]; // 可從後端讀取
const wellEmojis = ["😠", "🤕", "🤬", "😷", "🤮"];
const bossEmojis = ["🚓", "🚑", "🚒", "🚜", "🚁"];

let pauseButton, pauseMenu;

function setup() {
  // 建立畫布(讓畫面適配瀏覽器)
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  player = new Player(width / 2, height / 2);

  // 建立滑輪
  moveJoystick = new Joystick(100, height - 100);
  shootJoystick = new Joystick(width - 100, height - 100);
  moveVector = createVector(0, 0);
  shootVector = createVector(0, 0);

  // 建立暫停按鈕
  pauseButton = createButton("⏸");
  pauseButton.position(width / 2 - width/40, width/80);
  pauseButton.mousePressed(togglePause);
  pauseButton.style("font-size", "24px");

  // 建立井跟敵人
  wells.push({ pos: createVector(width/8, width/8), index: 0 });
  wells.push({ pos: createVector(width - width/8, width/8), index: 1 });
  wells.push({ pos: createVector(width/8, height - width/4), index: 2 });
  wells.push({ pos: createVector(width - width/8, height - width/4), index: 3 });
  wells.push({ pos: createVector(width / 2, height / 4), index: 4 });
  wells.forEach((w, i) => {
    const queue = [];
    for (let j = 0; j < 3; j++) queue.push("enemy");
    queue.push("boss");
    shuffle(queue, true); // 打亂順序
    w.spawnQueue = queue;
    w.emoji = wellEmojis[i];
    obstacles.push({ pos: w.pos, type: "well", index: i });
  });

  // 建立有刺障礙物
  obstacles.push({ pos: createVector(width / 2 - width*3/16, height / 2), type: "spike" });
  obstacles.push({ pos: createVector(width / 2 + width*3/16, height / 2), type: "spike" });

  // 建立遊戲邊界障礙物
  const spacing = 10;
  for (let x = 0; x < width; x += spacing) {
    obstacles.push({ pos: createVector(x, 0), type: "wall" });
    obstacles.push({ pos: createVector(x, height - 1), type: "wall" });
  }
  for (let y = spacing; y < height - spacing; y += spacing) {
    obstacles.push({ pos: createVector(0, y), type: "wall" });
    obstacles.push({ pos: createVector(width - 1, y), type: "wall" });
  }

  // 設定怪物生成間隔
  if (!gamePaused) {
    let candidates = wells.filter(w => w.spawnQueue.length > 0);
    if (candidates.length > 0) {
      let well = random(candidates);
      time = Date.now()
      enemyID = setTimeout(() => spawnNextFromWell(well), 4000);
    }
  }
}

function draw() {
  // 背景設為黑色
  background(0);

  // 遊戲結束畫面
  if (gameOver) {
    textSize(48);
    text("Game  Over", width / 2, height / 2);
    let btn = createButton("\u56de\u4e3b\u756b\u9762");
    btn.position(width / 2, (height*3) / 5);
    btn.mousePressed(() => window.location.href = "home.html");
    noLoop();
    return;
  }

  // 遊戲暫停畫面
  if (gamePaused) {
    pauseButton.hide();
    return;
  }

  // 滑輪
  moveJoystick.update();
  shootJoystick.update();
  moveVector = moveJoystick.getDirection();
  shootVector = shootJoystick.getDirection();

  // 障礙物款式
  obstacles.forEach(ob => {
    push();
    textSize(48);
    if (ob.type === "well") {
      text("🗑", ob.pos.x, ob.pos.y);
      fill(255);
      textSize(12);
      text("Lv " + wells_level[ob.index], ob.pos.x, ob.pos.y + 30);
    }
    else if (ob.type === "wall") {  
      noStroke();   
      fill(255, 204, 0); 
      rectMode(CENTER);  
      rect(ob.pos.x, ob.pos.y, 40, 40); 
    }
    else if (ob.type === "spike")  text("🌵", ob.pos.x, ob.pos.y);
    pop();
  });

  // Player移動
  player.update(moveVector);
  player.display();

  // Player子彈
  if (shootVector.mag() > 0)   player.shoot(shootVector);
  bullets.forEach((b, i) => {
    if (!gamePaused)  b.update();
    b.display();

    if (bulletHitsObstacle(b))    bullets.splice(i, 1);
    else if (b.offscreen())   bullets.splice(i, 1);
  });

  // Enemy移動
  enemies.forEach((e, i) => {
    if (!gamePaused)  e.update();
    e.display();

    if (e.collides(player)) {
      player.hp -= e.Body_Damage;
      e.hp -= player.Body_Damage;
      if (e.hp <= 0)  enemies.splice(i, 1);
      if (player.hp <= 0) gameOver = true;
    }

    bullets.forEach((b, j) => {
      if (b.hits(e)) {
        bullets.splice(j, 1);
        e.hp -= player.Bullet_Damage;
        if (e.hp <= 0)  enemies.splice(i, 1);
        }
    });
  });

  // Enemy子彈
  enemyBullets.forEach((eb, i) => {
    if (!gamePaused)  eb.update();
    eb.display();

    if (bulletHitsObstacle(eb)) {
      enemyBullets.splice(i, 1);
      return;
    }

    if (eb.hits(player)) {
      player.hp -= eb.Bullet_Damage;
      enemyBullets.splice(i, 1);
      if (player.hp <= 0) gameOver = true;
    } 
    else if (eb.offscreen())    enemyBullets.splice(i, 1);
  });

  // Boss移動
  bosses.forEach((B, i) => {
    if (!gamePaused)  B.update();
    B.display();

    if (B.collides(player)) {
      player.hp -= B.Body_Damage;
      B.hp -= player.Body_Damage;
      if (B.hp <= 0)  {
        bosses.splice(i, 1);
        reload(B.index);
      }
      if (player.hp <= 0) gameOver = true;
    }

    bullets.forEach((b, j) => {
      if (b.hits(B)) {
        bullets.splice(j, 1);
        B.hp -= player.Bullet_Damage;
        if (B.hp <= 0)  {
          bosses.splice(i, 1);
          console.log("lv. ",wells_level[B.index]," 被擊敗");
          reload(B.index);
        }
      }
    });
  });

  // Boss子彈
  bossBullets.forEach((bb, i) => {
    if (!gamePaused)  bb.update();
    bb.display();

    if (bulletHitsObstacle(bb)) {
      bossBullets.splice(i, 1);
      return;
    }

    if (bb.hits(player)) {
      player.hp -= bb.Bullet_Damage;
      bossBullets.splice(i, 1);
      if (player.hp <= 0) gameOver = true;
    }
    else if (bb.offscreen())    bossBullets.splice(i, 1);
  });

  // 詳情請查看Joystick.js
  moveJoystick.display();
  shootJoystick.display();
}

function spawnNextFromWell(well) {
  if (well.spawnQueue.length === 0) return;

  let type = well.spawnQueue.shift();
  let offset = p5.Vector.random2D().mult(30);
  let pos = p5.Vector.add(well.pos, offset);

  if (type === "enemy") {
    let emoji = well.emoji;
    enemies.push(new Enemy(pos.x, pos.y, emoji));
  } else if (type === "boss") {
    let emoji = bossEmojis[well.index];
    bosses.push(new Boss(pos.x, pos.y, emoji, well.index));
    console.log(emoji,"這個BOSS是lv",wells_level[well.index]);
  }
  
  // 冷卻並生成小怪
  let candidates = wells.filter(w => w.spawnQueue.length > 0);
  if (candidates.length > 0) {
    let well = random(candidates);
    time = Date.now()
    enemyID = setTimeout(() => spawnNextFromWell(well), 7000);
  }
}

let spikeDamageCooldown = new Set();
function collidesWithObstacle(pos) {
  for (let ob of obstacles) {
    if (dist(pos.x, pos.y, ob.pos.x, ob.pos.y) < 30) {
      if (ob.type === "spike") {
        let id = `${ob.pos.x},${ob.pos.y}`;
        if (!spikeDamageCooldown.has(id)) {
          spikeDamageCooldown.add(id);
          player.hp--;
          if (player.hp <= 0) gameOver = true;
          setTimeout(() => spikeDamageCooldown.delete(id), 1000);
        }
      }
      return true;
    }
  }
  return false;
}

function reload(index) {
  clearTimeout(enemyID);
  wells.forEach(well => {
    well.queue = [];
  });
  enemies = [];
  enemyBullets = [];
  bosses = [];
  bossBullets = [];

  // 刷新井的等級跟敵人
  let lv = wells_level[index];
  for (let i = 0; i < wells_level.length; i++)    wells_level[(index + i) % wells_level.length] = lv + i;

  // 重新生成enemy跟boss
  wells.forEach((w, i) => {
    const queue = [];
    for (let j = 0; j < 3; j++) queue.push("enemy");
    queue.push("boss");
    shuffle(queue, true); // 打亂順序
    w.spawnQueue = queue;
    let obstacle = obstacles.find(ob => ob.type === "well" && ob.pos.equals(w.pos));
  });

  let candidates = wells.filter(w => w.spawnQueue.length > 0);
  if (candidates.length > 0) {
    let well = random(candidates);
    time = Date.now()
    enemyID = setTimeout(() => spawnNextFromWell(well), 4000);
  }
}

// 暫停頁面
function togglePause() {
  wells.forEach((well, index) => {
    const enemyIcons = well.spawnQueue.map(type => {
      if (type === "enemy") {
        return well.enemyEmoji || "👾"; // 預設敵人emoji
      } else if (type === "boss") {
        return well.bossEmoji || "👹";  // 預設boss emoji
      }
      return "?";
    }).join(" ");

    console.log(`${well.emoji || "🕳️"} 井 ${index + 1} (Lv${well.level}) 剩下: ${enemyIcons}`);
  });

  gamePaused = !gamePaused;
  if (gamePaused) {
    pauseButton.hide();
    clearTimeout(enemyID);
    time = Date.now() - time;

    pauseMenu = createElement('div');
    pauseMenu.style('background', 'rgba(0,0,0,0.8)');
    pauseMenu.style('padding', '20px');
    pauseMenu.style('border-radius', '10px');
    pauseMenu.style('color', 'white');
    pauseMenu.style('text-align', 'center');
    pauseMenu.style('width', '100%');
    pauseMenu.style('height', '100%');
    pauseMenu.style('position', 'absolute');
    pauseMenu.style('top', '0');
    pauseMenu.style('left', '0');
    pauseMenu.style('display', 'flex');
    pauseMenu.style('flex-direction', 'column');
    pauseMenu.style('justify-content', 'center');
    pauseMenu.style('align-items', 'center');

    let title = createElement('h2', '遊戲暫停');
    title.style('margin-bottom', '30px');
    pauseMenu.child(title);

    let topButtonDiv = createElement('div');
    topButtonDiv.style('display', 'flex');
    topButtonDiv.style('gap', '20px');
    topButtonDiv.style('justify-content', 'center');

    let resumeButton = createButton('繼續遊戲');
    resumeButton.mousePressed(resumeGame);
    resumeButton.style('padding', '15px 30px');
    resumeButton.style('font-size', '18px');
    topButtonDiv.child(resumeButton);

    let upgradeButton = createButton('升級能力');
    upgradeButton.mousePressed(() => location.href = 'Upgrade.html');
    upgradeButton.style('padding', '15px 30px');
    upgradeButton.style('font-size', '18px');
    topButtonDiv.child(upgradeButton);

    pauseMenu.child(topButtonDiv);

    let bottomButtonDiv = createElement('div');
    bottomButtonDiv.style('display', 'flex');
    bottomButtonDiv.style('gap', '20px');
    bottomButtonDiv.style('justify-content', 'center');

    let saveButton = createButton('儲存進度');
    saveButton.mousePressed(() => alert('儲存進度尚未實作'));
    saveButton.style('padding', '15px 30px');
    saveButton.style('font-size', '18px');
    bottomButtonDiv.child(saveButton);

    let exitButton = createButton('離開遊戲');
    exitButton.mousePressed(() => location.href = 'home.html');
    exitButton.style('padding', '15px 30px');
    exitButton.style('font-size', '18px');
    bottomButtonDiv.child(exitButton);

    let helpButton = createButton('說明');
    helpButton.mousePressed(() => location.href = 'about.html');
    helpButton.style('padding', '15px 30px');
    helpButton.style('font-size', '18px');
    bottomButtonDiv.child(helpButton);

    pauseMenu.child(bottomButtonDiv);

    document.body.appendChild(pauseMenu.elt);
  }
}

// 繼續遊戲
function resumeGame() {
  gamePaused = false;
  if (pauseMenu) pauseMenu.remove();
  pauseButton.show();
  
  let candidates = wells.filter(w => w.spawnQueue.length > 0);
  if (candidates.length > 0) {
    let well = random(candidates);
    enemyID = setTimeout(() => spawnNextFromWell(well), 7000-time);
    time = Date.now()
  }
}