# Release

Use SemVer e atualize package.json, lockfile e CHANGELOG.md. Uma branch pequena e
pull request com evidências são suficientes. Não há auto-updater próprio: snapd
administra atualizações dos pacotes da loja; o site mantém seu próprio deploy.

## Fluxo

1. Confirmar checkpoints e limitações em milestone.md/documentacao.md.
2. Para edge, passar CI, auditoria, E2E, build e teste instalado e registrar as
   limitações conhecidas. Login real, fluxos privados e a matriz completa de QA
   são necessários antes da promoção para candidate/stable.
3. Criar tag `vMAJOR.MINOR.PATCH` correspondente ao package.json.
4. O workflow de release valida código, builda em ambiente isolado e guarda Snap,
   checksum e metadados como artefatos do Actions. Não cria publicação na loja.
5. Revisar os artefatos e confirmar a autorização de publicação já dada na sessão.
   Se não existir autorização, solicitá-la antes do upload. Credenciais de upload
   devem ser escopadas, nunca versionadas.
6. Publicar primeiro em edge, promover para beta e candidate após testes; promover
   para stable somente após critérios de aceite, identidade e revisão da loja.

Quando a publicação estiver autorizada, os comandos são:

```bash
snapcraft login
snapcraft upload --release=edge dist/enois-desktop_0.1.0_amd64.snap
snapcraft revisions enois-desktop
snapcraft status enois-desktop
snapcraft release enois-desktop <revisao> beta
```

A revisão pode recusar ou encaminhar interfaces para análise manual. Não remover
isolamento para passar nessa etapa. Nome reservado não garante aprovação do pacote.

O estado real da primeira submissão, hash e resultado da loja ficam em
[publicação na Snap Store](store-publication.md). Envio para análise e liberação
em um canal são estados distintos; sempre confirmar a liberação com `snapcraft status`.

## Ações e manutenção

GitHub Actions usa SHAs fixos e permissions contents:read. Apenas upload-artifact
guarda resultados temporários; não há segredo Snap nem permissão de escrita de
release configurados. Dependabot propõe atualizações semanais de pacotes e Actions.
Correções de segurança devem incluir teste reproduzível e nova versão.

Build reproduzível significa ferramentas/entradas fixadas e passos repetíveis;
não há promessa de binário idêntico byte a byte, pois imagens de build e timestamps
podem variar. `build-info.json` registra commit, estado dirty, ferramentas e hashes.
