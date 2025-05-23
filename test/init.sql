-- 建立資料庫
-- CREATE DATABASE IF NOT EXISTS gamedb;
DROP DATABASE IF EXISTS gamedb;
CREATE DATABASE gamedb;
-- 使用資料庫
USE gamedb;

SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS player_information;
DROP TABLE IF EXISTS ranking_list;
DROP TABLE IF EXISTS player_record;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS=1;

-- 建立 users 表格
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- 玩家資訊
CREATE TABLE IF NOT EXISTS player_information (
  user_id INT PRIMARY KEY,
  max_health FLOAT DEFAULT 1.0,
  movement_speed FLOAT DEFAULT 1.0,
  bullet_damage FLOAT DEFAULT 1.0,
  body_damage FLOAT DEFAULT 1.0,
  bullet_frequency FLOAT DEFAULT 1.0,
  health_regen FLOAT DEFAULT 1.0,
  bullet_speed FLOAT DEFAULT 1.0,
  lv INT DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 排行榜
CREATE TABLE IF NOT EXISTS ranking_list (
  user_id INT PRIMARY KEY,
  lv INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 歷史紀錄
CREATE TABLE IF NOT EXISTS player_record (
  user_id INT PRIMARY KEY,
  record1 INT DEFAULT NULL,
  record2 INT DEFAULT NULL,
  record3 INT DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 🔧 刪除舊的觸發器（防止重複創建）
DROP TRIGGER IF EXISTS after_user_insert;
DROP TRIGGER IF EXISTS after_player_record_lv_update;
DROP TRIGGER IF EXISTS after_record_lv_to_ranking;

DELIMITER //

-- ✅ 1. 新增 user 後自動新增三張表的資料
CREATE TRIGGER after_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
  INSERT INTO player_information (user_id) VALUES (NEW.id);
  INSERT INTO ranking_list (user_id, lv) VALUES (NEW.id, 1);
  INSERT INTO player_record (user_id) VALUES (NEW.id);
END;
//

-- ✅ 2. 更新 player_record.lv 時推移紀錄欄位
CREATE TRIGGER before_update_record1
BEFORE UPDATE ON player_record
FOR EACH ROW
BEGIN
  -- 只要 record1 欄位被設定（不論是否與原值相同）就 shift
  IF NEW.record1 IS NOT NULL THEN
    SET NEW.record3 = OLD.record2;
    SET NEW.record2 = OLD.record1;
    -- NEW.record1 保留用戶設定的新值
  END IF;
END;
//

-- ✅ 3. 更新 player_record.lv 後，更新 ranking_list.lv（如果比較高）
CREATE TRIGGER after_record_lv_to_ranking
AFTER UPDATE ON player_record
FOR EACH ROW
BEGIN
  DECLARE current_rank INT;
  SELECT lv INTO current_rank FROM ranking_list WHERE user_id = NEW.user_id;

  IF NEW.lv > current_rank THEN
    UPDATE ranking_list SET lv = NEW.lv WHERE user_id = NEW.user_id;
  END IF;
END;
//

DELIMITER ;
