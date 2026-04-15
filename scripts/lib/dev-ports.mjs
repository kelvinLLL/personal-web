import net from 'node:net';

import {
  BACKEND_DEV_PORT,
  BOOK_READER_BASE,
  BOOK_READER_DEV_PORT,
} from './site-config.mjs';

export async function canListenOnPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on('error', () => resolve(false));
    server.listen({host: '127.0.0.1', port}, () => {
      server.close(() => resolve(true));
    });
  });
}

export async function chooseAvailablePort(startPort, availabilityCheck = canListenOnPort, reserved = new Set()) {
  let port = startPort;
  while (reserved.has(port) || !(await availabilityCheck(port))) {
    port += 1;
  }
  reserved.add(port);
  return port;
}

export function buildDevRuntime({rootPort, bookReaderPort, frontendPort, backendPort}) {
  return {
    rootPort,
    bookReaderPort,
    frontendPort,
    backendPort,
    rootOrigin: `http://127.0.0.1:${rootPort}`,
    bookReaderTarget: `http://127.0.0.1:${bookReaderPort}`,
    frontendTarget: `http://127.0.0.1:${frontendPort}`,
    backendTarget: `http://127.0.0.1:${backendPort}`,
  };
}

export function buildFrontendDevProxyConfig(env = process.env) {
  const backendTarget = env.VITE_BACKEND_URL || `http://127.0.0.1:${BACKEND_DEV_PORT}`;
  const bookReaderTarget = env.VITE_BOOK_READER_URL || `http://127.0.0.1:${BOOK_READER_DEV_PORT}`;

  return {
    '/api': {
      target: backendTarget,
      changeOrigin: true,
    },
    [BOOK_READER_BASE]: {
      target: bookReaderTarget,
      changeOrigin: true,
    },
  };
}

export function resolveProxyTargetForRuntime(requestPath = '/', runtime) {
  if (requestPath.startsWith('/api/')) {
    return runtime.backendTarget;
  }
  if (requestPath.startsWith(BOOK_READER_BASE)) {
    return runtime.bookReaderTarget;
  }
  return runtime.frontendTarget;
}
