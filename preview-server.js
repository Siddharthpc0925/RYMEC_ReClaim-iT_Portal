const { spawn } = require('child_process');
const path = require('path');

console.log('===================================================================');
console.log('💎 RYMEC ReClaim-iT: Campus Lost & Found Portal Preview Server');
console.log('   Liquid Glass iOS Design System | Full Demo Engine');
console.log('===================================================================');

// 1. Start Backend on port 5000
const backendPath = path.join(__dirname, 'backend');
console.log('🚀 Starting Backend API on http://localhost:5000...');
const backend = spawn('node', ['server.js'], {
  cwd: backendPath,
  stdio: 'inherit',
  shell: true
});

// 2. Start Frontend Vite server on port 5173
const frontendPath = path.join(__dirname, 'frontend');
console.log('🎨 Starting Frontend Vite Server on http://localhost:5173...');
const frontend = spawn('cmd.exe', ['/c', 'npx vite --host'], {
  cwd: frontendPath,
  stdio: 'inherit',
  shell: true
});

backend.on('error', (err) => console.error('Backend process error:', err));
frontend.on('error', (err) => console.error('Frontend process error:', err));

process.on('SIGINT', () => {
  console.log('Shutting down preview services...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  backend.kill();
  frontend.kill();
  process.exit(0);
});
