@echo off
cd /d C:\Users\btcet\Desktop\design-system\project\ui_kits\erp-console
echo Starting HTTP server on http://localhost:8080
echo Press Ctrl+C to stop
echo.
python -m http.server 8080
pause