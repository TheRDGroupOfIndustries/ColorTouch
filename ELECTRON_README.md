# ColorTouch CRM - Desktop App

## Development

To run the desktop app in development mode:

```powershell
npm run electron:dev
```

This will:
1. Start the Next.js development server on port 3000
2. Launch the Electron window after 5 seconds
3. Enable hot-reload for both Next.js and Electron

## Building

### Build for Windows
```powershell
npm run electron:build:win
```

### Build for macOS
```powershell
npm run electron:build:mac
```

### Build for Linux
```powershell
npm run electron:build:linux
```

### Build for all platforms
```powershell
npm run electron:build
```

The built applications will be in the `dist/` folder.

## Production Mode

Before building, ensure your Next.js app is configured for static export.

Note: The electron build uses Next.js static export (`next export`), which means:
- No server-side rendering in the desktop app
- API routes won't work in production desktop builds
- Consider using a backend API server separately if needed

## Folder Structure

```
ColorTouch/
├── electron/
│   ├── main.js          # Main Electron process
│   ├── preload.js       # Preload script (IPC bridge)
│   └── dev-runner.js    # Development runner
├── build/               # Icons for different platforms
│   ├── icon.ico         # Windows icon
│   ├── icon.icns        # macOS icon
│   └── icon.png         # Linux icon
├── dist/                # Built desktop apps
└── out/                 # Next.js static export
```

## Icons

Place your app icons in the `build/` folder:
- **Windows**: `icon.ico` (256x256 or multi-size)
- **macOS**: `icon.icns` (512x512 @ 2x)
- **Linux**: `icon.png` (512x512 PNG)

You can use tools like [iConvert Icons](https://iconverticons.com/) to convert between formats.
