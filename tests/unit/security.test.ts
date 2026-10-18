import { describe, expect, it } from 'vitest'
import {
  classifyNavigation,
  isTrustedFrame,
  isTrustedShell,
  parseSafeUrl,
} from '../../src/main/security/navigation-policy'
import { permissionDecision } from '../../src/main/security/permission-policy'
import {
  commandSchema,
  defaultSettings,
  settingsSchema,
  stateSchema,
} from '../../src/shared/contracts/desktop'

const origin = 'https://enois.ia.br'

describe('navegação e fronteiras de confiança', () => {
  it.each(['/feed', '/entrar?tab=login', '/auth/callback?code=fake', '/comunidades'])(
    'preserva a rota legítima %s',
    (path) => {
      expect(classifyNavigation(`${origin}${path}`, origin)).toBe('internal')
    },
  )
  it.each([
    'https://enois.ia.br.evil.test/feed',
    'https://evil.test/?next=https://enois.ia.br',
    'https://sub.enois.ia.br',
    'http://enois.ia.br',
    'https://enois.ia.br:444',
  ])('não confia em domínio semelhante ou origem diferente: %s', (url) => {
    expect(classifyNavigation(url, origin)).toBe('external')
    expect(isTrustedFrame(url, origin)).toBe(false)
  })
  it.each([
    'javascript:alert(1)',
    'file:///etc/passwd',
    'data:text/html,oi',
    'enois://app/index.html',
    'https://user:password@enois.ia.br',
    'not a url',
    'mailto:a@b.test?body=%0aargument',
    'https://enois.ia.br/\nfeed',
  ])('bloqueia URL perigosa: %s', (url) => {
    expect(classifyNavigation(url, origin)).toBe('blocked')
  })
  it('permite link externo HTTPS e e-mail sem expor API de URL arbitrária ao renderer', () => {
    expect(classifyNavigation('https://example.org', origin)).toBe('external')
    expect(classifyNavigation('mailto:suporte@example.org', origin)).toBe('external')
    expect(commandSchema.safeParse({ name: 'open', url: 'file:///etc/passwd' }).success).toBe(false)
    expect(parseSafeUrl('x'.repeat(8193))).toBeNull()
  })
  it('aceita apenas a página local e separa o modo de desenvolvimento', () => {
    expect(isTrustedShell('enois://app/index.html')).toBe(true)
    for (const url of [
      'enois://evil/index.html',
      'enois://app/other.html',
      'https://enois.ia.br/index.html',
      'enois://user:secret@app/index.html',
    ])
      expect(isTrustedShell(url)).toBe(false)
    expect(isTrustedShell('http://localhost:5173/', 'http://localhost:5173')).toBe(true)
    expect(isTrustedShell('http://localhost:5174/', 'http://localhost:5173')).toBe(false)
  })
})

describe('permissões', () => {
  it.each([
    'notifications',
    'media',
    'clipboard-read',
    'clipboard-sanitized-write',
    'geolocation',
    'display-capture',
    'fullscreen',
  ])('nega %s a origens não confiáveis', (permission) => {
    expect(permissionDecision(permission, false, true)).toBe('deny')
  })
  it('exige opt-in para notificações e consentimento para dados sensíveis', () => {
    expect(permissionDecision('notifications', true, false)).toBe('deny')
    expect(permissionDecision('notifications', true, true)).toBe('allow')
    for (const name of ['media', 'clipboard-read', 'geolocation'])
      expect(permissionDecision(name, true, false)).toBe('ask')
    expect(permissionDecision('display-capture', true, true)).toBe('deny')
    expect(permissionDecision('unknown', true, true)).toBe('deny')
  })
})

describe('contratos', () => {
  it('recusa payloads extras, zoom inválido e comandos inexistentes', () => {
    expect(settingsSchema.parse(defaultSettings)).toEqual(defaultSettings)
    expect(settingsSchema.safeParse({ ...defaultSettings, token: 'fake' }).success).toBe(false)
    expect(settingsSchema.safeParse({ ...defaultSettings, zoom: Infinity }).success).toBe(false)
    expect(settingsSchema.safeParse({ ...defaultSettings, zoom: 3 }).success).toBe(false)
    expect(commandSchema.safeParse('execute').success).toBe(false)
    expect(commandSchema.parse('reload')).toBe('reload')
    expect(stateSchema.safeParse({ phase: 'ready' }).success).toBe(false)
  })
})
