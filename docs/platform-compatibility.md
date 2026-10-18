# Inventário e compatibilidade

A disponibilidade documental/publicamente observada não significa teste funcional
com uma conta. O cliente mantém o frontend original sem seleções ou versões locais
de seus módulos. As rotas, estética e regras de negócio continuam evoluindo no site.

| Área da plataforma             | Evidência pública                           | Validação necessária no desktop                             |
| ------------------------------ | ------------------------------------------- | ----------------------------------------------------------- |
| Feed, posts e comentários      | API e rotas oficiais; post público HTTP 200 | Feed autenticado, edição, reações, salvos e menções         |
| Autenticação e conta           | Login, 2FA, logout e conta documentados     | Conta real, expiração/renovação, verificação e recuperação  |
| Busca, perfis e ranking        | Documentados                                | Navegação, perfil HTML e paginação                          |
| Comunidades                    | Listagem HTTP 200                           | Entrar, sair, publicar e administrar                        |
| Vagas e eventos                | Listas públicas documentadas                | Candidatura, presença e links externos                      |
| Mentoria e rede                | APIs documentadas                           | Agenda, conexões e bloqueios                                |
| Mensagens e notificações       | Sessão exigida                              | Conversas, contadores e compatibilidade de Web Push         |
| Mídia                          | Upload assinado documentado                 | Imagem, vídeo, seleção de arquivo e limites Snap            |
| Suporte, denúncias e recursos  | Documentados                                | Conta, envio, estado e moderação conforme permissão         |
| Temas e blogs                  | Rotas existentes                            | Aparência mantida pelo site; HTML continua isolado          |
| Faísca, marketplace e serviços | APIs documentadas                           | Fluxos privados com ações humanas, sem automação financeira |
| Jogos                          | Iframe e compartilhamento documentados      | Isolamento, fullscreen, mídia e confirmação de publicação   |

## Pontos que não podem ser presumidos

- OAuth de terceiros estava em construção na documentação consultada. Não se
  autoriza Google/LinkedIn ou qualquer domínio externo sem inspecionar o fluxo.
- O site pode recusar autenticação em navegador incorporado por políticas de seus
  provedores. Abrir o navegador externo não transfere automaticamente a sessão.
- Web Push depende do runtime/provedor; permitir notificações não implementa um
  serviço de push nem comprova entrega em segundo plano.
- Câmera, microfone e captura de tela não recebem interfaces Snap antecipadamente.
- Nenhum fluxo privado ou transação foi executado nesta etapa sem conta autorizada.
- O ícone é próprio e provisório. Reserva de nome não concede direitos sobre a marca.

Fonte: [documentação oficial](https://enois.ia.br/developers),
[termos](https://enois.ia.br/termos), [privacidade](https://enois.ia.br/privacidade).
