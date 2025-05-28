from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# 資料庫設定
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'deesdees',
    'database': 'gamedb'
}

@app.route('/saveRecord1', methods=['POST'])
def save_record1():
    data = request.get_json()
    account = data.get('account')
    record1 = data.get('record1')

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    # 找 user_id
    cursor.execute("SELECT id FROM users WHERE account = %s", (account,))
    result = cursor.fetchone()
    if result is None:
        return jsonify({"error": "找不到該帳號"}), 404

    user_id = result[0]

    try:
        # 如果 user_id 沒在 player_record 就插入一筆空紀錄
        cursor.execute("SELECT user_id FROM player_record WHERE user_id = %s", (user_id,))
        if cursor.fetchone() is None:
            cursor.execute("INSERT INTO player_record (user_id) VALUES (%s)", (user_id,))

        # 更新 record1
        cursor.execute("UPDATE player_record SET record1 = %s WHERE user_id = %s", (record1, user_id))
        conn.commit()
        return jsonify({"success": True})
    except Exception as e:
        print("❌ 儲存歷史紀錄失敗：", e)
        return jsonify({"error": "儲存歷史紀錄時發生錯誤"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/saveLevel', methods=['POST'])
def save_level():
    data = request.get_json()
    account = data.get('account')
    lv = data.get('lv')

    if not account or lv is None:
        return jsonify({"error": "缺少必要參數"}), 400

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # 查找 user_id
        cursor.execute("SELECT id FROM users WHERE account = %s", (account,))
        result = cursor.fetchone()

        if result is None:
            cursor.close()
            conn.close()
            return jsonify({"error": "找不到該帳號"}), 404

        user_id = result[0]

        # 更新等級，若無紀錄則插入
        cursor.execute("""
            INSERT INTO player_information (user_id, lv)
            VALUES (%s, %s)
            ON DUPLICATE KEY UPDATE lv = VALUES(lv)
        """, (user_id, lv))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"success": True})

    except Exception as e:
        print("❌ 儲存等級失敗：", e)
        return jsonify({"error": "儲存等級時發生錯誤"}), 500

@app.route('/savePlayerStats', methods=['POST'])
def save_player_stats():
    data = request.get_json()
    account = data.get('account')
    if not account:
        return jsonify({'error': '缺少帳號'}), 400

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    try:
        # 取得 user_id
        cursor.execute("SELECT id FROM users WHERE account = %s", (account,))
        user = cursor.fetchone()
        if not user:
            return jsonify({'error': '找不到帳號'}), 404
        user_id = user[0]

        # 更新 player_information 表
        cursor.execute("""
            UPDATE player_information SET
                max_health = %s,
                movement_speed = %s,
                bullet_damage = %s,
                body_damage = %s,
                bullet_frequency = %s,
                health_regen = %s,
                bullet_speed = %s
            WHERE user_id = %s
        """, (
            data.get('max_health'),
            data.get('movement_speed'),
            data.get('bullet_damage'),
            data.get('body_damage'),
            data.get('bullet_frequency'),
            data.get('health_regen'),
            data.get('bullet_speed'),
            user_id
        ))

        conn.commit()
        return jsonify({'message': '更新成功'})

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@app.route('/getPlayerStats', methods=['POST'])
def get_player_stats():
    data = request.get_json()
    account = data.get('account')
    if not account:
        return jsonify({'error': '缺少帳號'}), 400
    
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)
    
    try:
        # 先取得 user_id
        cursor.execute("SELECT id FROM users WHERE account = %s", (account,))
        user = cursor.fetchone()
        if not user:
            return jsonify({'error': '找不到該帳號'}), 404
        
        user_id = user['id']

        # 從 player_information 撈七個屬性
        cursor.execute("""
            SELECT max_health, movement_speed, bullet_damage, body_damage, bullet_frequency, health_regen, bullet_speed
            FROM player_information WHERE user_id = %s
        """, (user_id,))
        stats = cursor.fetchone()
        if not stats:
            return jsonify({'error': '找不到玩家資訊'}), 404

        # 從 ranking_list 撈 lv
        cursor.execute("SELECT lv FROM ranking_list WHERE user_id = %s", (user_id,))
        rank = cursor.fetchone()
        ranking_lv = rank['lv'] if rank else 0

        # 回傳結果
        response = {
            **stats,
            'ranking_lv': ranking_lv
        }
        return jsonify(response)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@app.route('/getHistory', methods=['POST'])
