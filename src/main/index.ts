import { app, BrowserWindow, protocol, session } from 'electron'
import { chmod, mkdir } from 'node:fs/promises'
import { join, isAbsolute } from 'node:path'
import { performance } from 'node:perf_hooks'
import { registerLocalProtocol } from './security/local-protocol'
import { SettingsStore } from './services/settings-store'
import { createLogger } from './services/logger'
import { createDesktopWindow } from './windows/desktop-window'

const startedAt = performance.now()
const remoteUrl = 'https://enois.ia.br/feed'
const testMode = !app.isPackaged && process.env.ENOIS_E2E === '1'

app.setName('Énóis Desktop')
app.enableSandbox()
protocol.registerSchemesAsPrivileged([
  { scheme: 'enois', privileges: { standard: true, secure: true, supportFetchAPI: true } },
])

if (testMode && process.env.ENOIS_TEST_PROFILE && isAbsolute(process.env.ENOIS_TEST_PROFILE)) {
  app.setPath('userData', process.env.ENOIS_TEST_PROFILE)
}

let testRemoteUrl: string | undefined
if (testMode && process.env.ENOIS_TEST_REMOTE_URL) {
  const url = new URL(process.env.ENOIS_TEST_REMOTE_URL)
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1') {
    throw new Error('O servidor de testes deve usar HTTP em 127.0.0.1.')
  }
  testRemoteUrl = url.toString()
}

const locked = app.requestSingleInstanceLock()
if (!locked) app.quit()
else {
  app.on('second-instance', () => {
    const window = BrowserWindow.getAllWindows()[0]
    if (window?.isMinimized()) window.restore()
    window?.show()
    window?.focus()
  })
  app.on('window-all-closed', () => app.quit())
  void app
    .whenReady()
    .then(async () => {
      const directory = app.getPath('userData')
      await mkdir(directory, { recursive: true, mode: 0o700 })
      await chmod(directory, 0o700)
      const log = createLogger(directory)
      log('app.started', app.getVersion())
      process.on('uncaughtException', () => {
        log('app.uncaught_exception', 'main', 'error')
        app.quit()
      })
      process.on('unhandledRejection', () => log('app.unhandled_rejection', 'main', 'error'))
      app.on('before-quit', () => log('app.quitting'))
      session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) =>
        callback(false),
      )
      session.defaultSession.setPermissionCheckHandler(() => false)
      registerLocalProtocol(join(__dirname, '../renderer'))
      const store = new SettingsStore(directory)
      await store.load()
      await createDesktopWindow({
        store,
        remoteUrl: testRemoteUrl ?? remoteUrl,
        developmentUrl: !app.isPackaged ? process.env.ELECTRON_RENDERER_URL : undefined,
        log,
        startedAt,
      })
    })
    .catch(() => {
      createLogger(app.getPath('userData'))('app.start_failed', 'bootstrap', 'error')
      app.quit()
    })
}
