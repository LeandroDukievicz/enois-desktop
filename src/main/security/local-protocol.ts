import { net, protocol } from 'electron'
import { resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

export const localCsp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "frame-src 'none'",
  "form-action 'none'",
].join('; ')

export function registerLocalProtocol(root: string): void {
  const directory = resolve(root)
  protocol.handle('enois', async (request) => {
    try {
      const url = new URL(request.url)
      if (url.hostname !== 'app' || request.method !== 'GET')
        return new Response(null, { status: 403 })
      const file = resolve(directory, `.${decodeURIComponent(url.pathname)}`)
      if (!file.startsWith(`${directory}${sep}`)) return new Response(null, { status: 403 })
      const result = await net.fetch(pathToFileURL(file).toString())
      const headers = new Headers(result.headers)
      headers.set('Content-Security-Policy', localCsp)
      headers.set('X-Content-Type-Options', 'nosniff')
      return new Response(result.body, { status: result.status, headers })
    } catch {
      return new Response(null, { status: 404 })
    }
  })
}
