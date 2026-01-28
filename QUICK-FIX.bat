@echo off
echo ========================================
echo  FIX RAPIDE - Redemarrage du backoffice
echo ========================================
echo.

echo [1/3] Arret de tous les processus Node...
taskkill /F /IM node.exe >nul 2>&1
echo ✓ Processus Node arretes
echo.

echo [2/3] Verification de l'API...
timeout /t 2 /nobreak >nul
start "Yamaha API" cmd /k "cd apps\api && set PORT=3001&& npm run dev"
echo ✓ API demarree sur port 3001
echo.

timeout /t 3 /nobreak >nul

echo [3/3] Demarrage du Backoffice en mode DEVELOPPEMENT...
start "Yamaha Backoffice" cmd /k "cd apps\backoffice && npm run dev -- --port 5175"
echo ✓ Backoffice demarre sur port 5175
echo.

echo ========================================
echo  Services redemarres !
echo ========================================
echo.
echo IMPORTANT: Le backoffice va maintenant appeler l'API locale:
echo   http://localhost:3001
echo.
echo Ouvrez: http://localhost:5175
echo Connectez-vous avec:
echo   Email: heloise@yamaha.fr
echo   Mot de passe: admin123
echo.
pause
