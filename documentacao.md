# Documentação de criação do Énóis Desktop

Este documento registra como o projeto está sendo criado. Os checkpoints executáveis
ficam em [milestone.md](milestone.md). Decisões e resultados são atualizados conforme
as validações; configuração existente não é tratada como funcionalidade comprovada.

## Pedido e limites

Construir um cliente Linux com Electron, preservar UX/UI e estética do Énóis,
publicar o código em `enois-desktop`, produzir uma prévia e reservar o nome na Snap Store.
O site original é a fonte de verdade. Não há acesso ao backend nem afiliação oficial
confirmada. O desktop não recria entidades, feed ou APIs, não faz scraping, não
intercepta credenciais e não automatiza publicações.

## Discovery realizado em 18/10/2026

- Diretório novo: `/home/leandro-dukievicz/Projetos/enois-desktop`.
- Nenhum código preexistente foi sobrescrito.
- API oficial documentada em https://enois.ia.br/developers.
- Comunidades e um post público responderam HTTP 200 em consultas somente leitura.
- Feed pessoal respondeu HTTP 401 sem autenticação, conforme documentado.
- A API rejeitou a origem `app://enois`; a implementação inicial evita duplicar o
  frontend e usa a navegação do site em sua própria origem HTTPS.
- OAuth de terceiros está em evolução na documentação da plataforma. Login real,
  2FA, renovação e funcionalidades privadas exigem conta de teste autorizada.
- A documentação prevê clientes e proíbe publicação automática por bots/integrações.
- Não foi encontrada licença de redistribuição do frontend original nas páginas
  consultadas. O cliente carrega o serviço remoto; seu código local é independente.

## Escolhas e execução

1. Comparar BrowserWindow remota com WebContentsView e escolher o segundo: o shell
   local continua disponível quando o serviço falha, sem injetar controles no site.
2. Separar main, preload local, renderer React e contratos Zod. Não há preload no site.
3. Fixar versões, verificar peer dependencies e versionar o lockfile. TypeScript
   7 foi identificado como incompatível com typescript-eslint; foi fixado TypeScript 5.9.3.
4. Criar políticas puras de navegação/permissões e testá-las sem uma sessão real.
5. Persistir a sessão em `persist:enois`, administrada pelo Chromium/Electron. Não
   compartilhar automaticamente dados com navegadores externos ou copiar tokens.
6. Criar navegação desktop, recuperação manual, preferências implementadas e logs
   locais com campos limitados. Nenhuma telemetria externa.
7. Validar com servidor de testes local e Playwright; depois capturar o serviço real.
8. Gerar executável e Snap, inspecionar confinamento e registrar evidências.
9. Publicar o repositório solicitado. Não enviar pacote para a loja automaticamente.

## Reserva do nome

`snapcraft register --yes enois-desktop` retornou `Registered 'enois-desktop'`.
A listagem `snapcraft names` confirmou o nome público na conta `ldukie`, com data
`2026-10-18T22:20:43Z`. Isso reserva o identificador; não significa que exista uma
versão publicada, revisada ou aprovada pela loja.

## Material fornecido

O usuário forneceu `Downloads/download.svg`, um diagrama arquitetural, para uso no
README. Ele foi versionado como recurso de documentação; não foi tratado como
logotipo oficial da plataforma nem como autorização geral de uso da marca.

## Fundação implementada

- Electron 44.9.0, electron-builder 26.15.3, electron-vite 6.0.0 e Vite 8.3.4.
- React/React DOM 19.3.1, TypeScript 5.9.3, Tailwind 4.3.3 e Zod 4.6.7.
- Node de desenvolvimento 24.15.0, pnpm 11.0.9, Vitest 5.0.5 e Playwright 1.64.1.
- ESLint 10.13.0, typescript-eslint 8.71.2 e Prettier 3.9.10.
- Versões exatas e dependências restantes em package.json/pnpm-lock.yaml;
  `pnpm peers check` não apresentou incompatibilidades após o ajuste do TypeScript.

O main administra janela, view, navegação, permissões, downloads, configuração,
logs e lifecycle. O preload local expõe quatro operações específicas, sem objetos
Electron. O renderer React oferece barra de navegação, carregamento, erro e ajustes
locais. O remoto mantém frontend, tema, UX/UI e lógica do serviço sem injeção.

