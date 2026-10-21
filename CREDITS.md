# Créditos e relação com o Énóis

O **Énóis Desktop é um projeto derivado da experiência web do Énóis, desenvolvido
de forma paralela e independente para Linux**. A adaptação apresenta a plataforma
original em Electron e acrescenta navegação e integração desktop.

## Plataforma e comunidade originais

Os créditos pela criação, evolução, interface, identidade visual e funcionalidades
da plataforma pertencem ao **projeto original Énóis, a seus criadores,
mantenedores, colaboradores e à comunidade que participa e compartilha conteúdo**.

- [Plataforma Énóis](https://enois.ia.br/).
- [Sobre o projeto original](https://enois.ia.br/sobre).
- [Diretrizes da comunidade](https://enois.ia.br/diretrizes).
- [Documentação pública de integração](https://enois.ia.br/developers).
- [Repositório original do frontend: Rede-ENois/enois-frontend](https://github.com/Rede-ENois/enois-frontend).
- [Organização responsável pelo repositório original: Rede ÉNóis](https://github.com/Rede-ENois).
- [Origem dos símbolos e ícones usados neste cliente](assets/icons/README.md).

O repositório original foi informado pelo usuário nos links da página da Snap
Store e conferido na API pública do GitHub em 20/10/2026. Seu proprietário é a
organização **Rede ÉNóis (`Rede-ENois`)**. O README do upstream identifica o projeto
como frontend do domínio `enois.ia.br`. Os créditos incluem essa organização e
seus colaboradores, preservando a autoria da plataforma e da comunidade originais.

## Adaptação desktop

[Leandro Dukievicz](https://github.com/LeandroDukievicz) mantém o código local do
[enois-desktop](https://github.com/LeandroDukievicz/enois-desktop): janela, processos
Electron, políticas de segurança, configurações, empacotamento Linux e documentação.

O termo “derivado” descreve esta adaptação da experiência web para desktop.
O serviço remoto entrega sua própria interface e gerencia suas funcionalidades.
Este repositório contém a implementação local do cliente, sem uma cópia do backend
ou do código-fonte da plataforma. A afiliação oficial não foi confirmada.

## Recursos e licenças

A licença [MIT](LICENSE) cobre o código próprio deste repositório. A marca Énóis,
os recursos visuais originais e os conteúdos da comunidade mantêm os direitos de
seus respectivos titulares. O uso desses recursos é documentado por origem e hash.
Os banners deste cliente reutilizam o símbolo original sem redesenho; a composição
gráfica, as legendas e os arquivos editáveis pertencem à documentação desktop.

O diagrama de arquitetura foi fornecido pelo mantenedor e preservado em
[docs/assets/architecture.svg](docs/assets/architecture.svg). Electron, Chromium,
React, Vite, Tailwind CSS e as demais dependências mantêm seus próprios avisos de
licença; os avisos exigidos pelo runtime acompanham o pacote em `licenses/`.
