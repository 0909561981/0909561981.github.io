// === 你的程式碼開頭不變 ===
let player;
let bullets = [];
let enemies = [];
let enemyBullets = [];
let boss = null;
let bossActive = false;
let gameOver = false;
let playerHitCount = 0;

let moveJoystick, shootJoystick;
let moveVector, shootVector;

const wells = [];
const obstacles = []; // 包含井位、牆壁、尖刺牆

const wellEmojis = ["😠", "😡", "🤬", "😈", "👿"];
const bossEmojis = ["🚓", "🚑", "🚒", "🚜", "🚁"];

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  player = new Player(width / 2, height / 2);

  moveJoystick = new Joystick(100, height - 100);
  shootJoystick = new Joystick(width - 100, height - 100);

  moveVector = createVector(0, 0);
  shootVector = createVector(0, 0);

  wells.push({ pos: createVector(100, 100), level: 1 });
  wells.push({ pos: createVector(width - 100, 100), level: 2 });
  wells.push({ pos: createVector(100, height - 200), level: 3 });
  wells.push({ pos: createVector(width - 100, height - 200), level: 4 });
  wells.push({ pos: createVector(width / 2, height / 4), level: 5 });

  wells.forEach((w, i) => {
    const queue = [];
    for (let j = 0; j < 3; j++) queue.push("enemy");
    queue.push("boss");
    shuffle(queue, true);
    w.spawnQueue = queue;
    w.emoji = wellEmojis[i]; // 固定對應的表情符號
    obstacles.push({ pos: w.pos, type: "well", level: w.level });
  });

  obstacles.push({ pos: createVector(width / 2 - 150, height / 2), type: "wall" });
  obstacles.push({ pos: createVector(width / 2 + 150, height / 2), type: "spike" });

  setInterval(() => {
    let candidates = wells.filter(w => w.spawnQueue.length > 0);
    if (candidates.length > 0) {
      let well = random(candidates);
      spawnNextFromWell(well);
    }
  }, 5000); // 每 5 秒觸發一次
}

function draw() {
  background(0);

  if (gameOver) {
    textSize(48);
    text("Game Over", width / 2, height / 2);
    let btn = createButton("\u56de\u4e3b\u756b\u9762");
    btn.position(width / 2 - 50, height / 2 + 50);
    btn.mousePressed(() => window.location.href = "home.html");
    noLoop();
    return;
  }

  moveJoystick.update();
  shootJoystick.update();

  moveVector = moveJoystick.getDirection();
  shootVector = shootJoystick.getDirection();

  player.update(moveVector);
  player.display();

  obstacles.forEach(ob => {
    push();
    if (ob.type === "well") fill(100, 100, 255);
    else if (ob.type === "wall") fill(255, 204, 0);
    else if (ob.type === "spike") fill(255, 0, 0);
    rectMode(CENTER);
    rect(ob.pos.x, ob.pos.y, 40, 40);

    if (ob.type === "well") {
      fill(255);
      textSize(14);
      text("Lv" + ob.level, ob.pos.x, ob.pos.y + 30);
    }
    pop();
  });

  enemyBullets.forEach((eb, i) => {
    eb.update();
    eb.display();

    if (bulletHitsObstacle(eb)) {
      enemyBullets.splice(i, 1);
      return;
    }

    if (eb.hits(player)) {
      playerHitCount++;
      enemyBullets.splice(i, 1);
      if (playerHitCount >= 3) gameOver = true;
    } else if (eb.offscreen()) {
      enemyBullets.splice(i, 1);
    }
  });

  if (shootVector.mag() > 0) {
    player.shoot(shootVector);
  }

  bullets.forEach((b, i) => {
    b.update();
    b.display();

    if (bulletHitsObstacle(b)) {
      bullets.splice(i, 1);
    } else if (b.offscreen()) {
      bullets.splice(i, 1);
    }
  });

  enemies.forEach((e, i) => {
    e.update();
    e.display();

    if (e.collides(player)) {
      playerHitCount++;
      enemies.splice(i, 1);
      if (playerHitCount >= 3) gameOver = true;
    }

    bullets.forEach((b, j) => {
      if (b.hits(e)) {
        bullets.splice(j, 1);
        enemies.splice(i, 1);
      }
    });
  });

  if (boss) {
    boss.update();
    boss.display();

    bullets.forEach((b, i) => {
      if (b.hits(boss)) {
        boss.hp--;
        bullets.splice(i, 1);
        if (boss.hp <= 0) {
          boss = null;
          textSize(48);
          fill(255, 0, 0);
          text("You Win!", width / 2, height / 2);
          noLoop();
        }
      }
    });

    boss.bullets.forEach((bb, i) => {
      bb.update();
      bb.display();
      if (bb.hits(player)) {
        playerHitCount++;
        boss.bullets.splice(i, 1);
        if (playerHitCount >= 3) gameOver = true;
      }
    });
  }

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
    let emoji = bossEmojis[well.level - 1];
    boss = new Boss(pos.x, pos.y, emoji);
    bossActive = true;
  }

  if (well.spawnQueue.length > 0) {
    setTimeout(() => spawnNextFromWell(well), 3000);
  }
}

function bulletHitsObstacle(bullet) {
  return obstacles.some(ob => dist(bullet.pos.x, bullet.pos.y, ob.pos.x, ob.pos.y) < 25);
}

