@echo off
setlocal enabledelayedexpansion

REM Se placer dans le dossier du script pour garantir les chemins relatifs
cd /d "%~dp0"

echo ========================================
echo  Yamaha DRT - Starting All Services
echo  Mode: Cloudflare (Production)
echo ========================================
echo.

REM Start PostgreSQL database with Docker Compose
echo Starting PostgreSQL database...
docker-compose up -d
if errorlevel 1 (
    echo Erreur: Docker ou Docker Compose n'est pas disponible.
    echo Verifiez que Docker Desktop est installe et demarre.
    pause
    exit /b 1
)
echo Database started successfully!
echo.

REM Wait for database to be ready
echo Waiting for database to be ready...
timeout /t 5 /nobreak >nul

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Generate Prisma Client
echo Generating Prisma Client...
call npx prisma generate --schema=packages\database\prisma\schema.prisma
if errorlevel 1 (
    echo Erreur lors de la generation du client Prisma.
    pause
    exit /b 1
)
echo Prisma Client generated successfully!
echo.

REM Run database migrations
echo Running database migrations...
call npx prisma migrate deploy --schema=packages\database\prisma\schema.prisma
if errorlevel 1 (
    echo Avertissement: Les migrations ont echoue. La base pourrait ne pas etre a jour.
)
echo.

REM Start API in new window
echo Starting API on port 3001...
start "Yamaha API" cmd /k "set PORT=3001&& cd apps\api && npm run dev"

REM Wait 3 seconds for API to start
timeout /t 3 /nobreak >nul

REM Start Backoffice in new window (mode production)
echo Starting Backoffice on port 5175...
start "Yamaha Backoffice" cmd /k "cd apps\backoffice && npm run dev -- --port 5175 --mode production"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Start Web in new window (mode production)
echo Starting Web on port 5173...
start "Yamaha Web" cmd /k "cd apps\web && npm run dev -- --port 5173 --mode production"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Start Tablette in new window (mode production)
echo Starting Tablette on port 5174...
start "Yamaha Tablette" cmd /k "cd apps\tablette && npm run dev -- --port 5174 --mode production"

echo.
echo ========================================
echo  All services are starting...
echo ========================================
echo.
echo API:        http://localhost:3001 (via https://demo-service4.barberet.fr)
echo Backoffice: http://localhost:5175 (via https://demo-service2.barberet.fr)
echo Web:        http://localhost:5173 (via https://demo-service3.barberet.fr)
echo Tablette:   http://localhost:5174 (via https://demo-service1.barberet.fr)
echo.
echo IMPORTANT: N'oubliez pas de demarrer le tunnel Cloudflare:
echo   cloudflared tunnel --config cloudflared-config.yml run
echo.
echo Press any key to exit this window (services will keep running)
pause >nul
