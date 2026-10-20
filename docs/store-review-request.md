# Solicitação técnica de revisão — Énóis Desktop

Rascunho preparado após o resultado real da revisão automática da revisão `1`.
Não foi publicado separadamente no fórum nem enviado como mensagem a revisores.
O upload e seus metadados já foram enviados à loja.

Painel do publicador: [releases de enois-desktop](https://snapcraft.io/enois-desktop/releases).
A [documentação de browser-support](https://snapcraft.io/docs/reference/interfaces/browser-support-interface/)
explica que `allow-sandbox: true` exige avaliação de publicadores confiáveis.
Se a Canonical solicitar uma justificativa, o texto abaixo está pronto para o
painel ou para a categoria de solicitações de interfaces privilegiadas do fórum.

## Title

enois-desktop: review request for browser-support with allow-sandbox enabled

## Body

Hello Snap Store reviewers,

Please review revision 1 of `enois-desktop` and advise on the publisher vetting
and snap declaration required to use `browser-support` with `allow-sandbox: true`.

- Publisher: `ldukie`.
- Version/architecture: `0.1.0`, `amd64`.
- Requested initial channel: `latest/edge`, grade `devel`.
- Confinement/base: `strict`, `core22`.
- Source: https://github.com/LeandroDukievicz/enois-desktop/tree/v0.1.0.
- Artifact SHA-256: `684c453c965b6e68e46452ce217b2a55e5314c4ace9b8f68ffaf0e28d669ec20`.

Énóis Desktop is an independent Electron client for https://enois.ia.br/feed.
It is not presented as an official application. It runs interactively as the
desktop user; it has no daemon, service or requirement to run as root.

The app loads the original platform in a separate WebContentsView. Remote content
has no preload or Node.js access. Both renderers use `sandbox: true`,
`contextIsolation: true` and `webSecurity: true`, with Node integration disabled.
`app.enableSandbox()` is enabled. Privileged IPC exists only in the local shell
and validates the WebContents identity, main frame, local origin and typed payload.
The remote main-frame navigation policy accepts only the exact platform origin.

The requested attribute supports keeping Chromium's internal sandbox active
while displaying remote content. No launcher disables that sandbox. We are not
requesting classic confinement, a daemon, or additional device access. A manual
interface connection is acceptable if required by the approved declaration.

The package requests network, desktop, desktop-legacy, x11, wayland, opengl,
audio-playback, home and browser-support, plus the builder's desktop runtime/theme
content interfaces. Home is used for user-selected uploads/downloads. Permission
requests are denied by default, with explicit origin checks for supported prompts.

Verification includes 35 unit/integration tests, 10 Electron E2E scenarios,
window-control checks in X11 and Wayland, and an installed strict Snap smoke test
covering startup, remote loading and clean shutdown. Evidence is published under
https://github.com/LeandroDukievicz/enois-desktop/tree/main/docs/verification.
Authenticated business flows and the full desktop-environment matrix remain
pending, so this submission targets edge only.

The automatic review reported:

> human review required due to 'deny-connection' constraint (interface attributes).

Could you assess this permission request and advise on the required vetting steps
while retaining Chromium's internal sandbox?

Thank you.
