export type NavigationDecision = 'internal' | 'external' | 'blocked'

export function parseSafeUrl(value: string): URL | null {
  if (value.length > 8192 || /[\u0000-\u001f\u007f]/.test(value)) return null
  try {
    const url = new URL(value)
    return url.username || url.password ? null : url
  } catch {
    return null
  }
}

export function classifyNavigation(value: string, trustedOrigin: string): NavigationDecision {
  const url = parseSafeUrl(value)
  if (!url) return 'blocked'
  if (url.origin === trustedOrigin && ['https:', 'http:'].includes(url.protocol)) return 'internal'
  if (['https:', 'http:'].includes(url.protocol)) return 'external'
  if (url.protocol === 'mailto:' && !/%0[ad]/i.test(value)) return 'external'
  return 'blocked'
}

export function isTrustedFrame(value: string, origin: string): boolean {
  const url = parseSafeUrl(value)
  return url !== null && url.origin === origin
}

export function isTrustedShell(value: string, developmentUrl?: string): boolean {
  const url = parseSafeUrl(value)
  if (!url) return false
  if (developmentUrl) return url.origin === new URL(developmentUrl).origin
  return url.protocol === 'enois:' && url.hostname === 'app' && url.pathname === '/index.html'
}
