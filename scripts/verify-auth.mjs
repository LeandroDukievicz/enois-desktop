import { _electron as electron, expect } from '@playwright/test'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

const report = {
  checkedAt: new Date().toISOString(),
  scope: 'Public original login UI in real Electron, without credentials',
  authenticatedLogin: 'requires-manual-login',
  oauthReturnToDesktop: 'not-verified',
  providers: [],
}

for (const provider of [
  { name: 'Google', button: 'Continuar com Google', origin: 'https://accounts.google.com' },
  { name: 'LinkedIn', button: 'Entrar com LinkedIn', origin: 'https://www.linkedin.com' },
]) {
  const profile = await mkdtemp(join(tmpdir(), 'enois-auth-check-'))
  let app
  try {
    app = await electron.launch({
      args: [resolve('.'), '--ozone-platform=x11'],
      env: {
        ...process.env,
        WAYLAND_DISPLAY: '',
        XDG_SESSION_TYPE: 'x11',
        ENOIS_E2E: '1',
        ENOIS_TEST_PROFILE: profile,
        ENOIS_TEST_REMOTE_URL: '',
      },
    })
    const local = await app.firstWindow()
    await expect
      .poll(() => local.evaluate(() => window.desktop?.getState()), { timeout: 45_000 })
      .toMatchObject({ phase: 'ready' })
    const remote = app.windows().find((page) => page.url().startsWith('https://enois.ia.br/'))
    if (!remote) throw new Error('Conteúdo original não encontrado.')
    await remote.getByRole('button', { name: provider.button, exact: true }).waitFor({
      timeout: 30_000,
    })
    const url = new URL(remote.url())
    expect(url.origin).toBe('https://enois.ia.br')
    expect(url.pathname).toBe('/entrar')
    // Read control metadata only. Never inspect field values, cookies or storage.
    const controls = await remote.locator('input').evaluateAll((inputs) =>
      inputs.map((input) => ({
        type: input.type,
        required: input.required,
        autocomplete: input.autocomplete,
      })),
    )
    expect(controls).toEqual(
      expect.arrayContaining([
        { type: 'email', required: true, autocomplete: 'email' },
        { type: 'password', required: true, autocomplete: 'current-password' },
      ]),
    )
    await app.evaluate(({ dialog, shell }) => {
      globalThis.__enoisAuthDestinations = []
      dialog.showMessageBox = async () => ({ response: 1, checkboxChecked: false })
      // Only replace the OS side effect. The original UI and navigation policy run normally.
      shell.openExternal = async (value) => {
        const destination = new URL(value)
        const callback = destination.searchParams.get('redirect_uri')
        globalThis.__enoisAuthDestinations.push({
          origin: destination.origin,
          path: destination.pathname,
          ...(callback
            ? {
                callbackOrigin: new URL(callback).origin,
                callbackPath: new URL(callback).pathname,
              }
            : {}),
        })
      }
    })
    await remote.getByRole('button', { name: provider.button, exact: true }).click({
      noWaitAfter: true,
    })
    await expect
      .poll(() => app.evaluate(() => globalThis.__enoisAuthDestinations), { timeout: 15_000 })
      .toEqual([expect.objectContaining({ origin: provider.origin })])
    await delay(1500)
    const state = await local.evaluate(() => window.desktop.getState())
    expect(state.phase).toBe('ready')
    expect(state.error).toBeNull()
    expect(new URL(remote.url()).pathname).toBe('/entrar')
    report.providers.push({
      provider: provider.name,
      destinations: await app.evaluate(() => globalThis.__enoisAuthDestinations),
      shellPhase: state.phase,
      loginControls: controls,
    })
  } finally {
    await app?.close()
    await rm(profile, { recursive: true, force: true })
  }
}

await mkdir('test-results', { recursive: true })
await writeFile('test-results/authentication-check.json', `${JSON.stringify(report, null, 2)}\n`)
console.log(
  'Interface original e encaminhamento OAuth verificados. Login autenticado e retorno OAuth exigem validação manual.',
)
console.log('Relatório sem credenciais: test-results/authentication-check.json')
