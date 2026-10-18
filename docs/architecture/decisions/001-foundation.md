# ADR 001 — Electron, build e módulos

Status: aceito. Data: 18/10/2026.

**Contexto e problema:** executar o serviço web original no Linux, acrescentando
integrações desktop sem recriar negócio, backend ou design.

**Alternativas:** PWA instalada pelo navegador; Tauri com WebKitGTK; Electron com
Chromium distribuído. Para build, considerar scripts próprios, Forge e electron-vite.

**Decisão:** Electron, TypeScript e electron-vite/Vite; React e Tailwind apenas no
shell local; pnpm com dependências exatas e lockfile. Usar módulos por responsabilidade
nos diretórios main, preload, renderer e shared, sem framework interno.

**Justificativa:** Electron é requisito e oferece Chromium consistente e APIs
Linux maduras. electron-vite resolve os três builds com uma configuração pequena.
Vitest testa regras puras e Playwright exercita o Electron real. Zod valida a
fronteira IPC; não se exige uma camada extra de repositories/adapters sem necessidade.

**Consequências:** pacote/memória maiores que PWA; Chromium e dependências exigem
atualizações regulares. Node do desenvolvimento é distinto do Node incluído no
Electron. Compatibilidade é verificada por peers, typecheck, testes e build reais.
TypeScript 5.9.3 foi escolhido porque o TS 7 disponível no registry não satisfaz
o intervalo suportado pelo typescript-eslint selecionado.
