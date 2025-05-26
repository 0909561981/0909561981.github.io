class Game {
    // 建立game的屬性
    constructor(width, height, playerData) {
        this.map = new Map(width, height);
        this.player = new Player(width/2, height/2, playerData.max_health, playerData.movement_speed, playerData.bullet_damage, playerData.body_damage, playerData.bullet_frequency, playerData.health_regen, playerData.bullet_speed);
        this.enemies = [];
        this.bullets = [];
        this.obstacles = [];
    }

    // 初始化
    setup() {
        // 建立畫布(讓畫面適配瀏覽器)                       註記：game_facade可以使用全螢幕按鈕才呼叫
        createCanvas(windowWidth, windowHeight);
        textAlign(CENTER, CENTER);

        // 建立滑輪
        moveJoystick = new Joystick(100, this.map.height - 100);
        shootJoystick = new Joystick(this.map.width - 100, this.map.height - 100);
        moveVector = createVector(0, 0);
        shootVector = createVector(0, 0);

        // 建立暫停按鈕
        pauseButton = createButton("⏸");
        pauseButton.position(this.map.width / 2 - this.map.width/40, this.map.width/80);
        pauseButton.mousePressed(game_facade.togglePause);
        pauseButton.style("font-size", "24px");

        // 建立遊戲畫面 ( 牆壁 井 障礙物 )
        this.map.build();
    }
    
    print() {
        console.log("123");
    }
}