Não foi criado proxy de API: o site consome sua própria API normalmente. Não há
coleta de credenciais, duplicação de feed, banco local ou estado global adicional.

## Resultados de validação

- Typecheck, ESLint e Prettier passaram.
- 35 testes Vitest passaram: URLs, origem/frame IPC, permissões, contratos, dados
  inválidos, persistência/gravação concorrente e rotação de logs.
- 6 E2E com Electron real passaram: início/isolamento/navegação/encerramento,
  persistência após reabrir, falha e reconexão, link externo cancelado, limpeza
  de sessão confirmada e recuperação de renderer interrompido.
- O encerramento verifica saída do processo principal e desaparecimento dos PIDs
  dos renderers. Não são usadas credenciais reais no CI ou testes locais.
- O site real carregou no Electron e redirecionou o feed sem sessão para sua tela
  original de entrada. Capturas nativas em docs/preview/desktop.png e settings.png;
  captura da view isolada em platform.png.
- O SVG fornecido está em docs/assets/architecture.svg e aparece no README.
- GitHub público criado: https://github.com/LeandroDukievicz/enois-desktop.
  Relato privado de vulnerabilidades foi habilitado.

## Auditoria de dependências

`pnpm audit --prod` retornou zero vulnerabilidades conhecidas. A auditoria completa
encontrou uma vulnerabilidade moderada de negação de serviço em `sprintf-js@1.1.3`,
transitiva de electron-builder → @electron/get → global-agent → roarr. O advisory
indica correção a partir de 1.1.4, porém o registry consultado ainda publica 1.1.3
como última versão. Uma tentativa de resolver 1.1.4 retornou NO_MATCHING_VERSION;
o override não validado foi removido. Não se declara que essa dependência foi corrigida.
Ela pertence à ferramenta de desenvolvimento/build, não ao runtime distribuído.

## Empacotamento e incidente core24

1. core24 foi escolhido inicialmente pela base mais moderna e extensão GNOME.
2. O schema do electron-builder instalado classifica esse caminho como beta.
3. O build real criou um contêiner LXD Ubuntu 24.04, mas falhou com
   `TimeoutExpired` ao executar `snap unset system proxy.http` dentro dele.
4. O snapd do contêiner também registrou timeout ao conectar à API da loja. Não foi
   alterada a rede/firewall global do host nem usado build destrutivo de outra base.
5. O contêiner de teste foi encerrado e a configuração passou para core22, com
   template verificado pelo builder e sem depender do snapd aninhado.
6. O build core22 terminou e produziu dist/enois-desktop_0.1.0_amd64.snap (~107 MiB)
   e dist/linux-unpacked/enois-desktop.
7. O manifesto real foi inspecionado: confinement strict, base core22,
   browser-support com allow-sandbox e comando sem desativação de sandbox.
8. O pacote aplica fuses para impedir RunAsNode, NODE_OPTIONS e inspector Node por
   linha de comando. Não há menu de DevTools em produção.
9. O pacote final foi instalado localmente e executado com confinamento strict em
   Ubuntu 26.04.1/X11/Xvfb. Uma nova ocorrência de `remote.loaded` foi verificada
   pelo timestamp, aguardando mais 12 segundos antes da captura nativa. A tela de
   entrada original foi inspecionada em `docs/preview/snap-installed.png`.
   Não foram usadas credenciais ou argumentos para desativar o sandbox.

### Correção reproduzível do template em 19/10/2026

O teste instalado encontrou primeiro launchers ausentes e depois `libnspr4.so`
ausente. A causa foi confirmada inspecionando a imagem: ela continha
`snap-template-electron-4.0-2-amd64.tar` como um arquivo, sem seu conteúdo extraído.
O arquivo verificado do template já continha as bibliotecas necessárias.

Foi criado um patch pnpm pequeno em `patches/app-builder-lib@26.15.3.patch`. Ele
extrai o tar no staging do projeto e substitui os launchers legados pelas versões
do builder instalado. O hook provisório foi removido; a correção e seu hash estão
no lockfile e foram verificados após reinstalação limpa com `--frozen-lockfile`.
O build passou a inspecionar também a existência real de libnspr4.so e libnss3.so
dentro da imagem, além dos launchers e permissões de sandbox.

