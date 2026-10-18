import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Home,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  Settings2,
  WifiOff,
  X,
} from 'lucide-react'
import { IconButton } from '../components/icon-button'
import { SettingsPanel } from '../components/settings-panel'
import { useDesktop } from '../hooks/use-desktop'

export function App() {
  const { state, error, command, updateSettings, dismissError } = useDesktop()
  const loading = !state || state.phase === 'loading'
  const failed = state?.phase === 'error'
  return (
    <div className="desktop-shell">
      <header className="toolbar" aria-label="Navegação desktop">
        <div className="app-identity">
          <span className="app-mark" aria-hidden="true">
            é
          </span>
          <span>
            Énóis <span className="desktop-label">Desktop</span>
          </span>
        </div>
        <div className="toolbar-divider" />
        <nav aria-label="Controles da plataforma" className="navigation-controls">
          <IconButton
            label="Voltar"
            disabled={!state?.canGoBack || state.settingsOpen}
            onClick={() => void command('back')}
          >
            <ArrowLeft size={18} />
          </IconButton>
          <IconButton
            label="Avançar"
            disabled={!state?.canGoForward || state.settingsOpen}
            onClick={() => void command('forward')}
          >
            <ArrowRight size={18} />
          </IconButton>
          <IconButton
            label="Recarregar"
            disabled={!state || state.settingsOpen}
            onClick={() => void command('reload')}
          >
            <RefreshCw size={17} className={loading ? 'spin' : ''} />
          </IconButton>
          <IconButton
            label="Ir para o início"
            disabled={!state || state.settingsOpen}
            onClick={() => void command('home')}
          >
            <Home size={17} />
          </IconButton>
        </nav>
        <div className="location-chip">
          <LockKeyhole size={12} />
          <span>enois.ia.br</span>
        </div>
        <div className="toolbar-end">
          <span
            className={`connection-status ${failed || state?.online === false ? 'disconnected' : ''}`}
            role="status"
          >
            <span className="status-dot" />
            {state?.online === false
              ? 'Sem conexão'
              : failed
                ? 'Indisponível'
                : loading
                  ? 'Conectando'
                  : 'Conectado'}
          </span>
          <IconButton
            label="Abrir no navegador"
            onClick={() => void command('open-browser')}
            disabled={!state}
          >
            <ExternalLink size={16} />
          </IconButton>
          <IconButton
            label={state?.settingsOpen ? 'Fechar configurações' : 'Configurações'}
            onClick={() => void command(state?.settingsOpen ? 'close-settings' : 'settings')}
            disabled={!state}
          >
            <Settings2 size={18} />
          </IconButton>
        </div>
      </header>
      {state?.settingsOpen ? (
        <SettingsPanel state={state} command={command} updateSettings={updateSettings} />
      ) : loading || failed || !state ? (
        <main className="status-page" aria-live="polite" aria-busy={loading && !error}>
          <div className="status-orbit" aria-hidden="true">
            <span className="status-mark">{failed ? <WifiOff size={34} /> : 'é'}</span>
          </div>
          <p className="eyebrow">ÉNÓIS DESKTOP</p>
          <h1>
            {error && !state
              ? 'Vamos tentar de novo.'
              : failed
                ? 'Uma pausa na conexão.'
                : 'Sua comunidade, no desktop.'}
          </h1>
          <p className="status-description">
            {error && !state
              ? error
              : (state?.error?.message ?? 'Estamos abrindo seu espaço no Énóis.')}
          </p>
          {failed || (error && !state) ? (
            <button
              className="primary-button"
              onClick={() => (state ? void command('reload') : window.location.reload())}
            >
              <RefreshCw size={16} /> Tentar novamente
            </button>
          ) : (
            <div className="loading-caption">
              <LoaderCircle size={16} className="spin" /> Conectando à plataforma
            </div>
          )}
          <span className="status-footnote">
            A experiência original do Énóis, em uma janela sua.
          </span>
        </main>
      ) : (
        <main className="remote-placeholder" aria-label="Área da plataforma Énóis" />
      )}
      {error && state && (
        <div className="toast" role="alert">
          {error}
          <IconButton label="Fechar aviso" onClick={dismissError}>
            <X size={14} />
          </IconButton>
        </div>
      )}
    </div>
  )
}
