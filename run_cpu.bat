@echo off
chcp 65001 >nul
title Nihon and Zeno
cd /d "%~dp0"
echo Запуск игры Nihon and Zeno...
echo Сервер: http://localhost:8901
echo.
start "" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
timeout /t 2 /nobreak >nul
start "" http://localhost:8901
