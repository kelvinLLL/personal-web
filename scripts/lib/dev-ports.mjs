import net from 'node:net';

import {
  BOOK_READER_BASE,
  DAILY_NUANCE_BASE,
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

export async function chooseAvailablePort(startPort, availabilityCheck = canListenOnPort) {
  let port = startPort;
  while (!(await availabilityCheck(port))) {
    port += 1;
  }
  return port;
}

export function buildDevRuntime({rootPort, portalPort, bookReaderPort, dailyNuancePort}) {
  return {
    rootPort,
    portalPort,
    bookReaderPort,
    dailyNuancePort,
    rootOrigin: `http://127.0.0.1:${rootPort}`,
    portalTarget: `http://127.0.0.1:${portalPort}`,
    bookReaderTarget: `http://127.0.0.1:${bookReaderPort}`,
    dailyNuanceTarget: `http://127.0.0.1:${dailyNuancePort}`,
  };
}

export function resolveProxyTargetForRuntime(requestPath = '/', runtime) {
  if (requestPath.startsWith(BOOK_READER_BASE)) {
    return runtime.bookReaderTarget;
  }
  if (requestPath.startsWith(DAILY_NUANCE_BASE)) {
    return runtime.dailyNuanceTarget;
  }
  return runtime.portalTarget;
}
