-- 建立資料庫
CREATE DATABASE IF NOT EXISTS gamedb;

-- 使用資料庫
USE gamedb;

-- 建立 users 表格
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- 玩家資訊
CREATE TABLE IF NOT EXISTS player_information (
  user_id INT PRIMARY KEY,
  max_health INT DEFAULT 100,
  movement_speed FLOAT DEFAULT 1.0,
  bullet_damage INT DEFAULT 10,
  body_damage INT DEFAULT 5,
  bullet_frequency FLOAT DEFAULT 1.0,
  health_regen FLOAT DEFAULT 0.0,
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

DELIMITER //

CREATE TRIGGER after_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
  INSERT INTO player_information (user_id)
  VALUES (NEW.id);

  INSERT INTO ranking_list (user_id, lv)
  VALUES (NEW.id, 1);
END //

DELIMITER ;

DELIMITER //

CREATE TRIGGER after_player_info_lv_update
AFTER UPDATE ON player_information
FOR EACH ROW
BEGIN
  -- 當 lv 改變時，同步更新 ranking_list 的 lv
  IF NEW.lv <> OLD.lv THEN
    UPDATE ranking_list
    SET lv = NEW.lv
    WHERE user_id = NEW.user_id;
  END IF;
END
//

DELIMITER ;