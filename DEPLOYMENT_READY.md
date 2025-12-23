# Web Deployment Guide

## ✅ Ready for Web Deployment

Your project is now properly configured for both:
- **Web deployment** (Vercel, Netlify, etc.)
- **Desktop app** (Electron)

---

## 🌐 Deploy to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Add lead selection and fix deployment config"
git push origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 3. Environment Variables
Add these in Vercel dashboard → Settings → Environment Variables:

**Required:**
```env
DATABASE_URL=your_production_database_url
NEXTAUTH_SECRET=your_production_secret
AUTH_SECRET=your_production_auth_secret
NEXTAUTH_URL=https://your-app.vercel.app
```

**Optional (if using):**
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
```

---

## 🗄️ Database Setup

### Option 1: PostgreSQL (Recommended for production)

1. **Create Database** (e.g., Neon, Supabase, Railway)

2. **Update Schema** for PostgreSQL:
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

3. **Run Migration**:
```bash
npx prisma migrate dev --name init_postgresql
```

### Option 2: Keep SQLite (for testing)
- Not recommended for production
- Limited scalability

---

## 🔨 Build Electron App (Desktop)

The Electron files WON'T interfere with web deployment because:
- Removed `"main"` from package.json
- Added Electron files to `.gitignore`
- Using separate `electron-package.json`

### Build Desktop App:
```bash
# Windows
npm run electron:build:win

# macOS
npm run electron:build:mac

# Linux
npm run electron:build:linux
```

---

## ✅ What Was Fixed

1. **Removed Electron "main" entry** - Won't confuse Vercel
2. **Updated .gitignore** - Electron build files excluded
3. **Separate Electron config** - `electron-package.json`
4. **Updated build commands** - Use separate configs

---

## 🧪 Test Before Pushing

```bash
# Test web build
npm run build
npm start

# Test Electron (optional)
npm run electron:dev
```

---

## 🚀 You're Ready!

Run these commands:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

Then deploy on Vercel! 🎉
