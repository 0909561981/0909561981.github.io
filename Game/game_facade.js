class Game_Facade {
    // 建立Game_Facade的屬性
    constructor(width, height, playerData) {
        this.game = new Game(width, height, playerData);
        this.factory = new Enemy_Factory();
    }    

    // GameOver畫面
    Game_Over(){
        pauseButton.hide();
        textSize(48);
        text("Game  Over", width / 2, height / 2);
        let btn = createButton("\u56de\u4e3b\u756b\u9762");
        btn.position(width / 2, (height*3) / 5);
        btn.mousePressed(async () => {
            const account = getAccount();
            console.log( game_facade.game.map.tiles.filter(t => t.type === TileType.WELL).find(t => t.index === 0).lv);
            await this.saveRecord1(account, game_facade.game.map.tiles.filter(t => t.type === TileType.WELL).find(t => t.index === 0).lv);
            await this.saveProgress();
            
            window.location.href = `home.html?account=${encodeURIComponent(account)}`;
        });
        noLoop();
    }

    // 繼續遊戲
    resumeGame() {
        game_paused = false;
        if (pauseMenu) pauseMenu.remove();
        pauseButton.show();
        
        
        enemyID = setTimeout(() => this.factory.spawn_next_enemy(), 7000-time);
        time = Date.now()
    }

    // 打完Boss後整理關卡 
    reload(index) {
        clearTimeout(enemyID);
        let candidates = game_facade.game.map.tiles.filter(t => t.type === TileType.WELL)
        candidates.forEach(well => {
            candidates.queue = [];
        });
        game_facade.game.enemies = [];
        game_facade.game.bullets = [];
        
        // 刷新井的等級跟敵人
        let base = game_facade.game.map.tiles.filter(t => t.type === TileType.WELL).find(t => t.index === index)
        let lv = base.lv;
        candidates.forEach(well => {
            well.lv = lv + well.index;
        });
        
        // 重新生成enemy跟boss
        game_facade.factory.create_enemy(3,1);
        enemyID = setTimeout(() => game_facade.factory.spawn_next_enemy(), 3000);
    }

    // 暫停頁面
    togglePause() {
        game_paused = !game_paused;
        if (game_paused) {
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
            resumeButton.mousePressed(() => game_facade.resumeGame());
            resumeButton.style('padding', '15px 30px');
            resumeButton.style('font-size', '18px');
            topButtonDiv.child(resumeButton);

            let upgradeButton = createButton('升級能力');
            upgradeButton.mousePressed(() => showUpgradeScreen());
            upgradeButton.style('padding', '15px 30px');
            upgradeButton.style('font-size', '18px');
            topButtonDiv.child(upgradeButton);

            pauseMenu.child(topButtonDiv);

            let bottomButtonDiv = createElement('div');
            bottomButtonDiv.style('display', 'flex');
            bottomButtonDiv.style('gap', '20px');
            bottomButtonDiv.style('justify-content', 'center');

            let saveButton = createButton('儲存進度');
            // saveButton.mousePressed(() => alert('儲存進度尚未實作'));
            saveButton.mousePressed(() => game_facade.saveProgress());
            saveButton.style('padding', '15px 30px');
            saveButton.style('font-size', '18px');
            bottomButtonDiv.child(saveButton);

            let exitButton = createButton('離開遊戲');
            exitButton.mousePressed(() => {
            const account = getAccount();
            location.href = `home.html?account=${encodeURIComponent(account)}`;
            });
            exitButton.style('padding', '15px 30px');
            exitButton.style('font-size', '18px');
            bottomButtonDiv.child(exitButton);

            let helpButton = createButton('說明');
            helpButton.mousePressed(() => about());
            helpButton.style('padding', '15px 30px');
            helpButton.style('font-size', '18px');
            bottomButtonDiv.child(helpButton);

            pauseMenu.child(bottomButtonDiv);

            document.body.appendChild(pauseMenu.elt);
        }
    }    


    // 歷史紀錄登記
    async saveRecord1(account, record1) {
        try {
            const response = await ApiService.postToBackend('/saveRecord1', { account, record1 });
            if (response.error)     alert(`儲存失敗：${response.error}`); 
            //else                    alert('歷史紀錄已成功儲存！');
        } 
        catch (e) {
            alert('儲存歷史紀錄時發生錯誤');
            console.error(e);
        }
    }

    // 暫時儲存紀錄
    async saveProgress() {
        const account = getAccount();
        if (!account) {
            alert("尚未登入，請重新登入");
            window.location.href = 'login.html';
            return;
        }

        if(game_facade.game.player.hp<=0)   game_facade.game.map.tiles.find(t => t.type === TileType.WELL && t.index === 0).lv = 1;
        
        try {
            const response = await ApiService.postToBackend('/saveLevel', {
            account: account,
            lv: game_facade.game.map.tiles.find(t => t.type === TileType.WELL && t.index === 0).lv
            });

            if (response.error)     alert(`儲存失敗：${response.error}`);
            //else                    alert("進度已成功儲存！");
            
            window.location.href = `home.html?account=${encodeURIComponent(account)}`;
        }
        catch (error) {
            alert("儲存時發生錯誤");
            console.error(error);
        }
    }
}