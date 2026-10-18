import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { SettingsStore } from '../../src/main/services/settings-store'
import { defaultSettings } from '../../src/shared/contracts/desktop'

const directories: string[] = []
async function directory() {
  const path = await mkdtemp(join(tmpdir(), 'enois-store-test-'))
  directories.push(path)
  return path
}
afterEach(async () => {
  await Promise.all(directories.splice(0).map((path) => rm(path, { recursive: true, force: true })))
})

describe('persistência de configurações', () => {
  it('restaura preferências e dimensões após uma nova instância', async () => {
    const path = await directory()
    const store = new SettingsStore(path)
    await store.load()
    expect(store.settings).toEqual(defaultSettings)
    await store.saveSettings({ ...defaultSettings, zoom: 1.2, externalLinks: 'browser' })
    await store.saveBounds({ x: -1200, y: 40, width: 1000, height: 700 })
    const reopened = new SettingsStore(path)
    await reopened.load()
    expect(reopened.settings.zoom).toBe(1.2)
    expect(reopened.bounds?.x).toBe(-1200)
    expect((await stat(join(path, 'settings.json'))).mode & 0o777).toBe(0o600)
  })
  it('recupera corrupção e recusa dados sensíveis fora do schema', async () => {
    const path = await directory()
    await writeFile(join(path, 'settings.json'), '{broken')
    const store = new SettingsStore(path)
    await store.load()
    expect(store.settings).toEqual(defaultSettings)
    await store.saveSettings(defaultSettings)
    const data = await readFile(join(path, 'settings.json'), 'utf8')
    expect(data).not.toMatch(/password|cookie|token/)
  })
  it('serializa gravações concorrentes sem perder a última configuração', async () => {
    const path = await directory()
    const store = new SettingsStore(path)
    await Promise.all([
      store.saveSettings({ ...defaultSettings, zoom: 1.1 }),
      store.saveSettings({ ...defaultSettings, zoom: 1.3 }),
    ])
    const reopened = new SettingsStore(path)
    await reopened.load()
    expect(reopened.settings.zoom).toBe(1.3)
    const copy = reopened.settings
    copy.zoom = 1.7
    expect(reopened.settings.zoom).toBe(1.3)
  })
})
