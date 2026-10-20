# ADR 005 — Controles da janela no shell local

Status: aceito. Data: 20/10/2026.

**Contexto e problema:** todos os usuários precisam de minimizar, maximizar/restaurar
e fechar, sem depender da preferência de decoração do GNOME. A primeira implementação
usou `titleBarStyle: hidden` e `titleBarOverlay`, conforme a documentação do Electron.
Passou em X11/Xvfb, incluindo cliques reais. Porém, o Snap instalado na sessão
GNOME/Wayland encerrou com SIGSEGV antes de `window.visible`, inclusive com perfil vazio.
Uma sessão gdbserver em perfil descartável registrou chamada a endereço nulo. O
trecho nativo de consulta do tema corresponde a `GtkSymbolicIconProvider::GetThemeName`
no [Electron 44.9.0](https://github.com/electron/electron/blob/v44.9.0/shell/browser/ui/gtk/gtk_symbolic_icon_provider.cc).
Sem símbolos completos, essa associação identifica o caminho provável, não uma
confirmação de qual componente inicializou incorretamente o ponteiro GTK.

**Alternativas:** manter o overlay e forçar X11; depender apenas da decoração padrão
do sistema; implementar os três controles no renderer local.

**Decisão:** usar janela `frame: false` com controles React locais e três comandos
enumerados: `minimize-window`, `toggle-maximize-window` e `close-window`. O main usa
as APIs específicas de BrowserWindow. O estado maximizado é atualizado pelos eventos
`maximize`/`unmaximize`, inclusive quando a mudança é feita pelo sistema operacional.

**Justificativa:** remove a dependência do caminho de tema do overlay e mantém os
três botões disponíveis. Não exige flags de backend gráfico, dependências adicionais
ou nova ponte no conteúdo remoto. A validação IPC já existente exige o WebContents,
frame e origem locais, além de validar o comando com Zod.

**Consequências:** a aparência dos botões pertence ao shell, e sua área fica fora
da região arrastável. Fechar passa pelo mesmo tratamento de beforeunload, gravação
de dimensões e limpeza dos processos. E2E cobre layout e encerramento; o teste
opcional com Xvfb/Openbox/xdotool confirma os quatro cliques e os estados reais.
Uma inspeção estática do Snap e testes apenas em Xvfb não bastam para declarar
compatibilidade do pacote na sessão gráfica instalada.
