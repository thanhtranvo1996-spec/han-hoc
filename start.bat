@echo off
echo Starting Han Hoc...
start "Backend" cmd /k "cd /d D:\12. AI\Claude Code\Chinese\han-hoc\backend && node server.js"
timeout /t 2 /nobreak >nul
start "Frontend" cmd /k "cd /d D:\12. AI\Claude Code\Chinese\han-hoc\frontend && npm run dev"
echo Done! Open http://localhost:5173
