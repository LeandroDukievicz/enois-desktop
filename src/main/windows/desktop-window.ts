import {
  app,
  BrowserWindow,
  dialog,
  Menu,
  net,
  powerMonitor,
  screen,
  session,
  shell,
  WebContentsView,
} from 'electron'
import { join } from 'node:path'
import { performance } from 'node:perf_hooks'
import {
  channels,
  type Command,
  type DesktopState,
  type Settings,
} from '../../shared/contracts/desktop'
import { registerIpc } from '../ipc/register'
import { attachRemoteNavigation } from '../navigation/remote-navigation'
import { classifyNavigation, isTrustedShell } from '../security/navigation-policy'
import { secureSession } from '../security/session-policy'
import type { createLogger } from '../services/logger'
import type { SettingsStore } from '../services/settings-store'

const toolbarHeight = 64

export async function createDesktopWindow(options: {
  store: SettingsStore
  remoteUrl: string
  developmentUrl?: string
  log: ReturnType<typeof createLogger>
  startedAt: number
}): Promise<BrowserWindow> {
  const { store, log } = options
  const origin = new URL(options.remoteUrl).origin
  const saved = store.settings.restoreWindow ? store.bounds : undefined
  const display = screen.getDisplayMatching(saved ?? { x: 0, y: 0, width: 1360, height: 900 })
  const work = display.workArea
  const width = Math.min(saved?.width ?? 1360, work.width)
  const height = Math.min(saved?.height ?? 900, work.height)
  const window = new BrowserWindow({
    width,
    height,
    ...(saved
      ? {
          x: Math.max(work.x, Math.min(saved.x, work.x + work.width - width)),
          y: Math.max(work.y, Math.min(saved.y, work.y + work.height - height)),
        }
      : {}),
    minWidth: Math.min(760, work.width),
    minHeight: Math.min(560, work.height),
    center: !saved,
    show: false,
    title: 'Énóis Desktop',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#ffffff',
      symbolColor: '#262230',
      height: toolbarHeight,
    },
    backgroundColor: '#faf9fc',
    autoHideMenuBar: true,
    icon: join(app.getAppPath(), 'assets/icons/enois-desktop.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      webviewTag: false,
      spellcheck: true,
    },
  })
  const remoteSession = session.fromPartition('persist:enois')
  const remote = new WebContentsView({
    webPreferences: {
      session: remoteSession,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      webviewTag: false,
      spellcheck: true,
    },
  })
  window.contentView.addChildView(remote)
  remote.setVisible(false)
  remote.webContents.setZoomFactor(store.settings.zoom)

  let state: DesktopState = {
    version: app.getVersion(),
    phase: 'loading',
    online: net.isOnline(),
    title: 'Énóis',
    canGoBack: false,
    canGoForward: false,
    settingsOpen: false,
    settings: store.settings,
    error: null,
  }
  let timeout: ReturnType<typeof setTimeout> | undefined
  let loadStarted = performance.now()
  let quitting = false
  let closeRequested = false

  const layout = () => {
    if (window.isDestroyed() || remote.webContents.isDestroyed()) return
    const bounds = window.getContentBounds()
    remote.setBounds({
      x: 0,
      y: toolbarHeight,
      width: bounds.width,
      height: Math.max(0, bounds.height - toolbarHeight),
    })
    remote.setVisible(state.phase === 'ready' && !state.settingsOpen)
  }
  const publish = (change: Partial<DesktopState> = {}) => {
    if (window.isDestroyed() || remote.webContents.isDestroyed()) return
    state = {
      ...state,
      online: net.isOnline(),
      canGoBack: remote.webContents.navigationHistory.canGoBack(),
      canGoForward: remote.webContents.navigationHistory.canGoForward(),
      ...change,
    }
    layout()
    if (!window.webContents.isDestroyed()) window.webContents.send(channels.changed, state)
  }
  const fail = (kind: NonNullable<DesktopState['error']>['kind'], message: string) => {
    clearTimeout(timeout)
    publish({ phase: 'error', error: { kind, message } })
  }
  const load = async (url = options.remoteUrl) => {
    if (classifyNavigation(url, origin) !== 'internal') url = options.remoteUrl
    publish({ phase: 'loading', error: null })
    try {
      await remote.webContents.loadURL(url)
    } catch {
      if (!remote.webContents.isDestroyed() && state.phase !== 'error') {
        fail('connection', 'Não foi possível carregar o Énóis. Tente novamente em instantes.')
      }
    }
  }

  const updateSettings = async (settings: Settings) => {
    await store.saveSettings(settings)
    remote.webContents.setZoomFactor(settings.zoom)
    publish({ settings: store.settings })
  }
  const command = async (action: Command): Promise<void> => {
    switch (action) {
      case 'back':
        if (remote.webContents.navigationHistory.canGoBack())
          remote.webContents.navigationHistory.goBack()
        break
      case 'forward':
        if (remote.webContents.navigationHistory.canGoForward())
          remote.webContents.navigationHistory.goForward()
        break
      case 'reload':
        await load(remote.webContents.getURL())
        break
      case 'home':
        await load()
        break
      case 'open-browser':
        await shell.openExternal('https://enois.ia.br/feed')
        break
      case 'settings':
        publish({ settingsOpen: true })
        break
      case 'close-settings':
        publish({ settingsOpen: false })
        break
      case 'reset-session': {
        const { response } = await dialog.showMessageBox(window, {
          type: 'warning',
          title: 'Limpar dados locais',
          message: 'Sair e apagar os dados do Énóis neste aplicativo?',
          detail:
            'Sua conta e suas publicações permanecem na plataforma. Será necessário entrar novamente.',
          buttons: ['Cancelar', 'Limpar dados'],
          defaultId: 0,
          cancelId: 0,
        })
        if (response !== 1) break
        remote.webContents.stop()
        await remote.webContents.loadURL('about:blank')
        await remoteSession.clearStorageData()
        await remoteSession.clearCache()
        remoteSession.flushStorageData()
        log('session.cleared')
        publish({ settingsOpen: false })
        await load()
        break
      }
      case 'zoom-in':
      case 'zoom-out':
      case 'zoom-reset': {
        const zoom =
          action === 'zoom-reset'
            ? 1
            : Math.min(
                1.75,
                Math.max(0.75, store.settings.zoom + (action === 'zoom-in' ? 0.1 : -0.1)),
              )
        await updateSettings({ ...store.settings, zoom: Math.round(zoom * 100) / 100 })
        break
      }
    }
  }
  const run = (action: Command) => {
    void command(action).catch(() => log('command.failed', action, 'error'))
  }

  const cleanupIpc = registerIpc({
    shell: window.webContents,
    developmentUrl: options.developmentUrl,
    getState: () => ({ ...state, online: net.isOnline() }),
    command,
    updateSettings,
    log,
  })
  const cleanupSession = secureSession(
    remoteSession,
    window,
    origin,
    () => store.settings,
    app.getPath('downloads'),
    log,
  )
  attachRemoteNavigation({
    contents: remote.webContents,
    window,
    origin,
    getSettings: () => store.settings,
    log,
    onBlockedRedirect: () =>
      fail(
        'connection',
        'A plataforma tentou abrir outro domínio. Este fluxo precisa ser validado para funcionar no aplicativo.',
      ),
  })

  window.webContents.on('will-navigate', (event, url) => {
    if (!isTrustedShell(url, options.developmentUrl)) event.preventDefault()
  })
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  window.webContents.on('will-attach-webview', (event) => event.preventDefault())
  window.webContents.on('page-title-updated', (event) => event.preventDefault())
  window.webContents.on('did-finish-load', () => publish())
  window.webContents.on('render-process-gone', () => {
    log('shell.crashed', 'renderer', 'error')
    // The local shell is static and can be safely restored without touching the remote session.
    if (!window.isDestroyed()) window.webContents.reload()
  })

  remote.webContents.on('did-start-navigation', (details) => {
    if (
      !details.isMainFrame ||
      details.isSameDocument ||
      classifyNavigation(details.url, origin) !== 'internal'
    )
      return
    loadStarted = performance.now()
    publish({ phase: 'loading', error: null })
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      remote.webContents.stop()
      fail('connection', 'O Énóis está demorando para responder. Você pode tentar novamente.')
      log('remote.timeout', '30000', 'warn')
    }, 30_000)
  })
  remote.webContents.on('did-stop-loading', () => {
    clearTimeout(timeout)
    if (classifyNavigation(remote.webContents.getURL(), origin) !== 'internal') return
    if (state.phase !== 'error') publish({ phase: 'ready', error: null })
    log('remote.loaded', state.phase, 'info', { elapsed_ms: performance.now() - loadStarted })
  })
  remote.webContents.on('did-fail-load', (_event, code, _description, _url, mainFrame) => {
    if (!mainFrame || code === -3) return
    log('remote.load_failed', code, 'error')
    const offline = code === -106 || !net.isOnline()
    fail(
      offline ? 'offline' : 'connection',
      offline
        ? 'Verifique sua conexão com a internet e tente novamente.'
        : 'Não foi possível conectar ao Énóis. O serviço pode estar indisponível.',
    )
  })
  remote.webContents.on('did-navigate', (_event, _url, status) => {
    if (status >= 400) {
      fail('http', `O Énóis respondeu com erro ${status}. Tente novamente em instantes.`)
      log('remote.http_failed', status, 'warn')
    }
    publish()
    log('navigation.internal')
  })
  remote.webContents.on('did-navigate-in-page', () => publish())
  remote.webContents.on('page-title-updated', (_event, title) =>
    publish({ title: title.slice(0, 240) }),
  )
  remote.webContents.on('render-process-gone', (_event, details) => {
    log('remote.crashed', details.reason, 'error')
    fail('crashed', 'A página foi interrompida. Recarregue para continuar de onde parou.')
  })
  remote.webContents.on('will-prevent-unload', (event) => {
    const choice = dialog.showMessageBoxSync(window, {
      type: 'question',
      message: 'Sair desta página?',
      detail: 'Você pode perder alterações que ainda não foram enviadas.',
      buttons: ['Continuar na página', 'Sair da página'],
      defaultId: 0,
      cancelId: 0,
    })
    if (choice === 1) event.preventDefault()
    else closeRequested = false
  })

  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: 'Aplicativo',
        submenu: [
          { label: 'Configurações', accelerator: 'Ctrl+,', click: () => run('settings') },
          { type: 'separator' },
          { role: 'quit', label: 'Sair' },
        ],
      },
      {
        label: 'Editar',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectAll' },
        ],
      },
      {
        label: 'Navegar',
        submenu: [
          { label: 'Voltar', accelerator: 'Alt+Left', click: () => run('back') },
          { label: 'Avançar', accelerator: 'Alt+Right', click: () => run('forward') },
          { label: 'Início', accelerator: 'Ctrl+Shift+H', click: () => run('home') },
          { label: 'Recarregar', accelerator: 'Ctrl+R', click: () => run('reload') },
          { label: 'Recarregar página', accelerator: 'F5', click: () => run('reload') },
        ],
      },
      {
        label: 'Visualizar',
        submenu: [
          { label: 'Aumentar zoom', accelerator: 'Ctrl+Plus', click: () => run('zoom-in') },
          { label: 'Diminuir zoom', accelerator: 'Ctrl+-', click: () => run('zoom-out') },
          { label: 'Restaurar zoom', accelerator: 'Ctrl+0', click: () => run('zoom-reset') },
          { role: 'togglefullscreen', accelerator: 'F11', label: 'Tela cheia' },
          ...(!app.isPackaged
            ? [{ role: 'toggleDevTools' as const, label: 'Ferramentas de desenvolvimento' }]
            : []),
        ],
      },
    ]),
  )

  const resume = () => publish()
  powerMonitor.on('resume', resume)
  window.on('resize', layout)
  const closing = (event: Electron.Event) => {
    if (quitting) return
    event.preventDefault()
    if (closeRequested) return
    closeRequested = true
    const bounds = window.getNormalBounds()
    void store
      .saveBounds(bounds)
      .catch(() => log('settings.bounds_failed', 'write', 'warn'))
      .finally(() => {
        remoteSession.flushStorageData()
        if (remote.webContents.isDestroyed()) {
          quitting = true
          window.close()
        } else remote.webContents.close({ waitForBeforeUnload: true })
      })
  }
  remote.webContents.once('destroyed', () => {
    if (closeRequested && !window.isDestroyed()) {
      quitting = true
      window.close()
    }
  })
  window.on('close', closing)
  window.once('closed', () => {
    clearTimeout(timeout)
    powerMonitor.removeListener('resume', resume)
    cleanupIpc()
    cleanupSession()
    if (!remote.webContents.isDestroyed()) remote.webContents.close({ waitForBeforeUnload: false })
    log('window.closed')
  })

  if (options.developmentUrl) await window.loadURL(options.developmentUrl)
  else await window.loadURL('enois://app/index.html')
  layout()
  // A child view can finish first and suppress ready-to-show on a hidden Linux window.
  // The local shell has loaded; show it before starting the remote platform.
  window.show()
  log('window.visible', 'ok', 'info', { elapsed_ms: performance.now() - options.startedAt })
  void load()
  return window
}
