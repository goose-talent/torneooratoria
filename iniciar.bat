@echo off
echo Arrancando servidor PHP (MySQL + Formularios)...
start "PHP API" /B C:\xampp\php\php.exe -S 127.0.0.1:8081 -t C:\xampp\htdocs\torneo

echo Esperando a que PHP arranque...
timeout /t 2 /nobreak >nul

curl -s -o nul -w "" http://127.0.0.1:8081/api.php?action=datos >nul 2>&1
if errorlevel 1 (
    echo [ERROR] El servidor PHP no responde. Comprueba que XAMPP MySQL esta activo.
    pause
    exit /b 1
)
echo PHP activo en http://127.0.0.1:8081

echo Arrancando servidor del Torneo...
node server.js
