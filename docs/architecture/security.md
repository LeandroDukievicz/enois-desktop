# Ameaças, limites e mitigações

| Ameaça                                | Mitigação implementada                                             | Limite / validação                                     |
| ------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------ |
| Site ou HTML de usuário comprometido  | Remoto sem preload/Node; sandbox e context isolation               | Atualizar Electron; o cliente não audita o backend     |
| IPC enviado pelo remoto/subframe      | Identidade do WebContents, mainFrame, URL e schemas Zod            | Testes positivos e negativos na fronteira              |
| URL parecida com o domínio            | Parsing URL e origem exata                                         | Subdomínios não recebem confiança automática           |
| Execução de protocolo perigoso        | Bloquear file/data/javascript e credenciais em URLs                | HTTPS externo/e-mail abrem só pela política definida   |
| Redirect para outro domínio           | Bloqueio da navegação principal                                    | OAuth precisa de integração explícita validada         |
| Recurso externo legítimo quebrado     | Política de navegação separada de recursos                         | CDN/iframe continuam sob a segurança Chromium/site     |
| Leitura de arquivos locais pelo shell | Protocolo local limitado ao diretório buildado, CSP restritiva     | Não há API de filesystem no preload                    |
| Abuso de permissões                   | Negação padrão, origem e frame; consentimento para dados sensíveis | Captura de tela negada; Snap exige interfaces próprias |
| Download silencioso                   | Origem iniciadora autorizada, nome limitado, diálogo nativo        | Respeita permissões/confinamento do SO                 |
| Vazamento de sessão em logs           | Eventos/códigos limitados, sem URL/corpo/token/cookie              | Logs locais sem telemetria                             |
| Preferências corrompidas              | Schema, limites, recuperação, serialização/rename                  | Erros não devem impedir abrir o aplicativo             |
| Dependência vulnerável                | Versões exatas, lockfile, audit e Dependabot                       | Auditoria deve acompanhar novas versões                |

As permissões de notificação dependem de opt-in. Câmera/microfone, clipboard-read
e localização exigem confirmação por execução e origem confiável. Clipboard de
escrita sanitizada e fullscreen são permitidos à origem autorizada. Captura de
tela, HID, serial, USB e demais permissões não usadas são negadas.

Permitir uma API web não concede acesso fora do confinamento Snap. Os módulos que
exijam interfaces adicionais só serão considerados compatíveis após testes reais.

A CSP local bloqueia rede, frames, objetos e formulários; scripts e estilos vêm
do próprio build. Em desenvolvimento, o HTML permite o websocket local de HMR.
O protocolo de produção aplica headers mais restritivos. A CSP remota não é
reescrita, o TLS não é desativado e não se executa JavaScript remoto no main.

Controles de teste só funcionam sem empacotamento, com `ENOIS_E2E=1`, perfil
absoluto explícito e servidor HTTP em `127.0.0.1`. Um pacote de produção ignora
essas substituições. Não há acesso de teste pelo IPC do produto.

Referências: [segurança Electron](https://www.electronjs.org/docs/latest/tutorial/security),
[sandbox](https://www.electronjs.org/docs/latest/tutorial/sandbox),
[sessões](https://www.electronjs.org/docs/latest/api/session).
