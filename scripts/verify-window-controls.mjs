import { _electron as electron, expect } from '@playwright/test'
import { execFileSync, spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

// Run through pnpm verify:window-controls, which allocates its own Xvfb display.
const environment = { ...process.env, WAYLAND_DISPLAY: '', XDG_SESSION_TYPE: 'x11' }
const manager = spawn('openbox', ['--config-file', '/etc/xdg/openbox/rc.xml'], {
  env: environment,
  stdio: 'ignore',
})
let managerError
manager.on('error', (error) => {
  managerError = error
})
const server = createServer((_request, response) => {
  response.setHeader('Content-Type', 'text/html; charset=utf-8')
  response.end('<!doctype html><html lang="pt-BR"><h1>Conteúdo de teste</h1></html>')
})
await new Promise((done) => server.listen(0, '127.0.0.1', done))
const profile = await mkdtemp(join(tmpdir(), 'enois-native-controls-'))
let app
let appProcess
const report = {
  checkedAt: new Date().toISOString(),
  environment: 'X11/Xvfb with Openbox; no account',
  nativeButtonClicks: [],
}
try {
  await delay(500)
  if (managerError || manager.exitCode !== null) {
    throw new Error('Openbox não iniciou. Instale as ferramentas descritas em docs/development.md.')
  }
  app = await electron.launch({
    args: [resolve('.'), '--ozone-platform=x11'],
    env: {
      ...environment,
      ENOIS_E2E: '1',
      ENOIS_TEST_PROFILE: profile,
      ENOIS_TEST_REMOTE_URL: `http://127.0.0.1:${server.address().port}/feed`,
    },
  })
  // Cache before closing: Playwright disposes the Electron dispatcher after process exit.
  appProcess = app.process()
  const local = await app.firstWindow()
  await expect(local.getByRole('status')).toHaveText('Conectado')
  const handle = await app.evaluate(({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0].getNativeWindowHandle().readUInt32LE(0).toString(),
  )
  execFileSync('xdotool', ['windowactivate', '--sync', handle], { env: environment })
  const click = async (index) => {
    await delay(250)
    const area = await local.evaluate(() => {
      const safe = navigator.windowControlsOverlay.getTitlebarAreaRect()
      return { left: safe.left, right: safe.right, width: innerWidth, height: safe.height }
    })
    expect(area.left).toBe(0)
    expect(area.right).toBeLessThan(area.width)
    const bounds = await app.evaluate(({ BrowserWindow }) =>
      BrowserWindow.getAllWindows()[0].getContentBounds(),
    )
    const x = Math.round(bounds.x + area.right + ((area.width - area.right) * (index + 0.5)) / 3)
    const y = Math.round(bounds.y + area.height / 2)
    // Native controls are outside the DOM. Send real X11 pointer input on this isolated display.
    execFileSync('xdotool', ['mousemove', '--sync', String(x), String(y), 'click', '1'], {
      env: environment,
    })
  }
  const maximized = () =>
    app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].isMaximized())
  const minimized = () =>
    app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].isMinimized())
  await click(1)
  await expect.poll(maximized).toBe(true)
  report.nativeButtonClicks.push({ button: 'maximize', passed: true })
  await click(1)
  await expect.poll(maximized).toBe(false)
  report.nativeButtonClicks.push({ button: 'restore', passed: true })
  await click(0)
  await expect.poll(minimized).toBe(true)
  report.nativeButtonClicks.push({ button: 'minimize', passed: true })
  await app.evaluate(({ BrowserWindow }) => {
    const window = BrowserWindow.getAllWindows()[0]
    window.restore()
    window.show()
    window.focus()
  })
  await expect.poll(minimized).toBe(false)
  await click(2)
  await expect.poll(() => appProcess.exitCode).toBe(0)
  report.nativeButtonClicks.push({ button: 'close', passed: true, exitCode: appProcess.exitCode })
  await mkdir('test-results', { recursive: true })
  await writeFile(
    'test-results/native-window-controls.json',
    `${JSON.stringify(report, null, 2)}\n`,
  )
  console.log('Controles nativos: maximizar, restaurar, minimizar e fechar passaram.')
} finally {
  if (app && appProcess?.exitCode === null) await app.close()
  manager.kill('SIGTERM')
  await rm(profile, { recursive: true, force: true })
  await new Promise((done) => server.close(() => done()))
}
