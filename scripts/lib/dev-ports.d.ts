export interface FrontendDevProxyTarget {
  target: string
  changeOrigin: boolean
}

export interface DevRuntime {
  rootPort: number
  portalPort: number
  bookReaderPort: number
  dailyNuancePort: number
  frontendPort: number
  backendPort: number
  rootOrigin: string
  portalTarget: string
  bookReaderTarget: string
  dailyNuanceTarget: string
  frontendTarget: string
  backendTarget: string
}

export function canListenOnPort(port: number): Promise<boolean>
export function chooseAvailablePort(
  startPort: number,
  availabilityCheck?: (port: number) => Promise<boolean>,
  reserved?: Set<number>,
): Promise<number>
export function buildDevRuntime(input: {
  rootPort: number
  portalPort: number
  bookReaderPort: number
  dailyNuancePort: number
  frontendPort: number
  backendPort: number
}): DevRuntime
export function buildFrontendDevProxyConfig(
  env?: Record<string, string | undefined>,
): Record<string, FrontendDevProxyTarget>
export function resolveProxyTargetForRuntime(requestPath: string | undefined, runtime: DevRuntime): string
