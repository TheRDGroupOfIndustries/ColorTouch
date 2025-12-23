# Building Offline Desktop App with Sync

## Quick Start - Build & Install Desktop App

### Prerequisites
- Node.js 18+ installed
- Windows OS (for .exe build)
- Internet connection for initial build only

### Step 1: Prepare Offline Database

```powershell
# Navigate to project
cd C:\Users\Public\colour-touch-cmr\ColorTouch

# Copy offline environment config
Copy-Item .env.offline .env

# Install dependencies (if not already done)
npm ci

# Generate Prisma client for SQLite
npx prisma generate

# Create SQLite database and run migrations
npx prisma migrate deploy

# Seed admin user
npm run seed:admin
```

### Step 2: Build Desktop Installer

```powershell
# Build production Next.js app + Windows installer
npm run electron:build:win
```

**Build time:** 5-10 minutes (first build)
**Output location:** `dist/ColorTouch CRM-Setup-0.1.0.exe`

### Step 3: Install Desktop App

1. Navigate to `dist/` folder in File Explorer
2. Double-click `ColorTouch CRM-Setup-0.1.0.exe`
3. Follow installer wizard:
   - Choose installation location (default: `C:\Program Files\ColorTouch CRM`)
   - Create desktop shortcut (recommended)
   - Create Start Menu shortcut
4. Click "Finish" to launch app

### Step 4: Verify Installation

**App will be installed at:**
- Desktop shortcut: `ColorTouch CRM.lnk`
- Start Menu: `ColorTouch CRM`
- Installation folder: `C:\Program Files\ColorTouch CRM\`

**First launch:**
1. App opens with ColorTouch logo icon
2. Login with admin credentials:
   - Email: `ashishgond1100@gmail.com`
   - Password: `12345578`
3. Check network status indicator (online/offline badge)

---

## Offline Mode Features

### ✅ Works Offline (No Internet Required)
- View all leads, employees, campaigns
- Create new leads manually
- Search and filter data
- View dashboard metrics
- Edit lead information
- Schedule follow-ups
- View invoices and payments history

### ⚠️ Requires Internet Connection
- Upload CSV files (sync after connection)
- Send WhatsApp campaigns
- Process payments via Razorpay
- Send email notifications
- Google OAuth login
- Zapier webhooks

### 🔄 Auto-Sync When Online
- Detects network availability every 5 minutes
- Syncs pending changes automatically
- Shows sync status in UI
- Queues operations when offline
- Retries failed syncs

---

## Distribution Options

### Option 1: Share Installer File
1. Upload `dist/ColorTouch CRM-Setup-0.1.0.exe` to:
   - Google Drive
   - Dropbox
   - GitHub Releases
   - Company file server
2. Share download link with users
3. Users download and run installer

### Option 2: USB Distribution
1. Copy `dist/ColorTouch CRM-Setup-0.1.0.exe` to USB drive
2. Users run installer from USB
3. No internet required for installation

### Option 3: Network Share
1. Place installer on company network share
2. Users access `\\server\shared\ColorTouch CRM-Setup-0.1.0.exe`
3. Run installer from network location

---

## Switching Between Online and Offline

### To Switch from Online (PostgreSQL) to Offline (SQLite):

```powershell
# 1. Update .env
DATABASE_URL="file:./colortouch.db"

# 2. Regenerate Prisma client
npx prisma generate

# 3. Run migrations
npx prisma migrate deploy

# 4. Seed admin
npm run seed:admin

# 5. Rebuild installer
npm run electron:build:win
```

### To Switch from Offline to Online:

```powershell
# 1. Update .env
DATABASE_URL="postgresql://neondb_owner:npg_XJmrFe5pU4AK@ep-autumn-resonance-adrfzleg.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# 2. Regenerate Prisma client
npx prisma generate

# 3. Rebuild installer (data will sync to cloud)
npm run electron:build:win
```

---

## Troubleshooting

### Build Fails
**Error:** `electron-builder` fails
**Solution:**
```powershell
# Install Windows Build Tools
npm install --global windows-build-tools

# Clear cache and rebuild
npm run clean
npm ci
npm run electron:build:win
```

### Installer Won't Run
**Error:** "Windows protected your PC"
**Solution:**
1. Click "More info"
2. Click "Run anyway"
3. Or: Right-click installer → Properties → Unblock → Apply

### App Won't Start After Install
**Error:** White screen or crash
**Solution:**
1. Check logs at: `%APPDATA%\ColorTouch CRM\logs\`
2. Verify SQLite database exists at install location
3. Reinstall app

### Database Not Found
**Error:** "Can't reach database server"
**Solution:**
```powershell
# If using SQLite offline mode
DATABASE_URL="file:./colortouch.db"

# Run migrations in app data folder
cd "%LOCALAPPDATA%\Programs\ColorTouch CRM"
npx prisma migrate deploy
```

### Sync Not Working
**Error:** Data not syncing when online
**Solution:**
1. Check network indicator in app
2. Verify `REMOTE_SYNC_URL` in `.env.offline`
3. Check console logs for sync errors
4. Manually trigger sync from Settings → Integrations

---

## Uninstall

**Windows 10/11:**
1. Settings → Apps → Apps & features
2. Search "ColorTouch CRM"
3. Click → Uninstall

**Or use Control Panel:**
1. Control Panel → Programs → Uninstall a program
2. Find "ColorTouch CRM"
3. Right-click → Uninstall

---

## Advanced: Portable Version (No Installer)

To create a portable version that doesn't require installation:

```powershell
# Build unpacked version
npm run electron:build:win

# Portable app is in:
# dist/win-unpacked/ColorTouch CRM.exe

# Copy entire win-unpacked folder to USB/folder
# Users can run ColorTouch CRM.exe directly
```

---

## File Sizes

| File | Size (Approx) |
|------|---------------|
| Installer (.exe) | ~120-150 MB |
| Installed app | ~200-250 MB |
| SQLite database | ~50-500 KB (grows with data) |

---

## Next Steps

1. ✅ Build installer: `npm run electron:build:win`
2. ✅ Test on local machine first
3. ✅ Share installer file with team
4. ✅ Document for end users
5. ⚠️ Consider code signing certificate (removes security warnings)

**Ready to build?** Run: `npm run electron:build:win`
