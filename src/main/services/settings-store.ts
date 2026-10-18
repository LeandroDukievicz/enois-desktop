import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { z } from 'zod'
import { defaultSettings, settingsSchema, type Settings } from '../../shared/contracts/desktop'

const boundsSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
  width: z.number().int().min(760).max(10_000),
  height: z.number().int().min(560).max(10_000),
})
const persistedSchema = z
  .object({ version: z.literal(1), settings: settingsSchema, bounds: boundsSchema.optional() })
  .strict()
export type WindowBounds = z.infer<typeof boundsSchema>

export class SettingsStore {
  private data: z.infer<typeof persistedSchema> = {
    version: 1,
    settings: { ...defaultSettings },
  }
  private pending: Promise<void> = Promise.resolve()

  constructor(private readonly directory: string) {}

  async load(): Promise<void> {
    try {
      const raw = await readFile(join(this.directory, 'settings.json'), 'utf8')
      if (raw.length <= 16_384) this.data = persistedSchema.parse(JSON.parse(raw))
    } catch {
      // Missing or corrupt preferences never prevent startup. No credentials live here.
      this.data = { version: 1, settings: { ...defaultSettings } }
    }
  }

  get settings(): Settings {
    return { ...this.data.settings }
  }

  get bounds(): WindowBounds | undefined {
    return this.data.bounds ? { ...this.data.bounds } : undefined
  }

  async saveSettings(settings: Settings): Promise<void> {
    this.data.settings = settingsSchema.parse(settings)
    await this.persist()
  }

  async saveBounds(bounds: WindowBounds): Promise<void> {
    this.data.bounds = boundsSchema.parse(bounds)
    await this.persist()
  }

  private async persist(): Promise<void> {
    const snapshot = JSON.stringify(this.data, null, 2)
    const next = this.pending
      .catch(() => {})
      .then(async () => {
        await mkdir(this.directory, { recursive: true, mode: 0o700 })
        const temporary = join(this.directory, 'settings.json.tmp')
        await writeFile(temporary, snapshot, { mode: 0o600 })
        await rename(temporary, join(this.directory, 'settings.json'))
      })
    this.pending = next
    await next
  }
}
