import { _electron as electron, expect } from '@playwright/test'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { performance } from 'node:perf_hooks'
import { setTimeout as delay } from 'node:timers/promises'

const profile = await mkdtemp(join(tmpdir(), 'enois-preview-'))
const output = resolve('docs/preview')
await mkdir(output, { recursive: true })
let app
let failure
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
      ENOIS_TEST_REMOTE_URL: '',
    },
  })
  const local = await app.firstWindow()
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setSize(1600, 900))
  await expect.poll(() => local.evaluate(() => window.innerWidth)).toBe(1600)
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
    await local.evaluate(() => document.fonts.ready)
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
  await local.getByRole('button', { name: 'Voltar ao Énóis', exact: true }).click()
  // Scope the connectivity exercise to this disposable remote renderer.
  // Bypass the service worker so cached navigation cannot hide a failed load.
  const network = await remote.context().newCDPSession(remote)
  await network.send('Network.enable')
  await network.send('Network.setBypassServiceWorker', { bypass: true })
  await network.send('Network.emulateNetworkConditions', {
    offline: true,
    latency: 0,
    downloadThroughput: -1,
    uploadThroughput: -1,
  })
  await local.getByRole('button', { name: 'Recarregar', exact: true }).click()
  await expect(local.getByRole('heading', { name: 'Uma pausa na conexão.' })).toBeVisible()
  await capture('connection-error.png')
  await network.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 0,
    downloadThroughput: -1,
    uploadThroughput: -1,
  })
  await network.send('Network.setBypassServiceWorker', { bypass: false })
  await network.detach()
  await local.getByRole('button', { name: 'Tentar novamente', exact: true }).click()
  await expect
    .poll(async () => (await local.evaluate(() => window.desktop.getState())).phase, {
      timeout: 45_000,
    })
    .toBe('ready')
  await writeFile(
    join(output, 'capture-info.json'),
    `${JSON.stringify({ capturedAt: new Date().toISOString(), environment: 'Linux; Electron development build; X11/Xvfb; disposable profile; no account', windowSize: { width: 1600, height: 900 }, captures: { 'desktop.png': 'Original public sign-in page inside the desktop application', 'platform.png': 'Original remote WebContentsView without the local toolbar', 'settings.png': 'Implemented local settings', 'connection-error.png': 'Implemented error UI after scoped offline network emulation with service-worker bypass in the disposable profile' }, recoveryVerified: true }, null, 2)}\n`,
  )
  console.log(`Prévia real salva em ${output}`)
} catch (error) {
  failure = error
} finally {
  try {
    await app?.close()
    if (app) {
      const log = await readFile(join(profile, 'logs/desktop.log'), 'utf8')
      if (/"event":"app\.(?:uncaught_exception|unhandled_rejection)"/.test(log)) {
        failure ??= new Error('O aplicativo registrou uma exceção durante a captura.')
      }
      if (!log.includes('"event":"window.closed"')) {
        failure ??= new Error('O encerramento da janela não foi confirmado.')
      }
    }
  } catch (error) {
    failure ??= error
  } finally {
    await rm(profile, { recursive: true, force: true })
  }
}
if (failure) throw failure
