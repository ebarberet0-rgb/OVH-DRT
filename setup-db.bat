@echo off
echo ========================================
echo  Yamaha DRT - Database Setup
echo ========================================
echo.

REM Check if .env exists
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please create a .env file with DATABASE_URL and JWT_SECRET
    echo Example:
    echo DATABASE_URL="postgresql://user:password@localhost:5432/yamaha_drt"
    echo JWT_SECRET="your-secret-key-here"
    echo.
    pause
    exit /b 1
)

echo Step 1: Installing dependencies...
call npm install
echo.

echo Step 2: Generating Prisma Client...
cd packages\database
call npx prisma generate
echo.

echo Step 3: Running database migrations...
call npx prisma migrate dev --name init
echo.

echo Step 4: (Optional) Seeding database...
set /p seed="Do you want to seed the database with test data? (Y/N): "
if /i "%seed%"=="Y" (
    call npx prisma db seed
)

cd ..\..
echo.
echo ========================================
echo  Database setup complete!
echo ========================================
echo.
pause
