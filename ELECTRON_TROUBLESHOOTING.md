# Electron App Troubleshooting Guide

## Fixed Issues (v0.1.0)

The following issues have been resolved in this build:

### 1. **Database Path Resolution**
- ✅ Fixed: Database path now uses absolute path instead of relative
- The app automatically sets `DATABASE_URL` to the correct location in the packaged app

### 2. **Port Conflicts (EADDRINUSE)**
- ✅ Fixed: App now automatically finds an available port if 3000 is taken
- No more "address already in use" errors when running multiple instances or dev servers

### 3. **Server Startup Timing**
- ✅ Fixed: Added health check mechanism to ensure server is fully ready before loading UI
- The app now waits for the server to respond before loading the interface

### 3. **Error Visibility**
- ✅ Fixed: Dev tools automatically open to show any console errors
- Better error messages display when server fails to start

### 4. **Next.js Configuration**
- ✅ Fixed: Added standalone output mode for better packaging
- Optimized for Electron environment

## How to Run the App

1. Navigate to the `dist` folder
2. Run `ColorTouch CRM-0.1.0-Portable.exe`
3. Wait 5-10 seconds for the server to start
4. The app should load automatically

## If You Still See Issues

### Blank Screen or Loading Forever

**Check the server log:**
1. After running the app, navigate to:
   ```
   C:\Users\Public\colour-touch-cmr\ColorTouch\dist\win-unpacked\resources\app\server-log.txt
   ```
2. Open the log file and check for errors
3. Look for messages like:
   - "Database file not found" - Database is missing
   - "EPERM" or "EACCES" - Permission issues
   - "EADDRINUSE" - Port 3000 is already in use

**Solutions:**

1. **Database Missing:**
   ```powershell
   # Copy database from source
   Copy-Item "C:\Users\Public\colour-touch-cmr\ColorTouch\prisma\colortouch.db" `
             "C:\Users\Public\colour-touch-cmr\ColorTouch\dist\win-unpacked\resources\app\prisma\colortouch.db"
   ```

2. **Port Already in Use:**
   - Close any other instances of the app
   - Stop any other services running on port 3000
   - Or change the port in `electron/server.js`

3. **Permission Issues:**
   - Run the app as Administrator
   - Or move the app to a folder where you have write permissions (e.g., Documents)

### Internal Server Error

**Check Dev Tools:**
1. When the app opens, press `F12` or `Ctrl+Shift+I`
2. Check the Console tab for errors
3. Check the Network tab to see if API calls are failing

**Common Causes:**

1. **Database Connection Failed:**
   - Ensure `colortouch.db` exists in the `prisma` folder
   - Check file permissions

2. **Missing Environment Variables:**
   - Check if `.env` file exists in the app directory
   - Verify all required variables are set

3. **Prisma Client Issues:**
   - Rebuild the app with: `npm run electron:build:win`

### App Won't Start at All

1. **Check Windows Defender/Antivirus:**
   - Some antivirus software blocks unsigned executables
   - Add an exception for the app

2. **Missing Dependencies:**
   ```powershell
   # Reinstall dependencies
   cd "C:\Users\Public\colour-touch-cmr\ColorTouch"
   npm install
   ```

3. **Corrupted Build:**
   ```powershell
   # Clean and rebuild
   cd "C:\Users\Public\colour-touch-cmr\ColorTouch"
   Remove-Item dist -Recurse -Force
   npm run electron:build:win
   ```

## Debugging Tips

### Enable Verbose Logging

The app already has verbose logging enabled. Check:
- `server-log.txt` in the app directory
- Browser console (F12)

### Test Server Separately

You can test if the Next.js server works independently:

```powershell
cd "C:\Users\Public\colour-touch-cmr\ColorTouch"
npm run build
npm start
```

Then visit http://localhost:3000 in your browser.

### Check Database

Test database connection:

```powershell
cd "C:\Users\Public\colour-touch-cmr\ColorTouch"
node scripts/test-db-connection.js
```

## Building a New Version

If you need to rebuild after making changes:

```powershell
cd "C:\Users\Public\colour-touch-cmr\ColorTouch"

# Clean previous build
Remove-Item dist -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue

# Build
npm run electron:build:win
```

## Support

If issues persist:
1. Collect the `server-log.txt` file
2. Take a screenshot of any error messages
3. Check the browser console (F12) for errors
4. Note what actions you took before the error occurred

## Technical Details

### What Was Changed

1. **electron/server.js:**
   - Added absolute path resolution for database
   - Added database file existence checks
   - Enhanced logging

2. **electron/main.js:**
   - Added server health check before loading UI
   - Improved error display with helpful tips
   - Better timeout handling

3. **next.config.prod.js:**
   - Added `output: 'standalone'` for better packaging
   - Disabled source maps for production
   - Optimized for Electron

4. **electron-builder.json:**
   - Added `next.config.js` to packaged files
   - Excluded unnecessary .env files

### File Locations in Packaged App

```
dist/
└── win-unpacked/
    └── resources/
        └── app/
            ├── .env                    # Environment variables
            ├── electron/               # Electron scripts
            │   ├── main.js
            │   ├── server.js
            │   └── preload.js
            ├── .next/                  # Built Next.js app
            ├── prisma/
            │   ├── colortouch.db       # SQLite database
            │   └── schema.prisma
            ├── node_modules/           # Dependencies
            └── server-log.txt          # Server logs (created at runtime)
```
