import { contextBridge, ipcRenderer } from 'electron'
import {
  channels,
  commandSchema,
  settingsSchema,
  stateSchema,
  type DesktopBridge,
} from '../shared/contracts/desktop'

const bridge: DesktopBridge = {
  getState: async () => stateSchema.parse(await ipcRenderer.invoke(channels.state)),
  command: async (command) => {
    await ipcRenderer.invoke(channels.command, commandSchema.parse(command))
  },
  updateSettings: async (settings) => {
    await ipcRenderer.invoke(channels.settings, settingsSchema.parse(settings))
  },
  onState: (listener) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: unknown) => {
      const result = stateSchema.safeParse(payload)
      if (result.success) listener(result.data)
    }
    ipcRenderer.on(channels.changed, handler)
    return () => ipcRenderer.removeListener(channels.changed, handler)
  },
}

contextBridge.exposeInMainWorld('desktop', Object.freeze(bridge))
