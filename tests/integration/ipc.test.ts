import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { IpcMainInvokeEvent, WebContents } from 'electron'
import { channels, defaultSettings, type DesktopState } from '../../src/shared/contracts/desktop'

const handlers = vi.hoisted(
  () => new Map<string, (event: IpcMainInvokeEvent, payload?: unknown) => unknown>(),
)
vi.mock('electron', () => ({
  ipcMain: {
    handle: (name: string, handler: (event: IpcMainInvokeEvent, payload?: unknown) => unknown) =>
      handlers.set(name, handler),
    removeHandler: (name: string) => handlers.delete(name),
  },
}))
import { registerIpc } from '../../src/main/ipc/register'

const state: DesktopState = {
  version: '0.1.0',
  phase: 'ready',
  online: true,
  title: 'Énóis',
  canGoBack: false,
  canGoForward: false,
  settingsOpen: false,
  settings: defaultSettings,
  error: null,
}
beforeEach(() => handlers.clear())

function setup() {
  const frame = { url: 'enois://app/index.html' }
  const contents = { id: 1, mainFrame: frame } as unknown as WebContents
  const event = { sender: contents, senderFrame: frame } as unknown as IpcMainInvokeEvent
  const command = vi.fn().mockResolvedValue(undefined)
  const updateSettings = vi.fn().mockResolvedValue(undefined)
  const cleanup = registerIpc({
    shell: contents,
    getState: () => state,
    command,
    updateSettings,
    log: vi.fn(),
  })
  return { frame, event, command, updateSettings, cleanup }
}

describe('fronteira IPC do processo principal', () => {
  it('aceita comando tipado apenas do frame principal local', async () => {
    const { event, command, cleanup } = setup()
    await handlers.get(channels.command)!(event, 'reload')
    expect(command).toHaveBeenCalledWith('reload')
    expect(handlers.get(channels.state)!(event)).toEqual(state)
    cleanup()
    expect(handlers.size).toBe(0)
  })
  it('recusa o conteúdo remoto, subframes e payloads arbitrários', async () => {
    const { event, command } = setup()
    const attacker = {
      ...event,
      sender: { id: 2, mainFrame: {} },
      senderFrame: { url: 'https://enois.ia.br/feed' },
    } as unknown as IpcMainInvokeEvent
    await expect(handlers.get(channels.command)!(attacker, 'reload')).rejects.toThrow(
      'não permitida',
    )
    const subframe = {
      ...event,
      senderFrame: { url: 'enois://app/index.html' },
    } as unknown as IpcMainInvokeEvent
    await expect(handlers.get(channels.command)!(subframe, 'reload')).rejects.toThrow(
      'não permitida',
    )
    await expect(
      handlers.get(channels.command)!(event, { channel: 'execute', payload: 'ls' }),
    ).rejects.toThrow('inválido')
    expect(command).not.toHaveBeenCalled()
  })
  it('valida preferências novamente no main e oculta erros internos', async () => {
    const { event, command, updateSettings } = setup()
    await expect(
      handlers.get(channels.settings)!(event, { ...defaultSettings, zoom: 100 }),
    ).rejects.toThrow('inválida')
    expect(updateSettings).not.toHaveBeenCalled()
    command.mockRejectedValue(new Error('private internal details'))
    await expect(handlers.get(channels.command)!(event, 'reload')).rejects.toThrow(
      'Não foi possível concluir',
    )
  })
})
