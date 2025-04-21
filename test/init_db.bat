@echo off
REM 設定 MySQL 路徑（根據你安裝的目錄修改）
set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

REM 執行 SQL 初始化
%MYSQL_PATH% -u root -p < init.sql

pause