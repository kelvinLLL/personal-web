declare module '../scripts/lib/dev-ports.mjs' {
  export interface FrontendDevProxyTarget {
    target: string
    changeOrigin: boolean
  }

  export function buildFrontendDevProxyConfig(
    env?: Record<string, string | undefined>,
  ): Record<string, FrontendDevProxyTarget>
}
