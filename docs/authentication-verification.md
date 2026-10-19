# Verificação da autenticação original

Data: 19/10/2026. O site administra autenticação e credenciais. Esta verificação
avalia sua compatibilidade com o cliente, sem implementar outra autenticação.

## Evidências no serviço real

Inspeção com Electron real, sandbox ativo, perfil temporário vazio e sem conta.
Os botões originais foram acionados; nenhuma senha, código ou token foi enviado.
Somente a abertura do navegador externo foi substituída por um registro em memória,
para evitar iniciar sessões de provedores durante a inspeção automatizada.

| Verificação                              | Resultado observado                                                              |
| ---------------------------------------- | -------------------------------------------------------------------------------- |
| Abrir `/feed` sem sessão                 | O próprio site encaminhou para `/entrar`.                                        |
| Formulário                               | E-mail e senha obrigatórios, com autocomplete `email` e `current-password`.      |
| Google                                   | O site iniciou navegação para `https://accounts.google.com/o/oauth2/v2/auth`.    |
| Callback informado pelo site ao Google   | `https://enois.ia.br/api/auth/oauth/google/callback`.                            |
| LinkedIn                                 | O site iniciou navegação para `https://www.linkedin.com/oauth/v2/authorization`. |
| Callback informado pelo site ao LinkedIn | `https://enois.ia.br/auth/callback`.                                             |
| Política do wrapper                      | Encaminhou ambos ao navegador externo e manteve `/entrar` no aplicativo.         |
| Estado local após cada tentativa         | `ready`, sem erro; o shell continuou disponível.                                 |

Foram registrados apenas origens e caminhos públicos de navegação. Queries,
`state`, códigos OAuth, conteúdo de requisições, cookies e credenciais não foram
armazenados. Os callbacks acima foram observados nos links criados pelo próprio
site; não foram chamados diretamente ou usados como uma API do cliente.

## Conclusão técnica atual

O formulário original permanece no domínio e na sessão dedicada da plataforma.
Seu fluxo completo precisa de login manual com uma conta autorizada.

Google e LinkedIn já iniciam fluxos reais no site. A menção anterior a OAuth em
construção na documentação de integrações não comprova que esses botões estejam
indisponíveis. O retorno autenticado ao desktop ainda não foi comprovado: os
callbacks indicados pertencem ao site, e o navegador externo usa outro perfil.
Não há callback desktop, importação de cookies ou transferência de tokens no cliente.

A política do Google proíbe enviar a autorização OAuth para um navegador
incorporado controlado pelo aplicativo. Liberar todos os domínios ou forjar o
user agent não é uma correção. Caso o serviço não ofereça um retorno autorizado
ao desktop, será necessária cooperação da plataforma para esse fluxo.
Fonte: [política OAuth do Google](https://developers.google.com/identity/protocols/oauth2/policies).

## Validação manual necessária

O Snap foi iniciado na sessão gráfica do usuário para que o login seja feito
diretamente no site, sem compartilhar senha ou códigos com o agente.

- [ ] Entrar e alcançar o feed usando uma conta autorizada.
- [ ] Fechar normalmente, reabrir e verificar permanência da sessão.
- [ ] Sair pelo próprio site e confirmar retorno à entrada.
- [ ] Validar separadamente os métodos Google/LinkedIn, caso sejam usados.

Não marcar autenticação real como aprovada a partir dos testes de transporte e
persistência feitos com fixtures. A sessão GNOME/Wayland nativa registrou um
renderer interrompido (`killed`) na abertura inicial; seu comportamento também
precisa ser confirmado no teste manual. O teste anterior X11/Xvfb renderizou a
tela original de entrada.
