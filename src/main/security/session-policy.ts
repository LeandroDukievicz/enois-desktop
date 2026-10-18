import { dialog, type BrowserWindow, type Session } from 'electron'
import { basename, join } from 'node:path'
import type { Settings } from '../../shared/contracts/desktop'
import { isTrustedFrame } from './navigation-policy'
import { permissionDecision } from './permission-policy'

export function secureSession(
  session: Session,
  window: BrowserWindow,
  origin: string,
  getSettings: () => Settings,
  downloads: string,
  log: (event: string, code?: number | string, level?: 'info' | 'warn' | 'error') => void,
): () => void {
  const granted = new Set<string>()
  let permissionPrompt = false

  session.setPermissionCheckHandler((contents, permission, requestingOrigin) => {
    const trusted = Boolean(
      contents &&
      isTrustedFrame(contents.getURL(), origin) &&
      isTrustedFrame(requestingOrigin, origin),
    )
    const decision = permissionDecision(permission, trusted, getSettings().notifications)
    return decision === 'allow' || (decision === 'ask' && granted.has(permission))
  })

  session.setPermissionRequestHandler((contents, permission, callback, details) => {
    const trusted = Boolean(
      contents &&
      isTrustedFrame(contents.getURL(), origin) &&
      isTrustedFrame(details.requestingUrl, origin) &&
      details.isMainFrame,
    )
    const decision = permissionDecision(permission, trusted, getSettings().notifications)
    if (decision !== 'ask') {
      callback(decision === 'allow')
      if (decision === 'deny') log('permission.denied', permission, 'warn')
      return
    }
    if (permissionPrompt || window.isDestroyed()) {
      callback(false)
      return
    }
    permissionPrompt = true
    const names: Record<string, string> = {
      media: 'usar câmera ou microfone',
      'clipboard-read': 'ler a área de transferência',
      geolocation: 'acessar sua localização',
    }
    void dialog
      .showMessageBox(window, {
        type: 'question',
        title: 'Permissão do Énóis',
        message: `Permitir que o Énóis possa ${names[permission] ?? 'usar este recurso'}?`,
        detail: 'A permissão vale durante esta execução do aplicativo.',
        buttons: ['Não permitir', 'Permitir'],
        defaultId: 0,
        cancelId: 0,
      })
      .then(({ response }) => {
        if (response === 1) granted.add(permission)
        callback(response === 1)
      })
      .catch(() => callback(false))
      .finally(() => {
        permissionPrompt = false
      })
  })

  session.setDisplayMediaRequestHandler((_request, callback) => callback({}))

  const downloadHandler = (
    event: Electron.Event,
    item: Electron.DownloadItem,
    contents: Electron.WebContents,
  ) => {
    if (!contents || !isTrustedFrame(contents.getURL(), origin) || window.isDestroyed()) {
      event.preventDefault()
      return
    }
    item.pause()
    const filename = basename(item.getFilename())
      .replace(/[\u0000-\u001f\u007f]/g, '')
      .slice(0, 160)
    void dialog
      .showSaveDialog(window, {
        title: 'Salvar arquivo do Énóis',
        defaultPath: join(downloads, filename || 'download'),
      })
      .then(({ canceled, filePath }) => {
        if (canceled || !filePath) item.cancel()
        else {
          item.setSavePath(filePath)
          item.resume()
        }
      })
      .catch(() => item.cancel())
  }
  session.on('will-download', downloadHandler)
  return () => {
    session.removeListener('will-download', downloadHandler)
    session.setPermissionCheckHandler(null)
    session.setPermissionRequestHandler(null)
    session.setDisplayMediaRequestHandler(null)
    granted.clear()
  }
}
