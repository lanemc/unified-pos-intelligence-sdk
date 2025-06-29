#!/usr/bin/env node

const net = require('net');

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    server.on('error', () => resolve(false));
  });
}

async function findAvailablePort(startPort) {
  let port = startPort;
  while (!(await checkPort(port))) {
    port++;
  }
  return port;
}

async function findPorts() {
  const demoPort = await findAvailablePort(3000);
  const iframePort = await findAvailablePort(demoPort + 1);
  const sdkPort = await findAvailablePort(iframePort + 1);
  
  return {
    DEMO_PORT: demoPort,
    IFRAME_PORT: iframePort,
    SDK_PORT: sdkPort
  };
}

if (require.main === module) {
  findPorts().then(ports => {
    console.log(JSON.stringify(ports));
  });
}

module.exports = { findPorts };