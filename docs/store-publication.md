# Publicação na Snap Store

## Primeira versão — 0.1.0

O usuário autorizou explicitamente o commit/push e a publicação em 20/10/2026.
O destino inicial é `latest/edge`: versão para testes, com autenticação real,
fluxos privados e a matriz completa de ambientes ainda pendentes. O aplicativo
é identificado como cliente independente, sem afiliação oficial confirmada.

| Campo                         | Valor                                                                         |
| ----------------------------- | ----------------------------------------------------------------------------- |
| Nome reservado                | `enois-desktop`                                                               |
| Versão                        | `0.1.0`                                                                       |
| Arquitetura                   | `amd64`                                                                       |
| Commit do código empacotado   | `e8f0110556e53ee63c4cb16bff4a7d8a3bfd592f`                                    |
| Arquivo                       | `enois-desktop_0.1.0_amd64.snap`                                              |
| SHA-256                       | `684c453c965b6e68e46452ce217b2a55e5314c4ace9b8f68ffaf0e28d669ec20`            |
| Tamanho                       | 113.582.080 bytes                                                             |
| Base/confinamento             | `core22` / `strict`                                                           |
| Grade/canal solicitado        | `devel` / `latest/edge`                                                       |
| Validação instalada           | Revisão local `x8`; inicialização, site pronto e encerramento sem exceções    |
| Estado da loja antes do envio | Nenhuma revisão enviada ou liberada                                           |
| Tag do código                 | `v0.1.0`                                                                      |
| Revisão na loja               | `1`, recebida em 20/10/2026 às 19:14:26 UTC                                   |
| Metadados da loja             | Resumo, descrição e ícone enviados com sucesso                                |
| Estado desta etapa            | Recebido pela loja; em processamento; nenhum canal liberado até esta consulta |

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

A revisão da loja pode exigir análise de `browser-support` com `allow-sandbox: true`.
O sandbox Chromium e o confinamento strict serão mantidos. Não declarar a versão
publicada antes de a revisão ser efetivamente associada ao canal pela loja.

Após a liberação, a instalação será feita com `sudo snap install enois-desktop --edge`.
Esse comando depende da disponibilidade confirmada na loja; a instalação local `x8`
não é uma revisão pública.
