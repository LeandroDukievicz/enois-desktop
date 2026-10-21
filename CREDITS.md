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
- [Origem dos símbolos e ícones usados neste cliente](assets/icons/README.md).

A página pública consultada não identifica nominalmente o responsável nem
vincula um repositório de código-fonte. O link e a identificação foram solicitados
ao mantenedor deste cliente para acrescentar o crédito nominal com precisão.

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
