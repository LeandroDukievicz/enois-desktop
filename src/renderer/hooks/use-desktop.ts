import { useCallback, useEffect, useState } from 'react'
import type { Command, DesktopState, Settings } from '../../shared/contracts/desktop'

export function useDesktop() {
  const [state, setState] = useState<DesktopState | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!window.desktop) {
      setError('Abra o Énóis Desktop pelo aplicativo Electron para continuar.')
      return
    }
    let disposed = false
    const update = (next: DesktopState) => {
      if (!disposed) setState(next)
    }
    const refresh = () => {
      void window.desktop
        .getState()
        .then(update)
        .catch(() => {
          if (!disposed) setError('Não foi possível inicializar os controles do aplicativo.')
        })
    }
    const unsubscribe = window.desktop.onState(update)
    refresh()
    window.addEventListener('online', refresh)
    window.addEventListener('offline', refresh)
    return () => {
      disposed = true
      unsubscribe()
      window.removeEventListener('online', refresh)
      window.removeEventListener('offline', refresh)
    }
  }, [])

  const command = useCallback(async (action: Command) => {
    setError(null)
    try {
      await window.desktop.command(action)
    } catch {
      setError('Não foi possível concluir a operação. Tente novamente.')
    }
  }, [])
  const updateSettings = useCallback(async (settings: Settings) => {
    setError(null)
    try {
      await window.desktop.updateSettings(settings)
    } catch {
      setError('Não foi possível salvar a configuração.')
    }
  }, [])
  return { state, error, command, updateSettings, dismissError: () => setError(null) }
}
