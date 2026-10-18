import {
  _electron as electron,
  expect,
  test,
  type ElectronApplication,
  type Page,
} from '@playwright/test'
import { createServer, type Server } from 'node:http'
import { mkdtemp, rm, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

let server: Server
let origin: string
let unavailable = false
let profile: string
let application: ElectronApplication | undefined

test.beforeAll(async () => {
  server = createServer((request, response) => {
    if (unavailable) {
      request.socket.destroy()
      return
    }
    response.setHeader('Content-Type', 'text/html; charset=utf-8')
    response.end(
      `<!doctype html><html lang="pt-BR"><head><title>Plataforma de teste</title></head><body><h1>Comunidade de teste</h1><a href="/outra">Navegação interna</a><a href="javascript:void(0)" id="unsafe">Link bloqueado</a><a href="https://example.org" id="external">Link externo</a><script>document.querySelector('#unsafe').onclick=()=>window.open('file:///etc/passwd');</script></body></html>`,
    )
  })
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Servidor local indisponível')
  origin = `http://127.0.0.1:${address.port}`
})
test.afterAll(async () => {
  await new Promise<void>((done) => server.close(() => done()))
})
test.beforeEach(async () => {
  unavailable = false
  profile = await mkdtemp(join(tmpdir(), 'enois-e2e-'))
})
// eslint-disable-next-line no-empty-pattern -- Playwright requires fixture destructuring.
test.afterEach(async ({}, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    try {
      await testInfo.attach('desktop-log', {
        body: await readFile(join(profile, 'logs/desktop.log')),
        contentType: 'application/x-ndjson',
      })
    } catch {
      /* No log exists if bootstrap failed before profile creation. */
    }
  }
  await application?.close()
  application = undefined
  await rm(profile, { recursive: true, force: true })
})

async function launch() {
  application = await electron.launch({
    args: [resolve('.'), '--ozone-platform=x11'],
    env: {
      ...process.env,
      WAYLAND_DISPLAY: '',
      XDG_SESSION_TYPE: 'x11',
      ENOIS_E2E: '1',
      ENOIS_TEST_PROFILE: profile,
      ENOIS_TEST_REMOTE_URL: `${origin}/feed`,
    },
  })
  const shell = await application.firstWindow()
  await expect.poll(() => shell.evaluate(() => Boolean(window.desktop))).toBe(true)
  return shell
}

async function remotePage(): Promise<Page> {
  if (!application) throw new Error('Aplicativo não iniciado')
  let page: Page | undefined
  await expect
    .poll(() => {
      page = application!.windows().find((candidate) => candidate.url().startsWith(origin))
      return Boolean(page)
    })
    .toBe(true)
  return page!
}

test('inicia, isola o conteúdo remoto, navega e encerra sem renderers órfãos', async () => {
  const shell = await launch()
  await expect(shell.getByRole('status')).toHaveText('Conectado')
  const page = await remotePage()
  await expect(page.getByRole('heading', { name: 'Comunidade de teste' })).toBeVisible()
  expect(
    await page.evaluate(() => ({
      bridge: typeof window.desktop,
      node: typeof (window as unknown as { require?: unknown }).require,
    })),
  ).toEqual({ bridge: 'undefined', node: 'undefined' })
  expect(
    await page.evaluate(() => typeof (window as unknown as { process?: unknown }).process),
  ).toBe('undefined')
  await page.getByRole('link', { name: 'Navegação interna' }).click()
  await expect.poll(() => page.url()).toBe(`${origin}/outra`)
  await shell.getByRole('button', { name: 'Voltar', exact: true }).click()
  await expect.poll(() => page.url()).toBe(`${origin}/feed`)
  await page.locator('#unsafe').click()
  expect(application!.windows()).toHaveLength(2)
  const appProcess = application!.process()
  const rendererPids = await application!.evaluate(({ app }) =>
    app
      .getAppMetrics()
      .filter((metric) => metric.type === 'Tab')
      .map((metric) => metric.pid),
  )
  await application!.close()
  expect(appProcess.exitCode).toBe(0)
  await expect
    .poll(() =>
      rendererPids.every((pid) => {
        try {
          process.kill(pid, 0)
          return false
        } catch {
          return true
        }
      }),
    )
    .toBe(true)
  application = undefined
})

