# Estratégia de testes e cenários

## Comandos

- `npm run test:unit`: domínio monetário.
- `npm run test:e2e`: 12 grupos do README em Chromium desktop e mobile.
- `npm run test:visual`: snapshots de Home, detalhe, carrinho e checkout.
- `npm run test:visual:update`: cria/atualiza baselines depois de revisão humana.
- `npm run audit`: três medições Lighthouse por página e perfil; grava HTML, JSON e medianas.

Cada contexto Playwright limpa o banco persistido antes do primeiro carregamento. `localStorage['jungle:scenario']` seleciona um cenário. Valores: `default`, `slow`, `variable-latency`, `out-of-order`, `network-error`, `server-error`, `session-expired`, `favorite-failure`, `sold-out`, `order-timeout` e `payment-declined`.

Baselines visuais devem ser geradas somente depois que o Figma puder ser inspecionado e a comparação visual for aprovada. Não há baselines inventadas nesta sessão.
