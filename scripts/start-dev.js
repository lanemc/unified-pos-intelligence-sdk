#!/usr/bin/env node

const { spawn } = require('child_process');
const { findPorts } = require('./find-ports');
const fs = require('fs');
const path = require('path');

async function startDevelopment() {
  console.log('🔍 Finding available ports...');
  
  const ports = await findPorts();
  console.log(`📍 Using ports:
  - Demo POS App:     http://localhost:${ports.DEMO_PORT}
  - Iframe App:       http://localhost:${ports.IFRAME_PORT}
  - SDK Dev Server:   http://localhost:${ports.SDK_PORT}`);

  // Create environment variables
  const env = {
    ...process.env,
    DEMO_PORT: ports.DEMO_PORT.toString(),
    IFRAME_PORT: ports.IFRAME_PORT.toString(),
    SDK_PORT: ports.SDK_PORT.toString(),
    NEXT_PUBLIC_IFRAME_URL: `http://localhost:${ports.IFRAME_PORT}`,
    NEXT_PUBLIC_DEMO_URL: `http://localhost:${ports.DEMO_PORT}`,
  };

  console.log('\n🚀 Starting development servers...\n');

  // Start all services
  const processes = [];

  // Start SDK build in watch mode
  console.log('📦 Starting SDK build (watch mode)...');
  const sdkProcess = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, '../packages/sdk'),
    env,
    stdio: ['inherit', 'pipe', 'pipe']
  });
  
  sdkProcess.stdout.on('data', (data) => {
    console.log(`[SDK] ${data.toString().trim()}`);
  });
  
  sdkProcess.stderr.on('data', (data) => {
    console.log(`[SDK] ${data.toString().trim()}`);
  });
  
  processes.push(sdkProcess);

  // Start iframe app
  console.log('🖼️  Starting iframe app...');
  const iframeProcess = spawn('npm', ['run', 'dev', '--', '-p', ports.IFRAME_PORT.toString()], {
    cwd: path.join(__dirname, '../packages/iframe'),
    env,
    stdio: ['inherit', 'pipe', 'pipe']
  });
  
  iframeProcess.stdout.on('data', (data) => {
    console.log(`[IFRAME] ${data.toString().trim()}`);
  });
  
  iframeProcess.stderr.on('data', (data) => {
    console.log(`[IFRAME] ${data.toString().trim()}`);
  });
  
  processes.push(iframeProcess);

  // Start demo app
  console.log('🏪 Starting demo POS app...');
  const demoProcess = spawn('npm', ['run', 'dev', '--', '-p', ports.DEMO_PORT.toString()], {
    cwd: path.join(__dirname, '../packages/demo'),
    env,
    stdio: ['inherit', 'pipe', 'pipe']
  });
  
  demoProcess.stdout.on('data', (data) => {
    console.log(`[DEMO] ${data.toString().trim()}`);
  });
  
  demoProcess.stderr.on('data', (data) => {
    console.log(`[DEMO] ${data.toString().trim()}`);
  });
  
  processes.push(demoProcess);

  // Handle process termination
  const cleanup = () => {
    console.log('\n🛑 Shutting down development servers...');
    processes.forEach(proc => {
      if (!proc.killed) {
        proc.kill('SIGTERM');
      }
    });
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // Wait for a bit then show ready message
  setTimeout(() => {
    console.log(`
🎉 Development environment ready!

📱 Open your browser to:
   Demo POS App: http://localhost:${ports.DEMO_PORT}
   
💡 The iframe will automatically connect to: http://localhost:${ports.IFRAME_PORT}

🔧 Press Ctrl+C to stop all servers
`);
  }, 3000);
}

if (require.main === module) {
  startDevelopment().catch(error => {
    console.error('Failed to start development environment:', error);
    process.exit(1);
  });
}