# Empacotamento Linux

Configuração em `electron-builder.yml`. O código compilado e ícones são colocados
em ASAR; fontes, perfis, logs, testes e credenciais ficam fora do pacote.

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm package:dir
pnpm package:snap
```

O executável fica em `dist/linux-unpacked/enois-desktop`. O Snap deve ser gerado
como `dist/enois-desktop_0.1.0_amd64.snap`. Não considerar sua existência comprovada
até o build terminar. A produção deve ter checksum e informações de build:

```bash
node scripts/build-metadata.mjs
cd dist
sha256sum --check SHA256SUMS
```

A versão 26.15.3 deixava o arquivo `.tar` do template dentro do Snap, sem extrair
suas bibliotecas e launchers. A correção é um patch pnpm versionado em `patches/`,
com hash no lockfile: extrai o template verificado no staging do projeto e utiliza
os launchers atuais do builder. Não depende de edição manual de node_modules.
`scripts/verify-snap.mjs` impede artefatos sem launchers, NSS/NSPR, avisos de licença
do Electron/Chromium ou sandbox. O hook `build/license-notices.mjs` mantém os avisos
em `licenses/`, incluído pelo alvo Snap legado.
Essas verificações foram acrescentadas após falhas reais na instalação de teste.

## Base e interfaces

core22 usa o template de bibliotecas verificado pelo electron-builder. core24 foi
avaliado primeiro, mas seu build beta falhou no snapd aninhado do ambiente LXD
com timeout. O host é Ubuntu 26.04; não se usa modo destrutivo para instalar
pacotes de outra base no sistema do usuário. Detalhes ficam no ADR 004 e em
documentacao.md. O pacote core22 foi instalado e executado em Ubuntu 26.04.1 sob
X11/Xvfb: a tela original de entrada foi inspecionada na captura
`docs/preview/snap-installed.png`. Isso valida inicialização e carregamento público;
login autorizado, aceleração gráfica real e Wayland ainda precisam de QA.

Interfaces explícitas: network, desktop, desktop-legacy, x11, wayland, opengl,
audio-playback, home e browser-support. O template contém as bibliotecas de desktop.
`home` serve a upload/download de arquivos não ocultos; não concede acesso a todo
o sistema. Não há network-bind ou acesso preventivo a câmera, microfone ou captura.

`browser-support` declara `allow-sandbox: true`. Inspecione o `meta/snap.yaml`
gerado: o comando não pode desativar o sandbox. Essa interface pode exigir revisão
da loja e conexão manual durante o teste local.

## Instalação de teste

Somente após haver um `.snap` real:

```bash
sudo snap install --dangerous ./dist/enois-desktop_0.1.0_amd64.snap
snap connections enois-desktop
sudo snap connect enois-desktop:browser-support
snap run enois-desktop
```

`--dangerous` permite instalar um artefato local ainda sem assinatura da loja;
não muda strict para classic nem desativa o sandbox do Chromium.

Valide abertura pelo launcher, persistência, rede, upload/download, áudio, login e
logout. Consulte logs dentro do userData resolvido pelo Electron sob o perfil Snap
(`~/snap/enois-desktop/...`), em `logs/desktop.log`, sem enviar o perfil inteiro.
Para remover: `sudo snap remove enois-desktop`. Esse comando pode gerar snapshot
dos dados conforme a configuração do snapd; não o trate como exclusão instantânea.

## Critérios antes da loja

- Pacote abre instalado em strict, com sandbox Chromium.
- Permissões e arquivos desktop/ícone corretos; checagem de hashes passa.
- Login autorizado e módulos prioritários validados sem coleta de credenciais.
- Testes de gráfico/HiDPI/Wayland e GNOME/KDE registrados conforme ambiente.
- Identidade/descrição independente e direitos de recursos revisados.
- Elevar `grade` de devel para stable somente após QA e gerar novo pacote.

AppImage é opcional e não foi acrescentado antes de validar o caminho principal.
