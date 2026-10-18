import { appendFileSync, mkdirSync, renameSync, statSync } from 'node:fs'
import { join } from 'node:path'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export function createLogger(directory: string) {
  const folder = join(directory, 'logs')
  const file = join(folder, 'desktop.log')
  return (
    scope: string,
    code: number | string = 'ok',
    level: LogLevel = 'info',
    metrics?: Record<string, number>,
  ) => {
    try {
      mkdirSync(folder, { recursive: true, mode: 0o700 })
      try {
        if (statSync(file).size > 1_048_576) renameSync(file, `${file}.1`)
      } catch {
        // First write, or rotation unavailable. Logging must not crash the app.
      }
      const safeScope = scope.replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 64)
      const safeCode = String(code)
        .replace(/[^a-zA-Z0-9_.-]/g, '')
        .slice(0, 40)
      const safeMetrics = Object.fromEntries(
        Object.entries(metrics ?? {}).filter(
          ([key, value]) => /^[a-zA-Z_]{1,40}$/.test(key) && Number.isFinite(value),
        ),
      )
      appendFileSync(
        file,
        `${JSON.stringify({ time: new Date().toISOString(), level, event: safeScope, code: safeCode, metrics: safeMetrics })}\n`,
        { mode: 0o600 },
      )
    } catch {
      // Never include URLs, request bodies, renderer messages or credentials in logs.
    }
  }
}
