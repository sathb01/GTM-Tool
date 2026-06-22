@echo off
setlocal

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8787" ^| findstr "LISTENING"') do (
  taskkill /PID %%a /F >nul 2>nul
)

echo GTM Tool server stopped.
timeout /t 2 >nul
