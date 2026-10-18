# Contribuir

Use Node 24, pnpm e `pnpm install --frozen-lockfile`. Trabalhe em branch curta a
partir de `main` e abra pull request com problema resolvido, mudança observável e
validação. Prefira commits `feat:`, `fix:`, `docs:`, `test:` ou `chore:`.

Execute `pnpm check`, `pnpm build` e os E2E afetados antes de enviar. Não inclua
credenciais, perfis de navegador, downloads, logs de produção ou dados de contas.
Não automatize login real no CI.

Preserve a UX/UI remota. Mudanças que leiam credenciais, aumentem permissões ou
integrem novos domínios exigem justificativa, testes de fronteira e atualização
do ADR de segurança. Não acrescente endpoints privados nem telemetria implícita.

Atualizações de dependências devem passar pelos mesmos checks. Ações e pacotes
possuem versões fixadas; Dependabot propõe atualizações revisáveis. Use SemVer
e registre mudanças visíveis em CHANGELOG.md.
