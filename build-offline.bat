@echo off
REM Build script for offline desktop app with SQLite

echo ========================================
echo ColorTouch CRM - Offline Build Script
echo ========================================
echo.

echo [1/6] Backing up current .env...
if exist .env (
    copy /Y .env .env.backup
)

echo [2/6] Copying offline configuration...
copy /Y .env.offline .env

echo [3/6] Installing dependencies...
call npm ci

echo [4/6] Generating Prisma client for SQLite...
call npx prisma generate

echo [5/6] Running database migrations...
call npx prisma migrate deploy

echo [6/6] Building desktop installer...
call npm run electron:build:win

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Installer location: dist\ColorTouch CRM-Setup-0.1.0.exe
echo.
echo To restore online config:
echo   copy /Y .env.backup .env
echo.
pause
