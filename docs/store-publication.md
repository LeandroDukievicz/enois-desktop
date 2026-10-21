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
| Estado confirmado da revisão  | `ManualReviewPending`; liberação de `edge` pendente da Canonical           |

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

### Confirmação autenticada do estado

Em 20/10/2026 às 21:22 de Brasília (21/10 às 00:22 UTC), duas consultas
autenticadas pelo SDK oficial do Snapcraft retornaram HTTP `200`:

- `/dev/api/account`: registro do nome `Approved`; revisão `1` com estado
  `ManualReviewPending`.
- `/api/v2/snaps/enois-desktop/releases`: revisão `1` com estado
  `ManualReviewPending`; nenhuma revisão liberada em canais.

Assim, a loja **já registra revisão manual pendente**. Essa confirmação posterior
substitui a incerteza documentada logo após o upload; não foi necessário enviar
outro pacote ou uma solicitação duplicada. O estado não comprova que um revisor
iniciou a análise, não garante prazo e não representa autorização da interface.
Os campos públicos selecionados estão na
[evidência da consulta autenticada](verification/store-review-status-2026-10-20.json).
Credenciais foram usadas internamente pelo SDK, sem exportação ou registro.

A tentativa de abrir o formulário da revisão usando a autenticação do SDK
retornou HTTP `302` para `/openid/login/`. O painel web exige sua própria sessão;
essa autenticação também não fornece uma sessão do fórum. O pedido complementar
da interface continua preparado e **não foi publicado** em `privileged-interfaces`.

## Acompanhar e liberar após aprovação

1. Acompanhar a revisão `1` no
   [painel de releases](https://snapcraft.io/enois-desktop/releases) ou pela API
   autenticada. O estado `ManualReviewPending` já foi confirmado. Solicitar nova
   revisão apenas se houver mudança de estado que exija essa ação.
2. Para a autorização de `browser-support`, encaminhar a justificativa na categoria
   [privileged-interfaces](https://forum.snapcraft.io/c/store-requests/privileged-interfaces/27),
   usando o pedido preparado no modelo oficial e uma sessão autenticada no fórum.
   Essa solicitação ainda não foi enviada; o SDK do Snapcraft não autentica no fórum.
3. Após aprovação, consultar `snapcraft status enois-desktop`. Caso `edge` ainda
   não esteja associado à revisão, executar `snapcraft release enois-desktop 1 latest/edge`.
4. Confirmar a disponibilidade com `snap info enois-desktop` antes de anunciar a
   instalação ou marcar o checkpoint de publicação como concluído.

Após a liberação, a instalação será feita com `sudo snap install enois-desktop --edge`.
Esse comando depende da disponibilidade confirmada na loja; a instalação local `x8`
não é uma revisão pública.

## Créditos e material da página da loja

Em 20/10/2026 às 21:33 de Brasília, a descrição da página foi atualizada para
identificar o cliente como projeto derivado da experiência web, paralelo e
independente, com créditos à plataforma, aos criadores e à comunidade Énóis.
O repositório original foi confirmado posteriormente pelo link informado no
cadastro web: [Rede-ENois/enois-frontend](https://github.com/Rede-ENois/enois-frontend),
cuja proprietária é a organização [Rede ÉNóis](https://github.com/Rede-ENois).

Foram enviados e confirmados por consulta autenticada:

- Featured banner: `1800 × 600`, proporção 3:1.
- Três screenshots reais de `1600 × 900`: entrada, preferências e tela de erro.
- Ícone original preservado, com o mesmo SHA-256 registrado na primeira submissão.

O primeiro envio das imagens por `POST` retornou HTTP `409`, `Conflict on screenshots`.
Foi utilizado o `PUT` documentado pela API do publicador, com a lista completa dos
materiais existentes e as adições solicitadas. O retorno foi HTTP `200`. Nova
consulta confirmou todos os hashes, a descrição e a preservação do ícone.
As credenciais foram usadas internamente pelo SDK oficial, sem exportação.

A [evidência do envio](verification/store-media-2026-10-20.json) registra os campos
selecionados da resposta. Os materiais e os créditos estão no commit
[`10b972d`](https://github.com/LeandroDukievicz/enois-desktop/commit/10b972d3524522557f090cb631644f28f788cbde),
cujo [CI passou](https://github.com/LeandroDukievicz/enois-desktop/actions/runs/39521872433).
O procedimento de criação está em [media.md](media.md).

Esta operação atualiza a página da loja. Não enviou outro pacote nem liberou
um canal: a única revisão segue `1`, `ManualReviewPending`, e não há canais
liberados. O manifesto histórico da revisão `1` permanece preservado como evidência;
a descrição nova em `electron-builder.yml` também acompanhará um próximo build.

## Conferência após edição pelo navegador

O usuário informou que adicionou dados pela página web e que não via os prints.
As consultas autenticadas de 20/10/2026 às 21:37 de Brasília confirmaram o link
do repositório original e o endereço de apoio em `links`, mantendo a descrição.
Porém, o cadastro de mídia voltou a conter somente o ícone; o banner e os três
screenshots do envio anterior estavam ausentes. A resposta tinha política de
cache `no-store` e data atual. O desaparecimento foi observado, sem atribuir uma
causa que a API não comprova.

As imagens foram restauradas pelo endpoint de mídia, preservando o ícone e os
links informados pelo usuário. O envio retornou HTTP `200` e nova consulta
confirmou os cinco registros: um ícone, um banner e três screenshots.
Consultas às 21:41 e 21:42 de Brasília confirmaram a permanência dos cinco registros.
Os cinco arquivos também foram baixados sem autenticação, com HTTP `200` e
SHA-256 idêntico aos hashes do cadastro. Uma tentativa de baixar `desktop.png`
com limite de 12 segundos expirou com conteúdo parcial; uma nova tentativa com
limite maior baixou os 331.871 bytes e validou o hash completo. Esses resultados
estão na [evidência de restauração](verification/store-media-restoration-2026-10-20.json)
e na [consulta posterior](verification/store-media-after-restoration-2026-10-20.json).
A [consulta anterior à restauração](verification/store-browser-check-2026-10-20.json)
preserva a evidência da ausência das imagens.

Para conferir uma página que já estava aberta durante os envios, recarregar o
[painel da loja](https://snapcraft.io/enois-desktop/listing) com `Ctrl+Shift+R`.
O envio de material à página não altera o estado do pacote: a revisão `1` continua
`ManualReviewPending`, sem canal liberado ou prazo de conclusão informado.
