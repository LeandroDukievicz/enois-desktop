# ADR 003 — Sessão administrada pelo site e perfil persistente

Status: aceito. Data: 18/10/2026.

**Contexto e problema:** manter a sessão após reabrir respeitando expiração e logout
do serviço, sem acessar senhas ou criar uma implementação própria de autenticação.

**Alternativas:** sessão em memória; cookies/localStorage em partição persistente;
copiar credenciais para arquivo próprio ou compartilhar perfil de outro navegador.

**Decisão:** `session.fromPartition('persist:enois')`, com perfil próprio do Electron.
O fluxo original de login/logout permanece no site. Há limpeza local mediante
confirmação e flush de dados no encerramento. Preferências locais ficam em JSON
separado, validado e com gravação serializada.

**Justificativa:** mantém a política real do serviço, reduz superfície de código
sensível e permite provar persistência com localStorage fictício em testes.

**Consequências:** não há cookies compartilhados com Chrome/Firefox. Persistência
não impede o backend de expirar/revogar uma sessão. O localStorage que a plataforma
usa não recebe promessa de criptografia adicional; proteção do perfil depende do
sistema e do confinamento. Um futuro cliente de API deverá avaliar keyring/safeStorage
sem fallback silencioso para segredo persistido sem proteção.
