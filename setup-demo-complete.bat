@echo off
echo ========================================
echo  Configuration complete pour DEMO
echo ========================================
echo.

echo Cette operation va:
echo   1. Reinitialiser la base de donnees
echo   2. Creer les utilisateurs admin/instructeurs
echo   3. Creer 20 motos Yamaha avec photos
echo   4. Creer 2 evenements avec sessions
echo   5. Creer 10 clients de test
echo   6. Creer 15-20 reservations
echo.

set /p "confirm=Continuer? (oui/non): "

if /i not "%confirm%"=="oui" (
    echo Operation annulee.
    pause
    exit /b 0
)

echo.
echo [1/3] Seed principal (admin, instructeurs, events)...
npx tsx packages/database/prisma/seed.ts

echo.
echo [2/3] Ajout des 20 motos...
npx tsx packages/database/prisma/seed-motorcycles.ts

echo.
echo [3/3] Ajout de clients et reservations...
node add-clients-and-bookings.js

echo.
echo ========================================
echo  Configuration terminee !
echo ========================================
echo.
echo Vous pouvez maintenant vous connecter au backoffice:
echo   Admin:  heloise@yamaha.fr / admin123
echo   Client: thomas.dubois@gmail.com / demo123
echo.
pause
