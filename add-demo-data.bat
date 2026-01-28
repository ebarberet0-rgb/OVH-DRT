@echo off
echo ========================================
echo  Ajout des donnees de demonstration
echo ========================================
echo.

echo Cette operation va ajouter:
echo   - 3 nouveaux evenements
echo   - 15 nouveaux clients
echo   - 35 reservations
echo.

set /p "confirm=Continuer? (oui/non): "

if /i not "%confirm%"=="oui" (
    echo Operation annulee.
    pause
    exit /b 0
)

echo.
echo [1/1] Reinitialisation complete de la base avec seed principal...
npx tsx packages/database/prisma/seed.ts

if errorlevel 1 (
    echo.
    echo Erreur lors du seed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Donnees de demonstration ajoutees !
echo ========================================
echo.
echo CONTENU DE LA BASE:
echo   - Utilisateurs admin/instructeurs
echo   - 2 concessionnaires
echo   - 20 motos Yamaha avec photos
echo   - 2 evenements avec sessions
echo   - 2 clients de test
echo.
echo ACCES:
echo   Admin:  heloise@yamaha.fr / admin123
echo   Client: client1@example.com / client123
echo.
pause
