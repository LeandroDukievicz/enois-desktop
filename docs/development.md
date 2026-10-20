# Desenvolvimento

Use Linux, Node 24 e pnpm 11.0.9. Instale com `pnpm install --frozen-lockfile`.
Não atualize o lockfile implicitamente no CI. `pnpm peers check` verifica a
compatibilidade declarada pelos pacotes; typecheck/build/E2E validam a combinação.

`pnpm dev` inicia electron-vite, React/HMR e o processo Electron. `pnpm build` gera
main, preload CJS e renderer em `out/`; `pnpm start` executa esses arquivos.

## Sandbox no Ubuntu

O ambiente inicial usa Ubuntu 26.04.1, com restrição a user namespaces. O Electron
abortou inicialmente por helper SUID sem configuração. Foi ajustado exclusivamente
o helper da dependência instalada, preservando o sandbox e as restrições do host:

```bash
node node_modules/electron/install.js
sudo chown root:root node_modules/electron/dist/chrome-sandbox
sudo chmod 4755 node_modules/electron/dist/chrome-sandbox
```

Execute somente com a dependência obtida pelo lockfile verificado. Esse ajuste local
pode ser necessário novamente após reinstalação/atualização. Não altera o código
da aplicação nem o pacote Snap; a sessão Snap usa sua própria política de sandbox.
Não desative user namespaces globalmente nem acrescente flags para remover o sandbox.

## Testes

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm build
xvfb-run -a -s '-screen 0 1440x1000x24' pnpm exec playwright test
pnpm audit --prod
pnpm audit
```

Os E2E usam servidor HTTP efêmero em 127.0.0.1 e perfil temporário próprio. Testam
o Electron real sem automatizar login ou acessar contas da plataforma. A sessão
persistida usa localStorage fictício e cookie HttpOnly de uma fixture, sem valor
de autenticação na plataforma. Os cenários também verificam formulário POST,
redirect interno, reabertura e logout feito pelo servidor controlado. Diálogos e abertura
de navegador podem ser substituídos apenas no processo de teste para evitar efeitos
no sistema. Interação/navegação interna, rede, storage e lifecycle são reais.

Playwright gera traces e relatório em caso de falha; esses arquivos não são
versionados. O CI publica diagnósticos temporários, sem contas reais.

## Verificar a tela original de login

```bash
xvfb-run -a -s '-screen 0 1440x1000x24' pnpm verify:auth
```

Inspeciona os controles públicos e aciona Google/LinkedIn em perfis vazios, com
o próprio site e a política real de navegação. Substitui somente o diálogo e a
abertura do navegador no processo auditado. Registra origens e caminhos públicos;
não registra queries, credenciais, cookies, tokens ou dados de conta. Não faz
parte do CI, pois depende da rede e da interface remota. O sucesso deste comando
não representa login autenticado ou retorno OAuth ao desktop. Veja
[o resultado e a validação manual](authentication-verification.md).

## Verificar os controles da janela

O teste opcional usa Xvfb, Openbox e xdotool para enviar cliques reais aos botões
do shell local e conferir o estado nativo da janela, incluindo a alternância do
rótulo maximizar/restaurar. Em Ubuntu, instale as ferramentas
de teste com `sudo apt-get install --no-install-recommends xvfb xauth openbox xdotool`.

```bash
pnpm verify:window-controls
```

O comando cria um display próprio, inicia apenas seu gerenciador de janelas,
usa servidor/perfil temporários sem conta e verifica maximizar, restaurar,
minimizar e fechar com saída 0. A janela do usuário não recebe esses cliques.
O relatório fica em `test-results/window-controls.json`. A suíte E2E
principal também verifica o logo carregado e a separação dos controles nas
larguras 760 e 1360 px, sem depender dessas ferramentas opcionais.

Em uma sessão Wayland real, execute `pnpm verify:window-controls:wayland`. Esse modo
abre uma janela descartável no compositor atual, usa cliques Playwright nos
controles locais e verifica os estados reais de BrowserWindow. Não requer Openbox
ou xdotool. Seu relatório fica em `test-results/window-controls-wayland.json`.
Ambos os modos fecham somente seu perfil temporário e não usam contas reais.

## Capturar prévia real

Requer Xvfb, xauth e ImageMagick `import`, além das bibliotecas Linux do Electron.

```bash
pnpm build
xvfb-run -a -s '-screen 0 1440x1000x24' node scripts/capture-preview.mjs
```

O script usa perfil temporário sem login. Aguarda a plataforma real, captura a
janela nativa X11 (incluindo WebContentsView), a página remota e as configurações.
Não fabrica feed, conta ou publicação. BrowserWindow.capturePage captura somente
o shell em algumas configurações; por isso a prévia composta usa captura nativa.

## Estrutura

```text
src/main/{windows,navigation,security,ipc,services}/
src/preload/index.ts
src/renderer/{app,components,hooks,styles}/
src/shared/contracts/desktop.ts
tests/{unit,integration,e2e}/
docs/architecture/decisions/
scripts/
```

Não há diretórios vazios para camadas hipotéticas. Contratos mudam junto com main,
preload, renderer e testes; funcionalidades futuras só ganham módulos quando existirem.
