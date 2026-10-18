import { mkdtemp, readFile, rm, stat, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import { createLogger } from '../../src/main/services/logger'

it('limita campos e métricas, protege o arquivo e rotaciona o log', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'enois-logger-test-'))
  try {
    await mkdir(join(directory, 'logs'))
    const file = join(directory, 'logs/desktop.log')
    await writeFile(file, 'x'.repeat(1_048_577))
    createLogger(directory)('remote.load_failed', -105, 'error', {
      elapsed_ms: 42,
      invalid: Infinity,
      'invalid-key': 1,
    })
    const data = JSON.parse((await readFile(file, 'utf8')).trim())
    expect(data).toMatchObject({
      level: 'error',
      event: 'remote.load_failed',
      code: '-105',
      metrics: { elapsed_ms: 42 },
    })
    expect(Object.keys(data).sort()).toEqual(['code', 'event', 'level', 'metrics', 'time'])
    expect((await stat(file)).mode & 0o777).toBe(0o600)
    expect((await stat(`${file}.1`)).size).toBe(1_048_577)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
