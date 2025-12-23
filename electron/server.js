const path = require('path');
const http = require('http');
const fs = require('fs');
const net = require('net');

const hostname = 'localhost';
let port = 3000;

let server = null;
let nextApp = null;

// Create a log file for debugging
const logFile = path.join(__dirname, '..', 'server-log.txt');
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  try {
    fs.appendFileSync(logFile, logMessage);
  } catch (e) {
    // Ignore file write errors
  }
}

function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
    server.listen(startPort, () => {
      const { port } = server.address();
      server.close(() => {
        resolve(port);
      });
    });
  });
}

async function startServer() {
  const appDir = path.join(__dirname, '..');
  
  log('App directory: ' + appDir);
  log('__dirname: ' + __dirname);
  log('process.cwd(): ' + process.cwd());
  log('Starting Next.js programmatically...');
  
  // Find an available port
  try {
    port = await findAvailablePort(3000);
    log(`Found available port: ${port}`);
  } catch (err) {
    log('Error finding available port: ' + err.message);
    throw err;
  }
  
  // Change to app directory
  process.chdir(appDir);
  log('Changed directory to: ' + process.cwd());
  
  // Set database path to absolute location in prisma folder
  const dbPath = path.join(appDir, 'prisma', 'colortouch.db');
  process.env.DATABASE_URL = `file:${dbPath}`;
  log('Database URL set to: ' + process.env.DATABASE_URL);
  
  // Ensure prisma directory exists and check if database exists
  const prismaDir = path.join(appDir, 'prisma');
  if (!fs.existsSync(prismaDir)) {
    log('Creating prisma directory...');
    fs.mkdirSync(prismaDir, { recursive: true });
  }
  
  if (fs.existsSync(dbPath)) {
    log('Database file found at: ' + dbPath);
  } else {
    log('WARNING: Database file not found at: ' + dbPath);
    log('The app may not work correctly without a database file.');
  }
  
  // Rename next.config.prod.js to next.config.js if it exists
  const prodConfig = path.join(appDir, 'next.config.prod.js');
  const mainConfig = path.join(appDir, 'next.config.js');
  if (fs.existsSync(prodConfig) && !fs.existsSync(mainConfig)) {
    log('Renaming next.config.prod.js to next.config.js');
    fs.copyFileSync(prodConfig, mainConfig);
  }
  
  // Set environment variables
  process.env.PORT = String(port);
  process.env.HOSTNAME = hostname;
  process.env.NODE_ENV = 'production';
  
  try {
    // Check if node_modules/next exists
    const nextModulePath = path.join(appDir, 'node_modules', 'next');
    log('Checking for Next.js at: ' + nextModulePath);
    log('Next.js module exists: ' + fs.existsSync(nextModulePath));
    
    // Import Next.js
    log('Requiring next module...');
    const next = require('next');
    log('Next.js module loaded successfully');
    
    // Create Next.js app instance
    log('Creating Next.js app instance...');
    nextApp = next({
      dev: false,
      dir: appDir,
      hostname: hostname,
      port: port,
      customServer: true,
    });
    log('Next.js app instance created');
    
    // Prepare Next.js
    log('Preparing Next.js...');
    await nextApp.prepare();
    log('Next.js prepared successfully');
    
    // Get request handler
    const handle = nextApp.getRequestHandler();
    log('Got request handler');
    
    // Create HTTP server
    server = http.createServer(async (req, res) => {
      try {
        await handle(req, res);
      } catch (err) {
        log('Error handling request: ' + err.message);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });
    log('HTTP server created');
    
    // Start listening
    await new Promise((resolve, reject) => {
      server.listen(port, hostname, (err) => {
        if (err) {
          log('Failed to start server: ' + err.message);
          reject(err);
          return;
        }
        log(`> Ready on http://${hostname}:${port}`);
        resolve(port);
      });
      
      server.on('error', (err) => {
        log('Server error: ' + err.message);
        reject(err);
      });
    });
    
    return port;
    
  } catch (err) {
    log('ERROR starting Next.js server: ' + err.message);
    log('Stack trace: ' + err.stack);
    throw err;
  }
}

function stopServer() {
  log('Stopping server...');
  
  if (server) {
    server.close();
    server = null;
  }
  
  if (nextApp) {
    // Next.js doesn't have a close method in newer versions
    nextApp = null;
  }
}

module.exports = { startServer, stopServer };
