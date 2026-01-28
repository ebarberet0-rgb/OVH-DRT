@echo off
echo ========================================
echo  Test de configuration Cloudflare
echo ========================================
echo.

echo [1/5] Verification des fichiers .env.production...
if exist "apps\backoffice\.env.production" (
    echo   ✓ apps\backoffice\.env.production existe
    type apps\backoffice\.env.production
) else (
    echo   ✗ apps\backoffice\.env.production manquant
)
echo.

if exist "apps\tablette\.env.production" (
    echo   ✓ apps\tablette\.env.production existe
    type apps\tablette\.env.production
) else (
    echo   ✗ apps\tablette\.env.production manquant
)
echo.

if exist "apps\web\.env.production" (
    echo   ✓ apps\web\.env.production existe
    type apps\web\.env.production
) else (
    echo   ✗ apps\web\.env.production manquant
)
echo.

echo [2/5] Verification du fichier de config tunnel...
if exist "cloudflared-config.yml" (
    echo   ✓ cloudflared-config.yml existe
    type cloudflared-config.yml
) else (
    echo   ✗ cloudflared-config.yml manquant
)
echo.

echo [3/5] Verification de cloudflared...
where cloudflared >nul 2>&1
if errorlevel 1 (
    echo   ✗ cloudflared non installe
) else (
    echo   ✓ cloudflared installe
    cloudflared --version
)
echo.

echo [4/5] Verification de l'API locale...
echo   Test de http://localhost:3001/health...
curl -s http://localhost:3001/health >nul 2>&1
if errorlevel 1 (
    echo   ✗ API non accessible sur localhost:3001
    echo   Demarrez l'API avec: start-all.bat
) else (
    echo   ✓ API accessible
    curl -s http://localhost:3001/health
)
echo.

echo [5/5] Liste des tunnels Cloudflare...
cloudflared tunnel list
echo.

echo ========================================
echo  Test termine
echo ========================================
echo.
echo Pour demarrer en mode production:
echo   start-all-with-tunnel.bat
echo.
pause
