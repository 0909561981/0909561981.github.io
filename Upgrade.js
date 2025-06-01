function getAccount() {
  let account = localStorage.getItem('account');
  if (!account) {
    const urlParams = new URLSearchParams(window.location.search);
    account = urlParams.get('account');
  }
  return account || '';
}

async function fetchPlayerStats() {
  const account = getAccount();  // 確保帳號存在
  if (!account) {
    alert("尚未登入，請重新登入");
    window.location.href = 'login.html';
    return null;
  }

  try {
    const data = await ApiService.postToBackend('/getPlayerStats', { account });

    if (data.error) {
      alert(data.error);
      return null;
    }

    return data;
  } catch (error) {
    alert('無法取得玩家數值，請稍後再試');
    console.error(error);
    return null;
  }
}

async function showUpgradeScreen() {
  if (document.getElementById("upgrade-screen")) return;

  const account = getAccount();
  if (!account) {
    alert('尚未登入，請重新登入');
    window.location.href = 'login.html';
    return;
  }

  const playerStats = await fetchPlayerStats(account);
  if (!playerStats) return;

  const upgradeStats = [
    "Max Health", "Movement Speed", "Bullet Damage",
    "Body Damage", "Bullet Frequency", "Health Regen", "Bullet Speed"
  ];
  const maxLevel = 7;
  if(game_facade.game.map.tiles.find(t => t.type === TileType.WELL && t.index === 0).lv > playerStats.ranking_lv)    playerStats.ranking_lv = game_facade.game.map.tiles.find(t => t.type === TileType.WELL && t.index === 0).lv;

  // 使用後端回傳的升級點數
  let upgradePoints = 7-(playerStats.max_health+playerStats.movement_speed+playerStats.bullet_damage+playerStats.body_damage+playerStats.bullet_frequency+playerStats.health_regen+playerStats.bullet_speed)+ (int)(playerStats.ranking_lv) + 1;
  if(upgradePoints<0)
    upgradePoints=0;
  // 初始化等級從後端數值四捨五入
  const levels = {
    "Max Health": Math.round(playerStats.max_health),
    "Movement Speed": Math.round(playerStats.movement_speed),
    "Bullet Damage": Math.round(playerStats.bullet_damage),
    "Body Damage": Math.round(playerStats.body_damage),
    "Bullet Frequency": Math.round(playerStats.bullet_frequency),
    "Health Regen": Math.round(playerStats.health_regen),
    "Bullet Speed": Math.round(playerStats.bullet_speed),
  };

  const upgradeHTML = document.createElement("div");
  upgradeHTML.id = "upgrade-screen";
  upgradeHTML.innerHTML = `
    <style>
    #upgrade-screen {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: black;
      color: white;
      z-index: 9999;
      font-family: sans-serif;
      overflow-y: auto;
    }

    #top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background-color: #111;
      font-size: 18px;
      font-weight: bold;
    }

    #Back_Button {
      background-color: black;
      color: white;
      border: 1px solid white;
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 16px;
      cursor: pointer;
    }

    #upgrades {
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px; /* 每項能力間距較近 */
    }

    .upgrade-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 0;
      background: transparent; /* 移除背景 */
      box-shadow: none;        /* 移除陰影 */
      border-radius: 0;
      margin: 0;
    }

    .stat-name {
      font-size: 16px;
      font-weight: bold;
      color: white;
    }

    .bar {
      display: flex;
      gap: 4px;
    }

    .segment, .empty-segment {
      width: 20px;
      height: 20px;
      border-radius: 3px;
    }

    .segment {
      background-color: yellow;
    }

    .empty-segment {
      background-color: #333;
    }

    .upgrade-item button {
      background-color: yellow;
      color: black;
      border: none;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 16px;
      cursor: pointer;
      align-self: flex-start;
    }

    .upgrade-item button:hover {
      background-color: gold;
    }
  </style>

    <div id="top-bar">
      <button id="Back_Button">← 返回</button>
      <div id="points">剩餘升級點數：<span id="point-count">${upgradePoints}</span></div>
    </div>
    <div id="upgrades"></div>
    <audio id="levelup-sound" src="Upgrade.mp3" preload="auto"></audio>
  `;

  document.body.appendChild(upgradeHTML);

  function playLevelUpSound() {
    const audio = document.getElementById("levelup-sound");
    audio.currentTime = 0;
    audio.play();
  }

  function renderUpgrades() {
    document.getElementById("point-count").textContent = upgradePoints;
    const upgradesDiv = document.getElementById("upgrades");
    upgradesDiv.innerHTML = "";

    upgradeStats.forEach(stat => {
      const container = document.createElement("div");
      container.className = "upgrade-item";

      const name = document.createElement("div");
      name.className = "stat-name";
      name.textContent = stat;

      const bar = document.createElement("div");
      bar.className = "bar";

      for (let i = 0; i < maxLevel; i++) {
        const seg = document.createElement("div");
        seg.className = i < levels[stat] ? "segment" : "empty-segment";
        bar.appendChild(seg);
      }

      const btn = document.createElement("button");
      btn.textContent = "+";
      btn.onclick = () => {
        if (levels[stat] >= maxLevel) {
          alert(`${stat} 已經滿等囉！`);
          return;
        }
        if (upgradePoints <= 0) {
          alert("升級點數不足！");
          return;
        }
        levels[stat]++;
        upgradePoints--;
        playLevelUpSound();
        renderUpgrades();
      };

      container.appendChild(name);
      container.appendChild(bar);
      container.appendChild(btn);
      upgradesDiv.appendChild(container);
    });
  }

  renderUpgrades();

  document.getElementById("Back_Button").onclick = async () => {
    const statKeyMap = {
      "Max Health": "max_health",
      "Movement Speed": "movement_speed",
      "Bullet Damage": "bullet_damage",
      "Body Damage": "body_damage",
      "Bullet Frequency": "bullet_frequency",
      "Health Regen": "health_regen",
      "Bullet Speed": "bullet_speed",
    };
    for (const label in levels)    playerData[statKeyMap[label]] = levels[label];
    await savePlayerStats(playerData);

    game_facade.game.player.stats.Max_Health = 1.8 + playerData.max_health * 1.2;
    game_facade.game.player.stats.Movement_Speed = 6 + playerData.movement_speed * 1.5;
    game_facade.game.player.stats.Bullet_Damage = playerData.bullet_damage * 1;
    game_facade.game.player.stats.Body_Damage = 0.5 + playerData.body_damage * 0.5;
    game_facade.game.player.stats.Bullet_Frequency = 30 - playerData.bullet_frequency * 1.5;
    game_facade.game.player.stats.Health_Regen = playerData.health_regen * 0.01;
    game_facade.game.player.stats.Bullet_Speed = 9 + playerData.bullet_speed * 1.0;

    upgradeHTML.remove();
  };
}

async function savePlayerStats(stats) {
  const account = getAccount();
  if (!account) {
    alert("尚未登入，請重新登入");
    window.location.href = 'login.html';
    return;
  }

  try {
    const response = await ApiService.postToBackend('/savePlayerStats', {
      account,
      ...stats
    });

    if (response.error) {
      alert(`儲存失敗：${response.error}`);
    } else {
      console.log("送出給後端的 stats：", { account, ...stats });
      alert("玩家數值已成功儲存！");
    }
  } catch (error) {
    alert("儲存玩家數值時發生錯誤，請稍後再試");
    console.error(error);
  }
}