# ADR 004 — Snap strict, core24 e atualizações

Status: aceito; core24 avaliado, core22 escolhido após falha do ambiente isolado.
Data: 18/10/2026.

**Contexto e problema:** distribuir para Linux com build reproduzível, integração
de desktop e atualizações sem desativar o sandbox.

**Alternativas:** Snap core24 com extensão GNOME; base core22 legada; manifest Snap
manual com binário pré-compilado; AppImage como artefato complementar.

**Decisão:** electron-builder 26.15.3, chave `snapcraft`, core22 e confinamento
strict, usando o template de bibliotecas com checksum verificado pelo builder.
core24 foi tentado primeiro: o suporte desta versão é beta e o Snapcraft/LXD
falhou com TimeoutExpired ao configurar o proxy do snapd do contêiner. O serviço
também registrou timeout de conexão à API da loja. Isso é evidência de falha do
ambiente, não prova de incompatibilidade do aplicativo com Ubuntu 24.04.

**Justificativa:** core22 mantém um caminho estável de empacotamento, sem depender
do snapd aninhado no LXD deste host. A configuração explícita de browser-support com allow-sandbox
mantém o sandbox Chromium. O código gerador do builder foi inspecionado porque
configurações padrão podem acrescentar argumento que o desativa.

**Consequências:** a interface com allow-sandbox pode exigir conexão manual/revisão
na loja. Não se trocará por classic nem se desativará o sandbox para publicar.
`home` permite upload/download de arquivos não ocultos, além dos diálogos nativos;
network-bind, câmera, microfone e captura de tela não são solicitados antecipadamente.
Uma migração futura para core24 deverá passar por build e teste instalado; não
basta alterar a base no manifesto.

**Compatibilidade do builder:** o teste instalado detectou launchers e bibliotecas
ausentes. A inspeção mostrou que o builder deixava o `.tar` interno sem extrair
após abrir o `.tar.7z`. O patch versionado em
`patches/app-builder-lib@26.15.3.patch` extrai o arquivo verificado na área de staging
do projeto e usa os launchers da versão instalada. O cache compartilhado não é alterado.
Uma instalação limpa com lockfile imutável confirmou a aplicação do patch.
`scripts/verify-snap.mjs` verifica launchers, bibliotecas NSS/NSPR, avisos de licença
Electron/Chromium, strict, sandbox e associação de janela; o build falha se faltar
um desses requisitos. O pacote foi instalado em Ubuntu 26.04.1 e renderizou a tela
original de entrada sob X11/Xvfb, sem desativar sandbox. Wayland e QA autenticado
continuam pendentes.

**Atualizações:** snapd gerencia versões distribuídas na loja. Não há auto-updater
paralelo. Reserva do nome é distinta de upload, revisão ou lançamento. Não publicar
na Snap Store automaticamente; primeiro edge, depois beta/candidate/stable após QA.