O hook `build/license-notices.mjs` tem outra responsabilidade: preservar os avisos
de licença do Electron e Chromium em `licenses/`, pois o alvo Snap legado omite
esses arquivos da raiz. A inspeção do pacote exige ambos os avisos. Uma captura
inicial feita imediatamente após o evento de carregamento mostrou apenas o shell;
ela foi substituída após aguardar e verificar visualmente a renderização do site.
O ambiente Xvfb registrou avisos de inicialização OpenGL, mas o fallback renderizou
a interface. Isso não substitui a validação de aceleração gráfica em desktop real.

No CI, o teste que chamava forcefullyCrashRenderer apresentou timeout ao esperar
o encerramento do processo. O teste passou a enviar SIGKILL exclusivamente ao PID
do renderer da fixture, para validar uma interrupção real sem depender de coleta
de crash do sistema operacional. O CI completo passou com 35 testes Vitest e 6 E2E:
https://github.com/LeandroDukievicz/enois-desktop/actions/runs/39173598461.

## Baseline de desempenho

Uma amostra local X11/Xvfb de 20/10/2026 registrou aproximadamente 394 ms entre iniciar o processo
e obter a janela e 2,37 s até o serviço remoto pronto. O segundo valor inclui rede
e carregamento do site e não mede apenas o shell. A amostra, memória por processo,
intervalo de CPU e contexto estão em docs/preview/measurements.json.

É uma observação inicial em ambiente de desenvolvimento, não uma meta, benchmark
repetido ou garantia de consumo em máquinas dos usuários. Wayland, HiDPI, múltiplos
monitores e retomada de suspensão ainda precisam de medições próprias.

## Logo oficial e controles da janela em 20/10/2026

A pedido do usuário, o ícone provisório foi substituído pelos arquivos públicos
oficiais da plataforma. O PNG de 512 px veio do manifesto do site; o símbolo
transparente é o mesmo referenciado em seu HTML público. As cópias preservam os
bytes originais, e suas fontes/hashes estão em `assets/icons/README.md`.
O SVG arquitetural fornecido pelo usuário continua no README.

A primeira implementação usou o overlay nativo do Electron e passou nos testes
X11/Xvfb, inclusive com cliques reais. O CI identificou ainda uma condição em que
`ready-to-show` não era emitido para a janela oculta com view filha. O main passou
a mostrar a janela após carregar o shell local, antes de iniciar o site. Os 35
testes Vitest, 10 E2E e o CI do commit `d94d03c` passaram após essa correção.

Quando o usuário confirmou o fechamento do aplicativo, o Snap foi atualizado
para a revisão local `x6`. Sua abertura apresentou SIGSEGV antes de mostrar a
janela, também reproduzido com perfil vazio. O diagnóstico nativo em perfil
descartável apontou uma chamada nula no caminho de consulta do tema GTK usado pelo
overlay. Isso mostrou a necessidade de validar o pacote na sessão gráfica real,
além dos testes sob Xvfb. Nenhuma sessão de usuário foi limpa ou inspecionada.

A implementação atual usa `frame: false` e três botões no shell React: minimizar,
maximizar/restaurar e fechar. Os comandos IPC são enumerados e aceitos somente
do frame principal local; o main chama as APIs específicas de BrowserWindow.
Os eventos reais de maximização atualizam o rótulo do botão. Fechar mantém o
tratamento de beforeunload e a limpeza do ciclo de vida. O site continua sem
preload ou acesso nativo. A decisão e as alternativas estão na
[ADR 005](docs/architecture/decisions/005-window-controls.md).

A revisão `x7` abriu a janela e carregou a plataforma, mas a observação dos logs
encontrou uma exceção durante o fechamento. A reprodução em perfil descartável
mostrou que `WebContentsView.webContents` já estava indefinido no evento `closed`.
O main agora guarda a referência de WebContents desde a criação e consulta
`isDestroyed()` nesse objeto durante a limpeza. Os testes passaram a exigir
`window.closed` e a ausência de exceções/rejeições não tratadas nos logs depois
de fechar, além da saída 0. Isso evita considerar um encerramento com erro como
sucesso apenas porque o handler global chamou `app.quit()`.

