const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { startServer, stopServer } = require('./server');
const isDev = process.env.NODE_ENV === 'development';

const LOCAL_URL = 'http://localhost:3000';

let mainWindow;
let serverStarted = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    icon: path.join(__dirname, '../build/icons/icons/png/256x256.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    backgroundColor: '#1a1a2e',
    show: false,
    autoHideMenuBar: !isDev,
    title: 'ColorTouch CRM',
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Show loading screen first
  const loadingHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .loader {
          text-align: center;
          color: white;
        }
        .spinner {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        h1 { font-size: 28px; margin: 0 0 10px; }
        p { font-size: 16px; opacity: 0.9; margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="loader">
        <div class="spinner"></div>
        <h1>ColorTouch CRM</h1>
        <p>Starting local server...</p>
        <p style="font-size: 14px; opacity: 0.7;">This may take a few seconds</p>
      </div>
    </body>
    </html>
  `;

  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(loadingHTML)}`);

  // Load the app
  if (isDev) {
    // Development: connect to Next.js dev server
    mainWindow.loadURL(LOCAL_URL);
    mainWindow.webContents.openDevTools();
  } else {
    // Production: start local Next.js server
    console.log('Starting Next.js server...');
    startServer()
      .then((port) => {
        console.log(`Server ready on port ${port}, loading app...`);
        serverStarted = true;
        const localUrl = `http://localhost:${port}`;
        
        // Wait for server to be fully ready
        const checkServer = () => {
          const http = require('http');
          const options = {
            hostname: 'localhost',
            port: port,
            path: '/',
            method: 'GET',
            timeout: 5000
          };
          
          const req = http.request(options, (res) => {
            console.log('Server is responding, loading app...');
            mainWindow.loadURL(localUrl);
            // Dev tools disabled in production for better performance
            // Uncomment below line if you need to debug production issues:
            // mainWindow.webContents.openDevTools();
          });
          
          req.on('error', (err) => {
            console.log('Server not ready yet, retrying...');
            setTimeout(checkServer, 1000);
          });
          
          req.on('timeout', () => {
            req.destroy();
            console.log('Request timeout, retrying...');
            setTimeout(checkServer, 1000);
          });
          
          req.end();
        };
        
        // Start checking after 2 seconds
        setTimeout(checkServer, 2000);
      })
      .catch((err) => {
        console.error('Server start failed:', err);
        const errorHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { background: #1a1a2e; color: white; font-family: sans-serif; padding: 50px; }
              h1 { color: #ff6b6b; }
              pre { background: rgba(0,0,0,0.3); padding: 15px; border-radius: 5px; overflow: auto; }
              .info { background: rgba(100,100,255,0.2); padding: 10px; margin: 20px 0; border-radius: 5px; }
            </style>
          </head>
          <body>
            <h1>Failed to Start Server</h1>
            <p>Error: ${err.message}</p>
            <div class="info">
              <strong>Tip:</strong> Check the server-log.txt file in the app directory for details.
            </div>
            <pre>${err.stack || err.toString()}</pre>
          </body>
          </html>
        `;
        mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHTML)}`);
      });
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create custom menu
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) mainWindow.reload();
          },
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
      ],
    },
  ];

  if (isDev) {
    template.push({
      label: 'Developer',
      submenu: [
        { role: 'toggleDevTools' },
        { type: 'separator' },
        {
          label: 'Reload',
          accelerator: 'F5',
          click: () => {
            if (mainWindow) mainWindow.reload();
          },
        },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App lifecycle events
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Stop the local server
  if (serverStarted) {
    console.log('Stopping local server...');
    stopServer();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle any uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
