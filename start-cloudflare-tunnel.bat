@echo off
echo ========================================
echo  Starting Cloudflare Tunnel
echo ========================================
echo.
echo Tunnel will expose:
echo - demo-service2.barberet.fr -> http://localhost:3001
echo - demo-service4.barberet.fr -> http://localhost:3001
echo.

REM Démarrer le tunnel avec le fichier de configuration
cloudflared tunnel --config cloudflared-config.yml run

pause
