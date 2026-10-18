# ADR 002 — WebContentsView e ponte exclusiva do shell

Status: aceito. Data: 18/10/2026.

**Contexto e problema:** manter toda a UX/UI original e continuar oferecendo
feedback/navegação quando o serviço falhar. O conteúdo remoto não é confiável para
operações privilegiadas.

**Alternativas:** BrowserWindow carregando diretamente o site; BrowserWindow com
React local mais WebContentsView; recriar cliente pela API; BrowserView depreciado.

**Decisão:** BrowserWindow local com WebContentsView remoto. Ambos usam sandbox,
contextIsolation e webSecurity; Node está desativado. O remoto não recebe preload.
IPC é exposto somente ao shell com contratos explícitos, validação Zod, identidade
do WebContents e frame principal. Produção carrega o shell via `enois://app/index.html`.

**Justificativa:** uma janela apenas remota simplifica a criação inicial, mas torna
estados locais e controles persistentes mais frágeis ou dependentes de injeção no
site. A view separada satisfaz a recuperação de erros e preserva o frontend remoto.
Recriar o feed perderia fidelidade e duplicaria manutenção. BrowserView não será usado.

**Consequências:** há duas páginas/renderers e layout de uma view nativa. A view é
fechada explicitamente no lifecycle. Popups internos são direcionados à view;
autenticação federada exige inspeção/validação antes de autorizar novas origens.
Não há proxy de API, tratamento artificial de CORS ou interceptação de credenciais.
