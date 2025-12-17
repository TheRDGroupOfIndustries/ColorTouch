const { spawn } = require('child_process');
const path = require('path');

// Set development environment
process.env.NODE_ENV = 'development';

// Start Next.js dev server
console.log('🚀 Starting Next.js development server...');
const nextProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '..'),
  shell: true,
  stdio: 'inherit',
});

// Wait for Next.js to be ready, then start Electron
setTimeout(() => {
  console.log('⚡ Starting Electron...');
  const electronProcess = spawn('electron', ['.'], {
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
}, 5000); // Wait 5 seconds for Next.js to start

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  nextProcess.kill();
  process.exit(0);
});
