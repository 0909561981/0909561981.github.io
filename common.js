// common.js

// 把 getNgrokUrl 函式掛載到 window 上
window.getNgrokUrl = async function () {
    const res = await fetch('https://gist.githubusercontent.com/xmu310/bcd3d6d17926e0d772faf1fbe1faf505/raw');
    return (await res.text()).trim();
};

// 定義 AuthManager 類別並掛載到 window 上
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
        const ngrokUrl = await getNgrokUrl();

        const res = await fetch(`${ngrokUrl}${this.endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ account, password: hashedPassword })
        });

        return res.json();
    }

    handleResponse(data, successHref) {
        if (data.success) {
            alert(`${this.mode === 'login' ? '登入' : '註冊'}成功！`);
            localStorage.setItem('account', data.account || ''); // 可選：記住帳號
            location.href = successHref;
        } else {
            alert(`${this.mode === 'login' ? '登入' : '註冊'}失敗：` + data.message);
        }
    }
};