class Player {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.cooldown = 0;
  }

  update(vec) {
    let next = this.pos.copy().add(vec.copy().mult(5));
    if (!collidesWithObstacle(next, true)) {
      this.pos = next;
    }
    if (this.cooldown > 0) this.cooldown--;
  }

  display() {
    textSize(32);
    text("😄", this.pos.x, this.pos.y);
  }

  shoot(vec) {
    if (this.cooldown <= 0) {
      bullets.push(new Bullet(this.pos.x, this.pos.y, vec.copy().normalize().mult(7), "player"));
      this.cooldown = 15;
    }
  }
}

class Enemy {
  constructor(x, y, emoji = "😢") {
    this.pos = createVector(x, y);
    this.cooldown = int(random(30, 90));
    this.moveDir = p5.Vector.random2D().mult(2);
    this.changeDirCounter = 0;
    this.emoji = emoji;
  }

  update() {
    let next = this.pos.copy().add(this.moveDir);
    if (!collidesWithObstacle(next)) this.pos = next;

    this.changeDirCounter++;
    if (this.changeDirCounter > 30) {
      this.moveDir = p5.Vector.random2D().mult(2);
      this.changeDirCounter = 0;
    }

    this.cooldown--;
    if (this.cooldown <= 0) {
      let dir = p5.Vector.sub(player.pos, this.pos).normalize();
      enemyBullets.push(new Bullet(this.pos.x, this.pos.y, dir.mult(4), "enemy"));
      this.cooldown = int(random(60, 100));
    }
  }

  display() {
    textSize(32);
    text(this.emoji, this.pos.x, this.pos.y);
  }

  collides(p) {
    return dist(this.pos.x, this.pos.y, p.pos.x, p.pos.y) < 30;
  }
}

let spikeDamageCooldown = new Set();

function collidesWithObstacle(pos, checkSpike = true) {
  for (let ob of obstacles) {
    if (dist(pos.x, pos.y, ob.pos.x, ob.pos.y) < 30) {
      if (ob.type === "spike" && checkSpike) {
        let id = `${ob.pos.x},${ob.pos.y}`;
        if (!spikeDamageCooldown.has(id)) {
          spikeDamageCooldown.add(id);
          playerHitCount++;
          if (playerHitCount >= 3) gameOver = true;
          setTimeout(() => spikeDamageCooldown.delete(id), 1000);
        }
      }
      return true;
    }
  }
  return false;
}

class Bullet {
  constructor(x, y, vel, type) {
    this.pos = createVector(x, y);
    this.vel = vel;
    this.type = type;
  }

  update() {
    this.pos.add(this.vel);
  }

  display() {
    fill(this.type === "player" ? "yellow" : "red");
    ellipse(this.pos.x, this.pos.y, 10);
  }

  offscreen() {
    return (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height);
  }

  hits(target) {
    return dist(this.pos.x, this.pos.y, target.pos.x, target.pos.y) < 25;
  }
}

class Boss {
  constructor(x, y, emoji = "👹") {
    this.pos = createVector(x, y);
    this.hp = 3;
    this.bullets = [];
    this.cooldown = 0;
    this.moveDir = p5.Vector.random2D().mult(2);
    this.changeDirCounter = 0;
    this.emoji = emoji;
  }

  update() {
    this.pos.add(this.moveDir);
    this.pos.x = constrain(this.pos.x, 0, width);
    this.pos.y = constrain(this.pos.y, 0, height);

    this.changeDirCounter++;
    if (this.changeDirCounter > 40) {
      this.moveDir = p5.Vector.random2D().mult(2);
      this.changeDirCounter = 0;
    }

    if (this.cooldown <= 0) {
      let dir1 = p5.Vector.sub(player.pos, this.pos).normalize().rotate(PI / 12);
      let dir2 = p5.Vector.sub(player.pos, this.pos).normalize().rotate(-PI / 12);
      this.bullets.push(new Bullet(this.pos.x, this.pos.y, dir1.mult(5), "enemy"));
      this.bullets.push(new Bullet(this.pos.x, this.pos.y, dir2.mult(5), "enemy"));
      this.cooldown = 60;
    } else {
      this.cooldown--;
    }

    this.bullets.forEach((b, i) => {
      b.update();
      if (b.offscreen()) this.bullets.splice(i, 1);
    });
  }

  display() {
    textSize(48);
    text(this.emoji, this.pos.x, this.pos.y);
  }
}

class Joystick {
  constructor(x, y) {
    this.base = createVector(x, y);
    this.knob = this.base.copy();
    this.radius = 40;
    this.active = false;
  }

  update() {
    this.active = false;
    this.knob = this.base.copy();

    let controllingPoint = null;

    if (touches.length > 0) {
      let closestTouch = null;
      let minDist = Infinity;

      for (let t of touches) {
        let d = dist(t.x, t.y, this.base.x, this.base.y);
        if (d < this.radius * 2.5 && d < minDist) {
          minDist = d;
          closestTouch = t;
        }
      }

      if (closestTouch) {
        controllingPoint = createVector(closestTouch.x, closestTouch.y);
      }
    } else if (mouseIsPressed) {
      let d = dist(mouseX, mouseY, this.base.x, this.base.y);
      if (d < this.radius * 2.5) {
        controllingPoint = createVector(mouseX, mouseY);
      }
    }

    if (controllingPoint) {
      this.knob = controllingPoint;
      this.active = true;
    }
  }

  getDirection() {
    return p5.Vector.sub(this.knob, this.base).limit(1);
  }

  display() {
    noFill();
    stroke(255);
    ellipse(this.base.x, this.base.y, this.radius * 2.5);
    fill(200);
    ellipse(this.knob.x, this.knob.y, this.radius);
  }
}

function touchMoved() {
  return false;
}
