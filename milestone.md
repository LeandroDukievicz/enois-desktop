# Énóis Desktop — checkpoints

Fonte de verdade das funcionalidades: https://enois.ia.br/feed. Cliente independente;
não há afiliação oficial confirmada. Cada checkbox exige evidência verificável.

## M0 · Descoberta e reserva

- [x] Verificar o diretório: projeto novo, sem código preexistente.
- [x] Identificar a API oficial em https://enois.ia.br/developers.
- [x] Consultar comunidades e um post público: HTTP 200; feed pessoal: HTTP 401.
- [x] Confirmar acesso às contas GitHub e Snapcraft, sem guardar credenciais no projeto.
- [x] Reservar `enois-desktop` na Snap Store e registrar o resultado.
- [x] Criar repositório público `LeandroDukievicz/enois-desktop`.
- [x] Documentar identidade, limites do cliente e inventário de funcionalidades.

## M1 · Fundação e segurança

- [x] Fixar dependências e lockfile; configurar TypeScript, build, lint e formatação.
- [x] Escrever ADR comparando BrowserWindow remota e WebContentsView.
- [x] Criar shell React local e conteúdo remoto sem preload, Node ou ponte IPC.
- [x] Aplicar sandbox, isolamento, validação de origem e contratos IPC com Zod.
- [x] Restringir navegação, popups, permissões, downloads e protocolos externos.
- [x] Implementar partição persistente para o site sem interceptar senhas ou tokens.
- [x] Implementar instância única, fechamento e restauração da janela.

## M2 · Experiência desktop e prévia

- [x] Manter site original, rotas, tema, UX/UI e estética sem injetar CSS ou reimplementar feed.
- [x] Implementar voltar, avançar, recarregar, início, zoom e atalhos.
- [x] Implementar carregamento, erro de conexão, recuperação e limpeza de sessão com confirmação.
- [x] Implementar configurações locais e preferências persistentes.
- [x] Executar o aplicativo real e salvar capturas da prévia.

## M3 · Qualidade e publicação do código

- [x] Cobrir política de navegação, contratos e configurações com testes.
- [x] Testar o Electron com Playwright, incluindo isolamento do site e persistência.
- [x] Passar typecheck, lint, formatação, testes e build.
- [x] Criar CI e workflow de artefatos/release com permissões mínimas.
- [x] Publicar código, documentação, capturas e evidências no repositório público.

## M4 · Empacotamento Linux

- [x] Gerar aplicação Linux desempacotada.
- [x] Gerar `.snap` com confinamento strict.
- [x] Inspecionar manifesto, dependências e permissões do pacote.
- [x] Validar pacote instalado em ambiente de teste, sem desabilitar o sandbox de produção.

## M5 · Validação autenticada e lançamento

- [x] Inspecionar os botões originais de login e registrar navegação/callbacks sem credenciais.
- [ ] Validar login, logout, expiração/renovação e 2FA com conta de teste autorizada.
- [ ] Validar feed, posts, comentários, reações, comunidades e upload.
- [ ] Validar mensagens, notificações, vagas, eventos e demais módulos disponíveis à conta.
- [ ] Validar OAuth, redirecionamentos e recursos que dependem de fornecedores externos.
- [ ] Confirmar direitos sobre identidade visual antes de usar logotipo oficial na distribuição.
- [ ] Testar X11/Wayland, GNOME/KDE, acessibilidade e atualização via Snap.
- [ ] Preparar página da loja e política de privacidade do cliente.
- [ ] Publicar canal de testes, acompanhar revisão da loja e só então promover para stable.

Não marcar M5 como concluído com base apenas na disponibilidade do site. Carregar a
plataforma original preserva sua implementação, mas não prova compatibilidade de
todos os recursos em Electron. Nenhum backend, entidade ou endpoint privado será criado.

## Evidências desta etapa

- `pnpm check`: typecheck, ESLint, Prettier e 35 testes passaram.
- Playwright/Electron: 6 cenários passaram em X11/Xvfb com sandbox ativo.
- `pnpm audit --prod`: nenhuma vulnerabilidade conhecida nas dependências de produção.
- Auditoria completa: uma vulnerabilidade moderada em sprintf-js transitivo de
  desenvolvimento; a versão corrigida indicada pelo advisory ainda não está no registry.
- `pnpm package:snap`: artefato core22 de aproximadamente 107 MiB gerado.
- Manifesto: strict, browser-support com allow-sandbox, sem argumento que desative o sandbox.
- Snap instalado em Ubuntu 26.04.1, executado em X11/Xvfb; tela original de entrada
  inspecionada em `docs/preview/snap-installed.png`. Bibliotecas e avisos de licença
  do Electron/Chromium estão presentes na imagem. Wayland e login real pendentes.
- core24 foi tentado e falhou no snapd/LXD; motivo e alternativa registrados no ADR 004.
- Capturas reais e medição inicial em `docs/preview/`; teste com conta real pendente.
