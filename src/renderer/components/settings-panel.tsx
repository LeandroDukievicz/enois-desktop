import { ArrowLeft, ExternalLink, Minus, Plus, RotateCcw, ShieldCheck, Trash2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { Command, DesktopState, Settings } from '../../shared/contracts/desktop'
import { IconButton } from './icon-button'

export function SettingsPanel({
  state,
  command,
  updateSettings,
}: {
  state: DesktopState
  command: (command: Command) => Promise<void>
  updateSettings: (settings: Settings) => Promise<void>
}) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => heading.current?.focus(), [])
  const update = (change: Partial<Settings>) =>
    void updateSettings({ ...state.settings, ...change })
  return (
    <main className="settings-page" aria-label="Configurações do aplicativo">
      <div className="settings-content">
        <button className="text-button back-link" onClick={() => void command('close-settings')}>
          <ArrowLeft size={16} /> Voltar ao Énóis
        </button>
        <p className="eyebrow">DO SEU JEITO</p>
        <h1 ref={heading} tabIndex={-1}>
          Seu espaço no desktop.
        </h1>
        <p className="muted introduction">
          Os ajustes da plataforma continuam disponíveis no próprio Énóis.
        </p>
        <section className="settings-card" aria-label="Preferências locais">
          <div className="setting-row">
            <div>
              <h2>Zoom da plataforma</h2>
              <p>Ajuste o tamanho do conteúdo para sua tela.</p>
            </div>
            <div className="zoom-control">
              <IconButton
                label="Diminuir zoom"
                disabled={state.settings.zoom <= 0.75}
                onClick={() => void command('zoom-out')}
              >
                <Minus size={16} />
              </IconButton>
              <output aria-label="Zoom atual">{Math.round(state.settings.zoom * 100)}%</output>
              <IconButton
                label="Aumentar zoom"
                disabled={state.settings.zoom >= 1.75}
                onClick={() => void command('zoom-in')}
              >
                <Plus size={16} />
              </IconButton>
              <IconButton label="Restaurar zoom" onClick={() => void command('zoom-reset')}>
                <RotateCcw size={14} />
              </IconButton>
            </div>
          </div>
          <label className="setting-row">
            <span>
              <span className="setting-title">Restaurar a janela</span>
              <span className="setting-description">
                Lembrar tamanho e posição ao abrir o aplicativo.
              </span>
            </span>
            <input
              type="checkbox"
              checked={state.settings.restoreWindow}
              onChange={(event) => update({ restoreWindow: event.target.checked })}
            />
          </label>
          <label className="setting-row">
            <span>
              <span className="setting-title">Confirmar links externos</span>
              <span className="setting-description">
                Perguntar antes de abrir outro site no navegador.
              </span>
            </span>
            <input
              type="checkbox"
              checked={state.settings.externalLinks === 'ask'}
              onChange={(event) =>
                update({ externalLinks: event.target.checked ? 'ask' : 'browser' })
              }
            />
          </label>
          <label className="setting-row">
            <span>
              <span className="setting-title">Permitir notificações do site</span>
              <span className="setting-description">
                A entrega depende do suporte do Énóis e do seu ambiente Linux.
              </span>
            </span>
            <input
              type="checkbox"
              checked={state.settings.notifications}
              onChange={(event) => update({ notifications: event.target.checked })}
            />
          </label>
        </section>
        <section className="settings-card session-card" aria-label="Sessão local">
          <div className="session-copy">
            <ShieldCheck size={22} />
            <div>
              <h2>Sua sessão, neste aplicativo.</h2>
              <p>
                O login é feito pelo próprio Énóis. Limpar os dados locais encerra a sessão neste
                desktop.
              </p>
            </div>
          </div>
          <button className="secondary-button danger" onClick={() => void command('reset-session')}>
            <Trash2 size={15} /> Limpar dados locais
          </button>
        </section>
        <footer className="about-footer">
          <span>
            Énóis Desktop <span className="version">v{state.version}</span>
            <br />
            <small>Cliente independente para Linux</small>
          </span>
          <button className="text-button" onClick={() => void command('open-browser')}>
            Abrir a plataforma <ExternalLink size={14} />
          </button>
        </footer>
      </div>
    </main>
  )
}
