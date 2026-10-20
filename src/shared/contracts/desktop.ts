import { z } from 'zod'

export const settingsSchema = z
  .object({
    notifications: z.boolean(),
    zoom: z.number().min(0.75).max(1.75),
    externalLinks: z.enum(['ask', 'browser']),
    restoreWindow: z.boolean(),
  })
  .strict()

export const defaultSettings: Settings = {
  notifications: false,
  zoom: 1,
  externalLinks: 'ask',
  restoreWindow: true,
}
export type Settings = z.infer<typeof settingsSchema>

export const commandSchema = z.enum([
  'back',
  'forward',
  'reload',
  'home',
  'open-browser',
  'settings',
  'close-settings',
  'reset-session',
  'zoom-in',
  'zoom-out',
  'zoom-reset',
  'minimize-window',
  'toggle-maximize-window',
  'close-window',
])
export type Command = z.infer<typeof commandSchema>

export const stateSchema = z
  .object({
    version: z.string().max(40),
    phase: z.enum(['loading', 'ready', 'error']),
    online: z.boolean(),
    title: z.string().max(240),
    canGoBack: z.boolean(),
    canGoForward: z.boolean(),
    settingsOpen: z.boolean(),
    isMaximized: z.boolean(),
    settings: settingsSchema,
    error: z
      .object({
        kind: z.enum(['offline', 'connection', 'http', 'crashed']),
        message: z.string().max(400),
      })
      .strict()
      .nullable(),
  })
  .strict()
export type DesktopState = z.infer<typeof stateSchema>

export const channels = {
  state: 'desktop:state',
  command: 'desktop:command',
  settings: 'desktop:settings',
  changed: 'desktop:changed',
} as const

export interface DesktopBridge {
  getState(): Promise<DesktopState>
  command(command: Command): Promise<void>
  updateSettings(settings: Settings): Promise<void>
  onState(listener: (state: DesktopState) => void): () => void
}
