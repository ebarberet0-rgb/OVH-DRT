@echo off
echo ========================================
echo  Reinitialisation de la base de donnees
echo ========================================
echo.
echo ATTENTION: Cette operation va supprimer TOUTES les donnees existantes!
echo.
set /p "confirm=Voulez-vous continuer? (oui/non): "

if /i not "%confirm%"=="oui" (
    echo Operation annulee.
    pause
    exit /b 0
)

echo.
echo [1/2] Execution du seed...
npx tsx packages/database/prisma/seed.ts

if errorlevel 1 (
    echo.
    echo Erreur lors du seed!
    pause
    exit /b 1
)

echo.
echo [2/2] Test de connexion...
curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"heloise@yamaha.fr\",\"password\":\"admin123\"}" >nul 2>&1

if errorlevel 1 (
    echo.
    echo ATTENTION: L'API ne semble pas etre demarree.
    echo Lancez 'start-all.bat' pour demarrer les services.
) else (
    echo.
    echo ✓ Base de donnees reinitialisee avec succes!
    echo ✓ Test de connexion reussi!
)

echo.
echo ========================================
echo  Identifiants de connexion
echo ========================================
echo.
echo Admin:        heloise@yamaha.fr / admin123
echo Instructeur:  instructor1@yamaha.fr / instructor123
echo Client:       client1@example.com / client123
echo.
pause
