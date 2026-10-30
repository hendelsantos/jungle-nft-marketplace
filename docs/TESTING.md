# Estratégia de testes e cenários

## Comandos

- `npm run test:unit`: domínio monetário.
- `npm run test:e2e`: 12 grupos do README em Chromium desktop e mobile (aprovados em 2026-10-30, 26 testes verdes). Baselines visuais ficam de fora deste comando até existirem.
- `npm run test:visual`: snapshots de Home, detalhe, carrinho e checkout.
- `npm run test:visual:update`: cria/atualiza baselines depois de revisão humana.
- `npm run audit`: três medições Lighthouse por página e perfil; grava HTML, JSON e medianas (`lighthouse-reports/`, fora do controle de versão; a tabela de medianas vai para `docs/LIGHTHOUSE.md`).

## Notas de execução

- O service worker do MSW só controla a página a partir da primeira navegação seguinte; chamadas diretas a `/api/__mock/*` na carga inicial devem aguardar `waitForMocks` (em `tests/fixtures/app.ts`).
- `src/main.tsx` usa top-level await na inicialização do MSW: o evento `load` do documento só dispara com os mocks ativos.
- O settle de pedidos ocorre via `GET /api/orders/:id` (polling do cliente), nunca dentro do `POST /api/orders`, para preservar carrinho e cotação durante timeouts de criação.

Cada contexto Playwright limpa o banco persistido antes do primeiro carregamento. `localStorage['jungle:scenario']` seleciona um cenário. Valores: `default`, `slow`, `variable-latency`, `out-of-order`, `network-error`, `server-error`, `session-expired`, `favorite-failure`, `sold-out`, `order-timeout` e `payment-declined`.

Baselines visuais devem ser geradas somente depois que o Figma puder ser inspecionado e a comparação visual for aprovada. Não há baselines inventadas.