def get_history():
    try:
        data = request.get_json()
        if not data or 'account' not in data:
            return jsonify({'error': 'Missing account'}), 400

        account = data['account']

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        cursor.execute('SELECT id FROM users WHERE account = %s', (account,))
        user = cursor.fetchone()

        if not user:
            cursor.close()
            conn.close()
            return jsonify({'error': 'User not found'}), 404

        user_id = user['id']

        cursor.execute('SELECT record1, record2, record3 FROM player_record WHERE user_id = %s', (user_id,))
        record = cursor.fetchone()

        cursor.close()
        conn.close()

        return jsonify(record or {})
    except Exception as e:
        print('Error in /getHistory:', e)
        return jsonify({'error': 'Server error'}), 500

@app.route('/get_player_info', methods=['POST'])
def get_player_info():
    data = request.get_json()
    account = data.get('account')

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    query = '''
        SELECT pi.max_health, pi.movement_speed, pi.bullet_damage, pi.body_damage,
               pi.bullet_frequency, pi.health_regen, pi.bullet_speed, pi.lv
        FROM player_information pi
        JOIN users u ON pi.user_id = u.id
        WHERE u.account = %s
    '''
    cursor.execute(query, (account,))
    result = cursor.fetchone()
    conn.close()

    if result:
        return jsonify({
            'success': True,
            'max_health': result[0],
            'movement_speed': result[1],
            'bullet_damage': result[2],
            'body_damage': result[3],
            'bullet_frequency': result[4],
            'health_regen': result[5],
            'bullet_speed': result[6],
            'lv': result[7]
        })
    else:
        return jsonify({'success': False, 'message': '找不到玩家資訊'})

@app.route('/get_ranking', methods=['POST'])
def get_ranking():
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT users.account, ranking_list.lv
        FROM ranking_list
        JOIN users ON ranking_list.user_id = users.id
        ORDER BY ranking_list.lv DESC
        LIMIT 3
    ''')
    result = cursor.fetchall()
    conn.close()

    ranking = [{'account': row[0], 'lv': row[1]} for row in result]
    return jsonify(ranking)

@app.route('/get_user_lv', methods=['POST'])
def get_user_lv():
    data = request.get_json()
    account = data.get('account')

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    cursor.execute('''
        SELECT ranking_list.lv 
        FROM ranking_list
        JOIN users ON ranking_list.user_id = users.id
        WHERE users.account = %s
    ''', (account,))
    result = cursor.fetchone()
    conn.close()

    if result:
        return jsonify({'success': True, 'lv': result[0]})
    else:
        return jsonify({'success': False, 'message': '查無等級資料'})

# tmp
@app.route('/get_id', methods=['POST'])
def get_id():
    data = request.get_json()
    account = data.get('account')
    password = data.get('password')  # 已經是 hash 過的

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE account = %s", (account,))
    result = cursor.fetchone()

    if result:
            return jsonify({'success': True, 'id': result[0]})
    else:
        return jsonify({'success': False, 'message': '帳號不存在'})

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

#  查看後端有哪些功能
@app.route('/routes', methods=['GET'])
def list_routes():
    import urllib
    output = []
    for rule in app.url_map.iter_rules():
        methods = ','.join(rule.methods)
        line = f"{rule.endpoint:20s} {methods:20s} {urllib.parse.unquote(str(rule))}"
        output.append(line)
    return "<pre>" + "\n".join(sorted(output)) + "</pre>"

if __name__ == '__main__':
    app.run(port=5000)

