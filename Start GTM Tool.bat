@echo off
setlocal

set "PROJECT_DIR=%~dp0"
set "BUNDLED_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

cd /d "%PROJECT_DIR%"

if exist "%BUNDLED_NODE%" (
  start "GTM Tool Server" cmd /k ""%BUNDLED_NODE%" server\server.js"
) else (
  where node >nul 2>nul
  if errorlevel 1 (
    echo Node.js was not found.
    echo Please install Node.js or run this from Codex where the bundled runtime is available.
    pause
    exit /b 1
  )
  start "GTM Tool Server" cmd /k "node server\server.js"
)

timeout /t 2 >nul
start http://localhost:8787
