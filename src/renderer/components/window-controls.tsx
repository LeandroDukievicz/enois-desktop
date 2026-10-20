import { Copy, Minus, Square, X } from 'lucide-react'
import type { Command } from '../../shared/contracts/desktop'
import { IconButton } from './icon-button'

export function WindowControls({
  isMaximized,
  command,
}: {
  isMaximized: boolean
  command: (action: Command) => Promise<void>
}) {
  return (
    <div className="window-controls" role="group" aria-label="Controles da janela">
      <IconButton label="Minimizar janela" onClick={() => void command('minimize-window')}>
        <Minus size={16} />
      </IconButton>
      <IconButton
        label={isMaximized ? 'Restaurar janela' : 'Maximizar janela'}
        onClick={() => void command('toggle-maximize-window')}
      >
        {isMaximized ? <Copy size={14} /> : <Square size={14} />}
      </IconButton>
      <IconButton
        label="Fechar janela"
        className="icon-button close-window"
        onClick={() => void command('close-window')}
      >
        <X size={17} />
      </IconButton>
    </div>
  )
}
