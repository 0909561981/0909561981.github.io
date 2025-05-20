@echo off
start "" python app.py
start "" ngrok http 5000
timeout /t 1 >nul
start "" cmd /k python start.py