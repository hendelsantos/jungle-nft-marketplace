# Jungle Gaming — NFT Marketplace

Marketplace de NFTs desenvolvido em React e TypeScript para o desafio frontend da Jungle Gaming. A aplicação cobre os fluxos de descoberta, compra e conta do colecionador com API, autenticação, pagamentos e atualizações em tempo real totalmente simulados.

[Acessar demonstração](https://jungle-nft-marketplace-production.up.railway.app) · [Consultar arquitetura](ARCHITECTURE.md) · [Ver evidências de testes](docs/COVERAGE.md)

> Projeto demonstrativo: nenhuma carteira, blockchain, credencial ou transação real é utilizada.

## Entrega

| Item | Link / status |
|---|---|
| Aplicação publicada | [Railway](https://jungle-nft-marketplace-production.up.railway.app) |
| Código-fonte | [GitHub](https://github.com/hendelsantos/jungle-nft-marketplace) |
| Branch de entrega | `main` |
| Build de produção | Aprovado |
| Testes E2E | 26 aprovados em desktop e mobile |
| Lighthouse | Acessibilidade, Best Practices e SEO: 100 |

## Funcionalidades

- Catálogo com busca, filtros combináveis, ordenação e paginação sincronizados com a URL.
- Detalhes do NFT, seleção de edição e quantidade, favoritos e tratamento de item inexistente.
- Carrinho persistente com alteração de quantidades, remoção, cupom, taxas e merge após login.
- Cadastro, login, recuperação de sessão, expiração, logout e proteção de rotas privadas.
- Checkout com cotação revalidada, carteira e rede, idempotência e prevenção de pedido duplicado.
- Confirmação, recusa e recuperação de pedidos após timeout ou reconexão.
- Perfil, avatar, alteração de senha e gerenciamento de carteiras.
- Atualizações de preço, estoque e pedido por Socket.IO, incluindo descarte de eventos duplicados ou antigos.
- Estados de carregamento, vazio, erro e recuperação, com skeletons e feedback acessível.
- Layout responsivo e navegação por teclado validados em desktop e mobile.

## Credenciais de demonstração

| Usuário | E-mail | Senha |
|---|---|---|
| Ana Explorer | `ana@jungle.demo` | `Jungle#2026` |
| Caio Collector | `caio@jungle.demo` | `Collector#2026` |

As credenciais são fictícias e públicas. O banco simulado persiste apenas hashes determinísticos, nunca o texto das senhas.

## Executando localmente

Requisitos: Node.js 20.19 ou superior e npm 10 ou superior.

```bash
git clone https://github.com/hendelsantos/jungle-nft-marketplace.git
cd jungle-nft-marketplace
cp .env.example .env.local
npm install --legacy-peer-deps
npx playwright install chromium
npm run dev
```

A aplicação estará disponível no endereço exibido pelo Vite, normalmente `http://localhost:5173`.

O `postinstall` gera `public/mockServiceWorker.js` usando a versão instalada do MSW. Para regenerá-lo manualmente, execute `npm run msw:init`.

### Variáveis de ambiente

```dotenv
VITE_ENABLE_MOCKS=true
VITE_API_URL=/api
VITE_REALTIME_URL=ws://jungle.mock/realtime/
```

Mantenha `VITE_ENABLE_MOCKS=true` no build demonstrativo. Uma integração futura com backend real pode desativar os mocks e preservar os mesmos contratos tipados.

## Comandos

```bash
npm run dev                 # desenvolvimento com MSW
npm run typecheck           # verificação TypeScript estrita
npm run lint                # ESLint sem avisos
npm run test:unit           # regras de domínio
npm run test:e2e            # fluxos E2E em desktop e mobile
npm run test:visual         # regressão visual com baselines aprovadas
npm run test:visual:update  # atualização intencional das baselines
npm run build               # build otimizado de produção
npm run preview             # servidor local do diretório dist
npm run audit               # Lighthouse, três execuções por página e perfil
```

O Playwright gera relatório HTML e retém trace, screenshot e vídeo quando um teste falha. A auditoria Lighthouse grava os relatórios HTML/JSON em `lighthouse-reports/`, diretório deliberadamente fora do controle de versão.

## Evidências de qualidade

| Verificação | Resultado |
|---|---:|
| TypeScript estrito | aprovado |
| ESLint | aprovado, zero avisos |
| Testes unitários | 12/12 |
| Playwright E2E | 26/26 |
| Build Vite | aprovado |
| Lighthouse Home mobile | Performance 91; demais categorias 100 |
| Lighthouse Home desktop | todas as categorias 100 |
| Lighthouse detalhe mobile | Performance 89; demais categorias 100 |
| Lighthouse detalhe desktop | todas as categorias 100 |

As auditorias completas, métricas LCP, CLS e TBT e a justificativa do resultado mobile estão documentadas em [docs/LIGHTHOUSE.md](docs/LIGHTHOUSE.md). A matriz de cenários cobertos está em [docs/COVERAGE.md](docs/COVERAGE.md).

## Cenários simulados

O cenário pode ser selecionado pelo console do navegador antes de recarregar a aplicação:

```js
localStorage.setItem('jungle:scenario', 'slow')
location.reload()
```

| Cenário | Comportamento |
|---|---|
| `default` | fluxo de sucesso determinístico |
| `slow` | latência observável e skeletons |
| `variable-latency` | latência determinística variável por URL |
| `out-of-order` | respostas de busca fora de ordem |
| `network-error` | falha de conexão no catálogo |
| `server-error` | erro HTTP 500 recuperável |
| `session-expired` | sessão rejeitada com HTTP 401 |
| `favorite-failure` | rollback da atualização otimista |
| `sold-out` | conflito de estoque durante a cotação |
| `order-timeout` | pedido criado e recuperado pela chave de idempotência |
| `payment-declined` | pedido recusado sem limpar o carrinho |

Reset completo dos dados locais:

```js
localStorage.removeItem('jungle:mock-db:v1')
localStorage.removeItem('jungle:session-id')
localStorage.removeItem('jungle:scenario')
location.reload()
```

Nos testes, o estado também pode ser restaurado por `POST /api/__mock/reset`.

## Arquitetura

```text
Interface React
  ├─ TanStack Router ── rotas, busca e proteção de acesso
  ├─ TanStack Query  ── cache, mutations, retries e rollback
  ├─ Axios           ── cliente REST e contratos tipados
  └─ Socket.IO       ── preço, estoque e estado do pedido
            │
            ▼
MSW: API REST + WebSocket simulados e estado determinístico
```

TanStack Query usa chaves por usuário e parâmetros estáveis, cancelamento com `AbortSignal`, retries somente para consultas transitórias e atualização otimista de favoritos com rollback. O logout limpa dados privados do cache e encerra o socket. Valores em ETH trafegam como strings e os cálculos usam `decimal.js`.

Documentação técnica:

- [Arquitetura e decisões](ARCHITECTURE.md)
- [Requisitos e rastreabilidade](REQUIREMENTS.md)
- [Contratos REST](docs/REST_API.md)
- [Eventos Socket.IO](docs/REALTIME.md)
- [Testes e cenários](docs/TESTING.md)
- [Auditoria Lighthouse](docs/LIGHTHOUSE.md)
- [Cobertura funcional](docs/COVERAGE.md)

## Stack

| Tecnologia | Versão |
|---|---:|
| React / React DOM | 19.3.0 |
| TypeScript | 6.0.3 |
| Vite | 8.3.2 |
| TanStack Router | 1.154.7 |
| TanStack Query | 5.105.0 |
| Axios | 1.15.2 |
| Tailwind CSS | 4.3.3 |
| MSW | 2.13.4 |
| Socket.IO Client | 4.8.4 |
| `@mswjs/socket.io-binding` | 0.2.0 |
| Playwright | 1.63.0 |
| Lighthouse | 13.0.1 |

Os componentes de interface ficam em `src/components/ui`, seguindo o padrão shadcn/ui com CVA e Tailwind. O MSW 2 foi mantido por compatibilidade com o binding Socket.IO adotado.

## Deploy

O Vite gera uma SPA estática em `dist/`. No Railway, Railpack e Caddy servem os arquivos com fallback para `index.html`, permitindo acesso direto e refresh em qualquer rota. MSW e Socket.IO simulados permanecem ativos no build publicado, sem dependência de serviços privados.

Foram verificados na URL pública a Home, o carrinho, o detalhe de NFT, o service worker e os assets WebP, incluindo acesso direto às rotas.

## Limitações conhecidas

- A direção visual da Home foi alinhada à visão geral pública do [Figma oficial](https://www.figma.com/design/Ff0SksUi7UFtPWUO8kyNtw/Frontend-Challenge?node-id=0-1). Como a inspeção interativa frame a frame foi bloqueada pelo host do Figma, o projeto não declara fidelidade pixel-perfect nem inclui baselines visuais não verificadas.
- O resultado Lighthouse do detalhe em perfil mobile ficou em 89 de Performance. O custo principal é a inicialização do service worker demonstrativo e a primeira consulta simulada; Acessibilidade, Best Practices e SEO atingiram 100.
- A instalação usa `--legacy-peer-deps` para contornar uma falha de resolução observada no npm 10 com a árvore de dependências adotada.
