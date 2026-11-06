# Pedido de revisão da interface — rascunho para o fórum

Este texto está preparado para a categoria [privileged-interfaces](https://forum.snapcraft.io/c/store-requests/privileged-interfaces/27); não foi enviado ao fórum. Confirme o estado das revisões no painel antes de publicar.

## Título

enois-desktop: request browser-support with allow-sandbox for a strict Electron client

## Mensagem

Hello Snap Store reviewers,

Please advise on the publisher vetting and snap declaration required for the `enois-desktop` snap to use `browser-support` with `allow-sandbox: true`.

```yaml
name: enois-desktop
description: Independent Electron desktop client for the Énóis web platform
snapcraft: https://github.com/LeandroDukievicz/enois-desktop/blob/v0.1.1/electron-builder.yml
upstream: https://github.com/LeandroDukievicz/enois-desktop
upstream-relation: Maintainer of the independent desktop client; no official affiliation with the web platform is claimed
plugs:
  browser-support:
    attributes:
      allow-sandbox: true
    request-type: manual-connection
    reasoning: Keep Chromium's internal sandbox enabled while rendering the remote platform under strict Snap confinement.
```

The client is an interactive Electron desktop application, not a daemon. It loads https://enois.ia.br/feed in a separate WebContentsView with sandbox and context isolation enabled, Node integration disabled, no remote preload, and navigation restricted to the platform origin. It does not use `--no-sandbox`.

Revision 1 (0.1.0) is `ManualReviewPending`. Revision 2 (0.1.1), uploaded on 6 November 2026 with an Electron security update, is `ReviewQueued` behind revision 1. Neither revision has been released. We would appreciate guidance on how to proceed with the interface declaration and review of the updated revision.

- Publisher: `ldukie`; initial channel requested: `latest/edge`.
- Version 0.1.1: `amd64`, `core22`, `strict`, grade `devel`.
- Packaged manifest and launchers were inspected; Chromium's sandbox remains enabled.
- Tests: 35 unit tests, 10 Electron E2E tests, dependency audit and an installed Snap smoke test with a disposable profile.
- Source: https://github.com/LeandroDukievicz/enois-desktop/tree/v0.1.1
- Package SHA-256: `11f03c0af09978698e61024975fa91333cab479b21b98db8503f974ea7459284`.

The client is an independent adaptation and credits the original Énóis project and community. Please let us know what further information or vetting is needed. Thank you.
