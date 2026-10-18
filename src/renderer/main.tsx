import { Component, type ReactNode, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/app'
import './styles/app.css'

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed)
      return (
        <main className="status-page">
          <h1>Não foi possível abrir os controles.</h1>
          <button className="primary-button" onClick={() => window.location.reload()}>
            Reiniciar interface
          </button>
        </main>
      )
    return this.props.children
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
