import { ipcMain, type WebContents } from 'electron'
import {
  channels,
  commandSchema,
  settingsSchema,
  type Command,
  type DesktopState,
  type Settings,
} from '../../shared/contracts/desktop'
import { isTrustedShell } from '../security/navigation-policy'

export function registerIpc(options: {
  shell: WebContents
  developmentUrl?: string
  getState: () => DesktopState
  command: (command: Command) => Promise<void>
  updateSettings: (settings: Settings) => Promise<void>
  log: (event: string, code?: string, level?: 'warn' | 'error') => void
}): () => void {
  const guard = (event: Electron.IpcMainInvokeEvent) => {
    if (
      event.sender.id !== options.shell.id ||
      event.senderFrame !== event.sender.mainFrame ||
      !isTrustedShell(event.senderFrame.url, options.developmentUrl)
    ) {
      options.log('ipc.rejected', 'origin', 'warn')
      throw new Error('Operação não permitida.')
    }
  }
  ipcMain.handle(channels.state, (event) => {
    guard(event)
    return options.getState()
  })
  ipcMain.handle(channels.command, async (event, payload: unknown) => {
    guard(event)
    const result = commandSchema.safeParse(payload)
    if (!result.success) throw new Error('Comando inválido.')
    try {
      await options.command(result.data)
    } catch {
      options.log('ipc.failed', 'command', 'error')
      throw new Error('Não foi possível concluir a operação.')
    }
  })
  ipcMain.handle(channels.settings, async (event, payload: unknown) => {
    guard(event)
    const result = settingsSchema.safeParse(payload)
    if (!result.success) throw new Error('Configuração inválida.')
    try {
      await options.updateSettings(result.data)
    } catch {
      options.log('ipc.failed', 'settings', 'error')
      throw new Error('Não foi possível salvar a configuração.')
    }
  })
  return () => {
    for (const channel of [channels.state, channels.command, channels.settings]) {
      ipcMain.removeHandler(channel)
    }
  }
}
