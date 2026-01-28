@echo off
echo ========================================
echo  Configuration Production
echo  Pour acces externe via Cloudflare
echo ========================================
echo.

echo IMPORTANT: Cette configuration permet a vos collegues d'acceder
echo            a l'application via demo-service2.barberet.fr
echo.

echo [1/4] Arret des services en cours...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo ✓ Services arretes
echo.

echo [2/4] Verification de Docker (PostgreSQL)...
docker ps | findstr postgres >nul 2>&1
if errorlevel 1 (
    echo Demarrage de PostgreSQL...
    docker-compose up -d
    timeout /t 5 /nobreak >nul
)
echo ✓ PostgreSQL actif
echo.

echo [3/4] Demarrage de l'API...
start "Yamaha API" cmd /k "cd apps\api && set PORT=3001&& npm run dev"
echo ✓ API demarree sur localhost:3001
timeout /t 3 /nobreak >nul
echo.

echo [4/4] Demarrage du Backoffice en mode PRODUCTION...
start "Yamaha Backoffice [PRODUCTION]" cmd /k "cd apps\backoffice && npm run dev -- --port 5175 --mode production"
echo ✓ Backoffice demarre en mode PRODUCTION
echo.

timeout /t 2 /nobreak >nul

echo [5/6] Demarrage du Web en mode PRODUCTION...
start "Yamaha Web [PRODUCTION]" cmd /k "cd apps\web && npm run dev -- --port 5173 --mode production"
echo ✓ Web demarre en mode PRODUCTION
echo.

timeout /t 2 /nobreak >nul

echo [6/6] Demarrage de la Tablette en mode PRODUCTION...
start "Yamaha Tablette [PRODUCTION]" cmd /k "cd apps\tablette && npm run dev -- --port 5174 --mode production"
echo ✓ Tablette demarree en mode PRODUCTION
echo.

echo ========================================
echo  Services demarres en mode PRODUCTION
echo ========================================
echo.
echo Configuration:
echo   - API locale:        http://localhost:3001
echo   - Backoffice:        http://localhost:5175 (appelle demo-service4.barberet.fr)
echo   - Web:               http://localhost:5173 (appelle demo-service4.barberet.fr)
echo   - Tablette:          http://localhost:5174 (appelle demo-service4.barberet.fr)
echo.
echo Pour l'acces externe via Cloudflare:
echo   - API:               https://demo-service4.barberet.fr
echo   - Backoffice:        https://demo-service2.barberet.fr
echo   - Web:               https://demo-service3.barberet.fr
echo   - Tablette:          https://demo-service1.barberet.fr
echo.
echo ATTENTION: Cloudflare doit etre configure (actuellement bloque avec 403)
echo            Voir: CLOUDFLARE-CONFIG-URGENT.md
echo.
pause
