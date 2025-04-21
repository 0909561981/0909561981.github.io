from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# 資料庫設定
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'ntnupassword',
    'database': 'gamedb'
}

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    account = data.get('account')
    hashed_password = data.get('password')  # 這裡收到的已經是 hash 過的密碼

    if not account or not hashed_password:
        return jsonify({'success': False, 'message': '缺少帳號或密碼'})

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # 檢查帳號是否存在
        cursor.execute("SELECT * FROM users WHERE account = %s", (account,))
        if cursor.fetchone():
            return jsonify({'success': False, 'message': '帳號已存在'})

        # 儲存帳號與已 hash 的密碼
        cursor.execute("INSERT INTO users (account, password) VALUES (%s, %s)", (account, hashed_password))
        conn.commit()

        return jsonify({'success': True})

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    account = data.get('account')
    password = data.get('password')  # 已經是 hash 過的

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    cursor.execute("SELECT password FROM users WHERE account = %s", (account,))
    result = cursor.fetchone()

    if result and result[0] == password:
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'message': '帳號或密碼錯誤'})


if __name__ == '__main__':
    app.run(port=5000)

