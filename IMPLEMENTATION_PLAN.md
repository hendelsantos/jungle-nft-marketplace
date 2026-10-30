# Plano de implementação — Jungle Gaming NFT Marketplace

## Estado da análise inicial

- O diretório de trabalho estava vazio em 2026-10-30 e não continha um repositório Git utilizável. O diretório `.git/` existe vazio e somente leitura nesta sessão; portanto, commits não podem ser criados aqui até o ambiente liberar metadados Git.
- O README oficial foi lido integralmente no repositório público `junglegaming/frontend-challenge`.
- O Figma oficial foi solicitado, mas o host de automação do navegador e o acesso de leitura do link não estão disponíveis nesta sessão. Nenhuma medida, cor, fonte ou asset foi inferido como se tivesse sido inspecionado. Até o acesso ser restabelecido, a implementação usa um sistema visual coeso e documenta o desvio.
- O repositório de destino informado é `https://github.com/hendelsantos/jungle-nft-marketplace.git`. Nenhum push ou deploy será realizado sem autorização explícita.

## Objetivo

Entregar as nove telas e os fluxos de descoberta, compra e conta com React, TypeScript, Vite, TanStack Router, TanStack Query, Axios, Tailwind CSS, componentes no padrão shadcn/ui, MSW, Socket.IO Client, Playwright e Lighthouse.

## Etapas e critérios de aceite

### 0. Descoberta e documentação

- [x] README oficial revisado.
- [x] Critérios eliminatórios e matriz de requisitos registrados.
- [ ] Figma inspecionado em desktop e mobile quando o acesso real estiver disponível.
- [x] Riscos de MSW/Socket.IO, persistência, idempotência, sessão e precisão monetária registrados.

Aceite: `REQUIREMENTS.md`, `ARCHITECTURE.md`, `IMPLEMENTATION_PLAN.md` e `TASKS.md` versionáveis.

### 1. Fundação

- Scaffold Vite + React + TypeScript estrito.
- TanStack Router com busca tipada e rotas privadas.
- Query Client com política explícita.
- Axios como transporte REST único.
- Tailwind e componentes locais estilo shadcn/ui.
- MSW inicializado antes da aplicação.
- Playwright, Vitest e Lighthouse configurados.

Aceite: typecheck, lint, testes unitários e build passam em checkout limpo com dependências instaladas.

### 2. Shell e catálogo

- Cabeçalho responsivo, navegação, feedback e rodapé.
- Home com hero, catálogo, busca, filtros combináveis, ordenação e paginação na URL.
- Skeleton, vazio, erro, retry e descarte de respostas obsoletas.

Aceite: refresh e histórico restauram a consulta; testes E2E do grupo 1 passam.

### 3. Detalhe, favoritos e carrinho

- Detalhe direto/404, edição, estoque, quantidade e atualização de preço.
- Favoritos otimistas com rollback.
- Carrinho visitante persistente, merge após login, cupom e totais decimais originados da API.

Aceite: grupos E2E 2, 4 e 5 passam.

### 4. Autenticação e conta

- Cadastro, login, logout, sessão expirada e retorno ao fluxo.
- Perfil, avatar, senha e carteiras com validação por rede.
- Isolamento de cache e subscriptions por usuário.

Aceite: grupos E2E 3 e 8 passam.

### 5. Checkout e pedidos

- Conexão de carteira simulada, rede, revisão e cotação.
- Reconfirmação após mudança, idempotência e recuperação de timeout.
- Estados pending/confirmed/declined e recibo imutável apenas para confirmed.

Aceite: grupos E2E 6 e 7 passam sem remover itens em falhas.

### 6. Realtime real via protocolo Socket.IO

- `socket.io-client` criado somente depois que o MSW estiver ativo.
- `nft.updated` e `order.updated` com `eventId`, `resourceId`, `version` e sessão.
- Dedupe, descarte de versões antigas, reconexão e sincronização REST.

Aceite: grupos E2E 9 e 10 observam eventos que atravessam o cliente Socket.IO.

### 7. Qualidade e entrega

- Acessibilidade, foco, reduced motion e ausência de overflow.
- Baselines visuais em 390, 768 e 1440 px.
- Três medições Lighthouse por página/perfil e relatório de medianas.
- README, contratos, cenários e relatório final de cobertura.

Aceite: grupos 11 e 12 passam; build e preview funcionam; auditorias e limitações têm evidência real.

## Ordem de verificação por incremento

1. `npm run typecheck`
2. `npm run lint`
3. `npm run test:unit`
4. teste Playwright do fluxo alterado
5. `npm run build`
6. atualizar `TASKS.md` com resultado verdadeiro

## Dependências externas e bloqueios atuais

- O ambiente não resolve `registry.npmjs.org` no shell. Os arquivos serão preparados, mas nenhum comando será marcado como aprovado se depender de uma instalação que não ocorreu.
- A inspeção visual do Figma e a captura de assets aguardam acesso de navegador. A aplicação continua funcional usando assets locais próprios; a fidelidade final precisa de uma rodada posterior de comparação real.
- Deploy permanece deliberadamente fora de escopo até autorização do proprietário.
