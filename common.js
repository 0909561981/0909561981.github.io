// common.js
window.AuthManager = class {
    constructor(mode = 'login') {
      this.mode = mode;
      this.endpoint = mode === 'login' ? '/login' : '/register';
    }
  
    static async hashPassword(password) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  
    static isValidInput(account, password) {
      return account.length >= 5 && account.length <= 10 &&
        password.length >= 5 && password.length <= 10;
    }
  
    async submit(account, password) {
      if (!AuthManager.isValidInput(account, password)) {
        alert('條件都看不懂，呆子？');
        return { success: false, message: '輸入不合法' };
      }
  
      const hashedPassword = await AuthManager.hashPassword(password);
  
      return await window.ApiService.postToBackend(this.endpoint, {
        account,
        password: hashedPassword
      });
    }
  
    handleResponse(data, successHref) {
      if (data.success) {
        alert(`${this.mode === 'login' ? '登入' : '註冊'}成功！`);
        localStorage.setItem('account', data.account || '');
        location.href = successHref;
      } else {
        alert(`${this.mode === 'login' ? '登入' : '註冊'}失敗：` + data.message);
      }
    }
  };

// 排行榜
async function fetchRanking() {
  try {
    // 1. 先拿前三名排行榜
    const topData = await ApiService.postToBackend('/get_ranking', {});
    const rankListDiv = document.querySelector('.rank-list');
    rankListDiv.innerHTML = '';
    console.log('🏆 排行榜資料：', topData);

    const medals = ['🥇', '🥈', '🥉'];
    topData.forEach((entry, i) => {
      const medal = medals[i] || `🏅${i + 1}.`;
      const p = document.createElement('p');
      p.textContent = `${medal} ${entry.account} - Lv${entry.lv}`;
      rankListDiv.appendChild(p);
    });

    // 2. 再用帳號去查自己的等級
    let account = getUrlParam('account') || localStorage.getItem('account') || '屎蛋';
    const selfDiv = document.querySelector('.self-rank');

    const selfData = await ApiService.postToBackend('/get_user_lv', { account });
    if (selfData.success) {
      selfDiv.textContent = `⭐ ${account} - Lv${selfData.lv}`;
    } else {
      selfDiv.textContent = `⭐ ${account} - Lv0`;
    }
  } catch (error) {
    console.error('🚨 請求發生錯誤：', error);
  }
}

// 成功拿到user_id
async function fetchUserId(account) {
  try {
    const data = await ApiService.postToBackend('/get_id', { account });

    if (data.success) {
      localStorage.setItem('userId', data.id);
      console.log('✅ 成功取得 userId:', data.id);
    } else {
      console.error('❌ 錯誤：', data.message);
    }
  } catch (error) {
    console.error('🚨 請求發生錯誤：', error);
  }
}

