import { _electron as electron, expect } from '@playwright/test'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { performance } from 'node:perf_hooks'
import { setTimeout as delay } from 'node:timers/promises'

const profile = await mkdtemp(join(tmpdir(), 'enois-preview-'))
const output = resolve('docs/preview')
await mkdir(output, { recursive: true })
let app
const launchedAt = performance.now()
try {
  app = await electron.launch({
    args: [resolve('.'), '--ozone-platform=x11'],
    env: {
      ...process.env,
      WAYLAND_DISPLAY: '',
      XDG_SESSION_TYPE: 'x11',
      ENOIS_E2E: '1',
      ENOIS_TEST_PROFILE: profile,
    },
  })
  const local = await app.firstWindow()
  const launchToWindowMs = performance.now() - launchedAt
  await local.waitForFunction(() => Boolean(window.desktop))
  await expect
    .poll(async () => (await local.evaluate(() => window.desktop.getState())).phase, {
      timeout: 45_000,
    })
    .toBe('ready')
  const state = await local.evaluate(() => window.desktop.getState())
  const launchToPlatformReadyMs = performance.now() - launchedAt
  if (state.phase !== 'ready')
    throw new Error('A plataforma real não carregou; captura de sucesso não será fabricada.')
  const remote = app.windows().find((page) => page.url().startsWith('https://enois.ia.br'))
  if (!remote) throw new Error('Conteúdo remoto não encontrado')
  await remote.waitForLoadState('domcontentloaded')
  await remote.locator('input[type="email"]').waitFor({ timeout: 30_000 })
  await remote.evaluate(() => document.fonts.ready)
  await local
    .getByRole('img', { name: 'Símbolo oficial do Énóis', exact: true })
    .evaluate((image) => image.decode())
  await remote.screenshot({ path: join(output, 'platform.png') })
  const capture = async (name) => {
    const handle = await app.evaluate(({ BrowserWindow }) => {
      const window = BrowserWindow.getAllWindows()[0]
      if (!window) throw new Error('Janela ausente')
      return window.getNativeWindowHandle().readUInt32LE(0).toString()
    })
    // Native X11 capture includes child WebContentsViews; capturePage captures only the shell.
    execFileSync('import', ['-window', handle, join(output, name)])
  }
  await capture('desktop.png')
  await app.evaluate(({ app }) => app.getAppMetrics())
  await delay(1500)
  const measurements = await app.evaluate(({ app }) =>
    app.getAppMetrics().map((metric) => ({
      type: metric.type,
      cpuPercent: metric.cpu.percentCPUUsage,
      workingSetKiB: metric.memory.workingSetSize,
      peakWorkingSetKiB: metric.memory.peakWorkingSetSize,
    })),
  )
  await writeFile(
    join(output, 'measurements.json'),
    `${JSON.stringify({ capturedAt: new Date().toISOString(), platform: process.platform, scenario: 'Original login page visible; no account; development Electron under X11/Xvfb; 1500ms CPU sampling interval', launchToWindowMs, launchToPlatformReadyMs, measurements }, null, 2)}\n`,
  )
  await local.getByRole('button', { name: 'Configurações', exact: true }).click()
  await local.getByRole('heading', { name: 'Seu espaço no desktop.' }).waitFor()
  await capture('settings.png')
  console.log(`Prévia real salva em ${output}`)
} finally {
  await app?.close()
  await rm(profile, { recursive: true, force: true })
}
