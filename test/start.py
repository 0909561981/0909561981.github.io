import requests
import time

# == 請填入你自己的資訊 ==
GIST_ID = '36fdebf0f5cebc88b6b4ba8e4707f6e9'
GITHUB_TOKEN = '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'

def get_ngrok_url():
    try:
        res = requests.get("http://127.0.0.1:4040/api/tunnels")
        tunnels = res.json()["tunnels"]
        for tunnel in tunnels:
            if tunnel["proto"] == "https":
                return tunnel["public_url"]
    except Exception as e:
        print("無法取得 ngrok 網址:", e)
        return None

def update_gist(content):
    url = f"https://api.github.com/gists/{GIST_ID}"
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json"
    }
    data = {
        "files": {
            "ngrok-url.txt": {
                "content": content
            }
        }
    }
    res = requests.patch(url, headers=headers, json=data)
    if res.status_code == 200:
        print("✅ Gist 更新成功：", content)
    else:
        print("❌ 更新失敗：", res.text)

if __name__ == "__main__":
    print("⏳ 等待 ngrok 啟動...")
    time.sleep(2)  # 等 ngrok 跑起來
    url = get_ngrok_url()
    if url:
        update_gist(url)
    else:
        print("❌ 沒有找到 ngrok 網址，請確認 ngrok 有在跑。")
#    input("按下 Enter 鍵關閉視窗...")
