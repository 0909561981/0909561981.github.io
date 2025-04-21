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
