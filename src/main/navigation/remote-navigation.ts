import { dialog, shell, type BrowserWindow, type WebContents } from 'electron'
import { classifyNavigation, parseSafeUrl } from '../security/navigation-policy'
import type { Settings } from '../../shared/contracts/desktop'

export function attachRemoteNavigation(options: {
  contents: WebContents
  window: BrowserWindow
  origin: string
  getSettings: () => Settings
  log: (event: string, code?: string, level?: 'warn' | 'error') => void
  onBlockedRedirect: () => void
}): void {
  let externalPrompt = false

  const openExternal = async (value: string) => {
    if (classifyNavigation(value, options.origin) !== 'external' || externalPrompt) return
    const url = parseSafeUrl(value)
    if (!url) return
    externalPrompt = true
    try {
      if (options.getSettings().externalLinks === 'ask') {
        const { response } = await dialog.showMessageBox(options.window, {
          type: 'question',
          title: 'Abrir link externo',
          message: `Abrir ${url.hostname || 'seu aplicativo de e-mail'}?`,
          detail: 'O link será aberto fora do Énóis Desktop, no aplicativo padrão do sistema.',
          buttons: ['Cancelar', 'Abrir'],
          defaultId: 1,
          cancelId: 0,
          noLink: true,
        })
        if (response !== 1) return
      }
      await shell.openExternal(url.toString())
      options.log('navigation.external')
    } catch {
      options.log('navigation.external_failed', 'system', 'error')
    } finally {
      externalPrompt = false
    }
  }

  options.contents.on('will-frame-navigate', (details) => {
    if (!details.isMainFrame) return
    const decision = classifyNavigation(details.url, options.origin)
    if (decision === 'internal') return
    details.preventDefault()
    if (decision === 'external') void openExternal(details.url)
    else options.log('navigation.blocked', 'scheme', 'warn')
  })
  options.contents.on('will-redirect', (details) => {
    if (!details.isMainFrame) return
    if (classifyNavigation(details.url, options.origin) !== 'internal') {
      details.preventDefault()
      // A redirect is not a user click. Federated authentication needs explicit validation.
      options.log('navigation.redirect_blocked', 'origin', 'warn')
      options.onBlockedRedirect()
    }
  })
  options.contents.setWindowOpenHandler(({ url }) => {
    const decision = classifyNavigation(url, options.origin)
    if (decision === 'internal') {
      void options.contents.loadURL(url).catch(() => {
        options.log('navigation.popup_failed', 'load', 'warn')
      })
    } else if (decision === 'external') void openExternal(url)
    else options.log('navigation.popup_blocked', 'scheme', 'warn')
    return { action: 'deny' }
  })
  options.contents.on('will-attach-webview', (event) => event.preventDefault())
}
