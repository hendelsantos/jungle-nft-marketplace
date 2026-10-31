# Jungle Gaming — NFT Marketplace

SPA profissional para o desafio frontend da Jungle Gaming. A aplicação implementa descoberta, detalhe, favoritos, carrinho, autenticação, perfil, carteiras, checkout idempotente, pedidos e atualizações em tempo real usando somente backend simulado.

> Nenhuma carteira, blockchain, credencial ou transação real é utilizada.

## Stack e versões registradas

| Tecnologia | Versão |
|---|---:|
| React / React DOM | 19.3.0 |
| TypeScript | 6.0.3 |
| Vite | 8.3.2 |
| Vite React plugin | 6.1.2 |
| TanStack Router | 1.154.7 |
| TanStack Query | 5.105.0 |
| Axios | 1.15.2 |
| Tailwind CSS | 4.3.3 |
| MSW | 2.13.4 |
| Socket.IO Client | 4.8.4 |
| `@mswjs/socket.io-binding` | 0.2.0 |
| Playwright | 1.63.0 |
| Lighthouse | 13.0.1 |

MSW 2 foi mantido por compatibilidade explícita com o binding Socket.IO adotado. Componentes de interface vivem em `src/components/ui` no padrão shadcn/ui e usam CVA/ Tailwind; não há uma biblioteca de componentes opaca.

## Setup

Requisitos: Node.js 20.19+ e npm 10+.

```bash
cp .env.example .env.local
npm install
npx playwright install chromium
npm run dev
```

O `postinstall` gera `public/mockServiceWorker.js` a partir da versão instalada do MSW. Para regenerar manualmente: `npm run msw:init`.

Variáveis:

```dotenv
VITE_ENABLE_MOCKS=true
VITE_API_URL=/api
VITE_REALTIME_URL=ws://jungle.mock/realtime/
```

Para o build demonstrativo, mantenha `VITE_ENABLE_MOCKS=true`. Para integrar um backend real no futuro, desative os mocks e preserve os mesmos contratos.

## Credenciais fictícias

| Usuário | E-mail | Senha |
|---|---|---|
| Ana Explorer | `ana@jungle.demo` | `Jungle#2026` |
| Caio Collector | `caio@jungle.demo` | `Collector#2026` |

As senhas acima são dados públicos de demonstração. O banco mock persiste apenas hashes determinísticos, nunca o texto das senhas.

## Comandos

```bash
npm run dev                 # desenvolvimento com MSW
npm run typecheck           # TypeScript estrito
npm run lint                # ESLint
npm run test:unit           # cálculos e regras de domínio
npm run test:e2e            # 12 grupos do desafio, desktop + mobile
npm run test:visual         # comparação com baselines aprovadas
npm run test:visual:update  # atualizar baselines após revisão
npm run build               # build otimizado
npm run preview             # servir dist localmente
npm run audit               # Lighthouse 3x, mobile e desktop
```

Playwright produz relatório HTML e retém trace, screenshot e vídeo nas falhas. O Lighthouse audita Home e NFT Details três vezes por perfil, grava HTML/JSON em `lighthouse-reports/` e calcula medianas de Performance, Accessibility, Best Practices, SEO, LCP, CLS e TBT.

## Cenários MSW

Defina pelo console ou antes do carregamento:

```js
localStorage.setItem('jungle:scenario', 'slow')
location.reload()
```

| Cenário | Efeito |
|---|---|
| `default` | fluxo de sucesso determinístico |
| `slow` | latência observável e skeletons |
| `variable-latency` | latência determinística variável por URL |
| `out-of-order` | buscas contendo `slow` respondem depois das subsequentes |
| `network-error` | falha de conexão no catálogo |
| `server-error` | HTTP 500 recuperável |
| `session-expired` | sessão rejeitada com 401 |
| `favorite-failure` | mutation otimista reverte |
| `sold-out` | conflito de estoque na cotação |
| `order-timeout` | pedido criado antes do timeout e recuperável pela chave |
| `payment-declined` | pedido termina recusado e mantém carrinho |

Reset completo:

```js
localStorage.removeItem('jungle:mock-db:v1')
localStorage.removeItem('jungle:session-id')
location.reload()
```

Nos testes, o banco também pode ser resetado por `POST /api/__mock/reset`.

## Arquitetura e contratos

- [Arquitetura](ARCHITECTURE.md)
- [Requisitos e rastreabilidade](REQUIREMENTS.md)
- [Plano de implementação](IMPLEMENTATION_PLAN.md)
- [Tarefas e evidências](TASKS.md)
- [Contratos REST](docs/REST_API.md)
- [Eventos Socket.IO](docs/REALTIME.md)
- [Testes e cenários](docs/TESTING.md)
- [Auditoria Lighthouse](docs/LIGHTHOUSE.md)
- [Relatório final de cobertura](docs/COVERAGE.md)

TanStack Query usa chaves por identidade, parâmetros estáveis, cancelamento com `AbortSignal`, retries apenas para GETs transitórios e mutation otimista de favoritos com rollback. Logout limpa o cache e desmonta o socket. Valores ETH são strings e todos os cálculos passam por `decimal.js`.

## Deploy

O projeto gera uma SPA estática em `dist/`. `vercel.json` configura fallback de rotas diretas. O build demonstrativo não depende de serviço privado e mantém MSW e Socket.IO simulados ativos.

Deploy público: [jungle-nft-marketplace-production.up.railway.app](https://jungle-nft-marketplace-production.up.railway.app)

O Railway usa Railpack/Caddy para servir `dist/` com fallback de SPA. Em 2026-10-31, Home, `/cart`, `/nfts/nft_1`, `mockServiceWorker.js` e os assets WebP foram validados na URL pública; o Chromium confirmou a rota direta e o MSW ativo.

O código-fonte é versionado na branch `main`. As validações de `npm run build`, Playwright (12 grupos E2E) e Lighthouse (3 medições por página/perfil, medianas em `docs/LIGHTHOUSE.md`) foram concluídas.

## Limitações conhecidas desta sessão

- A visão geral pública do [Figma oficial](https://www.figma.com/design/Ff0SksUi7UFtPWUO8kyNtw/Frontend-Challenge?node-id=0-1) foi recuperada em 2026-10-31 e orientou a revisão marrom/laranja da Home e os retratos originais otimizados. O host/CloudFront ainda bloqueia a inspeção interativa de cada frame; portanto, medidas finas e baselines não são apresentados como pixel-perfect.
- Instalação de dependências concluída em 2026-10-30 com `npm install --legacy-peer-deps` (o npm 10.8 falha com `Cannot read properties of null (reading 'edgesOut')` nesta árvore de dependências). Typecheck estrito, lint com zero avisos, testes unitários, build Vite 8 e os 12 grupos E2E (26 testes em desktop e mobile) foram aprovados novamente em 2026-10-31; as três medições Lighthouse por página/perfil permanecem registradas em `docs/LIGHTHOUSE.md`.
- O diretório `.git/` fornecido pelo ambiente de automação estava vazio e somente leitura; os metadados Git foram mantidos em diretório isolado, com commit e push reais verificados na branch `main`.
- Baselines visuais e relatórios de auditoria só devem ser adicionados depois de execução real; arquivos falsos não foram criados.
