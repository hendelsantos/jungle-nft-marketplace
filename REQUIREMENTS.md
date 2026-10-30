# Requisitos e matriz de rastreabilidade

Fonte de verdade: README público do desafio Jungle Gaming, revisado em 2026-10-30. A coluna de evidência será atualizada apenas após execução.

| ID | Requisito | Implementação planejada | Teste/evidência | Estado |
|---|---|---|---|---|
| R01 | Stack obrigatória efetiva | `package.json`, providers, router, Axios, MSW, realtime, Tailwind, UI local | typecheck, build, inspeção de imports | Em andamento |
| R02 | Home com descoberta completa | rota `/`, feature `catalog`, search params tipados | E2E grupo 1 + visual Home | Implementado; execução pendente |
| R03 | Detalhes do NFT | rota `/nfts/$nftId`, edição/estoque/quantidade | E2E grupo 2 + visual detalhe | Implementado; execução pendente |
| R04 | Favoritos persistentes | API por usuário + mutation otimista/rollback | E2E grupo 4 | Implementado; execução pendente |
| R05 | Carrinho persistente e merge | carrinho visitante + servidor autenticado | E2E grupo 5 + visual carrinho | Implementado; execução pendente |
| R06 | ETH preciso | strings nos contratos; `decimal.js` no domínio e mocks | testes unitários de valores | Módulo executado; Vitest pendente |
| R07 | Checkout revalidado | quote versionada, reconfirmação e carteira simulada | E2E grupos 6, 7 e 9 | Implementado; execução pendente |
| R08 | Idempotência de pedidos | `Idempotency-Key`, hash lógico de payload e replay | E2E grupo 7 + testes de handler | Implementado; execução pendente |
| R09 | Recibo imutável | snapshot armazenado em `Order`, só para confirmed | E2E grupo 6 | Implementado; execução pendente |
| R10 | Autenticação e sessão | endpoints `/auth/*`, token fictício, expiração | E2E grupo 3 | Implementado; execução pendente |
| R11 | Perfil e senha | `/profile`, `/profile/password`; hash de senha no mock | E2E grupo 8 | Implementado; execução pendente |
| R12 | Carteiras por rede | CRUD, primária/secundária e validação | E2E grupo 8 | Implementado; execução pendente |
| R13 | REST tipada por Axios | `src/api/contracts`, `src/api/client` | testes de integração dos handlers | Implementado; execução pendente |
| R14 | MSW coerente e resetável | banco serializável + cenários determinísticos | E2E fixture chama reset | Implementado; execução pendente |
| R15 | Falhas e condições de rede | cenário por header/localStorage, `delay`, `HttpResponse.error` | E2E grupos 4, 7 e 12 | Implementado; execução pendente |
| R16 | `nft.updated` por Socket.IO | MSW WebSocket + binding Socket.IO | E2E grupo 9 | Implementado; execução pendente |
| R17 | `order.updated` por Socket.IO | evento versionado, REST fallback | E2E grupos 6, 7 e 10 | Implementado; execução pendente |
| R18 | Dedupe e descarte de antigo | registro de `eventId` e versão por recurso | unitário + E2E grupo 10 | Implementado; execução pendente |
| R19 | Isolamento entre usuários | banco indexado por userId, query keys com identity | E2E grupo 3 | Implementado; execução pendente |
| R20 | Rotas privadas e cache limpo | gate de sessão, redirect, `queryClient.clear` e disconnect | E2E grupo 3 | Implementado; execução pendente |
| R21 | Responsividade | layouts em 390, 768 e 1440 px | projetos Playwright + snapshots | Implementado; QA visual pendente |
| R22 | Acessibilidade | semântica, labels, live regions, foco e contraste | E2E grupo 11 + Lighthouse | Implementado; auditoria pendente |
| R23 | Skeleton estável e reduced motion | componente shimmer com dimensões fixas | E2E grupo 12 | Implementado; execução pendente |
| R24 | Regressão visual | Home, detalhe, carrinho e checkout | snapshots versionados | Testes escritos; baselines bloqueadas |
| R25 | Performance | budgets, lazy routes/assets e Lighthouse CI | 3 execuções/página/perfil | Runner criado; medições bloqueadas |
| R26 | Deploy público | SPA fallback + mocks em demo | validação pública após autorização | Bloqueado por autorização |

## Critérios eliminatórios

| Critério | Controle obrigatório |
|---|---|
| Stack ausente ou decorativa | cada tecnologia tem um caminho de produção e teste identificável |
| Fluxos apenas visuais | toda ação relevante atravessa Axios/MSW ou Socket.IO Client |
| Compra falsa | UI só navega ao recibo após estado `confirmed` vindo da API/evento |
| Vazamento entre usuários | recursos privados e query keys incluem identidade; logout limpa cache/socket |
| Realtime direto na UI | nenhum timer ou setter de React emite mudanças de negócio; eventos passam pelo protocolo Socket.IO |
| E2E não executável | Playwright inicia cenário isolado e observa UI/rede real simulada |

## Telas e estados

| Tela | Loading | Empty/404 | Error | Success/Realtime |
|---|---|---|---|---|
| Home | cards skeleton | zero resultados | retry | lista, filtros, paginação, badge de mudança |
| NFT Details | galeria/sumário skeleton | 404 | retry | edição, quantidade, favorite/cart, preço ao vivo |
| Cart | resumo skeleton | carrinho vazio | quote/cart error | quantidade, cupom, disponibilidade alterada |
| Checkout | quote/wallet skeleton | cart vazio | stale/declined/timeout | review, pending, confirmed |
| Order | receipt skeleton | não encontrado/não confirmado | retry | snapshot confirmed |
| Login | sessão/form busy | — | credencial/sessão | redirect preservado |
| Register | form busy | — | validation/conflict | sessão + redirect |
| Profile | profile skeleton | — | validation/session | dados/avatar/senha |
| Wallets | wallets skeleton | sem carteira | validation/session | CRUD e conexão simulada |

## Cenários determinísticos

- `default`: sucesso com dois usuários, catálogo diverso e pedidos conhecidos.
- `slow`: latência suficiente para observar skeletons.
- `variable-latency`: atrasos determinísticos distintos por URL.
- `out-of-order`: consulta com `q=slow` termina depois de consultas subsequentes.
- `network-error`: erro de conexão recuperável.
- `server-error`: HTTP 500.
- `session-expired`: HTTP 401 depois de sessão conhecida.
- `favorite-failure`: rollback otimista.
- `price-change`: versão/valor mudam antes da confirmação.
- `sold-out`: edição esgota durante checkout.
- `order-timeout`: pedido é persistido e resposta expira; retry retorna o mesmo ID.
- `payment-declined`: pedido terminal recusado.
