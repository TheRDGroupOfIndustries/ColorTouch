const { spawn } = require('child_process');
const path = require('path');

// Set development environment
process.env.NODE_ENV = 'development';

let nextReady = false;
let electronProcess = null;

// Start Next.js dev server
console.log('🚀 Starting Next.js development server...');
const nextProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '..'),
  shell: true,
});

// Capture Next.js output to detect when it's ready
nextProcess.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(data);
  
  // Check if Next.js is ready
  if (output.includes('Ready in') || output.includes('Local:') || output.includes('compiled successfully')) {
    if (!nextReady) {
      nextReady = true;
      // Wait a bit more to ensure it's fully ready
      setTimeout(startElectron, 2000);
    }
  }
});

nextProcess.stderr.on('data', (data) => {
  process.stderr.write(data);
});

function startElectron() {
  if (electronProcess) return; // Already started
  
  console.log('✅ Next.js is ready!');
  console.log('⚡ Starting Electron...');
  
  electronProcess = spawn('electron', ['.'], {
    cwd: path.join(__dirname, '..'),
    shell: true,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
    },
  });

  electronProcess.on('close', () => {
    console.log('Electron closed, shutting down Next.js...');
    nextProcess.kill();
    process.exit(0);
  });
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  if (electronProcess) electronProcess.kill();
  nextProcess.kill();
  process.exit(0);
});