test('mantém dados de sessão do site e preferências após reabrir', async () => {
  let shell = await launch()
  await expect(shell.getByRole('status')).toHaveText('Conectado')
  const page = await remotePage()
  await page.evaluate(() =>
    localStorage.setItem('fixture-session', 'valor-de-teste-sem-credenciais'),
  )
  await shell.getByRole('button', { name: 'Configurações', exact: true }).click()
  await shell.getByRole('button', { name: 'Aumentar zoom' }).click()
  await expect(shell.getByLabel('Zoom atual')).toHaveText('110%')
  await application!.close()
  application = undefined
  shell = await launch()
  await expect(shell.getByRole('status')).toHaveText('Conectado')
  expect(await (await remotePage()).evaluate(() => localStorage.getItem('fixture-session'))).toBe(
    'valor-de-teste-sem-credenciais',
  )
  await shell.getByRole('button', { name: 'Configurações', exact: true }).click()
  await expect(shell.getByLabel('Zoom atual')).toHaveText('110%')
})

test('mostra falha de rede e permite reconectar manualmente', async () => {
  unavailable = true
  const shell = await launch()
  await expect(shell.getByRole('heading', { name: 'Uma pausa na conexão.' })).toBeVisible()
  unavailable = false
  await shell.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(shell.getByRole('status')).toHaveText('Conectado')
  await expect(
    (await remotePage()).getByRole('heading', { name: 'Comunidade de teste' }),
  ).toBeVisible()
})

test('abre links externos só após a política e mantém a plataforma na janela', async () => {
  const shell = await launch()
  await expect(shell.getByRole('status')).toHaveText('Conectado')
  // Replace only OS side effects in the test process; production uses Electron's native dialog.
  await application!.evaluate(({ dialog, shell }) => {
    dialog.showMessageBox = async () => ({ response: 0, checkboxChecked: false })
    shell.openExternal = async () => {
      throw new Error('Não deveria abrir após cancelar')
    }
  })
  const page = await remotePage()
  await page.getByRole('link', { name: 'Link externo', exact: true }).dispatchEvent('click')
  await expect.poll(() => page.url()).toBe(`${origin}/feed`)
  await expect(shell.getByRole('status')).toHaveText('Conectado')
})

test('limpa apenas a sessão local após confirmação', async () => {
  const shell = await launch()
  await expect(shell.getByRole('status')).toHaveText('Conectado')
  await (
    await remotePage()
  ).evaluate(() => localStorage.setItem('fixture-session', 'sem-credenciais'))
  await application!.evaluate(({ dialog }) => {
    dialog.showMessageBox = async () => ({ response: 1, checkboxChecked: false })
  })
  await shell.getByRole('button', { name: 'Configurações', exact: true }).click()
  await shell.getByRole('button', { name: 'Limpar dados locais', exact: true }).click()
  await expect(shell.getByRole('button', { name: 'Limpar dados locais', exact: true })).toBeHidden()
  await expect(shell.getByRole('status')).toHaveText('Conectado')
  expect(
    await (await remotePage()).evaluate(() => localStorage.getItem('fixture-session')),
  ).toBeNull()
})

test('recupera o renderer remoto após uma falha', async () => {
  const shell = await launch()
  await expect(shell.getByRole('status')).toHaveText('Conectado')
  await application!.evaluate(({ webContents }) => {
    const target = webContents
      .getAllWebContents()
      .find((contents) => contents.getURL().startsWith('http://127.0.0.1'))!
    // Kill only the test renderer. SIGKILL avoids OS core-dump collection delaying CI.
    process.kill(target.getOSProcessId(), 'SIGKILL')
  })
  await expect(
    shell.getByText('A página foi interrompida. Recarregue para continuar de onde parou.'),
  ).toBeVisible()
  await shell.getByRole('button', { name: 'Tentar novamente', exact: true }).click()
  await expect(shell.getByRole('status')).toHaveText('Conectado')
})