Os 35 testes Vitest e 10 E2E passaram com essa implementação. O E2E confirma a
janela visível, o símbolo carregado, os controles sem sobreposição nas larguras
760 e 1360 px, o isolamento remoto e o encerramento pelo botão local sem processos
órfãos. `pnpm verify:window-controls` usa Xvfb/Openbox/xdotool em display isolado,
enquanto `pnpm verify:window-controls:wayland` usa o compositor Wayland real e
cliques Playwright. Ambos usam somente fixture e perfil temporários e verificam
maximizar, restaurar, minimizar e fechar com saída 0. As ferramentas de teste não
são dependências do aplicativo. Evidências revisadas ficam em
`docs/verification/window-controls-2026-10-20.json` e
`docs/verification/window-controls-wayland-2026-10-20.json`.

As capturas de `docs/preview/` foram atualizadas em perfil temporário sem conta,
aguardando o formulário original e o símbolo local carregado.

O pacote final do commit `e8f0110` foi gerado, inspecionado e instalado como revisão
local `x8`. O checksum passou e o ícone empacotado é idêntico ao PNG oficial.
Um perfil descartável executou o Snap na sessão GNOME/Wayland, sem flags gráficas:
janela visível, plataforma pronta e encerramento por SIGTERM após 16 segundos,
com `window.closed`, saída 0 e nenhuma exceção. A evidência fica em
`docs/verification/installed-branding-smoke-2026-10-20.json`.

