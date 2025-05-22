// api.js

window.ApiService = {
    async getNgrokUrl() {
      // const res = await fetch('https://gist.githubusercontent.com/xmu310/bcd3d6d17926e0d772faf1fbe1faf505/raw');
      const res = await fetch('https://gist.githubusercontent.com/0909561981/36fdebf0f5cebc88b6b4ba8e4707f6e9/raw');
      return (await res.text()).trim();
  
      // 本地測試時改用下面這行
      // return 'http://localhost:5000';
    },
  
    async postToBackend(endpoint, body) {
      const baseUrl = await this.getNgrokUrl();
      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
  
      return res.json();
    },

    // 新增 GET 方法
    async getFromBackend(endpoint) {
      const baseUrl = await this.getNgrokUrl();
      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      return res.json();
    }
  };