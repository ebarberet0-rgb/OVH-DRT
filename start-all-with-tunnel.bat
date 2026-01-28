@echo off
setlocal enabledelayedexpansion

REM Se placer dans le dossier du script
cd /d "%~dp0"

echo ========================================
echo  Yamaha DRT - Full Stack Start
echo  Mode: Production avec Cloudflare
echo ========================================
echo.

REM Démarrer tous les services
echo [1/2] Demarrage des services...
call start-all-cloudflare.bat

REM Attendre que l'utilisateur ferme la fenêtre de start-all-cloudflare
timeout /t 2 /nobreak >nul

REM Démarrer le tunnel Cloudflare
echo.
echo [2/2] Demarrage du tunnel Cloudflare...
echo.
echo ========================================
echo  Tunnel Cloudflare actif
echo ========================================
echo.
echo Vos services sont maintenant accessibles via:
echo - https://demo-service1.barberet.fr (Tablette)
echo - https://demo-service2.barberet.fr (Backoffice)
echo - https://demo-service3.barberet.fr (Web)
echo - https://demo-service4.barberet.fr (API)
echo.
echo Appuyez sur Ctrl+C pour arreter le tunnel
echo ========================================
echo.

cloudflared tunnel --config cloudflared-config.yml run
