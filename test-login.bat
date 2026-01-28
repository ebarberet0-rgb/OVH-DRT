@echo off
echo ========================================
echo  Test de connexion - Yamaha DRT
echo ========================================
echo.

echo [1/3] Test du health check de l'API...
curl -s http://localhost:3001/health
echo.
echo.

echo [2/3] Test de connexion admin...
curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"heloise@yamaha.fr\",\"password\":\"admin123\"}"
echo.
echo.

echo [3/3] Test de connexion depuis Cloudflare...
echo Tentative de connexion a demo-service4.barberet.fr...
curl -s https://demo-service4.barberet.fr/health
echo.
echo.

echo ========================================
echo  Test termine
echo ========================================
echo.
echo Identifiants de connexion:
echo   Admin: heloise@yamaha.fr / admin123
echo   Instructeur: instructor1@yamaha.fr / instructor123
echo   Client: client1@example.com / client123
echo.
echo URLs d'acces:
echo   Local - Backoffice: http://localhost:5175
echo   Cloud - Backoffice: https://demo-service2.barberet.fr
echo.
pause
