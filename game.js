let player;
let bullets = [];
let enemies = [];
let enemyBullets = [];
let boss = null;
let bossActive = false;
let gameOver = false;
let gameTime = 30;
let timer;
let playerHitCount = 0;

// 虛擬搖桿
let moveJoystick, shootJoystick;
let moveVector, shootVector;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  player = new Player(width / 2, height / 2);

  moveJoystick = new Joystick(100, height - 100);
  shootJoystick = new Joystick(width - 100, height - 100);

  moveVector = createVector(0, 0);
  shootVector = createVector(0, 0);

  timer = setInterval(() => {
    if (gameTime > 0) {
      gameTime--;
    } else if (!bossActive) {
      spawnBoss();
    }
  }, 1000);
}

function draw() {
  background(0);

  fill(255);
  textSize(24);
  text(bossActive ? "∞" : gameTime, width / 2, 40);

  if (gameOver) {
    textSize(48);
    text("Game Over", width / 2, height / 2);
    let btn = createButton("回主畫面");
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

  enemyBullets.forEach((eb, i) => {
    eb.update();
    eb.display();
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
    if (b.offscreen()) bullets.splice(i, 1);
  });

  enemies.forEach((e, i) => {
    e.update();
    e.display();

    bullets.forEach((b, j) => {
      if (b.hits(e)) {
        bullets.splice(j, 1);
        enemies.splice(i, 1);
      }
    });
  });

  enemyBullets.forEach((eb, i) => {
    eb.update();
    eb.display();
    if (eb.offscreen()) enemyBullets.splice(i, 1);
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

function keyPressed() {
  if (key === ' ') {
    let x = random(50, width - 50);
    let y = random(50, height - 50);
    enemies.push(new Enemy(x, y));
  }
}

// === Classes ===

class Player {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.cooldown = 0;
  }

  update(vec) {
    if (vec.mag() > 0.1) { // 增加門檻
      this.pos.add(vec.copy().mult(5));
    }
    this.pos.x = constrain(this.pos.x, 0, width);
    this.pos.y = constrain(this.pos.y, 0, height);
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

class Enemy {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.cooldown = int(random(30, 90));
    this.moveDir = p5.Vector.random2D().mult(2);
    this.changeDirCounter = 0;
  }

  update() {
    this.pos.add(this.moveDir);
    this.pos.x = constrain(this.pos.x, 0, width);
    this.pos.y = constrain(this.pos.y, 0, height);

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
    text("😢", this.pos.x, this.pos.y);
  }
}


class Boss {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.hp = 3;
    this.bullets = [];
    this.cooldown = 0;
    this.moveDir = p5.Vector.random2D().mult(2);
    this.changeDirCounter = 0;
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
    text("👹", this.pos.x, this.pos.y);
  }
}


class Joystick {
  constructor(x, y) {
    this.base = createVector(x, y);
    this.knob = this.base.copy();
    this.radius = 40;
    this.dragging = false;
    this.active = false;
  }

  update() {
    if (mouseIsPressed && dist(mouseX, mouseY, this.base.x, this.base.y) < this.radius * 2) {
      this.dragging = true;
      this.active = true;
      this.knob = createVector(mouseX, mouseY);
    } else if (!mouseIsPressed) {
      this.dragging = false;
      this.knob = this.base.copy();
      this.active = false;
    }
  }

  getDirection() {
    return p5.Vector.sub(this.knob, this.base).normalize();
  }

  display() {
    noFill();
    stroke(255);
    ellipse(this.base.x, this.base.y, this.radius * 2.5);
    fill(200);
    ellipse(this.knob.x, this.knob.y, this.radius);
  }
}

function spawnBoss() {
  boss = new Boss(width / 2, height / 3);
  bossActive = true;
  enemies = [];
  enemyBullets = [];
}

function touchMoved() {
  return false; // 防止預設觸控行為阻止畫面更新
}