O aplicativo foi reaberto no perfil habitual, mantendo os dados locais. A observação
registrou a janela visível, dois eventos de carregamento pronto e nenhum erro,
sem acessar credenciais ou conteúdo privado. O CI do código final também passou:
[execução e8f0110](https://github.com/LeandroDukievicz/enois-desktop/actions/runs/39477191619).
O [workflow de artefatos](https://github.com/LeandroDukievicz/enois-desktop/actions/runs/39477248521)
também passou e disponibilizou Snap, checksum e metadados no GitHub Actions.
O registro consolidado do pacote e da instalação fica em
`docs/verification/branding-package-2026-10-20.json`. Até essa etapa, anterior à
autorização posterior de publicação, nenhum upload à Snap Store havia sido executado.

## Pendências reais

### Verificação de login iniciada em 19/10/2026

Os botões originais Google e LinkedIn foram acionados em perfis temporários,
sem credenciais. Ambos iniciaram OAuth real, encaminhado pelo wrapper ao navegador
externo; o shell permaneceu pronto, sem erro. O retorno à sessão desktop ainda
depende de confirmação. Evidências, callbacks públicos observados e checklist
manual estão em [verificação de autenticação](docs/authentication-verification.md).

Foi acrescentado `pnpm verify:auth`, que reproduziu essa inspeção no site real
e gerou um relatório sem credenciais. A evidência pública revisada está em
`docs/verification/authentication-public-2026-10-19.json`. A suíte E2E passou a
10 cenários, acrescentando POST/redirect/cookie HttpOnly persistente/logout,
navegação OAuth externa, redirect externo bloqueado e CacheStorage. Os 10 passaram, assim como
typecheck, lint, formatação e os 35 testes Vitest. Nenhuma política de segurança
de produção foi relaxada e nenhuma autenticação paralela foi criada.

O Snap foi aberto na sessão gráfica para entrada manual do usuário. O repositório
foi conferido com `git fetch` e estava sincronizado com `origin/main`, sem commits
locais pendentes. A partir desta etapa, cada atualização validada é enviada em um
commit próprio ao remoto.

A inspeção extra descobriu uma interrupção real do renderer associada ao user
agent com o nome acentuado do aplicativo. Foi corrigido somente o produto HTTP
para `enois-desktop`, mantendo nome visual, Chromium/Electron reais, sandbox e
políticas de segurança. O percurso original `/entrar` → `/developers` → `/feed`
voltou a funcionar com o shell pronto. O verificador agora cobre esse percurso.
Diagnóstico e evidências ficam em `docs/authentication-verification.md`.

O Snap corrigido foi gerado novamente, inspecionado, instalado como revisão local
`x5` e iniciado na sessão GNOME/Wayland com `snap run enois-desktop`, sem flags de
backend gráfico. Houve carregamento remoto pronto e nenhuma nova interrupção no
período observado. O checksum foi validado; os dados anteriores foram preservados.
O registro técnico está em `docs/verification/installed-snap-2026-10-19.json`.
A janela corrigida foi deixada aberta para entrada manual. Login autenticado e
retorno OAuth continuam pendentes da confirmação do usuário.

Login real, 2FA, expiração/renovação, OAuth, Web Push e todos os módulos privados
exigem validação com conta autorizada. Recursos públicos/documentados e limites
estão inventariados em docs/platform-compatibility.md. Não se declara paridade
funcional completa apenas porque o site original está carregado.

A aprovação humana da Snap Store, condições de uso do logotipo na distribuição,
página completa da loja e promoção de canais continuam pendentes. Reservar o nome
ou enviar uma revisão não significa liberar um canal. O workflow gera artefatos
e não faz upload automático; o primeiro envio autorizado está registrado abaixo.

## Primeira publicação na Snap Store — 20/10/2026

O usuário autorizou explicitamente commit/push e publicação na loja. Foi escolhido
`latest/edge`, pois os testes automatizados e o smoke instalado passaram, enquanto
login real e QA completo continuam pendentes para os canais mais estáveis.
O repositório foi conferido e estava sincronizado com `origin/main`. O artefato
validado da revisão local `x8` foi inspecionado novamente e seu checksum passou;
as alterações posteriores ao código empacotado são exclusivamente documentais.

A preparação, hash, commit e resultado da loja são registrados em
[publicação na Snap Store](docs/store-publication.md). A autorização desta sessão
é suficiente para esse envio, sem solicitar novamente confirmação. Envio, revisão
e liberação do canal serão registrados conforme o resultado real da loja.

O commit de preparação `5a44a9b` foi enviado a `origin/main`, e a tag anotada
`v0.1.0` foi publicada apontando ao commit do código empacotado `e8f0110`.
O workflow acionado pela tag também passou. A loja recebeu o pacote como revisão
`1`, versão `0.1.0`, arquitetura amd64, em 20/10/2026 às 19:14:26 UTC.
`snapcraft upload-metadata` confirmou o envio do resumo, descrição e ícone.
A solicitação de liberação é `latest/edge`; durante o processamento, a consulta
`snapcraft status` ainda informou ausência de revisões liberadas. Isso comprova
submissão, mas ainda não disponibilidade para instalação pela loja.

O processamento terminou com `need_manual_review`: a revisão automática exigiu
análise humana por causa do atributo `allow-sandbox: true` da interface
`browser-support`. O comando de upload terminou com código `1`; a revisão continua
recebida na loja, mas nenhum canal foi liberado. Os requisitos de sandbox e
confinamento strict foram preservados. Não foi enviado outro pacote apenas para
repetir o mesmo resultado nem alterada a segurança para passar na revisão.

Foi preparado o [pedido técnico de revisão](docs/store-review-request.md), com
justificativa, fonte, versão, hash, permissões e evidências de QA. Esse texto não
foi publicado no fórum nem enviado separadamente a pessoas. O resultado da loja
está em `docs/verification/store-publication-2026-10-20.json`. A liberação depende
agora da avaliação da Canonical; o checkpoint de disponibilidade em edge permanece
aberto.

### Encaminhamento da revisão humana

Ao perguntar se bastava aguardar, o usuário recebeu a distinção que faltava:
o upload retornou a exigência `need_manual_review`, mas não confirmou entrada na
fila humana. O pedido técnico havia sido preparado, sem envio pelo painel/fórum.
O próximo passo é confirmar/acionar a solicitação manual na revisão `1` e formalizar
a autorização da interface na categoria `privileged-interfaces`, evitando duplicar
uma solicitação que já esteja pendente. O texto foi ajustado ao modelo oficial da
Canonical, com tipo `manual-connection`, relação com o upstream, atributo e motivo.
Uma cópia do manifesto real do pacote foi incluída em
`docs/verification/snap-manifest-0.1.0.yaml` para facilitar a análise. Nenhum segredo
ou dado de conta foi incluído. A autorização da Canonical permanece pendente.
