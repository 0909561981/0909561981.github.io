// 關於遊戲
function about() {
  if (document.getElementById("aboutPage")) return;

  const container = document.createElement("div");
  container.id = "aboutPage";
  container.style.position = "fixed";
  container.style.top = 0;
  container.style.left = 0;
  container.style.width = "100%";
  container.style.height = "100%";
  container.style.background = "rgba(0,0,0,0.95)";
  container.style.zIndex = 9999;
  container.style.overflowY = "auto";
  container.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-8">
      <div class="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-6 space-y-4">
        <div class="text-center pt-4">
          <button onclick="closeAbout()" class="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition">
            返回
          </button>
        </div>
        <p class="text-lg text-gray-700">
          歡迎來到「無盡射手」！這是一款使用 <code>p5.js</code> 製作的手機友善射擊遊戲。
        </p>
        <ul class="list-disc list-inside text-gray-700 text-base space-y-2">
          <li>操控可愛的笑臉角色，用虛擬搖桿在戰場中穿梭、射擊敵人。</li>
          <li>敵人會從五口井中隨機冒出，每口井都有自己風格與等級！</li>
          <li>30 秒後，強力 Boss 降臨，擊敗它就能升級井口、進入更高難度！</li>
          <li>內含暫停功能、升級系統、排行榜與搞笑小彩蛋！</li>
        </ul>
        <p class="text-lg text-gray-700">
          遊戲以模組化方式開發，將不同元件如玩家、敵人、子彈、搖桿、障礙物等拆分為不同的class檔案，便於維護與擴充。
        </p>
        <p class="text-lg text-gray-700">
          此專案由
          <span class="font-semibold text-purple-600">
            <br>
             -  41047049S 李邦安<br>
             -  41047004S 鄭琮祐<br>
             -  41047017S 許哲葦<br>
             -  41047018S 胡崇恩<br>
             -  41047036S 劉庭瑄<br>
          </span>
          製作，初衷是學習 OOP 與製作一款有趣又不失挑戰的瀏覽器遊戲。
        </p>
      </div>
    </div>
  `;
  document.body.appendChild(container);
}
// 關閉About
function closeAbout() {  document.getElementById("aboutPage").remove();   }