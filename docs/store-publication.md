# Publicação na Snap Store

## Primeira versão — 0.1.0

O usuário autorizou explicitamente o commit/push e a publicação em 20/10/2026.
O destino inicial é `latest/edge`: versão para testes, com autenticação real,
fluxos privados e a matriz completa de ambientes ainda pendentes. O aplicativo
é identificado como cliente independente, sem afiliação oficial confirmada.

| Campo                         | Valor                                                                      |
| ----------------------------- | -------------------------------------------------------------------------- |
| Nome reservado                | `enois-desktop`                                                            |
| Versão                        | `0.1.0`                                                                    |
| Arquitetura                   | `amd64`                                                                    |
| Commit do código empacotado   | `e8f0110556e53ee63c4cb16bff4a7d8a3bfd592f`                                 |
| Arquivo                       | `enois-desktop_0.1.0_amd64.snap`                                           |
| SHA-256                       | `684c453c965b6e68e46452ce217b2a55e5314c4ace9b8f68ffaf0e28d669ec20`         |
| Tamanho                       | 113.582.080 bytes                                                          |
| Base/confinamento             | `core22` / `strict`                                                        |
| Grade/canal solicitado        | `devel` / `latest/edge`                                                    |
| Validação instalada           | Revisão local `x8`; inicialização, site pronto e encerramento sem exceções |
| Estado da loja antes do envio | Nenhuma revisão enviada ou liberada                                        |
| Tag do código                 | `v0.1.0`                                                                   |
| Revisão na loja               | `1`, recebida em 20/10/2026 às 19:14:26 UTC                                |
| Metadados da loja             | Resumo, descrição e ícone enviados com sucesso                             |
| Estado desta etapa            | `need_manual_review`; liberação de `edge` pendente da Canonical            |

O código desse artefato passou em 35 testes Vitest, 10 E2E, verificações de
controles em X11 e Wayland e no CI. A loja recebeu o mesmo arquivo cujo checksum
foi conferido, sem reconstrução apenas por alterações de documentação.

- [CI do código](https://github.com/LeandroDukievicz/enois-desktop/actions/runs/39477191619)
- [Build isolado no GitHub](https://github.com/LeandroDukievicz/enois-desktop/actions/runs/39477248521)
- [Build validado pela tag v0.1.0](https://github.com/LeandroDukievicz/enois-desktop/actions/runs/39481721215)
- [Evidência da instalação](verification/branding-package-2026-10-20.json)
- [Smoke instalado e encerramento](verification/installed-branding-smoke-2026-10-20.json)

## Procedimento

```bash
snapcraft upload --release=latest/edge dist/enois-desktop_0.1.0_amd64.snap
snapcraft upload-metadata dist/enois-desktop_0.1.0_amd64.snap
snapcraft revisions enois-desktop
snapcraft status enois-desktop
```

A análise automática terminou exigindo revisão humana, com o motivo:

> human review required due to 'deny-connection' constraint (interface attributes).

O upload terminou com código de saída `1` por essa exigência, mas a revisão `1`
foi recebida e consta em `snapcraft revisions`. A consulta posterior de canais
continua informando ausência de revisões liberadas. Portanto, o pacote está
submetido e **ainda não está disponível para instalar pela loja**.

O motivo corresponde ao uso de `browser-support` com `allow-sandbox: true`.
Essa combinação exige avaliação do publicador pela Canonical, conforme a
[documentação oficial da interface](https://snapcraft.io/docs/reference/interfaces/browser-support-interface/).
O sandbox Chromium e o confinamento strict foram mantidos.

Foi preparado um [pedido técnico de revisão](store-review-request.md), ainda
não enviado separadamente a revisores ou ao fórum. A aprovação é uma decisão
externa da Canonical; não há aprovação automática simulada nem revisão pública
liberada nesta etapa. O resultado está em
[evidência da submissão](verification/store-publication-2026-10-20.json).

## Acompanhar e liberar após aprovação

1. Abrir o [painel de releases](https://snapcraft.io/enois-desktop/releases) e
   verificar a revisão `1`. O upload não confirmou entrada na fila humana: acionar
   `Request manual review` / `Ask for manual review` se disponível. Se já constar
   pedido pendente, acompanhar esse pedido sem duplicar.
2. Para a autorização de `browser-support`, encaminhar a justificativa na categoria
   [privileged-interfaces](https://forum.snapcraft.io/c/store-requests/privileged-interfaces/27),
   usando o pedido preparado no modelo oficial. Essa solicitação ainda não foi enviada.
3. Após aprovação, consultar `snapcraft status enois-desktop`. Caso `edge` ainda
   não esteja associado à revisão, executar `snapcraft release enois-desktop 1 latest/edge`.
4. Confirmar a disponibilidade com `snap info enois-desktop` antes de anunciar a
   instalação ou marcar o checkpoint de publicação como concluído.

Após a liberação, a instalação será feita com `sudo snap install enois-desktop --edge`.
Esse comando depende da disponibilidade confirmada na loja; a instalação local `x8`
não é uma revisão pública.
