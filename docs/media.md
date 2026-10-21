# Capturas e materiais de divulgação

Os materiais identificam o Énóis Desktop como projeto derivado, paralelo e
independente. Os [créditos](../CREDITS.md) reconhecem a plataforma e a comunidade
originais. As capturas mostram o programa em execução, sem uma conta conectada.

## Capturas reproduzíveis

```bash
xvfb-run -a -s '-screen 0 1920x1080x24' pnpm preview:capture
```

O script compila o aplicativo e inicia Electron com sandbox, perfil descartável
e a URL pública da plataforma. Aguarda a tela original de entrada e as fontes
antes da captura. A captura nativa X11 inclui a barra local e a WebContentsView.
O perfil habitual, a sessão autenticada e as janelas do usuário não são utilizados.

| Arquivo                                              | Conteúdo                                                          |
| ---------------------------------------------------- | ----------------------------------------------------------------- |
| [desktop.png](preview/desktop.png)                   | Janela inteira, navegação, controles e entrada original.          |
| [platform.png](preview/platform.png)                 | View da plataforma original, sem a barra local.                   |
| [settings.png](preview/settings.png)                 | Preferências realmente implementadas no cliente.                  |
| [connection-error.png](preview/connection-error.png) | Tela de erro após emulação de perda de rede no perfil temporário. |
| [capture-info.json](preview/capture-info.json)       | Data, ambiente, dimensões e resultado da reconexão.               |

As capturas da janela usam `1600 × 900` (16:9). A falha é provocada somente no
renderer remoto do perfil de captura por CDP, ignorando temporariamente o service
worker para evitar navegação em cache. A condição é removida em seguida, e o script
confirma o retorno a `ready`.
Também verifica encerramento da janela e ausência de exceções nos logs locais.
As medições em [measurements.json](preview/measurements.json) descrevem esse ambiente;
não são uma promessa de desempenho para qualquer máquina ou conexão.

[snap-installed.png](preview/snap-installed.png) é uma evidência anterior de
instalação local e conserva a data/contexto daquela verificação. Sua existência
não significa que a Snap Store tenha liberado um canal.

## Banners e formatos

```bash
pnpm preview:banners
```

Requer Inkscape no ambiente de criação; não adiciona dependência ao aplicativo.
O script usa a mesma composição em SVG, incorpora o símbolo original sem alteração
e exporta PNGs com fundo sólido. Não há imagens geradas de interfaces fictícias.

| Material                        | Arquivo                                                                                | Dimensões  |
| ------------------------------- | -------------------------------------------------------------------------------------- | ---------- |
| Cabeçalho do README             | [SVG](assets/banner.svg), [PNG](assets/banner.png)                                     | 1800 × 600 |
| Compartilhamento do repositório | [SVG](assets/social-preview.svg), [PNG](assets/social-preview.png)                     | 1280 × 640 |
| Featured banner da Snap Store   | [SVG](../assets/store/featured-banner.svg), [PNG](../assets/store/featured-banner.png) | 1800 × 600 |

A prévia social segue a
[recomendação do GitHub](https://docs.github.com/pt/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview)
de 1280 × 640 e menos de 1 MB. O banner da loja usa proporção 3:1 e menos de 2 MB,
conforme a
[validação atual do painel da Snap Store](https://github.com/canonical/snapcraft.io/blob/main/static/js/publisher/pages/Listing/ListingDetails/ListingDetails.tsx).
Esses arquivos versionados estão prontos para os respectivos campos; a configuração
de uma prévia social no painel é distinta de exibi-la no README.

## Identidade e estado de publicação

Os ícones originais e suas fontes estão documentados em
[assets/icons/README.md](../assets/icons/README.md). Os badges do README apontam
para CI, licença e estado da publicação; não anunciam instalação na loja enquanto
nenhum canal estiver liberado. O estado e os envios efetivos de material à loja
ficam em [store-publication.md](store-publication.md).
